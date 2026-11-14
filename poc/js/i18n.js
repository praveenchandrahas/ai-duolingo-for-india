/* UI strings (English, Hindi, Telugu), carried over from the click-through prototype, plus the sample cohort.
   Hindi and Telugu labels still need a check by native speakers. Strings added for the proof of concept are English only. */
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

window.COHORTS = {
  teacher: { name: "Govt. schools, Warangal", people: [["Lakshmi", 340], ["Ravi", 310], ["Sunita", 280], ["Kiran", 220], ["Padma", 190], ["Anwar", 150]] },
  marketing: { name: "Hyderabad marketers", people: [["Neha", 360], ["Arjun", 300], ["Sana", 270], ["Vikram", 210], ["Isha", 180], ["Dev", 140]] },
  sales: { name: "Pharma sales, Vijayawada", people: [["Suresh", 350], ["Pooja", 320], ["Imran", 260], ["Ritu", 230], ["Varun", 170], ["Hema", 120]] },
  finance: { name: "CA firm staff, Chennai", people: [["Karthik", 330], ["Divya", 300], ["Mohan", 250], ["Anita", 215], ["Rahul", 160], ["Geeta", 130]] }
};
