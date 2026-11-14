"""Step 2: transcript -> snippets at several lengths, each with tags.

The AI reads the numbered sentences of one class and answers with a list of snippets: where each starts
and ends (as sentence numbers), what it teaches, who it is for and which learner questions it answers.
Cuts are always on sentence boundaries, so the times come from the pauses found in step 1.

Three ways to get that list (--provider):
  anthropic   call the Anthropic API (needs ANTHROPIC_API_KEY)
  file        read library/work/<class>/cuts.json, written by any AI or by hand in the same format
  heuristic   no AI at all: sections from long pauses, tags left for the reviewer

Whatever the source, every snippet starts as "pending" and reaches learners only after review.
"""
import json, os, re, urllib.request
from . import common as C

TARGETS = "about 10 seconds, about 20 seconds, about 1 minute, a whole section (2 to 5 minutes), and longer blocks of 10 and 15 minutes when the class is long enough"

PROMPT = """You are preparing a recorded class for a micro-learning app. A real teacher is speaking. Learners will
watch short snippets of this class, and when a learner is stuck the app plays the shortest snippet that answers
their question. Your job is to choose where the snippets start and end and to describe each one. You never rewrite
or summarise what the teacher teaches; you only pick sentences.

CLASS: {title}
ROLE THE CLASS IS FOR: {role}
LANGUAGE: {language}

CONCEPTS this track teaches (use these ids; use null only if a snippet truly fits none):
{concepts}

TRANSCRIPT, one sentence per line as [number] (start-end) text. "||" marks a long pause after the sentence.
{sentences}

Cut snippets at these lengths: {targets}.
Rules:
1. A snippet is a run of whole sentences, given as "first" and "last" sentence numbers (inclusive).
2. It must make sense to someone who has seen nothing else: it starts where a thought starts, never mid-example,
   and it does not open with words that point backwards ("this", "that", "so", "back to").
3. It teaches one idea. If a run teaches two, cut two snippets.
4. Short snippets sit inside longer ones: the 10-second point inside the 20-second explanation or the
   1-minute example, those inside the section, the sections inside the whole class. Always include one snippet
   that is the whole class.
5. For every concept, try to give a 10-second, a 20-second and a 1-minute snippet, plus its section.
6. "questions" are 3 to 6 things a learner would type or say when stuck, in their own everyday words, that this
   snippet answers. Do not copy the teacher's sentences.
7. "level" is "new", "some" or "often" (how much the learner has used AI). "kind" is one of
   hook, point, why, example, tip, section, class.

Answer with JSON only, in this shape:
{{"snippets": [{{"first": 0, "last": 3, "kind": "example", "title": "...", "summary": "one sentence",
  "concept": "concept-id or null", "level": "new", "roles": ["{role_id}"], "questions": ["...", "..."]}}]}}
"""


def build_prompt(cls, transcript, concepts):
    lines = []
    for s in transcript["sentences"]:
        mark = " ||" if s["pause_after"] >= 1.0 else ""
        lines.append(f"[{s['i']}] ({C.clock(s['start'])}-{C.clock(s['end'])}) {s['text']}{mark}")
    clist = "\n".join(f"- {c['id']}: {c['title']}" for c in concepts["concepts"] if c["topic"] == cls.get("topic") or not cls.get("topic"))
    role = next((r for r in concepts["roles"] if r["id"] == cls.get("role")), {"id": cls.get("role", ""), "name": cls.get("role", "")})
    return PROMPT.format(title=cls["title"], role=role["name"], role_id=role["id"], language=cls.get("language", "en"),
                         concepts=clist, sentences="\n".join(lines), targets=TARGETS)


def call_anthropic(prompt):
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise SystemExit("ANTHROPIC_API_KEY is not set. Use --provider file or --provider heuristic, or set the key.")
    body = {"model": os.environ.get("AILP_MODEL", "claude-sonnet-5-5"), "max_tokens": 16000,
            "messages": [{"role": "user", "content": prompt}]}
    req = urllib.request.Request(os.environ.get("ANTHROPIC_API_URL", "https://api.anthropic.com/v1/messages"),
                                 data=json.dumps(body).encode(), method="POST",
                                 headers={"content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01"})
    with urllib.request.urlopen(req, timeout=600) as r:
        res = json.loads(r.read().decode())
    text = "".join(b.get("text", "") for b in res.get("content", []) if b.get("type") == "text")
    return parse_json(text), res.get("usage", {})


def parse_json(text):
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError("The AI did not answer with JSON.")
    return json.loads(m.group(0))


def heuristic(transcript):
    """Cuts without AI. Sections are split at the longest pauses; inside each section the opening sentences
    give the short snippets. Tags are left empty for the reviewer. Useful as a baseline and when there is no key."""
    S = transcript["sentences"]
    if not S: return {"snippets": []}
    bounds = [0] + [s["i"] + 1 for s in S[:-1] if s["pause_after"] >= 1.2] + [len(S)]
    out = [{"first": 0, "last": len(S) - 1, "kind": "class", "title": S[0]["text"][:70]}]
    for a, b in zip(bounds, bounds[1:]):
        if b - a < 2: continue
        out.append({"first": a, "last": b - 1, "kind": "section", "title": S[a]["text"][:70]})
        for kind, limit in (("point", 12), ("why", 30), ("example", 75)):
            last = a
            while last + 1 < b and S[last + 1]["end"] - S[a]["start"] <= limit: last += 1
            if last < b - 1 and (S[last]["end"] - S[a]["start"]) >= limit * 0.4:
                out.append({"first": a, "last": last, "kind": kind, "title": S[a]["text"][:70]})
    for o in out:
        o.update({"summary": "", "concept": None, "level": "new", "roles": [], "questions": []})
    return {"snippets": out}


def normalize(cls, transcript, raw, concepts, source):
    """Check the AI's answer and turn sentence numbers into times. Bad entries are dropped, not guessed."""
    S = transcript["sentences"]; ids = {c["id"] for c in concepts["concepts"]}
    seen, out, dropped = set(), [], []
    for r in raw.get("snippets", []):
        try:
            a, b = int(r["first"]), int(r["last"])
        except (KeyError, TypeError, ValueError):
            dropped.append({"why": "no sentence numbers", "item": r}); continue
        if not (0 <= a <= b < len(S)):
            dropped.append({"why": "sentence numbers outside the class", "item": r}); continue
        if (a, b) in seen:
            dropped.append({"why": "duplicate", "item": r}); continue
        seen.add((a, b))
        start, end = C.cut_times(S, a, b)
        concept = r.get("concept") if r.get("concept") in ids else None
        out.append({
            "id": f"{cls['id']}-{a}-{b}", "class": cls["id"], "s0": a, "s1": b, "start": start, "end": end, "dur": round(end - start, 2),
            "bucket": C.bucket(end - start), "kind": r.get("kind") or "point", "title": (r.get("title") or "").strip(),
            "summary": (r.get("summary") or "").strip(), "concept": concept, "level": r.get("level") if r.get("level") in ("new", "some", "often") else "new",
            "roles": [x for x in (r.get("roles") or [cls.get("role")]) if x], "questions": [q.strip() for q in (r.get("questions") or []) if q and q.strip()],
            "status": "pending", "source": source,
            "flags": ([] if S[a]["at_pause"] or a == 0 else ["start is not at a pause"]) + ([] if concept or r.get("kind") == "class" else ["no concept"]),
        })
    out.sort(key=lambda x: (x["s0"], -x["s1"]))
    for x in out:                                   # parent = the shortest longer snippet that contains this one
        holders = [y for y in out if y is not x and y["s0"] <= x["s0"] and y["s1"] >= x["s1"]]
        x["parent"] = min(holders, key=lambda y: y["dur"])["id"] if holders else None
    return out, dropped


def cut(cls, provider="file"):
    wd = C.wdir(cls["id"])
    transcript = C.load(os.path.join(wd, "transcript.json"))
    if not transcript:
        raise SystemExit(f"{cls['id']}: no transcript yet. Run transcribe first.")
    concepts = C.load(os.path.join(C.LIB, "concepts.json"))
    prompt = build_prompt(cls, transcript, concepts)
    with open(os.path.join(wd, "cut_prompt.txt"), "w", encoding="utf-8") as f: f.write(prompt)
    meta = {"provider": provider, "prompt_chars": len(prompt), "prompt_tokens_estimate": len(prompt) // 4}
    if provider == "anthropic":
        raw, usage = call_anthropic(prompt)
        meta["usage"] = usage; meta["model"] = os.environ.get("AILP_MODEL", "claude-sonnet-5-5")
        C.save(os.path.join(wd, "cuts.json"), raw)
    elif provider == "heuristic":
        raw = heuristic(transcript)
    else:
        raw = C.load(os.path.join(wd, "cuts.json"))
        if raw is None:
            raise SystemExit(f"{cls['id']}: library/work/{cls['id']}/cuts.json not found. The prompt is in cut_prompt.txt; "
                             "paste it into any AI, save the JSON answer as cuts.json, and run this again.")
        meta["made_by"] = raw.get("made_by", "")
    snippets, dropped = normalize(cls, transcript, raw, concepts, provider)
    meta["snippets"] = len(snippets); meta["dropped"] = dropped
    meta["answer_tokens_estimate"] = len(json.dumps(raw)) // 4
    C.save(os.path.join(wd, "snippets.json"), snippets)
    C.save(os.path.join(wd, "cut_meta.json"), meta)
    by = {}
    for s in snippets: by[s["bucket"]] = by.get(s["bucket"], 0) + 1
    print(f"{cls['id']}: {len(snippets)} snippets {by}" + (f", {len(dropped)} dropped" if dropped else ""))
    return snippets
