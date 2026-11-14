"""Stand-in classes for the proof of concept.

These are PLACEHOLDERS. The product teaches with real people on video; no real recordings were
available when the proof of concept was built, so these scripts are read by a synthetic voice over
plain slides. They exist only so the pipeline (transcribe -> cut -> tag -> review -> publish) has
something to work on. Replace them with real classes as soon as recordings are available.

Each beat is (kind, slide heading, slide lines, spoken text).
kind: title | story | rule | why | example | tip | recap.  A "rule" starts a new section.
"""

CLASSES = [
    {
        "id": "ws-01",
        "title": "Worksheets that fit your class",
        "topic": "worksheets",
        "beats": [
            ("title", "Worksheets that fit your class", ["A worksheet in seconds", "Written for nobody in particular"],
             "Hello, teachers. Today we make a worksheet with AI. Ask an AI for a worksheet and you get one in seconds. "
             "But it does not know your class. So it writes for nobody in particular."),
            ("story", "What I got the first time", ["Topic: photosynthesis, Class 7", "24 questions", "Q1: light-dependent reactions in the thylakoid membrane"],
             "Last year I asked for a worksheet on photosynthesis for my Class 7. I got twenty-four questions. "
             "The first one asked about light-dependent reactions in the thylakoid membrane. That is a college question. "
             "My students would have closed the notebook at question one. The AI was not wrong. It just did not know who it was writing for."),
            ("why", "Tell the AI three things", ["1. Who your students are", "2. How much you want", "3. How simple the words should be"],
             "The fix is simple. Tell the AI three things. Who your students are. How much you want. And how simple the words should be. "
             "Same AI, same topic, and now the worksheet fits your classroom."),
            ("story", "In this class", ["One worksheet, fixed step by step", "Then: check it before you print"],
             "In this class we take them one at a time, with the same photosynthesis worksheet. "
             "At the end, we check the worksheet before it goes to print."),

            ("rule", "Rule 1: say who your students are", ["Say the class and the level", "The questions come down to match"],
             "Rule one. Tell the AI who your students are. Say the class and the level, and the questions come down to match."),
            ("why", "Why it matters", ["The AI cannot see your classroom", "It aims at the middle of everything it has read", "Most of that was written for adults"],
             "The AI cannot see your classroom. It does not know if you teach Class 3 or a teacher training college. "
             "When it does not know, it aims at the middle of everything it has read, and most of that was written for adults. "
             "One line about your students changes its target."),
            ("example", "Worked example", ["Prompt: Make a worksheet on photosynthesis.", "✗ Q1: Describe the light-dependent reactions…", "+ It is for Class 7, with mixed reading levels.", "✓ Q1: What three things does a plant need to make food?"],
             "Let us try it. Here is the first prompt. Make a worksheet on photosynthesis. And here is question one from the AI. "
             "Describe the light-dependent reactions in the thylakoid membrane. Too hard for Class 7. "
             "Now I add one line to the prompt. It is for Class 7, with mixed reading levels. I send it again. "
             "Look at question one now. What three things does a plant need to make food? That is a question my Class 7 can answer. "
             "Sunlight, water and air. I did not ask the AI to be easy. I did not write the word simple. "
             "I only said who the students are, and the level changed by itself. "
             "If your class has children who read slowly, say that too. Mixed reading levels is a useful phrase. "
             "The AI will then mix easy and medium questions."),
            ("tip", "Common mistake: shouting", ["IMPORTANT!!! EASY!!!", "Easy for whom?", "Give the class, not the adjective"],
             "A common mistake here is to shout. Teachers type, important, make it easy, in capital letters. "
             "Capital letters tell the AI nothing new. Easy for whom? Easy for a Class 10 student is hard for Class 5. "
             "Give the class, not the adjective."),

            ("rule", "Rule 2: say how much you want", ["Ask for a number of questions", "Ask for the answer key"],
             "Rule two. Say how much you want. Ask for a number of questions, and ask for the answer key."),
            ("why", "Why it matters", ["No number? The AI guesses", "It gives 20 or 30 questions", "You have one period, and every notebook to correct"],
             "If you do not give a number, the AI guesses. And it likes to be generous. "
             "It will give you twenty or thirty questions, because more looks more helpful. "
             "But you have one period of forty minutes, and you have to correct every notebook."),
            ("example", "Worked example", ["✗ 24 questions, no answers", "+ Give five questions with an answer key.", "✓ 5 questions, 5 answers", "Also: say the kinds of questions, and the marks"],
             "Back to our worksheet. The level is right now, but look at the length. Twenty-four questions and no answers. "
             "So I add one more line to the prompt. Give five questions with an answer key. I send it. "
             "Now there are five questions, and under them, five answers. "
             "That fits one period, and the correction takes me ten minutes instead of an hour. "
             "You can go one step further. Tell it the kinds of questions. "
             "For example, two fill in the blanks, two one-line answers, and one diagram to label. The AI follows that list exactly. "
             "I often ask for the marks too. Five questions, ten marks in total. Then the worksheet is ready to become a small class test."),
            ("tip", "Tip: ask for the key in the same prompt", ["Ask later and the questions may change", "Ask once: questions and answers together"],
             "One more tip. Always ask for the answer key in the same prompt. If you ask later, the AI sometimes changes the questions. "
             "Ask once, and you get the questions and the answers together."),

            ("rule", "Rule 3: ask for simple words", ["Short sentences", "Everyday words"],
             "Rule three. Ask for simple words. Tell the AI how the language should sound. Short sentences and everyday words."),
            ("why", "Why it matters", ["The AI learnt to write from textbooks and reports", "For many students English is a second or third language", "They know the science but get stuck on the wording"],
             "The AI learnt to write from textbooks, reports and websites. So its natural voice sounds like a textbook. "
             "For many of our students, English is a second or third language. "
             "A child may know the science and still get stuck on the wording of the question."),
            ("example", "Worked example", ["✗ Attempt all questions with reference to the prescribed text.", "+ Use short sentences and everyday words.", "✓ Write short answers. One line is enough.", "✓ What does the green colour in a leaf do?"],
             "Look at the instruction line on our worksheet. It says, attempt all questions with reference to the prescribed text. "
             "No twelve-year-old talks like that. So I add the third line to the prompt. Use short sentences and everyday words. I send it. "
             "The instruction now says, write short answers. One line is enough. And the questions changed as well. "
             "Before, it asked, what is the significance of chlorophyll? Now it asks, what does the green colour in a leaf do? "
             "Same idea, in words a child uses. You can also name the language level. "
             "I sometimes write, use English that a Class 5 student can read. "
             "Or ask for the worksheet in Telugu or Hindi, if that is the language of your classroom."),
            ("tip", "Do not ask for impressive language", ["“Professional” makes it longer and stiffer", "Ask for short, plain and clear"],
             "Do not ask for impressive language. Do not ask it to be professional. Those words make the worksheet longer and stiffer. "
             "Ask for the opposite. Short, plain and clear."),

            ("rule", "Before you print: check it yourself", ["The AI drafts", "You are the teacher"],
             "Before you print, check the worksheet yourself. The AI drafts. You are the teacher."),
            ("example", "The full prompt, then three checks", ["Make a worksheet on photosynthesis. It is for Class 7, with mixed reading levels. Give five questions with an answer key. Use short sentences and everyday words.", "1. Read the answer key", "2. Check against your textbook", "3. Solve it once as a student"],
             "Here is the full prompt we built. Make a worksheet on photosynthesis. It is for Class 7, with mixed reading levels. "
             "Give five questions with an answer key. Use short sentences and everyday words. Four short lines. It took me under a minute to type. "
             "Now the checking. First, I read the answer key. AI makes mistakes with facts, and it makes them with full confidence. "
             "In one of my worksheets the key said plants breathe in oxygen to make food. That is wrong. It is carbon dioxide. "
             "If I had printed it, forty children would have learnt it wrong. "
             "Second, I check against my textbook. The AI does not know which chapter we finished. "
             "If question four is from next month's lesson, I remove it. "
             "Third, I solve the worksheet once as a student. If I need more than fifteen minutes, it is too long for my class."),
            ("tip", "Something wrong? Ask for one change", ["“Question three is too hard, make it simpler.”", "It keeps the rest and fixes that part"],
             "If something is wrong, you do not start again. Just tell the AI what to change. "
             "Question three is too hard, make it simpler. Or, replace question four with one about sunlight. "
             "It keeps the rest and fixes that one part."),

            ("recap", "To close", ["Who your students are", "How much you want", "How simple the words should be", "And: check before you print"],
             "Let us close. Three things to tell the AI every time. Who your students are. How much you want. How simple the words should be. "
             "And one thing for you to do. Check before you print. Try it today with the next topic in your own syllabus. "
             "Your first prompt will take two minutes. By the end of the week it will take thirty seconds. "
             "In the next class we use the same idea to plan a whole lesson."),
        ],
    },
    {
        "id": "lp-01",
        "title": "A lesson plan you can teach tomorrow",
        "topic": "lessonplans",
        "beats": [
            ("title", "A lesson plan you can teach tomorrow", ["An hour by hand", "Thirty seconds with AI"],
             "Hello again, teachers. A good lesson plan takes about an hour to write. An AI can draft one in thirty seconds. "
             "But the draft is only as good as what you tell it."),
            ("story", "What you get if you only say “fractions”", ["A three-day unit", "A projector and tablets", "Revision of things your class never learnt"],
             "Ask for a lesson plan on fractions and you may get a three-day unit, with a projector, tablets, "
             "and revision of things your class never learnt."),
            ("why", "Give it three things", ["1. The class and what they already know", "2. The time you have", "3. What is in your room"],
             "So give it three things. The class and what they already know. The time you have. And what is in your room. "
             "Then you fix the draft, because you are the teacher."),
            ("story", "Today's example", ["Class 5", "The first lesson on fractions"],
             "Today's example is the first lesson on fractions for Class 5."),

            ("rule", "1: the class and what they already know", ["Then the plan starts in the right place"],
             "First, say the class and what they already know. Then the plan starts in the right place."),
            ("why", "Why it matters", ["The AI cannot tell what your students have learnt", "It may revise something that was never taught"],
             "The AI cannot tell what your students have learnt. If you only say fractions, it may assume they met fractions last year. "
             "It will start with revision of something that was never taught."),
            ("example", "Worked example", ["Prompt: Write a lesson plan on fractions.", "✗ Start: revise equivalent fractions from last year", "+ It is Class 5's first lesson on fractions.", "✓ Start: fold a paper in half. This is one half."],
             "Here is my first prompt. Write a lesson plan on fractions. The plan begins like this. "
             "Start, revise equivalent fractions from last year. My Class 5 has never seen a fraction. So I add one line. "
             "It is Class 5's first lesson on fractions. Now the plan begins, fold a paper in half. This is one half. "
             "That is where a first lesson should begin, with something the children can hold. Notice the two parts of that line. "
             "Class 5 tells it the age. First lesson tells it the starting point. You need both. If your class is behind, say so. "
             "For example, most of them still find division hard. The plan will slow down and add practice."),
            ("tip", "Common mistake: “the best lesson plan ever”", ["It tells the AI nothing new", "Tell it about the children instead"],
             "A common mistake is to write, make it the best lesson plan ever. Best ever tells the AI nothing new. "
             "It was already trying its best. Tell it about the children instead."),

            ("rule", "2: your time limit", ["Say exactly how long you have", "It cuts the plan to fit the bell"],
             "Second, give it your time limit. Tell the AI exactly how long you have, and it cuts the plan to fit the bell."),
            ("why", "Why it matters", ["Without a limit it plans for a school with no bell", "You would finish a third of it"],
             "Without a time limit, the AI plans for an ideal school with no bell. "
             "You get an introduction, three activities, group work, a quiz and homework review. "
             "On paper it is lovely. In a real period you would finish a third of it."),
            ("example", "Worked example", ["✗ Length: a three-day unit with an assessment", "+ I have one forty-minute period.", "✓ One 40-minute period, in four steps", "5 start · 15 teach · 15 practise · 5 close"],
             "Look at our fractions plan. At the top it says, length, a three-day unit with an assessment. I have one period. "
             "So I add, I have one forty-minute period. I send it again. Now it says, length, one forty-minute period, in four steps. "
             "Five minutes to start, fifteen to teach, fifteen to practise, five to close. "
             "Every step has its minutes written next to it. That is a plan I can follow with a clock on the wall. "
             "If you lose time to attendance, tell it that too. I write, the first five minutes go to attendance. "
             "It then plans for thirty-five minutes, which is the truth."),
            ("tip", "Tip: minutes next to every step", ["When the class runs late", "You can see which step to drop"],
             "Ask for the minutes next to every step. Then, when the class runs late, you can see at a glance which step to drop."),

            ("rule", "3: what is in your room", ["List what you really have", "The activities change to match"],
             "Third, tell it what is in your room. List what you really have, and the activities change to match."),
            ("why", "Why it matters", ["It has read plans from schools with smart boards", "It does not know your room"],
             "The AI has read thousands of lesson plans from schools with smart boards and one tablet for each child. "
             "So that is what it suggests. It is not showing off. It simply does not know your room."),
            ("example", "Worked example", ["✗ Activity: a tablet quiz and a projector slideshow", "+ I have only chalk, a board and paper.", "✓ Pair work with paper strips and chalk", "Also say: 45 students, fixed benches, no printer"],
             "In our plan, the activity says, a tablet quiz and a projector slideshow. My school has neither. "
             "So I add the third line. I have only chalk, a board and paper. Now the activity is pair work with paper strips and chalk. "
             "Each pair folds a strip into halves, then quarters, and writes the fraction on it. "
             "That costs nothing, and I can do it tomorrow morning. You can list other things as well. "
             "Forty-five students in the room. Benches that do not move. No printer. Each of these changes the plan. "
             "With fixed benches, it stops asking for circles and group corners. With no printer, it stops asking for handouts."),
            ("tip", "Be honest about what the school lacks", ["The AI is not judging", "The more honest the list, the more usable the plan"],
             "Do not be shy about what your school lacks. The AI is not judging. The more honest the list, the more usable the plan."),

            ("recap", "To close", ["The class and what they know", "The time you have", "What is in your room", "The AI drafts. You decide."],
             "So, three lines for every lesson plan. The class and what they know. The time you have. What is in your room. "
             "Our full prompt was, write a lesson plan on fractions. It is Class 5's first lesson on fractions. "
             "I have one forty-minute period. I have only chalk, a board and paper. "
             "Read the draft once, change what does not suit your children, and it is ready. The AI drafts. You decide."),
        ],
    },
    {
        "id": "pm-01",
        "title": "Messages parents will read",
        "topic": "parents",
        "beats": [
            ("title", "Messages parents will read", ["Short, kind and clear", "The AI guesses the tone"],
             "Hello, teachers. Today, messages to parents. A note to parents has to be short, kind and clear. "
             "An AI can draft one in seconds. But it guesses the tone, and it usually guesses wrong."),
            ("story", "What you get if you only say “reading”", ["An office circular", "“Dear parent or guardian, it has been observed…”", "Parents stop at line two"],
             "Ask for a message about reading and you get an office circular. Dear parent or guardian, it has been observed, and so on. "
             "Parents stop reading at the second line."),
            ("why", "Tell it three things", ["1. Who is reading", "2. The tone you want", "3. The one thing parents should do"],
             "So tell it three things. Who is reading. The tone you want. And the one thing parents should do. "
             "Then read it once as a parent before you send it."),
            ("story", "Today's example", ["A note asking parents to help", "with reading practice at home"],
             "Our example today is a note asking parents to help with reading practice at home."),

            ("rule", "1: who is reading, and where", ["A parent on a phone needs four lines", "Not a circular"],
             "First, say who is reading, and where. A parent on a phone needs four lines, not a circular."),
            ("why", "Why it matters", ["The AI does not know your parents", "Most will open it on WhatsApp, on a small screen", "So it writes a formal letter"],
             "The AI does not know your parents. It does not know that most of them will open this on WhatsApp, "
             "on a small screen, on the bus home from work. "
             "When it does not know, it writes a formal letter, because school letters on the internet look like that."),
            ("example", "Worked example", ["Prompt: Write a message to parents about reading.", "✗ Dear parent or guardian, it has been observed…", "+ Parents are busy and will read it on a phone.", "✓ Namaste! A short note about reading this term."],
             "Here is the first prompt. Write a message to parents about reading. The draft begins, dear parent or guardian, "
             "it has been observed that reading proficiency is below the expected standard. Now I add one line. "
             "Parents are busy and will read it on a phone. I send it again. "
             "The new message begins, Namaste! A short note about reading this term. It is four lines long. No paragraphs to scroll through. "
             "You can tell it more about the readers. Many parents in my school read Telugu more easily than English. "
             "So I add, write it in simple Telugu. Some parents ask a neighbour to read messages to them. "
             "Then I ask for very short sentences, which are easy to read aloud."),
            ("tip", "Do not write “make it professional”", ["It gets stiffer and longer", "Ask for clear and respectful"],
             "Do not write, make it professional. Professional makes it stiffer and longer. "
             "For a parent, professional means clear and respectful, and you can ask for exactly that."),

            ("rule", "2: name the tone", ["Warm, respectful, not complaining", "The AI follows it closely"],
             "Second, name the tone. Say it in plain words. Warm, respectful, not complaining. The AI follows it closely."),
            ("why", "Why it matters", ["When the subject is a problem, the AI writes a complaint", "A parent who feels blamed does not help"],
             "Tone is where AI drafts go wrong most often. When the subject is a problem, like weak reading, the AI writes like a complaint. "
             "And a parent who feels blamed does not help. They get defensive, or they scold the child."),
            ("example", "Worked example", ["✗ Parents have not been monitoring reading at home.", "+ Be warm and respectful, not complaining.", "✓ Your child is working hard, and a little help at home goes a long way.", "Trick: describe the tone as a person"],
             "In our draft, one line says, parents have not been monitoring reading at home. "
             "Imagine receiving that after a twelve-hour shift. So I add, be warm and respectful, not complaining. "
             "The line becomes, your child is working hard, and a little help at home goes a long way. Same message. "
             "The child needs to read at home. But now the parent is on our side. Here is a trick I use. "
             "I describe the tone as a person. Write like a kind class teacher talking to a parent at the school gate. "
             "The AI understands a person better than a list of adjectives."),
            ("tip", "Tip: read it aloud once", ["Would you say it to a parent's face?", "If not, remove it"],
             "After the AI writes it, read the message aloud once. "
             "If you would not say a sentence to a parent's face, remove it."),

            ("rule", "3: end with one ask", ["Decide the one thing parents should do", "End with exactly that"],
             "Third, end with one ask. Decide the one thing you want parents to do, and ask the AI to end with exactly that."),
            ("why", "Why it matters", ["“Kindly take necessary action.” What action?", "A message works when the next step is small and clear"],
             "Most school messages end with, kindly take necessary action. What action? The parent does not know, so nothing happens. "
             "A message works when the parent knows the next step and the step is small."),
            ("example", "Worked example", ["✗ Kindly take necessary action.", "+ End with one request: ten minutes of reading a day.", "✓ Could you listen to them read aloud for ten minutes each evening?", "One message, one ask"],
             "Our draft ends that way. Kindly take necessary action. So I add the last line. "
             "End with one request, ten minutes of reading a day. "
             "Now it ends, could you listen to them read aloud for ten minutes each evening? That is something a parent can do tonight. "
             "Even a parent who cannot read English can listen and encourage. Keep it to one request. "
             "If you ask for reading, and homework checks, and a meeting, and the fee, parents do none of them. One message, one ask. "
             "If you need a reply, say how. For example, reply yes on WhatsApp. Then you can count who has seen it."),
            ("tip", "Tip: give a time", ["“Ten minutes each evening” is clear", "“Regularly” is not"],
             "And give a time. Ten minutes each evening is clear. Regularly is not."),

            ("recap", "To close", ["Who is reading", "The tone", "One ask", "Read it once as a parent"],
             "That is the whole method. Who is reading. The tone. One ask. Our full prompt was, write a message to parents about reading. "
             "Parents are busy and will read it on a phone. Be warm and respectful, not complaining. "
             "End with one request, ten minutes of reading a day. Before you press send, read it once as a parent. "
             "If it sounds like a friend who cares about your child, send it."),
        ],
    },
]
