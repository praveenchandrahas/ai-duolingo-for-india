"""Step 4: build what the learner app reads.

Takes the transcripts, the snippets and the reviewer's decisions, and writes:
  poc/data/library.json   classes (with sentence times for captions), snippets, concepts, exercises
  poc/data/metrics.json   the numbers for the proof-of-concept gate
  poc/media/<class>.mp4   a low-data copy of each class (360p), and <class>.m4a (audio only)
Originals in library/raw are never changed.
"""
import datetime, os, shutil, subprocess
from . import common as C


def link_parents(snips):
    for x in snips:
        holders = [y for y in snips if y is not x and y["class"] == x["class"] and y["s0"] <= x["s0"] and y["s1"] >= x["s1"]
                   and (y["s1"] - y["s0"]) > (x["s1"] - x["s0"])]
        x["parent"] = min(holders, key=lambda y: y["dur"])["id"] if holders else None


def apply_review(snip, review, sentences):
    r = review.get("snippets", {}).get(snip["id"])
    if not r: return snip
    for k in ("status", "title", "summary", "concept", "level", "questions", "reviewer", "reviewed_at", "note"):
        if k in r: snip[k] = r[k]
    if "s0" in r or "s1" in r:
        snip["s0"] = max(0, min(int(r.get("s0", snip["s0"])), len(sentences) - 1))
        snip["s1"] = max(snip["s0"], min(int(r.get("s1", snip["s1"])), len(sentences) - 1))
        snip["start"], snip["end"] = C.cut_times(sentences, snip["s0"], snip["s1"])
        snip["dur"] = round(snip["end"] - snip["start"], 2); snip["bucket"] = C.bucket(snip["dur"]); snip["edited"] = True
    return snip


def transcode(cls, force=False):
    src = os.path.join(C.ROOT, cls["source"])
    mdir = os.path.join(C.POC, "media"); os.makedirs(mdir, exist_ok=True)
    mp4, m4a = os.path.join(mdir, cls["id"] + ".mp4"), os.path.join(mdir, cls["id"] + ".m4a")
    if not os.path.exists(src):
        if os.path.exists(mp4): return mp4, m4a
        raise SystemExit(f"{cls['id']}: source video {cls['source']} not found")
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg is needed to publish media")
    fresh = lambda out: os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src) and not force
    if not fresh(mp4):
        part = mp4 + ".part.mp4"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vf", "scale=-2:360", "-c:v", "libx264", "-crf", "30", "-preset", "veryfast",
                        "-force_key_frames", "expr:gte(t,n_forced*2)", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "40k", "-ac", "1", "-ar", "24000", "-movflags", "+faststart", part], check=True)
        os.replace(part, mp4)
    if not fresh(m4a):
        part = m4a + ".part.m4a"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vn", "-c:a", "aac", "-b:a", "32k", "-ac", "1", "-ar", "24000",
                        "-movflags", "+faststart", part], check=True)
        os.replace(part, m4a)
    return mp4, m4a


def publish(force_media=False, quiet=False):
    concepts = C.load(os.path.join(C.LIB, "concepts.json"))
    review = C.load(os.path.join(C.LIB, "review.json"), {"snippets": {}})
    out_classes, snippets, proc = [], [], {"seconds": 0.0, "video_seconds": 0.0, "prompt_tokens": 0, "answer_tokens": 0, "src_bytes": 0, "mp4_bytes": 0, "m4a_bytes": 0}
    engine = cpus = None
    for cls in C.classes():
        tr = C.load(os.path.join(C.wdir(cls["id"]), "transcript.json"))
        sn = C.load(os.path.join(C.wdir(cls["id"]), "snippets.json"))
        if not tr or sn is None:
            print(f"{cls['id']}: skipped (not transcribed or not cut yet)"); continue
        mp4, m4a = transcode(cls, force_media)
        S = tr["sentences"]
        fixes = (C.load(os.path.join(C.wdir(cls["id"]), "fixes.json"), {}) or {}).get("sentences", {})
        proc["fixes"] = proc.get("fixes", 0) + len(fixes); proc["sentences"] = proc.get("sentences", 0) + len(S)
        meta = C.load(os.path.join(C.wdir(cls["id"]), "cut_meta.json"), {})
        out_classes.append({"id": cls["id"], "title": cls["title"], "presenter": cls.get("presenter", ""), "language": cls.get("language", "en"),
                            "role": cls.get("role"), "topic": cls.get("topic"), "standin": bool(cls.get("standin")), "duration": tr["duration"],
                            "video": "media/" + os.path.basename(mp4), "audio": "media/" + os.path.basename(m4a),
                            "video_bytes": os.path.getsize(mp4), "audio_bytes": os.path.getsize(m4a),
                            "cut_by": meta.get("made_by") or meta.get("model") or meta.get("provider", ""),
                            "sentences": [[s["start"], s["end"], fixes.get(str(s["i"]), s["text"]), s["pause_after"]] for s in S]})
        for s in sn:
            snippets.append(apply_review(dict(s), review, S))
        src = os.path.join(C.ROOT, cls["source"])
        proc["seconds"] += tr.get("seconds_to_transcribe", 0); proc["video_seconds"] += tr["duration"]
        proc["prompt_tokens"] += meta.get("usage", {}).get("input_tokens") or meta.get("prompt_tokens_estimate", 0)
        proc["answer_tokens"] += meta.get("usage", {}).get("output_tokens") or meta.get("answer_tokens_estimate", 0)
        proc["src_bytes"] += os.path.getsize(src) if os.path.exists(src) else 0
        proc["mp4_bytes"] += os.path.getsize(mp4); proc["m4a_bytes"] += os.path.getsize(m4a)
        engine, cpus = tr.get("engine"), tr.get("cpus")
    link_parents(snippets)
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    library = {"version": 1, "built_at": now, "roles": concepts["roles"], "levels": concepts["levels"], "topics": concepts["topics"],
               "concepts": concepts["concepts"], "classes": out_classes, "snippets": snippets}
    C.save(os.path.join(C.POC, "data", "library.json"), library, compact=True)

    hours = proc["video_seconds"] / 3600 or 1e-9
    count = lambda st: sum(1 for s in snippets if s["status"] == st)
    by_bucket = {}
    for s in snippets: by_bucket[s["bucket"]] = by_bucket.get(s["bucket"], 0) + 1
    covered = {s["concept"] for s in snippets if s["status"] == "approved" and s["concept"]}
    all_c = [c["id"] for c in concepts["concepts"]]
    reviewed = count("approved") + count("rejected")
    mb = lambda b: round(b / 1e6 / hours, 1)
    metrics = C.load(os.path.join(C.POC, "data", "metrics.json"), {})
    metrics.update({
        "built_at": now,
        "library": {"classes": len(out_classes), "minutes": round(proc["video_seconds"] / 60, 1), "snippets": len(snippets), "by_length": by_bucket,
                    "approved": count("approved"), "pending": count("pending"), "rejected": count("rejected"),
                    "clean_cut_rate": round(count("approved") / reviewed, 3) if reviewed else None,
                    "sentences": proc.get("sentences", 0), "captions_fixed_by_hand": proc.get("fixes", 0),
                    "reviewers": sorted({s.get("reviewer", "") for s in snippets if s.get("reviewer")})},
        "coverage": {"concepts": len(all_c), "with_approved_snippet": len([c for c in all_c if c in covered]),
                     "share": round(len([c for c in all_c if c in covered]) / len(all_c), 3) if all_c else None,
                     "missing": [c for c in all_c if c not in covered]},
        "processing": {"engine": engine, "cpus": cpus, "transcribe_minutes_per_hour_of_video": round(proc["seconds"] / 60 / hours, 1),
                       "cut_and_tag_input_tokens_per_hour_of_video": int(proc["prompt_tokens"] / hours),
                       "cut_and_tag_output_tokens_per_hour_of_video": int(proc["answer_tokens"] / hours),
                       "tokens_are": "estimates (characters / 4) unless the API reported usage"},
        "delivery": {"source_mb_per_hour": mb(proc["src_bytes"]), "published_video_mb_per_hour": mb(proc["mp4_bytes"]),
                     "audio_only_mb_per_hour": mb(proc["m4a_bytes"]),
                     "published_video_kbps": int(proc["mp4_bytes"] * 8 / 1000 / (hours * 3600)), "audio_only_kbps": int(proc["m4a_bytes"] * 8 / 1000 / (hours * 3600))},
    })
    C.save(os.path.join(C.POC, "data", "metrics.json"), metrics)
    if not quiet:
        L = metrics["library"]
        print(f"published {L['classes']} classes, {L['minutes']} min, {L['snippets']} snippets "
              f"({L['approved']} approved, {L['pending']} pending, {L['rejected']} rejected); "
              f"coverage {metrics['coverage']['with_approved_snippet']}/{metrics['coverage']['concepts']} concepts")
    return library, metrics
