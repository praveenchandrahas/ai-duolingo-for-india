"""Render the stand-in classes in lessons.py to video files in library/raw/.

Synthetic voice (Kokoro, via sherpa-onnx) over plain slides. Only needed to recreate the placeholders;
real recordings do not go through this script at all.

    python studio/standin/make.py --tts-model <dir with kokoro model> --fonts <dir with Caveat.ttf, SpaceGrotesk.ttf>
"""
import argparse, json, os, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from lessons import CLASSES

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
W, H = 1280, 720
PAPER, INK, MUTE, RUST, TEAL, SUN, CARD, BAD = "#FBF7EE", "#1F2A44", "#5B647C", "#C8451F", "#1B6F6A", "#F6D97A", "#FFFDF7", "#B3321A"
KICK = {"title": "Class", "story": "", "rule": "The rule", "why": "Why it matters", "example": "Worked example", "tip": "Tip", "recap": "Recap"}
GAP_SENT, GAP_BEAT, GAP_SECTION = 0.34, 0.85, 1.6


def font(path, size, weight=None):
    f = ImageFont.truetype(path, size)
    if weight:
        try: f.set_variation_by_axes([weight])
        except Exception: pass
    return f


def wrap(d, text, f, width):
    out, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= width or not cur: cur = t
        else: out.append(cur); cur = w
    if cur: out.append(cur)
    return out


def mark(d, kind, x, y, s):
    if kind == "✓":
        d.line([(x, y + s * .55), (x + s * .35, y + s * .9), (x + s, y + s * .1)], fill=TEAL, width=7, joint="curve")
    elif kind == "✗":
        d.line([(x + s * .1, y + s * .1), (x + s * .9, y + s * .9)], fill=BAD, width=7)
        d.line([(x + s * .9, y + s * .1), (x + s * .1, y + s * .9)], fill=BAD, width=7)


def slide(cls, beat, fonts, n, total):
    kind, head, lines, _ = beat
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im)
    for x in range(20, W, 36):
        for y in range(20, H, 36): d.ellipse((x - 1.5, y - 1.5, x + 1.5, y + 1.5), fill="#E8E1CF")
    hand, headf, body, small = font(fonts["hand"], 50), font(fonts["head"], 52, 700), font(fonts["head"], 33, 500), font(fonts["head"], 21, 500)
    # placeholder badge, always on screen
    label = "STAND-IN LESSON  ·  synthetic voice  ·  not a real class"
    tw = d.textlength(label, font=small)
    d.rounded_rectangle((W - tw - 72, 28, W - 36, 70), 21, fill=SUN, outline=INK, width=3)
    d.text((W - tw - 54, 36), label, font=small, fill=INK)
    y = 36
    k = KICK.get(kind, "")
    if k: d.text((60, y), k, font=hand, fill=RUST)
    y = 112
    for ln in wrap(d, head, headf, W - 140): d.text((60, y), ln, font=headf, fill=INK); y += 64
    d.line((60, y + 6, 60 + min(520, d.textlength(head, font=headf)), y + 8), fill=SUN, width=10)
    y += 44
    for ln in lines:
        m = ln[0] if ln[0] in "✓✗+" else None
        txt = ln[1:].strip() if m else ln
        rows = wrap(d, txt, body, W - 220)
        if m == "+" or txt.startswith("Prompt:") or (kind == "example" and not m and len(txt) > 70):
            hbox = len(rows) * 44 + 22
            d.rounded_rectangle((60, y - 6, W - 60, y + hbox - 6), 18, fill=SUN if m == "+" else CARD, outline=INK, width=3)
            if m == "+": d.text((80, y + 2), "+", font=body, fill=INK)
            for r in rows: d.text((122, y + 4), r, font=body, fill=INK); y += 44
            y += 30
        else:
            if m: mark(d, m, 74, y + 8, 26)
            else: d.ellipse((78, y + 14, 92, y + 28), fill=RUST)
            for r in rows: d.text((122, y), r, font=body, fill=BAD if m == "✗" else INK); y += 44
            y += 14
    d.text((60, H - 52), f"{cls['title']}  ·  AI Launchpad proof of concept", font=small, fill=MUTE)
    d.text((W - 110, H - 52), f"{n}/{total}", font=small, fill=MUTE)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tts-model", required=True)
    ap.add_argument("--fonts", required=True)
    ap.add_argument("--sid", type=int, default=6)
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", default="")
    a = ap.parse_args()
    import sherpa_onnx
    M = a.tts_model.rstrip("/") + "/"
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=M + "model.onnx", voices=M + "voices.bin", tokens=M + "tokens.txt", data_dir=M + "espeak-ng-data"),
        num_threads=2)))
    fonts = {"hand": os.path.join(a.fonts, "Caveat.ttf"), "head": os.path.join(a.fonts, "SpaceGrotesk.ttf")}
    out_dir = os.path.join(ROOT, "library", "raw"); tmp = os.path.join(out_dir, "_tmp"); os.makedirs(tmp, exist_ok=True)
    SR = 24000
    for cls in CLASSES:
        if a.only and cls["id"] not in a.only.split(","): continue
        audio, marks, t = [], [], 0.0
        for bi, beat in enumerate(cls["beats"]):
            kind, _, _, text = beat
            lead = 0.5 if bi == 0 else (GAP_SECTION if kind in ("rule", "recap") else GAP_BEAT)
            audio.append(np.zeros(int(lead * SR), np.float32)); t += lead
            marks.append(t - min(lead, 0.4))                 # slide changes just before the beat is spoken
            sents = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]
            for si, s in enumerate(sents):
                g = tts.generate(s, sid=a.sid, speed=a.speed)
                x = np.array(g.samples, dtype=np.float32)
                assert g.sample_rate == SR
                idx = np.where(np.abs(x) > 0.01)[0]
                if len(idx): x = x[max(0, idx[0] - int(.02 * SR)): idx[-1] + int(.05 * SR)]
                audio.append(x); t += len(x) / SR
                if si < len(sents) - 1: audio.append(np.zeros(int(GAP_SENT * SR), np.float32)); t += GAP_SENT
            print(cls["id"], bi + 1, "/", len(cls["beats"]), round(t, 1), flush=True)
        audio.append(np.zeros(int(1.2 * SR), np.float32)); t += 1.2
        y = np.concatenate(audio); y = y / max(1e-6, np.abs(y).max()) * 0.9
        wav = os.path.join(tmp, cls["id"] + ".wav")
        with wave.open(wav, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
        lst = os.path.join(tmp, cls["id"] + ".txt")
        with open(lst, "w") as f:
            for bi, beat in enumerate(cls["beats"]):
                p = os.path.join(tmp, f"{cls['id']}_{bi:02d}.png")
                slide(cls, beat, fonts, bi + 1, len(cls["beats"])).save(p)
                start = 0.0 if bi == 0 else marks[bi]
                end = marks[bi + 1] if bi + 1 < len(marks) else t
                f.write(f"file '{p}'\nduration {end - start:.3f}\n")
            f.write(f"file '{p}'\n")
        mp4 = os.path.join(out_dir, cls["id"] + ".mp4"); part = mp4 + ".part.mp4"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", wav,
                        "-vf", "fps=12,format=yuv420p", "-c:v", "libx264", "-crf", "24", "-preset", "veryfast", "-tune", "stillimage",
                        "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", part], check=True)
        os.replace(part, mp4)
        print("wrote", mp4, round(t, 1), "s", flush=True)
    # words per class, for the record
    json.dump({c["id"]: sum(len(b[3].split()) for b in c["beats"]) for c in CLASSES}, open(os.path.join(tmp, "words.json"), "w"))


if __name__ == "__main__":
    main()
