# AI Launchpad

A multilingual, role-based micro-learning app for AI literacy in India.
Real people teach on video. AI cuts each class into short snippets and tags them, a person approves every cut,
the app builds a personal plan from the approved snippets, and the right snippet plays the moment a learner is stuck.

This repository holds two stages:

| Stage | Where | What it is |
| --- | --- | --- |
| 1. Click-through prototype | `/` (`index.html`) | The experience, with hand-written content and placeholder footage. No engine. |
| 2. Proof of concept | `/poc/` and `/poc/studio/` | The engine: a pipeline that turns video files into a reviewed snippet library, and an app that runs on that library. |

Pushing to `main` deploys both to GitHub Pages (`.github/workflows/pages.yml`).

## The proof of concept

```
library/raw/*.mp4 ──► transcribe ──► cut and tag ──► review ──► publish ──► poc/  (learner app)
   class videos       Whisper +        AI, on            a person     low-data      plan · player · exercises
                      pause finder     sentence          approves     video +       "I'm stuck" search
                      (on this         boundaries        or fixes     library.json
                      computer)
```

**Content studio** (`studio/`, Python):

1. `transcribe` pulls the audio out, finds the pauses (Silero VAD) and turns speech into text (Whisper), all on the
   local machine. The output is a list of sentences with start and end times, each starting and ending at a real pause.
2. `cut` gives the numbered sentences to an AI, which answers with snippets at several lengths (about 10 s, 20 s, 1 min,
   a section, the whole class). Each has a title, the idea it teaches, a level, and the learner questions it answers.
   A snippet is always a run of whole sentences, so a cut always lands in a pause. The AI never rewrites the teaching.
3. `review` opens the review screen: play each snippet, move its start or end a sentence at a time, fix the tags,
   approve or reject. Only approved snippets reach learners.
4. `publish` writes `poc/data/library.json`, a 360p copy and an audio-only copy of each class in `poc/media/`,
   and the numbers in `poc/data/metrics.json`. Originals are never changed.

**Learner app** (`poc/`, plain HTML/CSS/JS, no build step):

- Set-up: profession, topics, level, language, minutes a day.
- The plan is built by rules from approved snippets: chosen topics in order, each idea after the ones it builds on,
  explainer length by level, packed into days of the chosen length.
- The player plays a time range of the real class file, with captions, speed and an audio-only switch.
- Exercises: "fix the prompt" (pick details to add, see the answer change) and one-question quick checks.
  The sample AI answers in the exercises are written by a person; no AI talks to the learner.
- Just-in-time help, three ways in: the "I'm stuck" button (questions sorted by what the last answer missed),
  a typed or spoken question (searched over the approved snippets), and a wrong answer (the right snippet is offered).
  The shortest snippet that answers plays first; "Still stuck" steps up to the worked example, then the full class.
  If nothing in the library answers, the app says so and saves the question.
- Progress shows streak, where the learner got stuck, seconds from "stuck" to a video playing, and data used.
  Asking for help adds a refresher day to the plan. The cohort screen is still sample data.

**Review screen and numbers** (`poc/studio/`): the same page works from the local studio (saves to
`library/review.json`) and from the live link (saves in the browser, applies to the learner app on that device,
and can be downloaded). It also runs the search test list and shows the numbers for the gate.

## Run it

```bash
pip install sherpa-onnx numpy          # and ffmpeg on the PATH; Node.js is only needed for the search test
python -m studio setup                 # once: downloads the speech models (about 640 MB) into models/
python -m studio review                # review screen http://localhost:8765/poc/studio/ , app http://localhost:8765/poc/
```

To put a real class through it:

```bash
# 1. copy the video to library/raw/ and add an entry to library/classes.json (id, title, role, topic, language, source)
python -m studio transcribe my-class
export ANTHROPIC_API_KEY=...           # or use --provider file / --provider heuristic, see below
python -m studio cut my-class --provider anthropic
python -m studio review                # approve or fix the cuts
python -m studio publish               # then commit and push
```

`--provider file` reads `library/work/<class>/cuts.json`; the prompt is written to `cut_prompt.txt` next to it, so any
AI can be used by hand. `--provider heuristic` uses no AI (sections from long pauses, tags left empty).
Ideas, topics and exercises live in `library/concepts.json` and are written by a person.

Tests: `python -m unittest tests.test_studio` and `node tests/test_core.js`.

## What is real and what is not

Real:
- The pipeline ran on three video files: speech-to-text, pause detection, cuts on sentence boundaries, publish.
- Every video in the app is a time range of those files, chosen through that pipeline.
- The plan builder, the search, the three help triggers, the review screen and the numbers are working code.

Not real yet:
- **The three classes are stand-ins.** No real recordings were available, so the classes are scripts written by an AI
  and read by a synthetic voice over slides (`studio/standin/`). They are labelled on screen. They must be replaced.
- **The cuts and tags of the stand-in classes were made by Claude in the build session**, from the same prompt the
  pipeline sends, and approved after a text check. Nobody has listened to them. The path that calls the AI through the
  API is written and tested against a local stand-in, but has not been run against the real API (no key was available).
- 47 of 293 captions were corrected by hand where the speech-to-text was wrong (`library/work/*/fixes.json`).
  There is no screen for this yet.
- The search test list (`library/questions.json`) was written by the same AI that tagged the snippets, so its score
  is flattering. It needs questions from real learners.
- Hindi and Telugu: only buttons and labels. The classes are in English. The Hindi and Telugu labels need a native check.
- No accounts, no server: progress is kept in the browser. Cohorts and leaderboards are sample data.

## Numbers from this build

Measured on 3 stand-in classes (16.6 minutes of video, 64 snippets) on a 2-core machine with no GPU.
They show that each number can be measured; they are not a forecast for real recordings.

| What | Result |
| --- | --- |
| Speech-to-text | 38 minutes of computing per hour of video (Whisper small, 2 CPU cores) |
| Captions needing a hand fix | 47 of 293 sentences (16%) |
| AI work to cut and tag | about 24k tokens in and 22k out per hour of video (estimated from text length), once per video |
| Search, starter list | right idea first for 29 of 30 questions, in the first three for 30 of 30; 3 of 3 unanswerable questions refused |
| Coverage | 13 of 17 ideas have an approved snippet ("Explaining hard topics" has no class yet) |
| Data | 48 MB per hour of video at 360p (slides, so real footage will be higher); 15 MB per hour audio-only |
| Time from "stuck" to video playing | under 1 second on a local connection; measured per device on the Progress screen |

## Layout

- `studio/` pipeline (`transcribe.py`, `cut.py`, `publish.py`, `serve.py`) and `standin/` (the placeholder classes)
- `library/` source of truth: `classes.json`, `concepts.json`, `questions.json`, `review.json`, `raw/` videos,
  `work/<class>/` transcript, cut prompt, cuts, snippets, caption fixes
- `poc/` learner app (`js/app.js`, `js/core.js` for plan and search, `data/`, `media/`) and `studio/` review screen
- `index.html`, `js/`, `css/` the earlier click-through prototype
- `video/AI-Launchpad-explainer.mp4` the hand-drawn explainer video (synthetic voice and music)
- `tests/`
