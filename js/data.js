/* Prototype content. Everything here is hand-written placeholder data.
   In the PoC this file is replaced by the snippet index produced by the content studio
   (transcribe -> AI cuts -> AI tags -> human review).
   A snippet with a `src` field plays a real video; without one the player shows placeholder footage. */

window.DURATIONS = { "10s": 10, "20s": 20, "1m": 60, "5m": 300, "10m": 600, "15m": 900 };

window.LANGS = {
  en: { name: "English", native: "English" },
  hi: { name: "Hindi", native: "हिन्दी" },
  te: { name: "Telugu", native: "తెలుగు" }
};

/* UI strings. Video voice-over language follows the chosen language in the real product. */
window.I18N = {
  en: {
    tagline: "Learn AI for your own job, in minutes a day",
    start: "Get started", pickRole: "What do you do?", pickRoleSub: "We build your plan around your work.",
    pickLang: "Which language?", pickLangSub: "Videos play in this language.", pickMins: "Minutes per day?",
    pickMinsSub: "We cut the lessons to fit.", min: "min", build: "Build my plan", yourWeek: "Your week",
    today: "Today", watch: "Watch", done: "Done", stuck: "I'm stuck", progress: "Progress", cohort: "Cohort",
    plan: "Plan", streak: "day streak", xp: "XP", soon: "Soon", howCanWeHelp: "What's tricky?",
    askOwn: "Or type your question", find: "Find", shorter: "Say it shorter", example: "Show an example",
    deeper: "Go deeper", backToLesson: "Back to my lesson", gotIt: "Got it", stillStuck: "Still stuck",
    quickCheck: "Quick check", continue: "Continue", tryAgain: "Try again", lessonDone: "Lesson done",
    leaderboard: "This week in your cohort", you: "You"
  },
  hi: {
    tagline: "अपने काम के लिए AI सीखिए, रोज़ कुछ मिनटों में",
    start: "शुरू करें", pickRole: "आप क्या काम करते हैं?", pickRoleSub: "हम आपके काम के हिसाब से प्लान बनाते हैं।",
    pickLang: "कौन सी भाषा?", pickLangSub: "वीडियो इसी भाषा में चलेंगे।", pickMins: "रोज़ कितने मिनट?",
    pickMinsSub: "हम पाठ को उसी हिसाब से काटते हैं।", min: "मिनट", build: "मेरा प्लान बनाएँ", yourWeek: "आपका हफ़्ता",
    today: "आज", watch: "देखें", done: "पूरा", stuck: "मैं अटक गया", progress: "प्रगति", cohort: "समूह",
    plan: "प्लान", streak: "दिन की लड़ी", xp: "XP", soon: "जल्द", howCanWeHelp: "क्या मुश्किल लग रहा है?",
    askOwn: "या अपना सवाल लिखें", find: "खोजें", shorter: "छोटे में समझाएँ", example: "उदाहरण दिखाएँ",
    deeper: "और गहराई से", backToLesson: "पाठ पर वापस", gotIt: "समझ गया", stillStuck: "अभी भी अटका हूँ",
    quickCheck: "झटपट जाँच", continue: "आगे बढ़ें", tryAgain: "फिर कोशिश करें", lessonDone: "पाठ पूरा",
    leaderboard: "इस हफ़्ते आपके समूह में", you: "आप"
  },
  te: {
    tagline: "మీ పనికి AI నేర్చుకోండి, రోజుకు కొన్ని నిమిషాల్లో",
    start: "ప్రారంభించండి", pickRole: "మీరు ఏ పని చేస్తారు?", pickRoleSub: "మీ పనికి తగ్గట్టు ప్లాన్ తయారు చేస్తాం.",
    pickLang: "ఏ భాష?", pickLangSub: "వీడియోలు ఈ భాషలో వస్తాయి.", pickMins: "రోజుకు ఎన్ని నిమిషాలు?",
    pickMinsSub: "పాఠాలను దానికి తగ్గట్టు కట్ చేస్తాం.", min: "నిమి", build: "నా ప్లాన్ తయారు చేయండి", yourWeek: "మీ వారం",
    today: "ఈరోజు", watch: "చూడండి", done: "పూర్తి", stuck: "నేను ఇరుక్కున్నాను", progress: "పురోగతి", cohort: "గ్రూప్",
    plan: "ప్లాన్", streak: "రోజుల వరుస", xp: "XP", soon: "త్వరలో", howCanWeHelp: "ఏది కష్టంగా ఉంది?",
    askOwn: "లేదా మీ ప్రశ్న రాయండి", find: "వెతుకు", shorter: "క్లుప్తంగా చెప్పండి", example: "ఉదాహరణ చూపండి",
    deeper: "లోతుగా", backToLesson: "పాఠానికి తిరిగి", gotIt: "అర్థమైంది", stillStuck: "ఇంకా ఇరుక్కున్నాను",
    quickCheck: "త్వరిత పరీక్ష", continue: "కొనసాగించండి", tryAgain: "మళ్లీ ప్రయత్నించండి", lessonDone: "పాఠం పూర్తి",
    leaderboard: "ఈ వారం మీ గ్రూప్‌లో", you: "మీరు"
  }
};

window.ROLES = [
  { id: "teacher", icon: "📚", name: "School teacher", live: true },
  { id: "marketing", icon: "📣", name: "Marketing", live: true },
  { id: "sales", icon: "🤝", name: "Sales", live: true },
  { id: "finance", icon: "🧾", name: "Finance & accounts", live: true },
  { id: "hr", icon: "👥", name: "HR", live: false },
  { id: "student", icon: "🎓", name: "College student", live: false }
];

/* The real-human presenters (placeholders until the videos arrive). */
window.PRESENTERS = {
  teacher: { name: "Anjali ma'am", title: "Former Class 8 science teacher", tone: "#CFE8E4" },
  marketing: { name: "Rohit", title: "Brand marketer, 9 years", tone: "#F9D9C8" },
  sales: { name: "Farhan", title: "Field sales lead", tone: "#F6D97A" },
  finance: { name: "Meenakshi", title: "Chartered accountant", tone: "#E3DDF2" }
};

/* Each role has a 5-day week. Per day:
   title, blurb      what the learner sees in the plan
   hook              the real-task framing
   transcript[]      caption lines shown while the placeholder footage "plays"
   check             one quick question; `help` is the snippet surfaced on a wrong answer
   stuck[]           pre-tagged "questions this answers": the JIT index
                     v = snippet length, from = where the clip comes from in the long video */
window.PLANS = {
  teacher: [
    { title: "What AI can do for a lesson plan", blurb: "See AI draft a plan in 30 seconds, then fix it.", kind: "Video",
      transcript: ["Think of the last lesson plan you wrote. How long did it take?", "Today we'll ask an AI to draft one for Class 7 science, on photosynthesis.", "Notice what it gets right: the structure, the timing, the activities.", "Now notice what it gets wrong: it doesn't know your students or your textbook.", "That is the job: you are the teacher, the AI is your fast assistant."],
      check: { q: "What is the AI's draft best treated as?", options: ["A finished plan to print", "A first draft you correct", "Something to ignore"], correct: 1,
        help: { v: "20s", title: "The AI drafts, you decide", from: "02:40", lines: ["Treat every AI answer as a first draft.", "It is quick, but it doesn't know your class.", "You read it, fix it, and then use it."] } },
      stuck: [
        { q: "What exactly is AI doing here?", v: "20s", from: "00:35", title: "What an AI assistant is, in one breath", lines: ["It predicts useful text from what you ask.", "It has read a lot, but it has not met your students.", "So the better you describe them, the better the draft."] },
        { q: "The plan has mistakes. Is AI wrong?", v: "1m", from: "03:10", title: "Why AI sounds sure and still errs", lines: ["AI writes fluent text, even when a fact is off.", "That's why you always check dates, numbers and names.", "Look at this example: it listed the wrong organelle.", "Spotting that is your expertise at work."] },
        { q: "Can I trust it with student data?", v: "1m", from: "06:50", title: "What to never paste into AI", lines: ["Don't paste names, marks or photos of children.", "Describe the class instead: 'Class 7, 40 students, mixed level'.", "You get the same help without the risk."] }
      ] },
    { title: "Tell the AI your class, level and language", blurb: "One prompt that gets a Class 7 worksheet, not a generic one.", kind: "Exercise",
      transcript: ["Yesterday's draft was generic. Today we fix that with one sentence.", "Say who the learners are: Class 7, 40 students, government school.", "Say the level: some read well, some struggle with long sentences.", "Say the language: simple Telugu, with English terms in brackets.", "Same AI, same topic, and the answer is suddenly usable."],
      check: { q: "Which prompt will give the most useful worksheet?", options: ["Make a worksheet on photosynthesis", "Make a 10-question photosynthesis worksheet for Class 7, simple Telugu, mixed level", "Photosynthesis worksheet please, make it good"], correct: 1,
        help: { v: "20s", title: "Class, level, language", from: "01:55", lines: ["Three things change the answer most: who, how hard, which language.", "Say all three in the first sentence.", "Then ask for the format you want."] } },
      stuck: [
        { q: "These worksheet questions are too hard for my class.", v: "1m", from: "02:20", title: "Tell the AI the level, then ask again", lines: ["Say the class and the reading level out loud, to the AI.", "Add: 'use short sentences and everyday words'.", "Ask again and compare. Watch the difference."] },
        { q: "How do I get answers in Telugu?", v: "20s", from: "03:45", title: "Ask for the language in the prompt", lines: ["Write: 'answer in simple Telugu, English terms in brackets'.", "Check one answer yourself before sharing."] },
        { q: "Why does it give a different answer every time?", v: "1m", from: "05:05", title: "Same question, different answers", lines: ["AI is not a lookup table; it composes each answer fresh.", "So give it more detail to narrow what it writes.", "And save the prompts that worked for you."] }
      ] },
    { title: "Build this week's worksheet", blurb: "A real task: make and check a worksheet you will actually use.", kind: "Real task",
      transcript: ["Now the real task. Pick a topic you teach this week.", "Write your prompt: class, level, language, number of questions.", "Read what comes back as a student would.", "Cut what is too hard, fix what is wrong, keep what is good.", "Print it. That's a worksheet you made in ten minutes."],
      check: { q: "What should you do before giving it to students?", options: ["Nothing, AI is accurate", "Read it and fix errors", "Ask the AI if it is correct"], correct: 1,
        help: { v: "10s", title: "Always check first", from: "04:30", lines: ["Read it yourself before it reaches a child.", "That's the whole rule."] } },
      stuck: [
        { q: "How many questions should I ask for?", v: "20s", from: "01:10", title: "Start small", lines: ["Ask for 5 to 10 questions.", "You can always ask for more of the kind you liked."] },
        { q: "Can it make a picture or diagram?", v: "1m", from: "05:40", title: "Pictures and diagrams: what works today", lines: ["Describe the diagram in words and ask for labels to fill in.", "For real pictures, use a drawing you trust, and have the AI write the questions."] },
        { q: "The answers it gave look wrong.", v: "1m", from: "03:55", title: "When the AI is wrong", lines: ["Tell it exactly what is wrong and ask it to redo only that part.", "If it keeps failing, write that one yourself. It's your class."] }
      ] },
    { title: "Fix what went wrong", blurb: "Learn the three quick fixes for a bad AI answer.", kind: "Video",
      transcript: ["Some AI answers will miss. That's normal.", "Fix one: say what's wrong, in plain words.", "Fix two: give an example of what you wanted.", "Fix three: break the job into smaller steps.", "Try each on yesterday's worksheet."],
      check: { q: "An answer is too long. What's the quickest fix?", options: ["Start a new chat", "Tell it: 'shorter, five lines'", "Give up on AI"], correct: 1,
        help: { v: "20s", title: "Just say what to change", from: "01:20", lines: ["You can talk to the AI like a colleague.", "'Shorter', 'simpler', 'with an example', all work."] } },
      stuck: [
        { q: "I don't know what to say back to the AI.", v: "1m", from: "02:10", title: "Three sentences that fix most answers", lines: ["'Make it shorter.' 'Explain like I'm in Class 7.' 'Give one example.'", "Try these; they work on almost everything."] },
        { q: "Should I start a new chat?", v: "20s", from: "04:00", title: "When to start fresh", lines: ["If the chat is long and confused, start a new one.", "Paste the best prompt and begin again."] },
        { q: "Is it okay to use AI at all in teaching?", v: "10m", from: "08:00", title: "Using AI as a teacher: the long conversation", lines: ["Anjali ma'am talks through her own doubts and rules.", "What she delegates, what she never does, and what she tells parents."] }
      ] },
    { title: "Share a lesson with your cohort", blurb: "Post your best prompt; borrow two from colleagues.", kind: "Assignment",
      transcript: ["Learning sticks when you share it.", "Pick the prompt that worked best this week.", "Post it to your cohort with one line on what it made.", "Try two prompts from colleagues. Which saved you the most time?", "That's how a staff room learns together."],
      check: { q: "Why share your prompt with colleagues?", options: ["They can reuse and improve it", "It keeps the AI busy", "It is required"], correct: 0,
        help: { v: "10s", title: "Prompts are reusable", from: "02:00", lines: ["A good prompt is a small tool.", "Share it and the whole school saves time."] } },
      stuck: [
        { q: "How do I write a good prompt to share?", v: "1m", from: "01:30", title: "What a shareable prompt looks like", lines: ["Say what it is for, then paste the prompt.", "Mention what to change: class, topic, language."] },
        { q: "What if my cohort is not active?", v: "20s", from: "04:20", title: "Start with just one colleague", lines: ["Invite one colleague you trust.", "Two people sharing is already a cohort."] },
        { q: "What's next after this week?", v: "20s", from: "05:00", title: "Your next week", lines: ["Next week you'll build question banks and parent notes.", "Your plan updates with what you struggled with."] }
      ] }
  ],

  marketing: [
    { title: "What AI can do for a campaign", blurb: "Go from a brief to five campaign ideas in a minute.", kind: "Video",
      transcript: ["You have a launch next month and a blank page.", "Let's ask an AI for five campaign angles from a one-line brief.", "Notice the speed, and notice how safe the ideas feel.", "The AI gives volume; you give taste.", "Your job moves from typing to choosing."],
      check: { q: "What does AI give you most reliably?", options: ["A final, polished campaign", "Many quick options to choose from", "Your brand voice automatically"], correct: 1,
        help: { v: "20s", title: "Volume from AI, taste from you", from: "02:15", lines: ["AI is great at many options, fast.", "Choosing and sharpening is still your skill."] } },
      stuck: [
        { q: "All the ideas sound generic.", v: "1m", from: "03:00", title: "Why AI starts generic, and how to fix it", lines: ["With no detail, AI writes the average of all brands.", "Give it your customer, your tone and one thing you hate.", "Ask again and compare."] },
        { q: "What is a good brief to give it?", v: "1m", from: "01:30", title: "The 4-line brief", lines: ["Product. Customer. Goal. Tone.", "Four lines are enough to move from generic to useful."] },
        { q: "Is it safe to paste my client's data?", v: "20s", from: "05:20", title: "Client data and AI", lines: ["Remove names and numbers you wouldn't post publicly.", "When unsure, ask the client."] }
      ] },
    { title: "Write in your brand's voice", blurb: "Teach the AI your tone with three samples.", kind: "Exercise",
      transcript: ["Your brand sounds like someone. The AI doesn't know who.", "Paste three posts you love and say: write like this.", "Ask for a new post on the same product.", "Compare it with the generic version from yesterday.", "Save this voice prompt. You'll reuse it daily."],
      check: { q: "How do you best teach the AI your voice?", options: ["Describe it with adjectives only", "Show it three real samples", "Say 'sound professional'"], correct: 1,
        help: { v: "20s", title: "Show, don't tell", from: "01:40", lines: ["Samples beat adjectives.", "Paste three posts and say: write like this."] } },
      stuck: [
        { q: "It sounds too formal.", v: "20s", from: "02:30", title: "Loosen the tone", lines: ["Say: 'more casual, short sentences, one emoji at most'.", "Then show a sample line."] },
        { q: "Can it write in Hindi and Hinglish?", v: "1m", from: "04:10", title: "Hindi, Hinglish and code-mixing", lines: ["Name the exact mix you want, with a sample.", "Always have a native speaker read the final line."] },
        { q: "Will my posts look AI-written?", v: "1m", from: "05:45", title: "Keeping it human", lines: ["Edit every draft with one detail only you would know.", "That detail is what readers remember."] }
      ] },
    { title: "Build this week's content calendar", blurb: "A real task: a week of posts, checked and ready.", kind: "Real task",
      transcript: ["Open your content plan for the week.", "Give the AI your product, audience and three events.", "Ask for a calendar with a hook and format for each day.", "Cut two ideas you don't believe in.", "Schedule what's left."],
      check: { q: "What should you do with ideas you don't believe in?", options: ["Post them anyway", "Cut them", "Ask the AI to justify them"], correct: 1,
        help: { v: "10s", title: "You are the filter", from: "03:30", lines: ["Cut what you don't believe in.", "Fewer, better posts win."] } },
      stuck: [
        { q: "How many posts should I ask for?", v: "20s", from: "01:00", title: "Ask for a few more than you need", lines: ["Ask for ten, keep five.", "Having to cut makes the week stronger."] },
        { q: "Can it check my facts and claims?", v: "1m", from: "04:20", title: "Claims, numbers and the law", lines: ["Verify every number and claim yourself.", "Ads have rules; check them before posting."] },
        { q: "It repeats the same hook.", v: "20s", from: "02:50", title: "Break the pattern", lines: ["Tell it: 'no hook starting with a question'.", "Constraints create variety."] }
      ] },
    { title: "Fix what went wrong", blurb: "Three quick fixes when the copy misses.", kind: "Video",
      transcript: ["Some copy will miss. Here's how to fix it quickly.", "Say what's wrong, plainly.", "Show an example of what you wanted.", "Break the job into smaller steps.", "Try each on yesterday's calendar."],
      check: { q: "The copy is too long. Best fix?", options: ["Delete lines yourself every time", "Say: 'half the length, keep the hook'", "Start over"], correct: 1,
        help: { v: "20s", title: "Say what to change", from: "01:20", lines: ["Tell the AI exactly what to change.", "It redoes it in seconds."] } },
      stuck: [
        { q: "How do I give feedback to AI?", v: "1m", from: "02:00", title: "Feedback the AI can use", lines: ["Be specific: 'shorter', 'warmer', 'drop the second line'.", "One change at a time."] },
        { q: "It ignores my instruction.", v: "1m", from: "03:40", title: "When it ignores you", lines: ["Move the instruction to the first line.", "Repeat it at the end if it still slips."] },
        { q: "How do I keep a good prompt?", v: "20s", from: "05:10", title: "Save what works", lines: ["Keep a notes file of your best prompts.", "Reuse and improve them each week."] }
      ] },
    { title: "Share a campaign idea with your cohort", blurb: "Post your best prompt; borrow two.", kind: "Assignment",
      transcript: ["Share your best prompt of the week.", "Add one line on what it made.", "Try two from colleagues.", "Which saved you the most time?", "That's how a team gets faster together."],
      check: { q: "Why share prompts?", options: ["Teams reuse and improve them", "To impress people", "It's a rule"], correct: 0,
        help: { v: "10s", title: "Prompts are tools", from: "02:00", lines: ["Share a good prompt and the whole team saves time."] } },
      stuck: [
        { q: "What makes a prompt worth sharing?", v: "1m", from: "01:30", title: "A shareable prompt", lines: ["Say what it's for.", "Show the result.", "Note what to change."] },
        { q: "My team doesn't use AI.", v: "20s", from: "04:00", title: "Start with one friend", lines: ["Pick one person and share one prompt.", "Show, don't preach."] },
        { q: "What next?", v: "20s", from: "05:00", title: "Next week", lines: ["Next: ad copy testing and reporting.", "Your plan updates from what you struggled with."] }
      ] }
  ],

  sales: [
    { title: "What AI can do before a sales call", blurb: "Prep a call in two minutes instead of twenty.", kind: "Video",
      transcript: ["You've a call at 4pm with a distributor.", "Ask the AI to summarise what that business likely cares about.", "Ask for five questions worth asking.", "Notice it's a good start, not the truth.", "You check, then you walk in prepared."],
      check: { q: "The AI's research on a customer is...", options: ["A starting point to verify", "Always accurate", "Not useful"], correct: 0,
        help: { v: "20s", title: "Prep, then verify", from: "02:00", lines: ["AI gives you a head start.", "Check the facts that matter before you quote them."] } },
      stuck: [
        { q: "What should I ask the AI to prep?", v: "1m", from: "01:20", title: "A 3-part prep prompt", lines: ["Who they are. What they need. What to ask.", "Paste what you already know about them."] },
        { q: "It invented a fact about the customer.", v: "1m", from: "03:30", title: "Invented facts", lines: ["AI can write confident, wrong details.", "Never quote a fact you haven't checked."] },
        { q: "Can I paste the customer's emails?", v: "20s", from: "05:10", title: "Customer data", lines: ["Remove personal details first.", "Follow your company's rules."] }
      ] },
    { title: "Write a follow-up that sounds like you", blurb: "Turn call notes into a clear message.", kind: "Exercise",
      transcript: ["After the call you've rough notes and no time.", "Paste the notes and say who it's for.", "Ask for a short message in your tone.", "Read it aloud. Would you say that?", "Fix one line and send."],
      check: { q: "What should you do before sending the message?", options: ["Read it aloud and edit", "Send immediately", "Ask AI to send it"], correct: 0,
        help: { v: "10s", title: "Read it aloud", from: "02:10", lines: ["If you wouldn't say it, change it."] } },
      stuck: [
        { q: "It sounds pushy.", v: "20s", from: "02:20", title: "Soften the tone", lines: ["Say: 'friendly, no pressure, one clear next step'."] },
        { q: "Can it write in Hindi or Telugu?", v: "1m", from: "03:50", title: "Local-language messages", lines: ["Name the language and the formality.", "Have a native speaker read the first one."] },
        { q: "How long should it be?", v: "20s", from: "01:30", title: "Keep it short", lines: ["Three to five lines.", "One ask at the end."] }
      ] },
    { title: "Handle an objection", blurb: "A real task: rehearse the 'price is too high' call.", kind: "Real task",
      transcript: ["The hardest part of sales is the objection.", "Ask the AI to play the customer who says 'too expensive'.", "Practise your answer out loud, then type it.", "Ask it to rate the answer and suggest one change.", "Repeat twice. You're better already."],
      check: { q: "How can AI help you practise?", options: ["By playing the customer", "By closing the deal for you", "By hiding objections"], correct: 0,
        help: { v: "20s", title: "AI as a practice partner", from: "01:40", lines: ["Tell it to play the customer.", "Practice is free and private."] } },
      stuck: [
        { q: "How do I set up the role-play?", v: "1m", from: "02:00", title: "Setting up a role-play", lines: ["Say who they are, their mood, and their objection.", "Ask it to stay in character."] },
        { q: "It's too easy on me.", v: "20s", from: "03:20", title: "Make it harder", lines: ["Say: 'push back twice before agreeing'."] },
        { q: "Is it ok to use AI on a live call?", v: "1m", from: "05:00", title: "Live calls", lines: ["Use it before and after, not during.", "Customers can tell when you're reading."] }
      ] },
    { title: "Fix what went wrong", blurb: "Three quick fixes when a draft misses.", kind: "Video",
      transcript: ["Some drafts miss. Fix them fast.", "Say what's wrong.", "Show an example.", "Break it into steps.", "Try each on yesterday's message."],
      check: { q: "The draft is vague. Best fix?", options: ["Add specifics about the customer", "Make it longer", "Start over"], correct: 0,
        help: { v: "20s", title: "Specifics beat length", from: "01:30", lines: ["Vague in, vague out.", "Add the customer's name, product and need."] } },
      stuck: [
        { q: "How do I give feedback?", v: "1m", from: "02:00", title: "Feedback the AI can use", lines: ["Be specific, one change at a time."] },
        { q: "It keeps repeating itself.", v: "20s", from: "03:00", title: "Repetition", lines: ["Start a fresh chat with your best prompt."] },
        { q: "Can I trust the numbers?", v: "1m", from: "04:00", title: "Numbers", lines: ["Check every number against your own source."] }
      ] },
    { title: "Share a winning script with your cohort", blurb: "Post your best prompt; borrow two.", kind: "Assignment",
      transcript: ["Share the prompt that saved you the most time.", "Say what it made.", "Try two from colleagues.", "Keep the best.", "Your team gets faster together."],
      check: { q: "Why share?", options: ["Teams reuse and improve", "To compete", "It's a rule"], correct: 0,
        help: { v: "10s", title: "Share to speed up", from: "02:00", lines: ["A shared prompt saves everyone time."] } },
      stuck: [
        { q: "What makes it shareable?", v: "1m", from: "01:30", title: "Shareable prompts", lines: ["Say what it's for, show the result."] },
        { q: "My team isn't on it.", v: "20s", from: "04:00", title: "Start small", lines: ["One friend is enough."] },
        { q: "What next?", v: "20s", from: "05:00", title: "Next week", lines: ["Proposals and follow-up sequences."] }
      ] }
  ],

  finance: [
    { title: "What AI can do for your books", blurb: "Explain a variance in plain words, in a minute.", kind: "Video",
      transcript: ["Your manager asks why costs rose 12%.", "Paste the figures (no names) and ask the AI to explain.", "It writes a clear explanation, quickly.", "But it can't see the ledger; you verify.", "You're the accountant. The AI is the typist."],
      check: { q: "What must you do with AI-written numbers?", options: ["Verify against the ledger", "Trust them", "Round them"], correct: 0,
        help: { v: "20s", title: "Numbers need checking", from: "02:30", lines: ["AI can slip on arithmetic and facts.", "Tie every figure back to your books."] } },
      stuck: [
        { q: "Can AI do the calculations?", v: "1m", from: "03:00", title: "AI and arithmetic", lines: ["Use a spreadsheet for the maths.", "Use AI to explain and draft."] },
        { q: "Is it safe to paste client figures?", v: "1m", from: "04:30", title: "Client confidentiality", lines: ["Strip names, PAN and bank details.", "Use rounded or sample figures if unsure."] },
        { q: "What should I ask first?", v: "20s", from: "01:10", title: "A good first prompt", lines: ["Say the audience, the figures and what you want explained."] }
      ] },
    { title: "Write a clear note to a client", blurb: "Turn a technical point into plain Hindi or English.", kind: "Exercise",
      transcript: ["Clients don't read jargon.", "Paste your technical note and ask for plain words.", "Ask for three lines, no more.", "Check no meaning changed.", "Send."],
      check: { q: "What's the risk when AI simplifies a note?", options: ["It may change the meaning", "It becomes too short", "None"], correct: 0,
        help: { v: "20s", title: "Simpler can mean wrong", from: "02:00", lines: ["Compare the simple version with the original.", "Make sure no condition has disappeared."] } },
      stuck: [
        { q: "It dropped a condition.", v: "1m", from: "03:00", title: "Lost conditions", lines: ["Tell it: 'keep every condition and deadline'.", "Check against the original."] },
        { q: "Can it write in Hindi?", v: "1m", from: "04:00", title: "Hindi notes", lines: ["Ask for simple Hindi with English terms in brackets."] },
        { q: "How long should it be?", v: "20s", from: "01:30", title: "Three lines", lines: ["One point, one reason, one next step."] }
      ] },
    { title: "Reconcile a messy list", blurb: "A real task: clean a vendor list with AI and check it.", kind: "Real task",
      transcript: ["You've a vendor list with spelling variants.", "Ask the AI to group likely duplicates.", "Don't merge yet; review the groups.", "Fix the ones it got wrong.", "Then merge in your system."],
      check: { q: "When AI groups duplicates, what next?", options: ["Review before merging", "Merge all", "Delete the list"], correct: 0,
        help: { v: "10s", title: "Review before you merge", from: "03:00", lines: ["Merging is hard to undo.", "Check every group first."] } },
      stuck: [
        { q: "How do I paste a big list?", v: "1m", from: "01:30", title: "Large lists", lines: ["Work in batches of 50 rows.", "Keep a copy of the original."] },
        { q: "It missed obvious duplicates.", v: "20s", from: "03:40", title: "Missed matches", lines: ["Ask it to look again with examples."] },
        { q: "Is there a safer way?", v: "1m", from: "05:00", title: "A safer pipeline", lines: ["Use AI to suggest, a spreadsheet to apply, you to approve."] }
      ] },
    { title: "Fix what went wrong", blurb: "Three quick fixes when an answer misses.", kind: "Video",
      transcript: ["Some answers will miss.", "Say what's wrong.", "Show an example.", "Break it into steps.", "Try each on yesterday's note."],
      check: { q: "An explanation is vague. Best fix?", options: ["Ask for a worked example", "Ignore it", "Make it longer"], correct: 0,
        help: { v: "20s", title: "Ask for an example", from: "01:30", lines: ["A worked example exposes gaps fast."] } },
      stuck: [
        { q: "How do I give feedback?", v: "1m", from: "02:00", title: "Feedback the AI can use", lines: ["Be specific; one change at a time."] },
        { q: "It sounds sure but is wrong.", v: "1m", from: "03:00", title: "Confident errors", lines: ["Ask it to show its steps.", "Check each step."] },
        { q: "Should I start fresh?", v: "20s", from: "04:00", title: "Start fresh", lines: ["If the chat gets confused, restart with your best prompt."] }
      ] },
    { title: "Share a checklist with your cohort", blurb: "Post your best prompt; borrow two.", kind: "Assignment",
      transcript: ["Share a prompt that saved you time.", "Say what it made.", "Try two from colleagues.", "Keep the best.", "Your office gets faster together."],
      check: { q: "Why share?", options: ["Teams reuse and improve", "To compete", "It's a rule"], correct: 0,
        help: { v: "10s", title: "Share to speed up", from: "02:00", lines: ["A shared prompt saves everyone time."] } },
      stuck: [
        { q: "What makes it shareable?", v: "1m", from: "01:30", title: "Shareable prompts", lines: ["Say what it's for, show the result."] },
        { q: "My office isn't on it.", v: "20s", from: "04:00", title: "Start small", lines: ["One colleague is enough."] },
        { q: "What next?", v: "20s", from: "05:00", title: "Next week", lines: ["Reports and audits."] }
      ] }
  ]
};

window.COHORTS = {
  teacher: { name: "Govt. schools, Warangal", people: [["Lakshmi", 340], ["Ravi", 310], ["Sunita", 280], ["Kiran", 220], ["Padma", 190], ["Anwar", 150]] },
  marketing: { name: "Hyderabad marketers", people: [["Neha", 360], ["Arjun", 300], ["Sana", 270], ["Vikram", 210], ["Isha", 180], ["Dev", 140]] },
  sales: { name: "Pharma sales, Vijayawada", people: [["Suresh", 350], ["Pooja", 320], ["Imran", 260], ["Ritu", 230], ["Varun", 170], ["Hema", 120]] },
  finance: { name: "CA firm staff, Chennai", people: [["Karthik", 330], ["Divya", 300], ["Mohan", 250], ["Anita", 215], ["Rahul", 160], ["Geeta", 130]] }
};
