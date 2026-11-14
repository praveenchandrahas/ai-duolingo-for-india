"""Step 1: video -> transcript with sentence times.

ffmpeg pulls the audio out, a voice-activity detector (Silero) finds the pauses, and Whisper turns the
speech between pauses into text. A "sentence" here is a run of speech that starts and ends at a real pause
and ends a sentence in the text. Cuts are only ever placed between two of them, so a cut always lands where
the speaker actually stops.

Everything runs on the local machine through sherpa-onnx. No audio leaves the computer.
"""
import os, re, subprocess, time, wave
import numpy as np
from . import common as C

WHISPER = os.environ.get("AILP_WHISPER", "small")
MODEL_URLS = {
    "whisper": "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-{name}.tar.bz2",
    "vad": "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx",
}


def setup():
    """Download the speech models (about 640 MB for Whisper small) into models/."""
    os.makedirs(C.MODELS, exist_ok=True)
    vad = os.path.join(C.MODELS, "silero_vad.onnx")
    if not os.path.exists(vad):
        subprocess.run(["curl", "-fsSL", "-o", vad, MODEL_URLS["vad"]], check=True)
    wdir = os.path.join(C.MODELS, f"sherpa-onnx-whisper-{WHISPER}")
    if not os.path.isdir(wdir):
        tar = wdir + ".tar.bz2"
        subprocess.run(["curl", "-fSL", "-o", tar, MODEL_URLS["whisper"].format(name=WHISPER)], check=True)
        subprocess.run(["tar", "xjf", tar, "-C", C.MODELS], check=True)
        os.remove(tar)
    print("models ready in", C.MODELS)


def _audio(src, wav):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav], check=True)
    with wave.open(wav) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0


def _models(language):
    import sherpa_onnx
    d = os.path.join(C.MODELS, f"sherpa-onnx-whisper-{WHISPER}")
    if not os.path.isdir(d) or not os.path.exists(os.path.join(C.MODELS, "silero_vad.onnx")):
        raise SystemExit("Speech models not found. Run:  python -m studio setup")
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=os.path.join(d, f"{WHISPER}-encoder.int8.onnx"), decoder=os.path.join(d, f"{WHISPER}-decoder.int8.onnx"),
        tokens=os.path.join(d, f"{WHISPER}-tokens.txt"), language=language, task="transcribe", num_threads=os.cpu_count() or 2)
    cfg = sherpa_onnx.VadModelConfig()
    cfg.silero_vad.model = os.path.join(C.MODELS, "silero_vad.onnx")
    cfg.silero_vad.min_silence_duration = 0.22
    cfg.silero_vad.min_speech_duration = 0.2
    cfg.silero_vad.max_speech_duration = 18      # Whisper reads at most 30 s at a time
    cfg.sample_rate = 16000
    return rec, sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=120), cfg.silero_vad.window_size


def speech_segments(samples, vad, window):
    out = []
    def drain():
        while not vad.empty():
            s = vad.front
            out.append((s.start / 16000.0, np.array(s.samples, dtype=np.float32)))
            vad.pop()
    for i in range(0, len(samples) - window + 1, window):
        vad.accept_waveform(samples[i:i + window]); drain()
    vad.flush(); drain()
    return out


END = re.compile(r"[.?!।]['\"”’)]*$")
MAX_UNIT = 24.0     # seconds; Whisper reads at most 30 s at a time


def group(segs, long_pause=0.7):
    """Decide which stretches of speech belong together as one sentence.
    Whisper puts a full stop at the end of almost every short stretch it hears, but it starts a stretch
    with a small letter when the speaker is carrying on. So a sentence ends where the text ends with a
    full stop, question mark or exclamation mark AND the next stretch does not start with a small letter,
    or at a long pause."""
    groups, cur = [], []
    for k, seg in enumerate(segs):
        cur.append(seg)
        nxt = segs[k + 1] if k + 1 < len(segs) else None
        if nxt is None: groups.append(cur); break
        carries_on = nxt["text"][:1].islower()
        too_long = nxt["end"] - cur[0]["start"] > MAX_UNIT
        if too_long or nxt["start"] - seg["end"] >= long_pause or (END.search(seg["text"]) and not carries_on):
            groups.append(cur); cur = []
    return groups


def _decode(rec, samples, a, b):
    st = rec.create_stream(); st.accept_waveform(16000, samples[int(a * 16000):int(b * 16000)]); rec.decode_stream(st)
    return st.result.text.strip()


def transcribe(cls, force=False):
    out = os.path.join(C.wdir(cls["id"]), "transcript.json")
    if os.path.exists(out) and not force:
        print(cls["id"], "already transcribed (use --force to redo)"); return C.load(out)
    os.makedirs(C.wdir(cls["id"]), exist_ok=True)
    t0 = time.time()
    samples = _audio(os.path.join(C.ROOT, cls["source"]), os.path.join(C.wdir(cls["id"]), "audio.wav"))
    dur = len(samples) / 16000.0
    rec, vad, window = _models(cls.get("language", "en"))
    raw = [(start, start + len(x) / 16000.0) for start, x in speech_segments(samples, vad, window)]
    pad = lambda k: (max(raw[k - 1][1] if k else 0.0, raw[k][0] - 0.25), min(raw[k + 1][0] if k + 1 < len(raw) else dur, raw[k][1] + 0.2))
    # pass 1: each stretch of speech on its own, to find where sentences end
    segs = []
    for k, (start, end) in enumerate(raw):
        text = _decode(rec, samples, *pad(k))
        if text: segs.append({"start": round(start, 2), "end": round(end, 2), "text": text, "k": k})
    # pass 2: each sentence heard as a whole, which gives better words and punctuation than its pieces
    whole = lambda g: _decode(rec, samples, pad(g[0]["k"])[0], pad(g[-1]["k"])[1]) or " ".join(x["text"] for x in g)
    units = [{"g": g, "text": whole(g) if len(g) > 1 else g[0]["text"]} for g in group(segs)]
    # heard as a whole, some turn out to stop mid-sentence ("... At the end,") or to carry on from the one before
    # ("how much you want ..."): join those to their neighbour and listen again
    k, joins = 0, 0
    while k < len(units) - 1 and joins < 4 * len(units):
        u, n = units[k], units[k + 1]
        open_end = not END.search(u["text"]); carries_on = n["text"][:1].islower()
        fits = n["g"][-1]["end"] - u["g"][0]["start"] <= MAX_UNIT and n["g"][0]["start"] - u["g"][-1]["end"] < 0.7
        if (open_end or carries_on) and fits:
            g = u["g"] + n["g"]; units[k:k + 2] = [{"g": g, "text": whole(g)}]; joins += 1
            k = max(0, k - 1)
        else:
            k += 1
    sentences = [{"start": u["g"][0]["start"], "end": u["g"][-1]["end"], "text": u["text"], "pieces": len(u["g"])} for u in units]
    for i, s in enumerate(sentences):
        nxt = sentences[i + 1]["start"] if i + 1 < len(sentences) else s["end"]
        s.update({"i": i, "pause_after": round(max(0.0, nxt - s["end"]), 2), "at_pause": True})
    for x in segs: x.pop("k")
    took = time.time() - t0
    data = {"class": cls["id"], "language": cls.get("language", "en"), "duration": round(dur, 2), "engine": f"whisper-{WHISPER} (sherpa-onnx) + silero-vad",
            "seconds_to_transcribe": round(took, 1), "realtime_factor": round(took / dur, 3), "cpus": os.cpu_count(),
            "segments": segs, "sentences": sentences}
    C.save(out, data)
    os.remove(os.path.join(C.wdir(cls["id"]), "audio.wav"))
    print(f"{cls['id']}: {C.clock(dur)} of video, {len(data['sentences'])} sentences, transcribed in {took:.0f}s ({took / dur:.2f}x real time)")
    return data
