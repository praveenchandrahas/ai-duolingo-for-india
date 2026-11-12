/* Prototype content. Everything here is hand-written placeholder data.
   In the proof of concept this file is replaced by the snippet index produced by the content studio
   (transcribe -> AI cuts -> AI tags -> human review).

   Model: role -> topics. Each topic is one lesson = a short explainer video + one exercise.
   The exercise is "fix the prompt": the learner adds details to a weak prompt and sees the AI answer change.
   Every useful detail (chip with ok:1) carries the "I'm stuck" question it answers and the clip that teaches it. */

window.DURATIONS = { "10s": 10, "20s": 20, "1m": 60, "10m": 600 };

window.LANGS = {
  en: { name: "English", native: "English" },
  hi: { name: "Hindi", native: "हिन्दी" },
  te: { name: "Telugu", native: "తెలుగు" }
};

/* UI strings. Lesson content stays in English in the prototype; real videos carry the chosen language. */
window.I18N = {
  en: {
    tagline: "Learn AI for your own job, in minutes a day", start: "Get started", next: "Next",
    pickRole: "What do you do?", pickRoleSub: "We build your plan around your work.",
    pickTopics: "What should AI help you with?", pickTopicsSub: "Pick up to 3. Your plan starts with these.",
    pickLevel: "How much have you used AI?", pickLevelSub: "We start where you are.",
    lvNew: "New to AI", lvNewSub: "I have not really used it",
    lvSome: "Tried it a few times", lvSomeSub: "I have asked it a few things",
    lvOften: "I use it most weeks", lvOftenSub: "I want to get better at it",
    pickLang: "Which language?", pickLangSub: "Videos play in this language.",
    pickMins: "Minutes per day?", pickMinsSub: "We cut the lessons to fit.", min: "min", build: "Build my plan",
    building: "Building your plan", startLesson: "Start lesson 1",
    yourWeek: "Your week", today: "Today", stuck: "I'm stuck", progress: "Progress", cohort: "Cohort", plan: "Plan",
    streak: "day streak", soon: "Soon", explainer: "Explainer", exercise: "Exercise",
    nowYouTry: "Now you try", skipToExercise: "Skip to the exercise", yourTask: "Your task",
    addToPrompt: "Add to your prompt", send: "Send", sendAgain: "Send again",
    stuckOn: "What are you stuck on?", askOwn: "Or type your question", find: "Find",
    backToExercise: "Back to my exercise", gotIt: "Got it", stillStuck: "Still stuck",
    finish: "Finish lesson", lessonDone: "Lesson done", seeWeek: "See my week",
    leaderboard: "This week in your cohort", you: "You"
  },
  hi: {
    tagline: "अपने काम के लिए AI सीखिए, रोज़ कुछ मिनटों में", start: "शुरू करें", next: "आगे",
    pickRole: "आप क्या काम करते हैं?", pickRoleSub: "हम आपके काम के हिसाब से प्लान बनाते हैं।",
    pickTopics: "AI से किस काम में मदद चाहिए?", pickTopicsSub: "3 तक चुनें। आपका प्लान इन्हीं से शुरू होगा।",
    pickLevel: "आपने AI कितना इस्तेमाल किया है?", pickLevelSub: "हम वहीं से शुरू करते हैं जहाँ आप हैं।",
    lvNew: "AI में नया हूँ", lvNewSub: "अभी तक खास इस्तेमाल नहीं किया",
    lvSome: "कुछ बार आज़माया है", lvSomeSub: "कुछ सवाल पूछे हैं",
    lvOften: "लगभग हर हफ़्ते इस्तेमाल करता हूँ", lvOftenSub: "और बेहतर होना चाहता हूँ",
    pickLang: "कौन सी भाषा?", pickLangSub: "वीडियो इसी भाषा में चलेंगे।",
    pickMins: "रोज़ कितने मिनट?", pickMinsSub: "हम पाठ को उसी हिसाब से काटते हैं।", min: "मिनट", build: "मेरा प्लान बनाएँ",
    building: "आपका प्लान बन रहा है", startLesson: "पाठ 1 शुरू करें",
    yourWeek: "आपका हफ़्ता", today: "आज", stuck: "मैं अटक गया", progress: "प्रगति", cohort: "समूह", plan: "प्लान",
    streak: "दिन की लड़ी", soon: "जल्द", explainer: "वीडियो", exercise: "अभ्यास",
    nowYouTry: "अब आप कोशिश करें", skipToExercise: "सीधे अभ्यास पर जाएँ", yourTask: "आपका काम",
    addToPrompt: "अपने प्रॉम्प्ट में जोड़ें", send: "भेजें", sendAgain: "फिर भेजें",
    stuckOn: "आप कहाँ अटके हैं?", askOwn: "या अपना सवाल लिखें", find: "खोजें",
    backToExercise: "अभ्यास पर वापस", gotIt: "समझ गया", stillStuck: "अभी भी अटका हूँ",
    finish: "पाठ पूरा करें", lessonDone: "पाठ पूरा", seeWeek: "मेरा हफ़्ता देखें",
    leaderboard: "इस हफ़्ते आपके समूह में", you: "आप"
  },
  te: {
    tagline: "మీ పనికి AI నేర్చుకోండి, రోజుకు కొన్ని నిమిషాల్లో", start: "ప్రారంభించండి", next: "తర్వాత",
    pickRole: "మీరు ఏ పని చేస్తారు?", pickRoleSub: "మీ పనికి తగ్గట్టు ప్లాన్ తయారు చేస్తాం.",
    pickTopics: "AI ఏ పనిలో సహాయం చేయాలి?", pickTopicsSub: "3 వరకు ఎంచుకోండి. మీ ప్లాన్ వీటితో మొదలవుతుంది.",
    pickLevel: "మీరు AI ఎంత వాడారు?", pickLevelSub: "మీరు ఉన్న చోటి నుంచే మొదలుపెడతాం.",
    lvNew: "AI నాకు కొత్త", lvNewSub: "ఇంతవరకు పెద్దగా వాడలేదు",
    lvSome: "కొన్నిసార్లు ప్రయత్నించాను", lvSomeSub: "కొన్ని ప్రశ్నలు అడిగాను",
    lvOften: "దాదాపు ప్రతి వారం వాడతాను", lvOftenSub: "ఇంకా మెరుగవ్వాలనుకుంటున్నాను",
    pickLang: "ఏ భాష?", pickLangSub: "వీడియోలు ఈ భాషలో వస్తాయి.",
    pickMins: "రోజుకు ఎన్ని నిమిషాలు?", pickMinsSub: "పాఠాలను దానికి తగ్గట్టు కట్ చేస్తాం.", min: "నిమి", build: "నా ప్లాన్ తయారు చేయండి",
    building: "మీ ప్లాన్ తయారవుతోంది", startLesson: "పాఠం 1 మొదలుపెట్టండి",
    yourWeek: "మీ వారం", today: "ఈరోజు", stuck: "నేను ఇరుక్కున్నాను", progress: "పురోగతి", cohort: "గ్రూప్", plan: "ప్లాన్",
    streak: "రోజుల వరుస", soon: "త్వరలో", explainer: "వీడియో", exercise: "అభ్యాసం",
    nowYouTry: "ఇప్పుడు మీరు ప్రయత్నించండి", skipToExercise: "నేరుగా అభ్యాసానికి", yourTask: "మీ పని",
    addToPrompt: "మీ ప్రాంప్ట్‌కు జోడించండి", send: "పంపండి", sendAgain: "మళ్లీ పంపండి",
    stuckOn: "ఎక్కడ ఇరుక్కున్నారు?", askOwn: "లేదా మీ ప్రశ్న రాయండి", find: "వెతుకు",
    backToExercise: "అభ్యాసానికి తిరిగి", gotIt: "అర్థమైంది", stillStuck: "ఇంకా ఇరుక్కున్నాను",
    finish: "పాఠం పూర్తి చేయండి", lessonDone: "పాఠం పూర్తి", seeWeek: "నా వారం చూడండి",
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

window.LEVELS = [
  { id: "new", icon: "🌱", key: "lvNew", sub: "lvNewSub", explainer: "1m", plan: "New to AI: a 1-minute explainer before every exercise" },
  { id: "some", icon: "🌿", key: "lvSome", sub: "lvSomeSub", explainer: "20s", plan: "Some experience: 20-second explainers, more time on practice" },
  { id: "often", icon: "🌳", key: "lvOften", sub: "lvOftenSub", explainer: "10s", plan: "Regular user: 10-second recaps, straight to practice" }
];

/* The real-human presenters (placeholders until the videos arrive). */
window.PRESENTERS = {
  teacher: { name: "Anjali ma'am", title: "Former Class 8 science teacher", tone: "#CFE8E4" },
  marketing: { name: "Rohit", title: "Brand marketer, 9 years", tone: "#F9D9C8" },
  sales: { name: "Farhan", title: "Field sales lead", tone: "#F6D97A" },
  finance: { name: "Meenakshi", title: "Chartered accountant", tone: "#E3DDF2" }
};

/* Topic fields
   ex     explainer video: title + 4 caption lines (shorter levels use fewer lines)
   task   what the learner must get the AI to produce
   base   the weak prompt they start with
   head   title of the AI's answer
   chips  details the learner can add to the prompt.
          ok:1  -> useful. `no`/`yes` = the answer line without/with it, `bad`/`good` = the label on that line,
                   `q` = the "I'm stuck" question it answers, `title` + `tip` = the 20-second clip.
          else  -> a distractor; `note` explains why it did nothing.
   next   title of the follow-up lesson shown (locked) in the plan */
window.TOPICS = {
  teacher: [
    { id: "worksheets", icon: "📝", name: "Worksheets & question papers", next: "Turn a worksheet into a question paper",
      ex: { title: "Why the first worksheet never fits", lines: ["Ask an AI for a worksheet and you get one in seconds.", "But it doesn't know your class, so it writes for nobody in particular.", "Tell it three things: who the students are, how much you want, and how simple the words should be.", "Same AI, same topic, and now the worksheet fits your classroom."] },
      task: "Get a photosynthesis worksheet your Class 7 can actually do.", base: "Make a worksheet on photosynthesis.", head: "Worksheet: Photosynthesis",
      chips: [
        { t: "Please make it really good.", note: "“Make it good” gave the AI nothing to work with." },
        { t: "It is for Class 7, mixed reading levels.", ok: 1, no: "1. Describe the light-dependent reactions in the thylakoid membrane.", yes: "1. What three things does a plant need to make food?", bad: "Too hard for Class 7", good: "Right level for Class 7",
          q: "The questions are too hard for my class.", title: "Tell the AI who your students are", tip: ["The AI can't see your classroom.", "Say the class and the level, and the questions come down to match."] },
        { t: "Give 5 questions with an answer key.", ok: 1, no: "… and 19 more questions, with no answers", yes: "… 4 more questions, with an answer key", bad: "Too long, no answer key", good: "5 questions with answers",
          q: "There are far too many questions, and no answers.", title: "Say how much you want", tip: ["Ask for a number: five questions, with an answer key.", "The AI stops guessing how much you need."] },
        { t: "IMPORTANT!!! EASY!!!", note: "Shouting didn't help. Details do." },
        { t: "Use short sentences and everyday words.", ok: 1, no: "Instructions: Attempt all questions with reference to the prescribed text.", yes: "Instructions: Write short answers. One line is enough.", bad: "Textbook language", good: "Simple, everyday words",
          q: "The language is too difficult for my students.", title: "Ask for simple words", tip: ["Tell the AI how the words should sound: short sentences, everyday words.", "It will rewrite everything that way."] }
      ] },
    { id: "lessonplans", icon: "🗓️", name: "Lesson plans", next: "Plan a whole week in one go",
      ex: { title: "A lesson plan in 30 seconds", lines: ["A lesson plan takes you an hour. An AI drafts one in 30 seconds.", "The draft is only as good as what you tell it.", "Give it the class, the time you have, and what is in your room.", "Then you fix it, because you are the teacher."] },
      task: "Get a plan for tomorrow's class on fractions that you could really teach.", base: "Write a lesson plan on fractions.", head: "Lesson plan: Fractions",
      chips: [
        { t: "It is Class 5's first lesson on fractions.", ok: 1, no: "Start: Revise equivalent fractions from last year.", yes: "Start: Fold a paper in half. “This is one half.”", bad: "Assumes they already know fractions", good: "Starts from zero for Class 5",
          q: "The plan is too advanced for my students.", title: "Say the class and what they already know", tip: ["The AI can't tell what your students have learnt.", "Say the class and where they are, and the plan starts in the right place."] },
        { t: "Make it the best lesson plan ever.", note: "“Best ever” told the AI nothing new." },
        { t: "I have one 40-minute period.", ok: 1, no: "Length: a 3-day unit with an assessment.", yes: "Length: one 40-minute period, in 4 steps.", bad: "Far too long", good: "Fits one period",
          q: "The plan is far too long for one period.", title: "Give it your time limit", tip: ["Tell the AI exactly how long you have.", "It cuts the plan to fit the bell."] },
        { t: "I have only chalk, a board and paper.", ok: 1, no: "Activity: a tablet quiz and a projector slideshow.", yes: "Activity: pair work with paper strips and chalk.", bad: "Needs a projector and tablets", good: "Uses what you have",
          q: "It asks for things my school doesn't have.", title: "Tell it what is in your room", tip: ["List what you really have: chalk, board, paper.", "The activities change to match."] },
        { t: "Think step by step.", note: "It sounded clever and changed nothing here." }
      ] },
    { id: "explain", icon: "💡", name: "Explaining hard topics", next: "Five ways to explain one idea",
      ex: { title: "An explanation your students can follow", lines: ["Some topics are hard to explain, even when you know them well.", "An AI can give you five different ways to explain the same idea.", "Say who it is for, ask for an example from their life, and keep it short.", "Pick the one that fits and make it yours."] },
      task: "Get an explanation of day and night that a Class 4 child will follow.", base: "Explain day and night.", head: "Why we have day and night",
      chips: [
        { t: "It is for a 9-year-old in Class 4.", ok: 1, no: "The Earth rotates on an axis inclined at 23.5° to its orbital plane.", yes: "The Earth is like a ball that keeps turning.", bad: "Written for adults", good: "Right for a 9-year-old",
          q: "The explanation is too difficult for children.", title: "Say the child's age", tip: ["Tell the AI the child's age or class.", "It changes its words to match."] },
        { t: "Use an example from daily life.", ok: 1, no: "The terminator line divides the illuminated hemisphere from the dark one.", yes: "Shine a torch on a ball: the bright side is day, the dark side is night.", bad: "No example, only theory", good: "Uses a torch and a ball",
          q: "It is all theory, with no example.", title: "Ask for an everyday example", tip: ["Ask for an example from daily life.", "Children remember the torch and the ball, not the definition."] },
        { t: "Explain it properly.", note: "“Properly” means nothing to an AI." },
        { t: "Be very detailed.", note: "“Very detailed” made it longer, not clearer." },
        { t: "Keep it to 4 short sentences.", ok: 1, no: "(continues for a full page)", yes: "(4 sentences in total)", bad: "Too long to use in class", good: "Four short sentences",
          q: "The answer is too long to use in class.", title: "Set the length", tip: ["Say how long you want it: four sentences, or one minute.", "The AI sticks to it."] }
      ] },
    { id: "parents", icon: "✉️", name: "Messages to parents", next: "A term's worth of parent updates",
      ex: { title: "Messages parents will read", lines: ["A note to parents has to be short, kind and clear.", "An AI can draft it in seconds, but it guesses the tone.", "Tell it who is reading, the tone you want, and the one thing they must do.", "Read it once as a parent before you send it."] },
      task: "Write a note asking parents to help with reading practice at home.", base: "Write a message to parents about reading.", head: "Message to parents",
      chips: [
        { t: "Make it professional.", note: "“Professional” made it stiffer." },
        { t: "Parents are busy and will read it on a phone.", ok: 1, no: "Dear Parent/Guardian, it has been observed that reading proficiency is below the expected standard.", yes: "Namaste! A short note about reading this term.", bad: "Reads like an office circular", good: "Short enough for a phone",
          q: "It sounds like an office circular.", title: "Say who is reading, and where", tip: ["Tell the AI who will read it and on what.", "A parent on a phone needs four lines, not a circular."] },
        { t: "Be warm and respectful, not complaining.", ok: 1, no: "Parents have not been monitoring reading at home.", yes: "Your child is working hard, and a little help at home goes a long way.", bad: "Sounds like a complaint", good: "Warm and respectful",
          q: "The tone feels like I am blaming the parents.", title: "Name the tone", tip: ["Say the tone in plain words: warm, respectful, not complaining.", "The AI follows it closely."] },
        { t: "Use impressive words.", note: "Impressive words are harder to read." },
        { t: "End with one request: 10 minutes of reading a day.", ok: 1, no: "Kindly take necessary action.", yes: "Could you listen to them read aloud for 10 minutes each evening?", bad: "No clear request", good: "One clear request",
          q: "Parents won't know what to do after reading it.", title: "End with one ask", tip: ["Decide the one thing you want parents to do.", "Ask the AI to end with exactly that."] }
      ] }
  ],

  marketing: [
    { id: "social", icon: "📱", name: "Social media posts", next: "A week of posts from one idea",
      ex: { title: "Posts that sound like your brand", lines: ["An AI can write ten posts before your tea gets cold.", "Left alone, it writes the average of every brand on the internet.", "Tell it the customer, the tone, and the one offer.", "You pick the best and add the detail only you know."] },
      task: "Get an Instagram caption for a cafe's new mango lassi.", base: "Write an Instagram post for our new mango lassi.", head: "Instagram caption",
      chips: [
        { t: "It is for college students near our Hyderabad cafe.", ok: 1, no: "Introducing our NEW Mango Lassi, a treat the whole family will love!", yes: "Exams got you melting? 🥭", bad: "Could be for anyone", good: "Speaks to college students",
          q: "The post could be for any brand, anywhere.", title: "Name the customer", tip: ["Say exactly who you want to reach.", "The AI changes its words, jokes and offers to fit them."] },
        { t: "Make it go viral.", note: "“Go viral” is a wish, not an instruction." },
        { t: "Sound playful, like a friend texting.", ok: 1, no: "Crafted with the finest ingredients for a refreshing experience.", yes: "Bring a friend. We'll pretend you're studying.", bad: "Sounds like an advertisement", good: "Sounds like a friend",
          q: "It sounds like an advertisement.", title: "Describe the voice", tip: ["Describe the voice like a person: a friend texting.", "Better still, paste a post you like and say: write like this."] },
        { t: "Add lots of hashtags.", note: "Twenty hashtags added clutter, not reach." },
        { t: "Under 30 words, with one offer: ₹49 with a college ID.", ok: 1, no: "Visit us today! #mango #lassi #food #yum #instafood #foodie …", yes: "₹49 with your college ID, this week only.", bad: "Long, with no offer", good: "Short, with one offer",
          q: "The caption is long and has no hook.", title: "Set the length and the offer", tip: ["Give a word limit and the one offer.", "Short posts with one ask get the taps."] }
      ] },
    { id: "ads", icon: "🎯", name: "Ad copy", next: "Three versions to test",
      ex: { title: "One ad, one person, one action", lines: ["A good ad says one thing to one person.", "An AI will happily write an ad that says everything to everyone.", "Give it the buyer, the result they want, and the action to take.", "Then ask for three versions and test them."] },
      task: "Get ad copy for a weekend tailoring class.", base: "Write an ad for our tailoring class.", head: "Ad copy",
      chips: [
        { t: "Make it catchy.", note: "“Catchy” gave the AI nothing to aim at." },
        { t: "Lead with the result: a first paid order in 6 weeks.", ok: 1, no: "Join our Tailoring Class!", yes: "Your first paid stitching order in 6 weeks.", bad: "Leads with the product", good: "Leads with the result",
          q: "It lists features but doesn't sell.", title: "Lead with the result", tip: ["People buy the result, not the syllabus.", "Tell the AI the result and ask it to open with that."] },
        { t: "It is for women who want to earn from home.", ok: 1, no: "Experienced trainers, modern machines, flexible timings, certificates.", yes: "Weekend classes for women who want to earn from home.", bad: "Features for nobody in particular", good: "Speaks to one buyer",
          q: "The ad isn't speaking to anyone in particular.", title: "Say who the buyer is", tip: ["Start with the buyer, not the product.", "One clear person makes the whole ad sharper."] },
        { t: "End with: WhatsApp us to book a free trial.", ok: 1, no: "Limited seats. Enrol now for a bright future!", yes: "WhatsApp us to book a free trial class.", bad: "No clear next step", good: "One clear next step",
          q: "People won't know what to do next.", title: "Give one next step", tip: ["Every ad needs one action.", "Give the AI the exact words of the call to action."] },
        { t: "Use powerful words.", note: "Powerful words, same weak message." }
      ] },
    { id: "email", icon: "📧", name: "Customer emails", next: "A subject line people open",
      ex: { title: "Emails people actually open", lines: ["Most marketing emails are deleted in two seconds.", "An AI drafts one fast, but it loves long, polite paragraphs.", "Tell it the reader, the one piece of news, and the length.", "Then cut one more sentence yourself."] },
      task: "Get an email telling past customers about a Diwali offer.", base: "Write an email about our Diwali offer.", head: "Email",
      chips: [
        { t: "Under 80 words, with a subject line.", ok: 1, no: "(no subject line, then four long paragraphs)", yes: "Subject: A Diwali thank-you for you", bad: "Too long, no subject line", good: "Short, with a subject line",
          q: "The email is too long.", title: "Set the length", tip: ["Give a word limit and ask for a subject line.", "The AI cuts the politeness and keeps the news."] },
        { t: "Make it festive and grand.", note: "More adjectives, same vague offer." },
        { t: "It goes to customers who bought from us last year.", ok: 1, no: "Dear Valued Customer, we hope this email finds you well.", yes: "Hello again! You shopped with us last Diwali, so you hear this first.", bad: "Sounds like we have never met", good: "Greets a returning customer",
          q: "It sounds like we have never met the customer.", title: "Say who is reading", tip: ["Tell the AI what the reader already knows about you.", "A returning customer should be greeted like one."] },
        { t: "Sound very formal.", note: "Formal made it colder." },
        { t: "One offer: 20% off everything, this week only.", ok: 1, no: "We are delighted to announce a range of exciting offers.", yes: "20% off everything, this week only.", bad: "The offer is vague", good: "One clear offer",
          q: "The offer isn't clear.", title: "Give the exact offer", tip: ["The AI can't invent your offer.", "Give the number and the deadline, and it leads with them."] }
      ] },
    { id: "research", icon: "🔍", name: "Customer research", next: "Let the AI play your customer",
      ex: { title: "Better questions before you spend", lines: ["Before you spend on a campaign, you want to know what customers think.", "An AI can't replace real customers, but it can help you prepare.", "Tell it who you are asking, keep it short, and ask for plain words.", "Then test the questions on five real people."] },
      task: "Get survey questions to learn why customers left a tiffin service.", base: "Write survey questions for our customers.", head: "Survey",
      chips: [
        { t: "It is for customers who stopped ordering our tiffins.", ok: 1, no: "1. How satisfied are you with our service overall?", yes: "1. What was the main reason you stopped ordering?", bad: "Generic satisfaction questions", good: "Asks why they stopped",
          q: "The questions are too general.", title: "Say who you are asking, and why", tip: ["Tell the AI exactly who will answer and what you want to learn.", "The questions go straight to the point."] },
        { t: "Use plain words, no marketing terms.", ok: 1, no: "2. How would you rate our value proposition?", yes: "2. What would bring you back?", bad: "Marketing jargon", good: "Plain, everyday words",
          q: "The wording is full of jargon.", title: "Ask for plain words", tip: ["Customers don't say “value proposition”.", "Ask the AI for words a customer would use."] },
        { t: "Make it scientific.", note: "“Scientific” added jargon." },
        { t: "Only 5 questions, answerable in a minute on WhatsApp.", ok: 1, no: "… and 23 more questions", yes: "… 3 more questions, one minute in total", bad: "Nobody will finish it", good: "Five quick questions",
          q: "Nobody will finish this survey.", title: "Limit the questions", tip: ["Long surveys get abandoned.", "Give the AI a number and where it will be answered."] },
        { t: "Cover everything.", note: "Covering everything made it endless." }
      ] }
  ],

  sales: [
    { id: "callprep", icon: "📞", name: "Preparing for a call", next: "Research a customer in two minutes",
      ex: { title: "Two minutes of prep", lines: ["Twenty minutes of prep before every call is time you don't have.", "An AI can do the first draft of that prep in two minutes.", "Tell it who you are meeting, what you sell, and the format you want.", "Check the facts that matter, then walk in ready."] },
      task: "Prepare for a first meeting with a pharmacy owner.", base: "Help me prepare for a sales call.", head: "Call prep",
      chips: [
        { t: "I am meeting a pharmacy owner with 2 shops.", ok: 1, no: "Customer: a business that may need solutions.", yes: "Customer: a pharmacy owner running 2 shops.", bad: "Advice for any customer", good: "About this customer",
          q: "The advice is too general.", title: "Describe the customer", tip: ["The AI doesn't know who you are meeting.", "One line about the customer changes every answer."] },
        { t: "Help me close the deal for sure.", note: "No prompt can promise a deal." },
        { t: "I sell billing software for small shops.", ok: 1, no: "Pitch: explain your company's products and services.", yes: "Angle: billing and stock across both shops.", bad: "Doesn't know what you sell", good: "Tied to your product",
          q: "It doesn't mention my product.", title: "Say what you sell", tip: ["Tell the AI what you sell, in one line.", "It connects your product to the customer's problems."] },
        { t: "Be an expert salesman.", note: "A title alone changed little." },
        { t: "Give me 5 questions to ask, not a script.", ok: 1, no: "Script: “Hello Sir/Madam, may I take a few minutes of your valuable time?”", yes: "Ask: How do you bill today? What goes wrong at month-end? (+3 more)", bad: "A script to read out", good: "Questions to ask",
          q: "It gave me a script I can't use.", title: "Ask for the format you need", tip: ["Say what form you want: questions, not a script.", "The AI gives you exactly that shape."] }
      ] },
    { id: "followup", icon: "💬", name: "Follow-up messages", next: "Three follow-ups that don't nag",
      ex: { title: "The follow-up that gets a reply", lines: ["Most deals are lost in the silence after the meeting.", "An AI can turn your rough notes into a clear message in seconds.", "Give it what happened, the tone, and the one next step.", "Read it aloud. If you wouldn't say it, change it."] },
      task: "Write a WhatsApp follow-up to a school principal after a demo.", base: "Write a follow-up message.", head: "WhatsApp message",
      chips: [
        { t: "Make them reply fast.", note: "Urgency words made it pushier." },
        { t: "Yesterday I demoed our fee software to a school principal.", ok: 1, no: "Dear Sir/Madam, I am following up regarding our products and services.", yes: "Good morning, ma'am. Thank you for your time at yesterday's demo.", bad: "Doesn't mention the meeting", good: "Refers to the demo",
          q: "It doesn't mention what we discussed.", title: "Give it the context", tip: ["The AI wasn't in the meeting.", "Tell it what happened, and the message sounds like you were there."] },
        { t: "Be friendly and respectful, with no pressure.", ok: 1, no: "Please revert at the earliest with your decision.", yes: "No hurry at all; happy to answer any questions.", bad: "Sounds pushy", good: "Friendly, no pressure",
          q: "It sounds pushy.", title: "Name the tone", tip: ["Say the tone in plain words: friendly, no pressure.", "The AI drops the pushy phrases."] },
        { t: "End with: can we talk on Thursday at 4?", ok: 1, no: "Kindly do the needful.", yes: "Can we talk on Thursday at 4?", bad: "No next step", good: "One clear next step",
          q: "It doesn't say what should happen next.", title: "End with one next step", tip: ["A follow-up needs one easy next step.", "Give the AI the exact question to end on."] },
        { t: "Sound very professional.", note: "It got longer and stiffer." }
      ] },
    { id: "objections", icon: "🛡️", name: "Handling objections", next: "Practise three more objections",
      ex: { title: "Practise the hard conversation", lines: ["“It's too expensive.” Every salesperson hears it.", "An AI can play the customer, so you can practise in private.", "Tell it who to be, the exact objection, and how tough to be.", "Practise twice. The real call gets easier."] },
      task: "Set up a practice round with a customer who says your price is too high.", base: "Help me with objections.", head: "Practice round",
      chips: [
        { t: "Play a kirana shop owner I am selling a card machine to.", ok: 1, no: "Here are 10 tips for handling objections: listen, empathise…", yes: "(as the shop owner) “I already have a free QR code.”", bad: "Tips, not practice", good: "Plays the customer",
          q: "It only gives tips. I want to practise.", title: "Ask it to play the customer", tip: ["An AI can act a part.", "Tell it who to be, and you get a practice partner."] },
        { t: "Your objection: the monthly fee is too high.", ok: 1, no: "Customers may object about many things.", yes: "“₹299 every month is too much for my shop.”", bad: "Not the objection you face", good: "Raises the price objection",
          q: "It isn't raising the objection I actually face.", title: "Give the exact objection", tip: ["Give the AI the exact words customers say to you.", "Then you practise the real thing."] },
        { t: "Teach me to win every argument.", note: "A sale isn't an argument to win." },
        { t: "Give me magic words.", note: "There are no magic words." },
        { t: "Push back twice, then tell me what I did well.", ok: 1, no: "“OK, that sounds good. I'll take it.”", yes: "(pushes back twice, then tells you what worked)", bad: "Gives in too easily", good: "Pushes back, then gives feedback",
          q: "It gives in too easily.", title: "Set the difficulty", tip: ["Tell the AI how tough to be.", "Ask for feedback at the end, and it becomes a coach."] }
      ] },
    { id: "proposals", icon: "📄", name: "Quotes & proposals", next: "Turn call notes into a quote",
      ex: { title: "A proposal the buyer reads", lines: ["A proposal nobody reads wins nothing.", "An AI can draft one from your notes in a minute.", "Tell it the customer's problem, your exact offer, and the length.", "Check every number yourself before it goes out."] },
      task: "Draft a proposal for supplying uniforms to a school.", base: "Write a proposal for uniforms.", head: "Proposal",
      chips: [
        { t: "Make us look big.", note: "Bigger words, less trust." },
        { t: "The school had late deliveries last year.", ok: 1, no: "About us: established in 1998, a leading name in garments.", yes: "Last year your uniforms arrived late. This year they won't.", bad: "Talks about us", good: "Opens with their problem",
          q: "It talks about us, not the customer.", title: "Start with their problem", tip: ["Buyers read about their own problem first.", "Tell the AI the problem, and ask it to open with that."] },
        { t: "Our offer: all 600 sets in 21 days, or 5% off.", ok: 1, no: "We promise the best quality and timely service.", yes: "All 600 sets in 21 days, or 5% off.", bad: "Vague promises", good: "A specific promise",
          q: "The offer sounds vague.", title: "Give the exact offer", tip: ["“Best quality” means nothing to a buyer.", "Give the AI your numbers, and it writes a promise."] },
        { t: "Add our full company history.", note: "History pushed the offer to page 4." },
        { t: "One page, with a simple price table.", ok: 1, no: "(6 pages, with the price on page 5)", yes: "(one page, with a simple price table)", bad: "Much too long", good: "One page with prices",
          q: "It is much too long.", title: "Ask for one page", tip: ["Tell the AI the length and the layout.", "One page with a price table gets read."] }
      ] }
  ],

  finance: [
    { id: "numbers", icon: "📊", name: "Explaining numbers", next: "A monthly summary for the owner",
      ex: { title: "From figures to plain words", lines: ["Your manager asks why costs went up, and wants it in two lines.", "An AI is good at turning figures into plain words.", "Give it the figures, the reader, and the length.", "You check every number against the books."] },
      task: "Explain a 12% rise in costs to an owner who isn't an accountant.", base: "Explain why costs went up.", head: "Why costs rose",
      chips: [
        { t: "Figures: rent +₹40,000, power +₹25,000, salaries flat.", ok: 1, no: "Costs may have risen due to inflation and market conditions.", yes: "Rent rose ₹40,000 and power rose ₹25,000; salaries did not change.", bad: "Guesses at reasons", good: "Uses your figures",
          q: "It is guessing. It doesn't know my numbers.", title: "Give it the figures", tip: ["The AI can't see your books.", "Paste the figures, without names, and it explains those."] },
        { t: "Make it sound smart.", note: "Smart-sounding, harder to read." },
        { t: "It is for the owner, who is not an accountant.", ok: 1, no: "This reflects operating leverage dynamics.", yes: "In short: rent is the main reason.", bad: "Accounting jargon", good: "Plain words for the owner",
          q: "It uses terms the owner won't understand.", title: "Say who is reading", tip: ["Tell the AI who will read the answer.", "It swaps the jargon for plain words."] },
        { t: "Keep it to 3 lines, biggest reason first.", ok: 1, no: "(a full-page report)", yes: "(3 lines, biggest reason first)", bad: "Too long for a busy owner", good: "Three lines",
          q: "It is too long for a busy owner.", title: "Set the length and the order", tip: ["Say how long, and what comes first.", "Busy readers get the main point in line one."] },
        { t: "Be 100% accurate.", note: "Saying it doesn't make it so. You still check." }
      ] },
    { id: "clientnotes", icon: "✍️", name: "Notes to clients", next: "One note, three languages",
      ex: { title: "Jargon out, meaning in", lines: ["Clients don't read jargon. They read what they must do, and by when.", "An AI can rewrite a technical note in plain words.", "Tell it the reader, what must stay exact, and how to end.", "Compare it with your original before you send it."] },
      task: "Turn a technical GST note into a message a shop owner will act on.", base: "Simplify this GST note.", head: "Message to client",
      chips: [
        { t: "Make it very simple.", note: "“Very simple” also removed the deadline." },
        { t: "It is for a shop owner with no accounts training.", ok: 1, no: "ITC reconciliation discrepancies necessitate rectification.", yes: "Three purchase bills don't match what your supplier filed.", bad: "Still full of jargon", good: "Plain words",
          q: "It is still too technical.", title: "Say who is reading", tip: ["Tell the AI the reader has no accounts training.", "It explains the problem the way you would across a desk."] },
        { t: "Keep every date and amount exactly as written.", ok: 1, no: "Please fix this soon.", yes: "Fix it by the 10th and you pay no interest.", bad: "Dropped the due date", good: "Date kept exact",
          q: "It dropped an important date.", title: "Protect the facts", tip: ["Simplifying can lose a date or a condition.", "Tell the AI what must stay exact, then compare."] },
        { t: "Sound authoritative.", note: "Authority brought the jargon back." },
        { t: "End with what the client must do.", ok: 1, no: "Interest liability may accrue.", yes: "Please send us those 3 bills this week.", bad: "No clear action", good: "Says what to do",
          q: "The client won't know what to do.", title: "End with the action", tip: ["A client note should end with one action.", "Ask the AI to finish with exactly that."] }
      ] },
    { id: "sheets", icon: "🧮", name: "Spreadsheet help", next: "Clean a messy vendor list",
      ex: { title: "Ask for the formula, with your columns", lines: ["You know what you want from the sheet, but not the formula.", "An AI can write the formula, if it knows your sheet.", "Tell it your columns, the result you want, and your software.", "Test it on three rows before you trust it."] },
      task: "Get a formula that totals sales for each salesperson.", base: "Give me a formula to total sales.", head: "Formula",
      chips: [
        { t: "Column A is the salesperson, column C is the amount.", ok: 1, no: "Uses: Sales[Amount], a table you don't have", yes: "Uses: column A for names, column C for amounts", bad: "Doesn't match your sheet", good: "Uses your columns",
          q: "The formula doesn't match my sheet.", title: "Describe your columns", tip: ["The AI can't see your sheet.", "Tell it what is in each column, and the formula fits."] },
        { t: "I want one total per salesperson.", ok: 1, no: "Result: one grand total for everyone", yes: "Result: one total for each salesperson", bad: "Adds everything into one number", good: "A total for each person",
          q: "It adds everything into one number.", title: "Say the result you want", tip: ["Describe the answer you want to see.", "“One total per person” gets a different formula from “a total”."] },
        { t: "Give me the best formula.", note: "“Best” didn't tell it your columns." },
        { t: "I use Excel 2016. Explain each part.", ok: 1, no: "Function: GROUPBY, which Excel 2016 doesn't have", yes: "Function: SUMIF, works in Excel 2016, each part explained", bad: "Gives an error in your Excel", good: "Works in your Excel",
          q: "The formula gives an error in my Excel.", title: "Name your software", tip: ["Newer formulas don't work in older Excel.", "Tell the AI your version and ask it to explain each part."] },
        { t: "Make it advanced.", note: "Advanced made it harder to check." }
      ] },
    { id: "reminders", icon: "⏰", name: "Payment reminders", next: "A reminder sequence for late payers",
      ex: { title: "Firm, polite, paid", lines: ["Asking for money is awkward, so reminders get delayed.", "An AI can write a reminder that is firm and still polite.", "Give it the invoice, the tone, and the one thing to ask for.", "Check the amount twice before you send."] },
      task: "Write a reminder for an invoice that is 30 days overdue.", base: "Write a payment reminder.", head: "Payment reminder",
      chips: [
        { t: "Make them pay immediately.", note: "Demands made it sound like a threat." },
        { t: "Invoice 214 for ₹48,000, due 30 days ago.", ok: 1, no: "Your payment is overdue.", yes: "Invoice 214 for ₹48,000 was due last month.", bad: "No invoice details", good: "Names the invoice",
          q: "It doesn't mention the invoice.", title: "Give the details", tip: ["The AI can't know which invoice you mean.", "Give the number, the amount and the due date."] },
        { t: "Polite but firm. They are a long-standing customer.", ok: 1, no: "Failure to pay will result in legal action.", yes: "We value working with you, so this is a gentle reminder.", bad: "Sounds like a threat", good: "Polite but firm",
          q: "The tone is too harsh.", title: "Name the tone", tip: ["Say the tone and the relationship.", "A long-standing customer gets a different message from a stranger."] },
        { t: "Use legal language.", note: "Legal language scared; it didn't persuade." },
        { t: "Ask for a payment date.", ok: 1, no: "Remit immediately.", yes: "Could you tell us the date we can expect payment?", bad: "No clear ask", good: "Asks for a date",
          q: "It doesn't ask for anything specific.", title: "Make one clear ask", tip: ["A reminder should ask for one thing.", "A payment date is easier to give than money today."] }
      ] }
  ]
};

window.COHORTS = {
  teacher: { name: "Govt. schools, Warangal", people: [["Lakshmi", 340], ["Ravi", 310], ["Sunita", 280], ["Kiran", 220], ["Padma", 190], ["Anwar", 150]] },
  marketing: { name: "Hyderabad marketers", people: [["Neha", 360], ["Arjun", 300], ["Sana", 270], ["Vikram", 210], ["Isha", 180], ["Dev", 140]] },
  sales: { name: "Pharma sales, Vijayawada", people: [["Suresh", 350], ["Pooja", 320], ["Imran", 260], ["Ritu", 230], ["Varun", 170], ["Hema", 120]] },
  finance: { name: "CA firm staff, Chennai", people: [["Karthik", 330], ["Divya", 300], ["Mohan", 250], ["Anita", 215], ["Rahul", 160], ["Geeta", 130]] }
};
