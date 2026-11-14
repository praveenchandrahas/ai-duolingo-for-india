/* AI Launchpad proof of concept: the logic that does not touch the screen.
   Used by the learner app, by the review screen, and by the tests under Node.

   - applyReview   lay the reviewer's decisions over the library
   - buildPlan     a personal plan from approved snippets (rules, no AI)
   - buildIndex / search / ladderFor   the just-in-time finder: shortest snippet that answers, then longer ones

   Only snippets with status "approved" ever reach a learner. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AILP = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var PAD_BEFORE = 0.15, PAD_AFTER = 0.25;
  var ORDER = ["10s", "20s", "1m", "section", "class"];

  function cutTimes(S, s0, s1) {
    var a = S[s0], b = S[s1];
    var start = s0 > 0 ? Math.max(a[0] - PAD_BEFORE, (S[s0 - 1][1] + a[0]) / 2) : Math.max(0, a[0] - PAD_BEFORE);
    var end = s1 + 1 < S.length ? Math.min(b[1] + PAD_AFTER, (b[1] + S[s1 + 1][0]) / 2) : b[1] + PAD_AFTER;
    return [Math.round(start * 100) / 100, Math.round(end * 100) / 100];
  }
  function bucket(d) { return d <= 15 ? "10s" : d <= 40 ? "20s" : d <= 100 ? "1m" : d <= 330 ? "section" : "class"; }
  function lenLabel(d) {
    if (d < 52) return Math.max(5, Math.round(d / 5) * 5) + " sec";
    return Math.max(1, Math.round(d / 60)) + " min";
  }
  function clock(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2); }
  function byId(list) { var m = {}; list.forEach(function (x) { m[x.id] = x; }); return m; }

  /* ---------- review overlay ---------- */
  function applyReview(lib, overlay) {
    var o = (overlay && overlay.snippets) || {}, classes = byId(lib.classes);
    var out = Object.assign({}, lib);
    out.snippets = lib.snippets.map(function (s) {
      var r = o[s.id]; if (!r) return s;
      var n = Object.assign({}, s);
      ["status", "title", "summary", "concept", "level", "questions", "reviewer", "reviewed_at", "note"].forEach(function (k) { if (k in r) n[k] = r[k]; });
      if ("s0" in r || "s1" in r) {
        var S = classes[n.class].sentences;
        n.s0 = Math.max(0, Math.min(+("s0" in r ? r.s0 : n.s0), S.length - 1));
        n.s1 = Math.max(n.s0, Math.min(+("s1" in r ? r.s1 : n.s1), S.length - 1));
        var t = cutTimes(S, n.s0, n.s1);
        n.start = t[0]; n.end = t[1]; n.dur = Math.round((t[1] - t[0]) * 100) / 100; n.bucket = bucket(n.dur); n.edited = true;
      }
      return n;
    });
    out.snippets.forEach(function (x) {
      var best = null;
      out.snippets.forEach(function (y) {
        if (y !== x && y.class === x.class && y.s0 <= x.s0 && y.s1 >= x.s1 && (y.s1 - y.s0) > (x.s1 - x.s0) && (!best || y.dur < best.dur)) best = y;
      });
      x.parent = best ? best.id : null;
    });
    return out;
  }
  function approved(lib) { return lib.snippets.filter(function (s) { return s.status === "approved"; }); }
  function textOf(lib, sn) {
    var c = byId(lib.classes)[sn.class]; if (!c) return "";
    return c.sentences.slice(sn.s0, sn.s1 + 1).map(function (x) { return x[2]; }).join(" ");
  }

  /* ---------- what is available ---------- */
  var NOMINAL = { "10s": 10, "20s": 22, "1m": 60, section: 180, "class": 600 };
  function pickLen(list, want) {
    /* the snippet whose length is closest to the one wanted (10 s, 20 s, 1 min ...), compared as a ratio */
    var target = NOMINAL[want] || 60, best = null, bd = 1e9;
    list.forEach(function (s) { var d = Math.abs(Math.log(s.dur / target)); if (d < bd) { best = s; bd = d; } });
    return best;
  }
  function forConcept(lib, cid) { return approved(lib).filter(function (s) { return s.concept === cid; }); }
  function topicLive(lib, topic) {
    return forConcept(lib, topic.intro).length > 0 && topic.concepts.some(function (c) { return c !== topic.intro && forConcept(lib, c).length > 0; });
  }
  function liveTopics(lib, role) { return lib.topics.filter(function (t) { return t.role === role && topicLive(lib, t); }); }
  function roleLive(lib, role) { return liveTopics(lib, role).length > 0; }

  /* Help for one concept: shortest first, then each longer step once. */
  function ladderFor(lib, cid, scores) {
    var own = forConcept(lib, cid).filter(function (s) { return s.kind !== "class"; });
    if (!own.length) own = forConcept(lib, cid);
    if (!own.length) return [];
    var all = byId(lib.snippets), chain = own.slice();
    var top = own.slice().sort(function (a, b) { return b.dur - a.dur; })[0], p = top.parent && all[top.parent];
    while (p) { if (p.status === "approved" && chain.indexOf(p) < 0) chain.push(p); p = p.parent && all[p.parent]; }
    var per = {};
    chain.forEach(function (s) {
      var cur = per[s.bucket];
      var better = !cur || (scores ? (scores[s.id] || 0) > (scores[cur.id] || 0) : rank(s) < rank(cur));
      if (better) per[s.bucket] = s;
    });
    var steps = ORDER.map(function (b) { return per[b]; }).filter(Boolean);
    /* The first answer should explain, not only state: start at the 20-second step when there is one. */
    if (steps.length > 1 && steps[0].bucket === "10s" && steps[1].bucket === "20s") steps.shift();
    return steps;
    function rank(s) { return ({ point: 0, why: 1, example: 2, tip: 3, hook: 4, section: 5, "class": 6 })[s.kind] || 9; }
  }

  /* ---------- plan builder (rules) ---------- */
  function topo(ids, concepts) {
    var out = [], seen = {};
    function visit(id) {
      if (seen[id]) return; seen[id] = 1;
      (concepts[id].prereq || []).forEach(function (p) { if (ids.indexOf(p) >= 0) visit(p); });
      out.push(id);
    }
    ids.forEach(visit); return out;
  }
  function buildPlan(lib, profile) {
    var concepts = byId(lib.concepts), topics = byId(lib.topics), levels = byId(lib.levels);
    var lv = levels[profile.level] || lib.levels[0], mins = profile.mins || 10, items = [];
    (profile.topics || []).forEach(function (tid) {
      var tp = topics[tid]; if (!tp || !topicLive(lib, tp)) return;
      var ex = pickLen(forConcept(lib, tp.intro).filter(function (s) { return s.kind !== "class"; }), lv.explainer);
      if (ex) items.push({ key: "v:" + ex.id, type: "video", use: "explainer", snippet: ex.id, topic: tid, concept: tp.intro, est: ex.dur / 60, title: ex.title });
      items.push({ key: "x:" + tid, type: "exercise", topic: tid, est: 3, title: tp.exercise.task });
      topo(tp.concepts, concepts).forEach(function (cid) {
        if (cid === tp.intro) return;
        var c = concepts[cid], pool = forConcept(lib, cid).filter(function (s) { return s.kind !== "class" && s.kind !== "section"; });
        var deep = pickLen(pool, profile.level === "often" ? "20s" : "1m");
        if (!deep) return;
        items.push({ key: "v:" + deep.id, type: "video", use: "deepen", snippet: deep.id, topic: tid, concept: cid, est: deep.dur / 60, title: c.title });
        if (c.check) items.push({ key: "c:" + cid, type: "check", topic: tid, concept: cid, est: 1, title: "Quick check: " + c.title });
      });
      var full = approved(lib).filter(function (s) { return s.kind === "class" && byId(lib.classes)[s.class].topic === tid; })[0];
      if (full && mins >= 10) items.push({ key: "v:" + full.id, type: "video", use: "class", snippet: full.id, topic: tid, concept: tp.intro, est: full.dur / 60, title: "Full class: " + byId(lib.classes)[full.class].title });
    });
    (profile.stuck || []).forEach(function (cid) {
      var c = concepts[cid]; if (!c) return;
      var r = pickLen(forConcept(lib, cid).filter(function (s) { return s.kind !== "class"; }), "20s");
      if (r) items.push({ key: "r:" + r.id, type: "video", use: "refresher", snippet: r.id, topic: c.topic, concept: cid, est: r.dur / 60, title: "Refresher: " + c.title });
    });
    /* pack the queue into days of about `mins` minutes; an exercise or check stays with the video before it */
    var days = [], cur = null, cap = mins * 1.25;
    items.forEach(function (it, i) {
      var glued = it.type !== "video" && cur && cur.items.length;       // keep practice next to its video
      var fits = cur && (cur.minutes + it.est <= cap);
      var fresh = it.use === "refresher" && (i === 0 || items[i - 1].use !== "refresher");
      if (!cur || fresh || (!fits && !(glued && cur.minutes + it.est <= cap * 1.2))) { cur = { n: days.length, items: [], minutes: 0, refresher: it.use === "refresher" }; days.push(cur); }
      cur.items.push(it); cur.minutes += it.est;
    });
    days.forEach(function (d) { d.minutes = Math.round(d.minutes * 10) / 10; });
    var vids = items.filter(function (i) { return i.type === "video"; });
    return { days: days, items: items, videoMinutes: Math.round(vids.reduce(function (a, i) { return a + i.est; }, 0) * 10) / 10,
      snippets: vids.length, classes: Object.keys(vids.reduce(function (m, i) { m[byId(lib.snippets)[i.snippet].class] = 1; return m; }, {})).length };
  }

  /* ---------- search ---------- */
  var STOP = "a an the is are was were be been am i me my we our you your it its this that these those to of in on for with and or but so do does did how what why when which who can could should would will shall have has had not no dont doesnt isnt cant there here at as by from if then than too very just also about into after before get got gets make makes made give gives gave ai".split(" ");
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  /* everyday words mapped to one form, so "kids", "children" and "students" find each other */
  var CANON = { kid: "student", child: "student", children: "student", pupil: "student", learner: "student",
    tough: "hard", difficult: "hard", advanced: "hard", complicated: "hard", difficulty: "hard", simpler: "simple", easy: "simple", easier: "simple",
    lengthy: "long", msg: "message", note: "message", qs: "question", guardian: "parent", mother: "parent", father: "parent",
    reply: "reply", respond: "reply", response: "reply", ans: "answer", key: "key", period: "period", mins: "minute", min: "minute",
    wrong: "wrong", mistake: "wrong", incorrect: "wrong", error: "wrong", polite: "kind", rude: "blame", blaming: "blame", scold: "blame",
    english: "language", telugu: "language", hindi: "language", wording: "word", words: "word", lot: "many", lots: "many", much: "many" };
  function suffix(s) {
    if (s.length > 4 && /ies$/.test(s)) s = s.slice(0, -3) + "y";
    else if (s.length > 4 && /sses$/.test(s)) s = s.slice(0, -2);
    else if (s.length > 3 && /s$/.test(s) && !/ss$/.test(s)) s = s.slice(0, -1);
    if (s.length > 5 && /ing$/.test(s)) s = s.slice(0, -3);
    else if (s.length > 4 && /ed$/.test(s)) s = s.slice(0, -2);
    if (s.length > 4 && /e$/.test(s)) s = s.slice(0, -1);          // take / taking, write / writing
    return s;
  }
  function stem(w) {
    var c = CANON[w];
    if (!c) { var s = suffix(w); c = CANON[s] || s; }
    return suffix(c);
  }
  function tokens(text) {
    return String(text || "").toLowerCase().replace(/[’']/g, "").split(/[^a-z0-9ऀ-ॿఀ-౿]+/).filter(function (w) { return w && !STOPSET[w]; }).map(stem);
  }
  var MIN_COVER = 0.5;
  var FIELDS = { questions: 3.0, title: 2.5, concept: 2.0, summary: 1.5, text: 1.0 };
  function buildIndex(lib) {
    var concepts = byId(lib.concepts), docs = approved(lib).map(function (s) {
      var c = concepts[s.concept];
      var f = { questions: tokens((s.questions || []).join(" ")), title: tokens(s.title), concept: tokens(c ? c.title + " " + c.q : ""), summary: tokens(s.summary), text: tokens(textOf(lib, s)) };
      return { sn: s, f: f };
    });
    var avg = {}, df = {};
    Object.keys(FIELDS).forEach(function (k) { avg[k] = docs.reduce(function (a, d) { return a + d.f[k].length; }, 0) / (docs.length || 1) || 1; });
    docs.forEach(function (d) {
      var seen = {};
      Object.keys(FIELDS).forEach(function (k) { d.f[k].forEach(function (w) { seen[w] = 1; }); });
      Object.keys(seen).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
    });
    return { lib: lib, docs: docs, avg: avg, df: df, N: docs.length };
  }
  function idfOf(ix, w) { var df = ix.df[w] || 0; return Math.log(1 + (ix.N - df + 0.5) / (df + 0.5)); }
  function scoreDoc(ix, d, q) {
    var k1 = 1.2, b = 0.6, total = 0, strong = 0, hit = 0, got = 0;
    q.forEach(function (w) {
      var tf = 0, s = 0;
      Object.keys(FIELDS).forEach(function (k) {
        var n = 0; d.f[k].forEach(function (x) { if (x === w) n++; });
        if (!n) return;
        tf += FIELDS[k] * n / (1 - b + b * d.f[k].length / ix.avg[k]);
        if (k === "questions" || k === "title" || k === "concept") s = 1;
      });
      if (!tf) return;
      var idf = idfOf(ix, w);
      total += idf * tf / (k1 + tf); hit++; strong += s; got += idf;
    });
    return { score: total, hit: hit, strong: strong, got: got };
  }
  /* search(index, "the questions are too hard", {topic, concepts}) ->
       { none: bool, groups: [{ concept, score, steps: [snippet, ...] }] }   best group first; steps run short to long */
  function search(ix, query, ctx) {
    var q = tokens(query).filter(function (w, i, a) { return a.indexOf(w) === i; }), lib = ix.lib, concepts = byId(lib.concepts), classes = byId(lib.classes);
    if (!q.length) return { none: true, groups: [], tokens: q };
    var per = {}, scores = {};
    ix.docs.forEach(function (d) {
      var r = scoreDoc(ix, d, q); if (!r.score) return;
      var cid = d.sn.concept; if (!cid) return;
      var s = r.score;
      if (ctx && ctx.topic && concepts[cid] && concepts[cid].topic === ctx.topic) s *= 1.15;
      if (ctx && ctx.concepts && ctx.concepts.indexOf(cid) >= 0) s *= 1.1;
      if (d.sn.kind === "class") s *= 0.6;            // a whole class matches a little of everything
      scores[d.sn.id] = s;
      var g = per[cid] || (per[cid] = { concept: cid, score: 0, hit: 0, strong: 0, got: 0 });
      if (s > g.score) { g.score = s; g.hit = r.hit; g.strong = r.strong; g.got = r.got; }
    });
    var groups = Object.keys(per).map(function (k) { return per[k]; }).sort(function (a, b) { return b.score - a.score; });
    groups.forEach(function (g) { g.steps = ladderFor(lib, g.concept, null); g.title = concepts[g.concept] ? concepts[g.concept].title : ""; });
    groups = groups.filter(function (g) { return g.steps.length; });
    /* "No answer in the library": nothing matched where it counts, or the words that carry the question were not
       found. Each word counts by how rare it is, so a question about "handwriting" is not answered by a snippet
       that only shares "students" with it. */
    var top = groups[0], want = q.reduce(function (a, w) { return a + idfOf(ix, w); }, 0);
    var cover = top ? top.got / want : 0;
    var none = !top || top.strong === 0 || cover < MIN_COVER;
    return { none: none, cover: cover, groups: groups.slice(0, 4), tokens: q, scores: scores };
  }

  return { cutTimes: cutTimes, bucket: bucket, lenLabel: lenLabel, clock: clock, byId: byId, applyReview: applyReview, approved: approved, textOf: textOf,
    forConcept: forConcept, pickLen: pickLen, topicLive: topicLive, liveTopics: liveTopics, roleLive: roleLive, ladderFor: ladderFor,
    buildPlan: buildPlan, tokens: tokens, buildIndex: buildIndex, search: search, ORDER: ORDER };
});
