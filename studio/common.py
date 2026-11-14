"""Shared paths and helpers for the content studio."""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LIB = os.path.join(ROOT, "library")
WORK = os.path.join(LIB, "work")
POC = os.path.join(ROOT, "poc")
MODELS = os.environ.get("AILP_MODELS") or os.path.join(ROOT, "models")

# Padding around a cut, in seconds. A cut always lands in the silence between two sentences.
PAD_BEFORE, PAD_AFTER = 0.15, 0.25


def load(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, data, compact=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        if compact:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        else:
            json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def classes():
    return load(os.path.join(LIB, "classes.json"), [])


def wdir(class_id):
    return os.path.join(WORK, class_id)


def clock(sec):
    sec = max(0, int(round(sec)))
    return f"{sec // 60:02d}:{sec % 60:02d}"


def cut_times(sentences, s0, s1):
    """Start and end time of a snippet that runs from sentence s0 to sentence s1 (inclusive).
    The cut is placed in the pause before the first sentence and after the last one."""
    a, b = sentences[s0], sentences[s1]
    prev_end = sentences[s0 - 1]["end"] if s0 > 0 else 0.0
    next_start = sentences[s1 + 1]["start"] if s1 + 1 < len(sentences) else b["end"] + PAD_AFTER
    start = max(a["start"] - PAD_BEFORE, (prev_end + a["start"]) / 2 if s0 > 0 else 0.0)
    end = min(b["end"] + PAD_AFTER, (b["end"] + next_start) / 2 if s1 + 1 < len(sentences) else b["end"] + PAD_AFTER)
    return round(max(0.0, start), 2), round(end, 2)


def bucket(dur):
    """Length class of a snippet. The names follow the product's ladder: 10 s, 20 s, 1 min, a section, a class."""
    if dur <= 15: return "10s"
    if dur <= 40: return "20s"
    if dur <= 100: return "1m"
    if dur <= 330: return "section"
    return "class"
