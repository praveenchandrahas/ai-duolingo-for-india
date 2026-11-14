"""Checks on the pipeline code that do not need the speech models.   python -m unittest tests.test_studio"""
import unittest
from studio import common as C
from studio.cut import normalize, heuristic, parse_json, build_prompt
from studio.transcribe import group


def sents(n, gap=0.4, long_every=5):
    out, t = [], 0.5
    for i in range(n):
        pause = 1.6 if (i + 1) % long_every == 0 else gap
        out.append({"i": i, "start": round(t, 2), "end": round(t + 2.0, 2), "text": f"Sentence {i}.", "pause_after": pause, "at_pause": True})
        t += 2.0 + pause
    return out


CON = {"roles": [{"id": "teacher", "name": "School teacher"}], "concepts": [{"id": "a", "topic": "t", "title": "Idea A"}, {"id": "b", "topic": "t", "title": "Idea B"}]}
CLS = {"id": "c1", "title": "Class", "role": "teacher", "topic": "t", "language": "en"}


class Cuts(unittest.TestCase):
    def test_cut_lands_in_the_pause(self):
        S = sents(10)
        start, end = C.cut_times(S, 2, 4)
        self.assertGreaterEqual(start, S[1]["end"]); self.assertLessEqual(start, S[2]["start"])
        self.assertGreaterEqual(end, S[4]["end"]); self.assertLessEqual(end, S[5]["start"])

    def test_bad_answers_are_dropped_not_guessed(self):
        tr = {"sentences": sents(10)}
        raw = {"snippets": [{"first": 0, "last": 9, "kind": "class", "title": "All", "concept": "a"},
                            {"first": 2, "last": 3, "title": "Good", "concept": "b", "questions": ["why?", " "]},
                            {"first": 2, "last": 3, "title": "Duplicate", "concept": "b"},
                            {"first": 7, "last": 30, "title": "Past the end", "concept": "a"},
                            {"first": "x", "last": 3, "title": "No numbers"},
                            {"first": 5, "last": 6, "title": "Unknown concept", "concept": "zzz"}]}
        out, dropped = normalize(CLS, tr, raw, CON, "test")
        self.assertEqual(len(out), 3); self.assertEqual(len(dropped), 3)
        good = next(s for s in out if s["title"] == "Good")
        self.assertEqual(good["parent"], "c1-0-9"); self.assertEqual(good["questions"], ["why?"]); self.assertEqual(good["status"], "pending")
        self.assertIsNone(next(s for s in out if s["title"] == "Unknown concept")["concept"])

    def test_heuristic_cuts_are_valid(self):
        tr = {"sentences": sents(20)}
        out, dropped = normalize(CLS, tr, heuristic(tr), CON, "heuristic")
        self.assertFalse(dropped); self.assertTrue(any(s["kind"] == "class" for s in out)); self.assertTrue(any(s["kind"] == "section" for s in out))

    def test_prompt_and_json(self):
        p = build_prompt(CLS, {"sentences": sents(6)}, CON)
        self.assertIn("[4] (", p); self.assertIn("||", p); self.assertIn("- a: Idea A", p)
        self.assertEqual(parse_json('Here you go:\n```json\n{"snippets": []}\n```')["snippets"], [])

    def test_sentence_grouping(self):
        seg = lambda a, b, t: {"start": a, "end": b, "text": t}
        g = group([seg(0, 2, "Ask an AI for a worksheet."), seg(2.3, 4, "and you get one in seconds."), seg(4.3, 6, "The fix is simple."),
                   seg(6.3, 7, "It says"), seg(8.5, 10, "attempt all questions.")])
        self.assertEqual([len(x) for x in g], [2, 1, 1, 1])     # joined across a comma pause; split at a long pause


class Api(unittest.TestCase):
    def test_anthropic_call_against_a_local_stand_in(self):
        """The real API was not called while building this (no key). This checks the request and the parsing."""
        import json, os, threading
        from http.server import BaseHTTPRequestHandler, HTTPServer
        from studio.cut import call_anthropic
        seen = {}

        class H(BaseHTTPRequestHandler):
            def log_message(self, *a): pass
            def do_POST(self):
                seen["headers"] = dict(self.headers); seen["body"] = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                out = json.dumps({"content": [{"type": "text", "text": 'Sure.\n{"snippets": [{"first": 0, "last": 1, "title": "T"}]}'}], "usage": {"input_tokens": 12, "output_tokens": 7}}).encode()
                self.send_response(200); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(out))); self.end_headers(); self.wfile.write(out)

        srv = HTTPServer(("127.0.0.1", 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
        old = {k: os.environ.get(k) for k in ("ANTHROPIC_API_KEY", "ANTHROPIC_API_URL", "no_proxy", "NO_PROXY")}
        os.environ.update({"ANTHROPIC_API_KEY": "test-key", "ANTHROPIC_API_URL": f"http://127.0.0.1:{srv.server_port}/v1/messages", "no_proxy": "127.0.0.1", "NO_PROXY": "127.0.0.1"})
        try:
            raw, usage = call_anthropic("PROMPT")
        finally:
            srv.shutdown()
            for k, v in old.items():
                if v is None: os.environ.pop(k, None)
                else: os.environ[k] = v
        self.assertEqual(raw["snippets"][0]["title"], "T"); self.assertEqual(usage["input_tokens"], 12)
        self.assertEqual(seen["body"]["messages"][0]["content"], "PROMPT"); self.assertEqual({k.lower(): v for k, v in seen["headers"].items()}.get("x-api-key"), "test-key")


if __name__ == "__main__":
    unittest.main()
