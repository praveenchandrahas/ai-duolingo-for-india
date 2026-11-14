"""AI Launchpad content studio.

    python -m studio setup                      download the speech models (once)
    python -m studio transcribe [class ...]     video -> sentences with times
    python -m studio cut [class ...] --provider anthropic|file|heuristic
    python -m studio review                     open the review screen on http://localhost:8765/poc/studio/
    python -m studio publish                    build poc/data and poc/media from what was approved
    python -m studio eval                       run the search test list
    python -m studio all --provider ...         transcribe, cut and publish in one go

Classes are listed in library/classes.json. To add one, put the video in library/raw/ and add an entry.
"""
import argparse, os, shutil, subprocess, sys
from . import common as C


def pick(ids):
    cl = C.classes()
    if ids:
        cl = [c for c in cl if c["id"] in ids]
        missing = set(ids) - {c["id"] for c in cl}
        if missing: raise SystemExit("not in library/classes.json: " + ", ".join(sorted(missing)))
    return cl


def run_eval():
    if shutil.which("node") is None:
        print("Node.js not found: open the review screen and use the Search test tab instead."); return 0
    return subprocess.run(["node", os.path.join(C.ROOT, "tests", "search_eval.js"), "--write"], cwd=C.ROOT).returncode


def main():
    ap = argparse.ArgumentParser(prog="python -m studio", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("setup")
    p = sub.add_parser("transcribe"); p.add_argument("classes", nargs="*"); p.add_argument("--force", action="store_true")
    p = sub.add_parser("cut"); p.add_argument("classes", nargs="*"); p.add_argument("--provider", default="file", choices=["anthropic", "file", "heuristic"])
    p = sub.add_parser("publish"); p.add_argument("--force-media", action="store_true")
    p = sub.add_parser("review"); p.add_argument("--port", type=int, default=8765)
    sub.add_parser("eval")
    p = sub.add_parser("all"); p.add_argument("classes", nargs="*"); p.add_argument("--provider", default="file", choices=["anthropic", "file", "heuristic"])
    a = ap.parse_args()

    if a.cmd == "setup":
        from .transcribe import setup; setup()
    elif a.cmd == "transcribe":
        from .transcribe import transcribe
        for c in pick(a.classes): transcribe(c, a.force)
    elif a.cmd == "cut":
        from .cut import cut
        for c in pick(a.classes): cut(c, a.provider)
    elif a.cmd == "publish":
        from .publish import publish
        publish(a.force_media); run_eval()
    elif a.cmd == "review":
        from .serve import serve; serve(a.port)
    elif a.cmd == "eval":
        sys.exit(run_eval())
    elif a.cmd == "all":
        from .transcribe import transcribe
        from .cut import cut
        from .publish import publish
        for c in pick(a.classes): transcribe(c); cut(c, a.provider)
        publish(); run_eval()


if __name__ == "__main__":
    main()
