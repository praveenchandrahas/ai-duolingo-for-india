/* Content studio: review the AI's cuts and tags, test the search, see the numbers.
   Works in two modes with the same code:
   - opened from the local studio (python -m studio review): decisions are saved to library/review.json
   - opened from the live link: decisions are saved in this browser, apply to the learner app on this device,
     and can be downloaded as review.json */
(function () {
  "use strict";
  var A = window.AILP, main = document.getElementById("main"), saveEl = document.getElementById("save");
  var RKEY = "ailp-review-v1", NKEY = "ailp-reviewer", LKEY = "ailp-poc-v1";
  var RAW = null, LIB = null, OV = { snippets: {} }, LOCAL = false, METRICS = {}, QUESTIONS = null;
  var tab = "review", F = { cls: null, status: "all", len: "all" }, open = null;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var who = function () { try { return localStorage.getItem(NKEY) || ""; } catch (e) { return ""; } };
  var json = function (url) { return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(url + " " + r.status); return r.json(); }); };

  function rebuild() { LIB = A.applyReview(RAW, OV); }
  function persist() {
    try { localStorage.setItem(RKEY, JSON.stringify(OV)); } catch (e) {}
    if (LOCAL) {
      fetch("/api/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(OV) })
        .then(function (r) { return r.json(); }).then(function (r) { saveEl.textContent = r.ok ? "Saved to library/review.json" : "Could not save: " + r.error; })
        .catch(function () { saveEl.textContent = "Could not reach the local studio"; });
    } else saveEl.textContent = Object.keys(OV.snippets).length + " decisions saved in this browser";
  }
  function change(id, patch) {
    var cur = OV.snippets[id] || {};
    OV.snippets[id] = Object.assign(cur, patch, { reviewer: who() || "reviewer", reviewed_at: new Date().toISOString() });
    rebuild(); persist();
  }

  /* ---------- review ---------- */
  function review() {
    var classes = A.byId(LIB.classes), concepts = LIB.concepts;
    if (!F.cls) F.cls = LIB.classes[0].id;
    var cls = classes[F.cls], all = LIB.snippets.filter(function (s) { return s.class === F.cls; });
    var list = all.filter(function (s) { return (F.status === "all" || s.status === F.status) && (F.len === "all" || s.bucket === F.len); })
      .sort(function (a, b) { return a.s0 - b.s0 || b.dur - a.dur; });
    var cnt = function (st) { return LIB.snippets.filter(function (s) { return s.status === st; }).length; };
    var h = "<h2>Review the cuts</h2><p class=\"sub\">Each snippet is a run of whole sentences from one class. Check that it starts and ends cleanly, makes sense alone, teaches one idea, and that the title and questions match. Only approved snippets reach learners.</p>";
    if (LIB.classes.some(function (c) { return c.standin; })) h += '<p class="note">The classes in this build are stand-ins (synthetic voice). Their cuts were chosen and tagged by an AI and approved after a text check only. Nobody has listened to them. Real classes should be approved here by a person.</p>';
    h += '<div class="bar"><b>' + cnt("approved") + " approved · " + cnt("pending") + " pending · " + cnt("rejected") + ' rejected</b><span style="flex:1"></span>' +
      '<label style="margin:0">Reviewer</label><input type="text" id="who" style="width:150px" placeholder="your name" value="' + esc(who()) + '">' +
      '<button class="small" id="dl">Download review.json</button>' + (LOCAL ? '<button class="small" id="pub">Publish to the app</button>' : '<button class="small" id="clr">Clear my changes</button>') + "</div>";
    h += '<div class="bar">' + LIB.classes.map(function (c) { return '<button class="pill ' + (c.id === F.cls ? "on" : "") + '" data-cls="' + c.id + '">' + esc(c.title) + " · " + A.clock(c.duration) + "</button>"; }).join("") + "</div>";
    h += '<div class="bar">' + ["all", "pending", "approved", "rejected"].map(function (s) { return '<button class="pill ' + (F.status === s ? "on" : "") + '" data-st="' + s + '">' + s + "</button>"; }).join("") +
      '<span style="width:12px"></span>' + ["all"].concat(A.ORDER).map(function (b) { return '<button class="pill ' + (F.len === b ? "on" : "") + '" data-len="' + b + '">' + ({ all: "any length", "10s": "≈10 s", "20s": "≈20 s", "1m": "≈1 min", section: "section", "class": "class" })[b] + "</button>"; }).join("") + "</div>";
    h += '<p class="sub" style="font-size:13px">' + esc(cls.presenter) + " · cut by: " + esc(cls.cut_by || "?") + " · " + list.length + " of " + all.length + " snippets shown</p>";
    h += list.map(function (s) { return card(s, cls, concepts); }).join("") || '<p class="note">Nothing matches these filters.</p>';
    main.innerHTML = h;
    main.querySelectorAll("[data-cls]").forEach(function (b) { b.onclick = function () { F.cls = b.getAttribute("data-cls"); open = null; review(); }; });
    main.querySelectorAll("[data-st]").forEach(function (b) { b.onclick = function () { F.status = b.getAttribute("data-st"); review(); }; });
    main.querySelectorAll("[data-len]").forEach(function (b) { b.onclick = function () { F.len = b.getAttribute("data-len"); review(); }; });
    document.getElementById("who").onchange = function () { try { localStorage.setItem(NKEY, this.value.trim()); } catch (e) {} };
    document.getElementById("dl").onclick = function () {
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(OV, null, 1)], { type: "application/json" })); a.download = "review.json"; a.click();
    };
    if (document.getElementById("clr")) document.getElementById("clr").onclick = function () { if (confirm("Remove the review decisions saved in this browser?")) { OV = { snippets: {} }; rebuild(); persist(); review(); } };
    if (document.getElementById("pub")) document.getElementById("pub").onclick = function () {
      saveEl.textContent = "Publishing…";
      fetch("/api/publish", { method: "POST", body: "{}" }).then(function (r) { return r.json(); }).then(function (r) { saveEl.textContent = r.ok ? "Published. Reload the learner app." : "Publish failed"; if (!r.ok) alert(r.log); });
    };
    main.querySelectorAll(".head").forEach(function (b) { b.onclick = function () { var id = b.parentNode.getAttribute("data-id"); open = open === id ? null : id; review(); }; });
    if (open) wire(open);
  }
  function card(s, cls, concepts) {
    var h = '<div class="snip ' + (open === s.id ? "open" : "") + '" data-id="' + s.id + '"><button class="head"><span class="len">' + A.lenLabel(s.dur) + '</span><span class="grow"><b>' + esc(s.title || "(no title)") + "</b>" +
      (s.flags || []).map(function (f) { return '<span class="flag">' + esc(f) + "</span>"; }).join("") + (s.edited ? '<span class="flag">edited</span>' : "") +
      "<small>" + A.clock(s.start) + "–" + A.clock(s.end) + " · " + esc(s.kind) + " · " + esc(s.concept || "no concept") + (s.reviewer ? " · " + esc(s.reviewer) : "") + '</small></span><span class="st ' + s.status + '">' + s.status + "</span></button>";
    if (open !== s.id) return h + "</div>";
    var S = cls.sentences, tx = "";
    for (var i = Math.max(0, s.s0 - 1); i <= Math.min(S.length - 1, s.s1 + 1); i++) {
      var inn = i >= s.s0 && i <= s.s1;
      tx += '<span class="' + (inn ? "in" : "ctx") + '">' + (i === s.s0 ? '<span class="edge">[ </span>' : "") + esc(S[i][2]) + (i === s.s1 ? '<span class="edge"> ]</span>' : "") + "</span> ";
      if (s.s1 - s.s0 > 8 && i === s.s0 + 2) { tx += '<span class="ctx">… ' + (s.s1 - s.s0 - 4) + " sentences … </span>"; i = s.s1 - 3; }
    }
    h += '<div class="body"><div><video id="v" playsinline controls preload="metadata" src="../' + cls.video + "#t=" + s.start + "," + s.end + '"></video>' +
      '<div class="acts" style="margin-top:8px"><button data-play="0">▶ Play the snippet</button><button data-play="1">▶ First 4 s</button><button data-play="2">▶ Last 4 s</button></div>' +
      '<div class="tx">' + tx + '</div><div class="nudge"><button data-n="s0,-1">◀ Start one sentence earlier</button><button data-n="s0,1">Start one sentence later ▶</button>' +
      '<button data-n="s1,-1">◀ End one sentence earlier</button><button data-n="s1,1">End one sentence later ▶</button></div>' +
      '<p class="sub" style="font-size:12.5px;margin-top:6px">Grey text is the sentence before and after the cut. Cuts move a whole sentence at a time, into the pause between sentences.</p></div>';
    h += '<div><label>Title</label><input type="text" data-f="title" value="' + esc(s.title) + '"><label>What it teaches, in one sentence</label><input type="text" data-f="summary" value="' + esc(s.summary) + '">' +
      '<div class="two"><div><label>Concept</label><select data-f="concept"><option value="">(none)</option>' + concepts.map(function (c) { return '<option value="' + c.id + '"' + (c.id === s.concept ? " selected" : "") + ">" + esc(c.title) + "</option>"; }).join("") + "</select></div>" +
      '<div><label>Level</label><select data-f="level">' + ["new", "some", "often"].map(function (l) { return '<option' + (l === s.level ? " selected" : "") + ">" + l + "</option>"; }).join("") + "</select></div></div>" +
      '<label>Learner questions this answers (one per line)</label><textarea data-f="questions">' + esc((s.questions || []).join("\n")) + "</textarea>" +
      '<div class="acts"><button class="ok" data-set="approved">✓ Approve</button><button class="no" data-set="rejected">✗ Reject</button><button data-set="pending">Back to pending</button></div></div></div></div>';
    return h;
  }
  function wire(id) {
    var el = main.querySelector('[data-id="' + id + '"]'); if (!el) return;
    var s = A.byId(LIB.snippets)[id], v = el.querySelector("#v"), stopAt = s.end;
    v.addEventListener("timeupdate", function () { if (v.currentTime >= stopAt && !v.paused) v.pause(); });
    el.querySelectorAll("[data-play]").forEach(function (b) {
      b.onclick = function () {
        var m = +b.getAttribute("data-play");
        v.currentTime = m === 2 ? Math.max(s.start, s.end - 4) : s.start; stopAt = m === 1 ? Math.min(s.end, s.start + 4) : s.end; v.play();
      };
    });
    el.querySelectorAll("[data-n]").forEach(function (b) {
      b.onclick = function () {
        var p = b.getAttribute("data-n").split(","), n = A.byId(LIB.classes)[s.class].sentences.length, val = s[p[0]] + (+p[1]);
        if (val < 0 || val >= n || (p[0] === "s0" && val > s.s1) || (p[0] === "s1" && val < s.s0)) return;
        var patch = { s0: s.s0, s1: s.s1 }; patch[p[0]] = val; change(id, patch); review();
      };
    });
    el.querySelectorAll("[data-f]").forEach(function (f) {
      f.onchange = function () {
        var k = f.getAttribute("data-f"), val = f.value.trim(), patch = {};
        patch[k] = k === "questions" ? val.split("\n").map(function (x) { return x.trim(); }).filter(Boolean) : k === "concept" ? (val || null) : val;
        change(id, patch); saveEl.textContent += " ·";
      };
    });
    el.querySelectorAll("[data-set]").forEach(function (b) { b.onclick = function () { change(id, { status: b.getAttribute("data-set") }); review(); }; });
  }

  /* ---------- search test ---------- */
  function runTest() {
    var ix = A.buildIndex(LIB), rows = [], t1 = 0, t3 = 0, n = 0, none = 0, noneOk = 0;
    (QUESTIONS ? QUESTIONS.questions : []).forEach(function (q) {
      var r = A.search(ix, q.q, null), got = r.none ? null : r.groups[0].concept, top3 = r.groups.slice(0, 3).map(function (g) { return g.concept; });
      if (q.concept === null) { none++; if (r.none) noneOk++; rows.push({ q: q, got: got, ok: r.none, r: r }); return; }
      n++; var ok = got === q.concept, in3 = !r.none && top3.indexOf(q.concept) >= 0;
      if (ok) t1++; if (in3) t3++;
      rows.push({ q: q, got: got, ok: ok, in3: in3, r: r });
    });
    return { rows: rows, n: n, top1: t1, top3: t3, none: none, noneOk: noneOk };
  }
  function searchTab(tryQ) {
    var C = A.byId(LIB.concepts), T = runTest(), pct = function (a, b) { return b ? Math.round(a / b * 100) + "%" : "–"; };
    var h = "<h2>Search test</h2><p class=\"sub\">A fixed list of questions a stuck learner might type, each with the idea whose snippet should come back. It runs in this page on the approved snippets, with the same code the learner app uses.</p>" +
      '<p class="note">' + esc(QUESTIONS ? QUESTIONS.note : "library/questions.json could not be loaded.") + "</p>" +
      '<div class="cards"><div class="card"><b>' + pct(T.top1, T.n) + "</b><span>right idea is the first result</span><p>" + T.top1 + " of " + T.n + ' questions</p></div><div class="card"><b>' + pct(T.top3, T.n) + "</b><span>right idea is in the first three</span><p>" + T.top3 + " of " + T.n +
      ' questions</p></div><div class="card"><b>' + T.noneOk + " / " + T.none + "</b><span>says “no video yet” when there is none</span><p>questions the library cannot answer</p></div></div>";
    h += '<form class="try" id="try"><input type="text" id="tq" placeholder="Try any question a learner might ask" value="' + esc(tryQ || "") + '"><button>Search</button></form><div id="tr"></div>';
    h += "<table><tr><th>Question</th><th>Should find</th><th>Found first</th><th></th></tr>" + T.rows.map(function (r) {
      var first = r.r.none ? "“No video answers this yet”" : esc(C[r.got].title) + " · " + A.lenLabel(r.r.groups[0].steps[0].dur);
      return "<tr><td>" + esc(r.q.q) + "</td><td>" + (r.q.concept ? esc(C[r.q.concept] ? C[r.q.concept].title : r.q.concept) : "<i>nothing in the library</i>") + "</td><td>" + first + '</td><td class="' + (r.ok ? "y" : "n") + '">' + (r.ok ? "✓" : r.in3 ? "in top 3" : "✗") + "</td></tr>";
    }).join("") + "</table>";
    main.innerHTML = h;
    document.getElementById("try").onsubmit = function (e) { e.preventDefault(); searchTab(document.getElementById("tq").value); };
    if (tryQ) {
      var r = A.search(A.buildIndex(LIB), tryQ, null);
      document.getElementById("tr").innerHTML = r.none ? '<p class="note">No video answers this yet. In the app, the question is saved for the teaching team.</p>' :
        "<table><tr><th>Idea</th><th>Score</th><th>Help offered, shortest first</th></tr>" + r.groups.map(function (g) {
          return "<tr><td>" + esc(g.title) + "</td><td>" + g.score.toFixed(1) + "</td><td>" + g.steps.map(function (s) { return A.lenLabel(s.dur) + " (" + esc(s.kind) + ")"; }).join(" → ") + "</td></tr>";
        }).join("") + "</table><br>";
    }
  }

  /* ---------- numbers ---------- */
  function numbers() {
    var m = METRICS, sn = LIB.snippets, cnt = function (st) { return sn.filter(function (s) { return s.status === st; }).length; };
    var reviewed = cnt("approved") + cnt("rejected"), C = LIB.concepts, cov = C.filter(function (c) { return A.forConcept(LIB, c.id).length; });
    var reviewers = []; sn.forEach(function (x) { if (x.reviewer && reviewers.indexOf(x.reviewer) < 0) reviewers.push(x.reviewer); });
    var T = runTest(), learner = {}; try { learner = JSON.parse(localStorage.getItem(LKEY) || "{}"); } catch (e) {}
    var tth = (learner.tth || []).slice().sort(function (a, b) { return a - b; }), med = tth.length ? tth[Math.floor(tth.length / 2)] : null;
    var P = m.processing || {}, D = m.delivery || {}, L = m.library || {};
    var card = function (big, label, text) { return '<div class="card"><b>' + big + "</b><span>" + label + "</span><p>" + text + "</p></div>"; };
    var pct = function (a, b) { return b ? Math.round(a / b * 100) + "%" : "–"; };
    var h = "<h2>The numbers for the proof-of-concept gate</h2><p class=\"sub\">Measured on what is in the library now: " + LIB.classes.length + " classes, " + (L.minutes || "?") + " minutes of video, " + sn.length + " snippets. Review decisions saved in this browser are included.</p>";
    if (LIB.classes.some(function (c) { return c.standin; })) h += '<p class="note">These are numbers for stand-in classes on a small library. They show that each number can be measured, not what it will be on real recordings.</p>';
    h += '<div class="cards">' +
      card(pct(cnt("approved"), reviewed), "clean cuts", cnt("approved") + " approved of " + reviewed + " reviewed; " + cnt("pending") + " still pending. Reviewed by: " + esc(reviewers.join(", ") || "nobody yet")) +
      card(pct(T.top1, T.n), "search: right idea first", T.top1 + " of " + T.n + " test questions; " + pct(T.top3, T.n) + " in the first three") +
      card(med == null ? "–" : med + " s", "time to help", med == null ? "Use “I'm stuck” in the learner app on this device and come back." : "median of " + tth.length + " help requests on this device, from the tap to the video playing") +
      card(cov.length + " / " + C.length, "coverage", "ideas in the concept list with at least one approved snippet") +
      card((P.transcribe_minutes_per_hour_of_video || "?") + " min", "to transcribe an hour of video", esc(P.engine || "") + " on " + (P.cpus || "?") + " CPU cores, no GPU, no cloud") +
      card(P.cut_and_tag_input_tokens_per_hour_of_video ? Math.round((P.cut_and_tag_input_tokens_per_hour_of_video + P.cut_and_tag_output_tokens_per_hour_of_video) / 1000) + "k" : "?", "AI tokens to cut and tag an hour", "about " + Math.round((P.cut_and_tag_input_tokens_per_hour_of_video || 0) / 1000) + "k in and " + Math.round((P.cut_and_tag_output_tokens_per_hour_of_video || 0) / 1000) + "k out, once per video. " + esc(P.tokens_are || "")) +
      card((D.published_video_mb_per_hour || "?") + " MB", "data per hour of video", "360p at " + (D.published_video_kbps || "?") + " kbps; audio only is " + (D.audio_only_mb_per_hour || "?") + " MB per hour") +
      card(learner.bytes ? (learner.bytes / 1e6).toFixed(1) + " MB" : "–", "data used by the learner on this device", learner.watched ? Math.round(learner.watched / 60 * 10) / 10 + " minutes of video watched" : "nothing watched yet") + "</div>";
    var miss = C.filter(function (c) { return cov.indexOf(c) < 0; });
    h += "<h2>What to record next</h2>" + (miss.length ? "<p class=\"sub\">Ideas in the concept list with no approved snippet:</p><table>" + miss.map(function (c) { return "<tr><td>" + esc(c.title) + '</td><td class="sub">' + esc(A.byId(LIB.topics)[c.topic].name) + "</td></tr>"; }).join("") + "</table>" : '<p class="sub">Every idea in the concept list has at least one approved snippet.</p>');
    var un = learner.unanswered || [];
    h += "<br><h2>Questions the library could not answer</h2>" + (un.length ? "<table>" + un.map(function (u) { return "<tr><td>" + esc(u.q) + "</td></tr>"; }).join("") + "</table>" : '<p class="sub">None asked on this device yet. In the pilot these come from every learner and become the recording list.</p>');
    main.innerHTML = h;
  }

  function render() { ({ review: review, search: searchTab, numbers: numbers })[tab](); }
  document.querySelectorAll(".tab").forEach(function (b) {
    b.onclick = function () { tab = b.getAttribute("data-tab"); document.querySelectorAll(".tab").forEach(function (x) { x.classList.toggle("on", x === b); }); render(); };
  });
  Promise.all([json("../data/library.json"), json("../data/metrics.json").catch(function () { return {}; }), json("../../library/questions.json").catch(function () { return null; }),
    fetch("/api/ping").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })]).then(function (r) {
    RAW = r[0]; METRICS = r[1]; QUESTIONS = r[2]; LOCAL = !!(r[3] && r[3].studio);
    var start = LOCAL ? json("/api/review").catch(function () { return { snippets: {} }; }) : Promise.resolve((function () { try { return JSON.parse(localStorage.getItem(RKEY) || "null"); } catch (e) { return null; } })());
    return start.then(function (o) {
      OV = o && o.snippets ? o : { snippets: {} }; rebuild();
      saveEl.textContent = LOCAL ? "Local studio: saving to library/review.json" : "Live link: decisions stay in this browser";
      render();
    });
  }).catch(function (e) { main.innerHTML = '<p class="note">Could not load the library: ' + esc(e.message) + "</p>"; });
})();
