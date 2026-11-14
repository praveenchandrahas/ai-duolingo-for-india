"""Local server for the review screen and the learner app.

Serves the repository folder (so /poc/ behaves as it does on GitHub Pages), supports range requests so
video can be played from the middle of a file, and saves review decisions to library/review.json.
"""
import json, os, re, subprocess, sys
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from . import common as C

REVIEW = os.path.join(C.LIB, "review.json")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=C.ROOT, **k)

    def log_message(self, fmt, *args):
        if "/api/" in (args[0] if args else ""): sys.stderr.write("  " + fmt % args + "\n")

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body))); self.send_header("Cache-Control", "no-store"); self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        if not self.path.startswith("/api/"): self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/api/ping"): return self._json({"ok": True, "studio": "local"})
        if self.path.startswith("/api/review"): return self._json(C.load(REVIEW, {"snippets": {}}))
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if rng and os.path.isfile(path):
            m = re.match(r"bytes=(\d*)-(\d*)", rng)
            size = os.path.getsize(path)
            if m and (m.group(1) or m.group(2)):
                start = int(m.group(1)) if m.group(1) else max(0, size - int(m.group(2)))
                end = min(int(m.group(2)), size - 1) if m.group(1) and m.group(2) else size - 1
                if start >= size:
                    self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE); self.send_header("Content-Range", f"bytes */{size}"); self.end_headers(); return
                self.send_response(HTTPStatus.PARTIAL_CONTENT)
                self.send_header("Content-Type", self.guess_type(path)); self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}"); self.send_header("Content-Length", str(end - start + 1)); self.end_headers()
                with open(path, "rb") as f:
                    f.seek(start); left = end - start + 1
                    while left > 0:
                        chunk = f.read(min(65536, left))
                        if not chunk: break
                        try: self.wfile.write(chunk)
                        except (BrokenPipeError, ConnectionResetError): return
                        left -= len(chunk)
                return
        return super().do_GET()

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        try: data = json.loads(self.rfile.read(n) or b"{}")
        except ValueError: return self._json({"ok": False, "error": "bad json"}, 400)
        if self.path.startswith("/api/review"):
            if not isinstance(data.get("snippets"), dict): return self._json({"ok": False, "error": "expected {snippets: {...}}"}, 400)
            C.save(REVIEW, {"snippets": data["snippets"]})
            return self._json({"ok": True, "saved": len(data["snippets"])})
        if self.path.startswith("/api/publish"):
            r = subprocess.run([sys.executable, "-m", "studio", "publish"], cwd=C.ROOT, capture_output=True, text=True)
            return self._json({"ok": r.returncode == 0, "log": (r.stdout + r.stderr)[-2000:]})
        return self._json({"ok": False, "error": "unknown"}, 404)


def serve(port=8765):
    srv = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Review screen:  http://localhost:{port}/poc/studio/\nLearner app:    http://localhost:{port}/poc/\n(Ctrl+C to stop)")
    try: srv.serve_forever()
    except KeyboardInterrupt: pass
