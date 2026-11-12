# AI Launchpad: click-through prototype

A multilingual, role-based micro-learning app for AI literacy in India.
Real-human videos, cut into short snippets, assembled into a personal plan,
with the right snippet surfaced the moment a learner taps "I'm stuck".

**Stage 1 (this repo):** click-through prototype. Hand-written content, placeholder footage.
**Stage 2 (next):** proof of concept. Real videos, AI-cut snippets, human review, live link.

## Run it
No build step. Open `index.html`, or serve the folder:

    python3 -m http.server 8000   # then open http://localhost:8000

On a phone-width screen it fills the screen; on a desktop it shows in a phone frame.
Pushing to `main` deploys to GitHub Pages (`.github/workflows/pages.yml`).

## Demo flow
1. **Set up:** profession → topics (up to 3) → level → language → minutes a day.
2. **Plan is built**, and the first lesson starts straight away.
3. **Explainer:** a short video (1 min, 20 sec or 10 sec, by level).
4. **Exercise:** a weak prompt and the AI's weak answer. The learner picks details to add and sends again;
   each line of the answer shows whether it now fits.
5. **I'm stuck:** inside the exercise. Questions are sorted by what the last answer still misses, or the learner
   types their own. A 20-second clip plays; "Still stuck" steps up to a 1-minute worked example, then the 10-minute class.
6. **Lesson done** → week plan, progress ("where you got stuck") and cohort screens.

## What is real and what is not
- The app, the flow and the exercise logic are real code.
- Videos are placeholder footage with captions. A clip with a `src` field would play a real video.
- The AI's answers are written by hand in `js/data.js`; no AI is called.
- Level changes the explainer length. Minutes change the daily mix shown in the plan; only the video and the
  exercise are playable.
- Buttons and labels switch between English, Hindi and Telugu. Lesson content is in English.

## Layout
- `js/data.js`  all content: roles, topics, explainers, exercises, clips, UI strings
- `js/app.js`   screens, player, exercise and the "I'm stuck" finder
- `css/style.css`  hand-drawn look

## Explainer video

[`video/AI-Launchpad-explainer.mp4`](video/AI-Launchpad-explainer.mp4) is a 1 min 51 s hand-drawn explainer of the app: the mission, real-teacher videos cut into snippets, the personalised plan, the fix-the-prompt exercise and the "I'm stuck" just-in-time help. The voice and music are synthetic placeholders.
