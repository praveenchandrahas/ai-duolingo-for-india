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

## Demo flow
Pick role, language, minutes/day → weekly plan → open a day → play a snippet (try the 30× demo speed)
→ tap **I'm stuck** (pick a question, a length, or type one) → watch the short clip → back to the lesson
→ quick check (try a wrong answer to see the clip surface) → progress and cohort screens.

## Layout
- `js/data.js`  all content: roles, plans, snippet index, UI strings in English/Hindi/Telugu
- `js/app.js`   screens and the player
- `css/style.css`  hand-drawn look

A snippet with a `src` field will play a real video; without one the player shows placeholder footage.
