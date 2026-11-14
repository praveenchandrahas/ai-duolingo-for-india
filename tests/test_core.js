/* Checks on the plan builder, the search and the review overlay.  node tests/test_core.js */
const assert = require("assert"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const A = require(path.join(root, "poc/js/core.js"));
const lib = JSON.parse(fs.readFileSync(path.join(root, "poc/data/library.json"), "utf8"));
const SN = A.byId(lib.snippets), CON = A.byId(lib.concepts), CLS = A.byId(lib.classes);
let n = 0; const ok = (name, fn) => { fn(); n++; console.log("ok  " + name); };

ok("every snippet is a run of whole sentences inside its class, cut in a pause", () => {
  for (const s of lib.snippets) {
    const S = CLS[s.class].sentences;
    assert(s.s0 >= 0 && s.s1 < S.length && s.s0 <= s.s1, s.id);
    assert(s.start <= S[s.s0][0] && s.end >= S[s.s1][1], s.id + " cuts into speech");
    if (s.s0 > 0) assert(s.start >= S[s.s0 - 1][1], s.id + " starts before the previous sentence ends");
    if (s.s1 + 1 < S.length) assert(s.end <= S[s.s1 + 1][0], s.id + " ends after the next sentence starts");
  }
});
ok("every approved snippet has a title, and a concept from the concept list", () => {
  for (const s of A.approved(lib)) { assert(s.title, s.id); assert(CON[s.concept], s.id + " concept " + s.concept); }
});
ok("a plan uses approved snippets only, keeps prerequisites first and respects the minutes", () => {
  for (const mins of [5, 10, 15]) for (const level of ["new", "some", "often"]) {
    const topics = A.liveTopics(lib, "teacher").map(t => t.id).slice(0, 3);
    const p = A.buildPlan(lib, { topics, level, mins });
    assert(p.days.length > 0);
    const seen = new Set(); let order = [];
    for (const d of p.days) {
      const longest = Math.max(...d.items.map(i => i.est));
      assert(d.minutes <= mins * 1.5 || d.items.length === 1 || longest > mins, `day ${d.n} is ${d.minutes} min at ${mins}/day`);
      for (const it of d.items) {
        if (it.type === "video") assert.strictEqual(SN[it.snippet].status, "approved");
        if (it.concept && it.use !== "class") { for (const pre of CON[it.concept].prereq) if (CON[pre].topic === it.topic && A.forConcept(lib, pre).length) assert(seen.has(pre), `${it.concept} before ${pre}`); seen.add(it.concept); }
        if (it.type === "exercise") for (const c of A.byId(lib.topics)[it.topic].concepts) seen.add(c);
      }
    }
  }
});
ok("level changes the length of the explainer", () => {
  const t = A.liveTopics(lib, "teacher")[0].id;
  const len = lv => SN[A.buildPlan(lib, { topics: [t], level: lv, mins: 10 }).items[0].snippet].dur;
  assert(len("new") > len("some") && len("some") >= len("often"), [len("new"), len("some"), len("often")].join(" "));
});
ok("help for an idea runs from short to long", () => {
  for (const c of lib.concepts) { const st = A.ladderFor(lib, c.id); for (let i = 1; i < st.length; i++) assert(st[i].dur > st[i - 1].dur, c.id); }
});
ok("a rejected snippet never reaches the plan or the search", () => {
  const t = A.liveTopics(lib, "teacher")[0], victim = A.ladderFor(lib, t.concepts[1])[0];
  const lib2 = A.applyReview(lib, { snippets: { [victim.id]: { status: "rejected" } } });
  assert(!A.approved(lib2).some(s => s.id === victim.id));
  const r = A.search(A.buildIndex(lib2), CON[t.concepts[1]].q, null);
  assert(!r.groups.some(g => g.steps.some(s => s.id === victim.id)));
  assert(!A.buildPlan(lib2, { topics: [t.id], level: "new", mins: 15 }).items.some(i => i.snippet === victim.id));
});
ok("moving a cut in review moves whole sentences and stays in the pause", () => {
  const s = lib.snippets.find(x => x.s0 > 2 && x.bucket === "20s"), S = CLS[s.class].sentences;
  const m = A.byId(A.applyReview(lib, { snippets: { [s.id]: { s0: s.s0 - 1 } } }).snippets)[s.id];
  assert.strictEqual(m.s0, s.s0 - 1); assert(m.start <= S[m.s0][0] && m.start >= S[m.s0 - 1][1]); assert(m.dur > s.dur);
});
ok("a question with nothing in the library gets no answer instead of a guess", () => {
  assert(A.search(A.buildIndex(lib), "what is the capital of France", null).none);
});
const res = require("./search_eval.js");
ok("search test list: right idea in the first three for at least 80% of questions", () => assert(res.top3_rate >= 0.8, JSON.stringify(res)));
console.log(n + " checks passed");
