/* AI Launchpad: proof-of-concept learner app.
   Vanilla JS, no build step. Everything a learner sees comes from data/library.json, which the content studio
   builds from real video files: classes, sentence times, AI-cut snippets and the reviewer's approvals.

   #/welcome -> #/role -> #/topics -> #/level -> #/lang -> #/minutes -> #/building
   -> #/item/<day>/<k>   a video snippet, an exercise or a quick check, in the order the plan gives
   -> #/help             the just-in-time clip (shortest first), then back to where the learner was
   -> #/done/<day> -> #/home, #/progress, #/cohort */
(function () {
  "use strict";
  var A = window.AILP, app = document.getElementById("app");
  var KEY = "ailp-poc-v1", RKEY = "ailp-review-v1";
  var DEFAULT = { role: null, topics: [], level: null, lang: "en", mins: 10, done: {}, first: {}, xp: 0, stuckLog: [], clips: 0, tth: [], unanswered: [],
    watched: 0, bytes: 0, seen: {}, audioOnly: false, cc: true, speed: 1 };
  var S = load(), LIB = null, IX = null, PLAN = null, CLS = {}, SN = {}, CON = {}, TOP = {};
  var EX = null, CHK = null, HELP = null, P = null, auto = null;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return Object.assign({}, JSON.parse(JSON.stringify(DEFAULT)), JSON.parse(raw)); } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function t(k) { return (I18N[S.lang] && I18N[S.lang][k]) || I18N.en[k] || k; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function roleObj() { return LIB.roles.filter(function (r) { return r.id === S.role; })[0]; }
  function levelObj() { return LIB.levels.filter(function (l) { return l.id === S.level; })[0] || LIB.levels[0]; }
  function okIdx(ex) { var a = []; ex.chips.forEach(function (c, i) { if (c.ok) a.push(i); }); return a; }
  function same(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); }
  function median(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }
  function mb(bytes) { return bytes >= 1e6 ? (bytes / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(bytes / 1e3)) + " KB"; }
  function plan() {
    if (!PLAN) {
      var stuck = []; S.stuckLog.forEach(function (x) { if (x.concept && stuck.indexOf(x.concept) < 0) stuck.push(x.concept); });
      PLAN = A.buildPlan(LIB, { topics: S.topics, level: S.level, mins: S.mins, stuck: stuck });
    }
    return PLAN;
  }
  function dayDone(d) { return d.items.every(function (i) { return S.done[i.key]; }); }
  function daysDone() { return plan().days.filter(dayDone).length; }
  function dayName(n) { return DAYS[n % 5]; }

  /* ---------- router ---------- */
  function go(path) { if (location.hash === "#" + path) route(); else location.hash = path; }
  window.addEventListener("hashchange", route);
  function route() {
    stopPlayer();
    if (auto) { clearTimeout(auto); auto = null; }
    var p = (location.hash || "#/welcome").slice(1).split("/").filter(Boolean);
    var name = p[0] || "welcome";
    var ready = S.role && S.topics.length && S.level;
    if (["building", "home", "item", "help", "done", "progress", "cohort"].indexOf(name) >= 0 && !ready) return go("/welcome");
    var fn = { welcome: welcome, role: pickRole, topics: pickTopics, level: pickLevel, lang: pickLang, minutes: pickMins, building: building,
      home: home, item: item, help: helpScreen, done: done, progress: progress, cohort: cohort }[name] || welcome;
    fn(p[1], p[2]);
  }

  /* ---------- shared bits ---------- */
  function person(tone) {
    return '<svg class="person" viewBox="0 0 200 220" aria-hidden="true"><g fill="' + tone + '" stroke="#1F2A44" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M30 220 Q36 150 100 140 Q164 150 170 220 Z" fill="#1F2A44"/><path d="M84 140 L84 120 L116 120 L116 140" fill="#F3D2B3"/>' +
      '<ellipse cx="100" cy="86" rx="38" ry="44" fill="#F3D2B3"/><path d="M60 84 Q56 36 100 34 Q146 36 140 84 Q128 56 100 58 Q72 56 60 84 Z" fill="#1F2A44"/>' +
      '<path d="M84 94 L84 98 M116 94 L116 98" fill="none"/><path d="M86 112 Q100 122 114 112" fill="none"/></g></svg>';
  }
  function topbar() {
    var langs = Object.keys(LANGS), next = langs[(langs.indexOf(S.lang) + 1) % langs.length];
    return '<div class="top"><span class="pill">🔥 ' + daysDone() + '</span><span class="pill">⭐ ' + S.xp + '</span><span class="grow"></span>' +
      '<button class="pill" data-lang="' + next + '" aria-label="Change language">🌐 ' + LANGS[S.lang].native + "</button></div>";
  }
  function tabbar(active) {
    var items = [["home", "🗺️", t("plan")], ["progress", "📈", t("progress")], ["cohort", "👥", t("cohort")]];
    return '<nav class="tabs">' + items.map(function (i) {
      return '<button data-go="/' + i[0] + '" class="' + (active === i[0] ? "on" : "") + '"><span>' + i[1] + "</span>" + esc(i[2]) + "</button>";
    }).join("") + "</nav>";
  }
  function shell(inner, active) { app.innerHTML = topbar() + '<div class="screen">' + inner + "</div>" + tabbar(active); bind(); }
  function bind() {
    app.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-go")); }; });
    app.querySelectorAll("[data-lang]").forEach(function (b) { b.onclick = function () { S.lang = b.getAttribute("data-lang"); save(); route(); }; });
  }
  function steps(n, back) {
    var h = ""; for (var i = 0; i < 5; i++) h += '<i class="' + (i < n ? "on" : "") + '"></i>';
    return '<div class="row"><button class="pill" data-go="' + back + '" aria-label="Back">←</button><div class="dots grow">' + h + "</div></div>";
  }
  function toast(msg) {
    var el = document.createElement("div"); el.className = "toast"; el.textContent = msg; app.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }
  function resetProfile(keep) { S = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), keep || {}); PLAN = null; EX = null; CHK = null; HELP = null; save(); }

  /* ---------- onboarding ---------- */
  function welcome() {
    var a = A.approved(LIB), mins = Math.round(LIB.classes.reduce(function (x, c) { return x + c.duration; }, 0) / 60);
    app.innerHTML = '<div class="screen"><div class="hero"><div class="logo">AI Launchpad</div><h1>' + esc(t("tagline")) + "</h1>" +
      '<div class="hero-art">' + person("#CFE8E4") + "</div>" +
      '<p class="sub">Real people explain it. Short videos, in your language, built around your work.</p>' +
      '<button class="btn" data-go="/role">' + esc(t("start")) + '</button>' +
      '<p class="sub" style="font-size:12.5px;text-align:center">Library: ' + a.length + " approved snippets from " + LIB.classes.length + " classes (" + mins + " min of video)</p></div></div>";
    bind();
  }
  function pickRole() {
    app.innerHTML = '<div class="screen">' + steps(1, "/welcome") + "<h2>" + esc(t("pickRole")) + '</h2><p class="sub">' + esc(t("pickRoleSub")) + '</p><div class="stack">' +
      LIB.roles.map(function (r) {
        var live = A.roleLive(LIB, r.id);
        return '<button class="choice ' + (live ? (S.role === r.id ? "on" : "") : "off") + '" data-role="' + r.id + '"' + (live ? "" : " disabled") + '><span class="ic">' + r.icon + "</span>" + esc(r.name) +
          (live ? "" : "<small>" + esc(t("soon")) + "</small>") + "</button>";
      }).join("") + '</div><p class="sub" style="font-size:13px">A role opens when its first classes have been recorded, cut and approved.</p></div>';
    bind();
    app.querySelectorAll("[data-role]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-role");
        if (S.role !== id) resetProfile({ role: id, lang: S.lang, mins: S.mins, level: S.level, audioOnly: S.audioOnly, cc: S.cc });
        go("/topics");
      };
    });
  }
  function pickTopics() {
    if (!S.role) return go("/role");
    var list = LIB.topics.filter(function (x) { return x.role === S.role; });
    app.innerHTML = '<div class="screen">' + steps(2, "/role") + "<h2>" + esc(t("pickTopics")) + '</h2><p class="sub">' + esc(t("pickTopicsSub")) + '</p><div class="stack">' +
      list.map(function (tp) {
        var k = S.topics.indexOf(tp.id), live = A.topicLive(LIB, tp);
        return '<button class="choice ' + (live ? (k >= 0 ? "on" : "") : "off") + '" data-tp="' + tp.id + '"' + (live ? ' aria-pressed="' + (k >= 0) + '"' : " disabled") + '><span class="ic">' + tp.icon + "</span><span>" + esc(tp.name) +
          (live ? "" : '<span class="sm">No approved videos yet</span>') + '</span><small class="num">' + (k >= 0 ? k + 1 : "") + "</small></button>";
      }).join("") + '</div><p class="sub" style="font-size:13px">The number shows the order your plan follows.</p><div class="grow"></div>' +
      '<button class="btn" id="nx"' + (S.topics.length ? "" : " disabled") + ">" + esc(t("next")) + "</button></div>";
    bind();
    app.querySelectorAll("[data-tp]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-tp"), k = S.topics.indexOf(id);
        if (k >= 0) S.topics.splice(k, 1);
        else if (S.topics.length >= 3) return toast("Pick up to 3. Tap one again to remove it.");
        else S.topics.push(id);
        PLAN = null; save(); pickTopics();
      };
    });
    $("nx").onclick = function () { if (S.topics.length) go("/level"); };
  }
  function pickLevel() {
    app.innerHTML = '<div class="screen">' + steps(3, "/topics") + "<h2>" + esc(t("pickLevel")) + '</h2><p class="sub">' + esc(t("pickLevelSub")) + '</p><div class="stack">' +
      LIB.levels.map(function (l) {
        return '<button class="choice ' + (S.level === l.id ? "on" : "") + '" data-lv="' + l.id + '"><span class="ic">' + l.icon + "</span><span>" + esc(t(l.key)) + '<span class="sm">' + esc(t(l.sub)) + "</span></span></button>";
      }).join("") + "</div></div>";
    bind();
    app.querySelectorAll("[data-lv]").forEach(function (b) { b.onclick = function () { S.level = b.getAttribute("data-lv"); PLAN = null; save(); go("/lang"); }; });
  }
  function pickLang() {
    app.innerHTML = '<div class="screen">' + steps(4, "/level") + "<h2>" + esc(t("pickLang")) + '</h2><p class="sub">' + esc(t("pickLangSub")) + '</p><div class="stack">' +
      Object.keys(LANGS).map(function (k) {
        return '<button class="choice ' + (S.lang === k ? "on" : "") + '" data-l="' + k + '"><span class="ic">🗣️</span><span>' + LANGS[k].native + '<span class="sm">' + LANGS[k].name + "</span></span></button>";
      }).join("") + '</div><p class="note">In this proof of concept the classes are in English, with captions. The buttons and labels follow the language you pick. Each new language is a new set of recordings through the same pipeline.</p></div>';
    bind();
    app.querySelectorAll("[data-l]").forEach(function (b) { b.onclick = function () { S.lang = b.getAttribute("data-l"); save(); go("/minutes"); }; });
  }
  function pickMins() {
    var pl = A.buildPlan(LIB, { topics: S.topics, level: S.level, mins: S.mins });
    app.innerHTML = '<div class="screen">' + steps(5, "/lang") + "<h2>" + esc(t("pickMins")) + '</h2><p class="sub">' + esc(t("pickMinsSub")) + "</p>" +
      '<div class="mins">' + [5, 10, 15].map(function (m) {
        return '<button class="choice ' + (S.mins === m ? "on" : "") + '" data-m="' + m + '"><b>' + m + "</b>" + esc(t("min")) + "</button>";
      }).join("") + '</div><p class="note">At ' + S.mins + " minutes a day your plan is " + pl.days.length + " days: " + pl.snippets + " video snippets (" + pl.videoMinutes + " min) with an exercise or a quick check after each." +
      (S.mins < 10 ? " The full classes are left out at this pace; you can still reach them through “" + esc(t("stuck")) + "”." : "") +
      '</p><div class="grow"></div><button class="btn" id="build">' + esc(t("build")) + "</button></div>";
    bind();
    app.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { S.mins = +b.getAttribute("data-m"); PLAN = null; save(); pickMins(); }; });
    $("build").onclick = function () { PLAN = null; save(); go("/building"); };
  }
  function building() {
    var pl = plan(), d0 = pl.days[0];
    if (!d0) return go("/topics");
    var lines = [
      roleObj().name + ": " + S.topics.map(function (x) { return TOP[x].name; }).join(", "),
      levelObj().plan,
      S.mins + " minutes a day · " + pl.days.length + " days",
      pl.snippets + " snippets picked from " + pl.classes + (pl.classes === 1 ? " class" : " classes") + " · " + pl.videoMinutes + " min of video"
    ];
    app.innerHTML = '<div class="screen"><div class="hand">' + esc(t("building")) + "</div><h2>" + esc(roleObj().name) + '</h2><div class="stack">' +
      lines.map(function (l, i) { return '<div class="bl" style="--d:' + (i * 0.45) + 's"><span>✓</span>' + esc(l) + "</div>"; }).join("") + "</div>" +
      '<div class="bl day today" style="--d:1.9s"><span class="dn">' + dayName(0) + '</span><span class="grow"><span class="tag">' + esc(TOP[d0.items[0].topic].name) + "</span><br><b>" + esc(d0.items[0].title) + "</b></span></div>" +
      '<div class="grow"></div><button class="btn" id="st">' + esc(t("startLesson")) + " →</button></div>";
    $("st").onclick = function () { go("/item/0/0"); };
    auto = setTimeout(function () { go("/item/0/0"); }, reduce ? 2500 : 3600);
  }

  /* ---------- video player: plays one snippet (a time range) of a class ---------- */
  function stopPlayer() {
    if (P) { try { P.v.pause(); P.v.removeAttribute("src"); P.v.load(); } catch (e) {} P = null; save(); }
  }
  function kindLabel(sn) { return ({ hook: "explainer", point: "the rule", why: "why it works", example: "worked example", tip: "tip", section: "full section", "class": "full class" })[sn.kind] || "clip"; }
  function player(sn, o) {
    var cls = CLS[sn.class];
    var rate = (S.audioOnly ? cls.audio_bytes : cls.video_bytes) / cls.duration;
    app.innerHTML = '<div class="player">' +
      '<div class="top"><button class="pill" id="back" aria-label="Back">←</button><span class="grow"></span><span class="pill">🔥 ' + daysDone() + "</span></div>" +
      '<div class="stage' + (S.audioOnly ? " audio" : "") + '"><video id="vid" playsinline webkit-playsinline preload="auto"></video>' +
      (S.audioOnly ? '<div class="aud">' + person("#CFE8E4") + "</div>" : "") +
      '<span class="badge">' + esc(o.badge || ("▶ " + A.lenLabel(sn.dur) + " · " + kindLabel(sn))) + "</span>" +
      (cls.standin ? '<span class="ph">Stand-in footage</span>' : "") +
      '<button class="bigplay" id="big" aria-label="Play" hidden>▶</button><div class="caption" id="cap" hidden></div></div>' +
      '<div class="bar" id="bar" role="slider" aria-label="Seek"><i id="fill"></i></div>' +
      '<div class="controls"><button class="round" id="pp" aria-label="Play or pause">▶</button><span id="time" class="sub tnum"></span><span class="grow"></span>' +
      '<button class="chip" id="sp" aria-label="Speed">' + S.speed + '×</button><button class="chip ' + (S.cc ? "on" : "") + '" id="cc" aria-pressed="' + !!S.cc + '">CC</button>' +
      '<button class="chip ' + (S.audioOnly ? "on" : "") + '" id="ao" aria-pressed="' + !!S.audioOnly + '" aria-label="Audio only, uses less data">🎧</button></div>' +
      '<div class="meta"><div class="hand" style="font-size:22px">' + esc(o.kicker || "") + "</div><h3>" + esc(sn.title) + '</h3><p class="sub" style="font-size:13px">' +
      esc(cls.presenter) + " · from " + A.clock(sn.start) + " of “" + esc(cls.title) + "” · about " + mb(rate * sn.dur) + "</p></div>" +
      '<div class="foot" id="foot"></div></div>';
    var v = $("vid");
    P = { v: v, sn: sn, cls: cls, o: o, ended: false, last: null, rate: rate, begun: false };
    v.src = (S.audioOnly ? cls.audio : cls.video) + "#t=" + (o.resume || sn.start) + "," + sn.end;
    v.playbackRate = S.speed;
    function tryPlay() { var pr = v.play(); if (pr && pr.catch) pr.catch(function () { $("big") && ($("big").hidden = false); }); }
    v.addEventListener("loadedmetadata", function () { if (Math.abs(v.currentTime - (o.resume || sn.start)) > 0.3) v.currentTime = o.resume || sn.start; tryPlay(); });
    v.addEventListener("playing", function () {
      if ($("big")) $("big").hidden = true;
      if (!P.begun) { P.begun = true; if (o.onPlaying) o.onPlaying(); }
      P.last = v.currentTime; loop(); ui();
    });
    v.addEventListener("pause", ui); v.addEventListener("timeupdate", tick);
    v.addEventListener("error", function () { $("cap").hidden = false; $("cap").textContent = "The video could not be loaded. Check the connection and try again."; });
    function loop() { if (!P || P.v !== v) return; tick(); if (!v.paused) requestAnimationFrame(loop); }
    function tick() {
      if (!P || P.v !== v) return;
      var now = v.currentTime;
      if (P.last != null && !v.paused) { var dt = now - P.last; if (dt > 0 && dt < 1.5) { S.watched += dt; S.bytes += dt * rate; } }
      P.last = now;
      if (now >= sn.end - 0.02 && !P.ended) { P.ended = true; v.pause(); S.seen[sn.class] = 1; save(); renderFoot(); }
      $("fill").style.width = Math.max(0, Math.min(100, (now - sn.start) / sn.dur * 100)) + "%";
      $("time").textContent = A.clock(Math.max(0, Math.min(sn.dur, now - sn.start))) + " / " + A.clock(sn.dur);
      var cap = $("cap"), line = "";
      if (S.cc) { for (var i = sn.s0; i <= sn.s1; i++) { var s = cls.sentences[i]; if (now >= s[0] - 0.15) line = s[2]; else break; } }
      cap.hidden = !line; if (line && cap.textContent !== line) cap.textContent = line;
    }
    function ui() { if ($("pp")) $("pp").textContent = v.paused ? "▶" : "❚❚"; }
    function toggle() {
      if (P.ended) { P.ended = false; v.currentTime = sn.start; renderFoot(); }
      if (v.paused) tryPlay(); else v.pause();
    }
    $("pp").onclick = toggle; $("big").onclick = toggle; v.onclick = toggle;
    $("back").onclick = function () { o.back(); };
    $("bar").onclick = function (e) {
      var r = this.getBoundingClientRect(); P.ended = false;
      v.currentTime = sn.start + Math.max(0, Math.min(0.98, (e.clientX - r.left) / r.width)) * sn.dur; P.last = null; tick(); renderFoot();
    };
    $("sp").onclick = function () { S.speed = S.speed === 1 ? 1.25 : S.speed === 1.25 ? 1.5 : 1; v.playbackRate = S.speed; this.textContent = S.speed + "×"; save(); };
    $("cc").onclick = function () { S.cc = !S.cc; this.classList.toggle("on", S.cc); save(); tick(); };
    $("ao").onclick = function () { S.audioOnly = !S.audioOnly; save(); var at = Math.min(Math.max(v.currentTime, sn.start), sn.end - 1); stopPlayer(); player(sn, Object.assign({}, o, { resume: at })); };
    function renderFoot() { var f = $("foot"); if (!f || !P) return; f.innerHTML = o.foot(P.ended); o.bind(); }
    renderFoot();
  }

  /* ---------- plan items ---------- */
  function item(n, k) {
    n = +n; k = +k;
    var d = plan().days[n], it = d && d.items[k];
    if (!it) return go("/home");
    if (it.type === "video") return videoItem(n, k, it);
    if (it.type === "exercise") return exercise(n, k, it);
    return check(n, k, it);
  }
  function finishItem(n, k, xp, first) {
    var it = plan().days[n].items[k];
    if (!S.done[it.key]) { S.done[it.key] = 1; S.xp += xp + (first ? Math.round(xp / 3) : 0); if (first != null) S.first[it.key] = first; save(); }
  }
  function nextAfter(n, k) { var d = plan().days[n]; go(k + 1 < d.items.length ? "/item/" + n + "/" + (k + 1) : "/done/" + n); }
  function useLabel(it) { return ({ explainer: t("explainer"), deepen: "Worked example", "class": "Full class", refresher: "Refresher" })[it.use] || "Video"; }
  function videoItem(n, k, it) {
    var sn = SN[it.snippet], d = plan().days[n], nx = d.items[k + 1];
    player(sn, {
      kicker: useLabel(it) + " · " + TOP[it.topic].name,
      back: function () { go("/home"); },
      foot: function (ended) {
        var label = nx ? (nx.type === "exercise" ? t("nowYouTry") : nx.type === "check" ? "Quick check" : t("next")) : t("finish");
        return '<button class="btn' + (ended ? "" : " ghost") + '" id="nx">' + esc(ended ? label : (nx && nx.type === "exercise" ? t("skipToExercise") : "Skip")) + " →</button>";
      },
      bind: function () { $("nx").onclick = function () { finishItem(n, k, 10); nextAfter(n, k); }; }
    });
  }

  /* ---------- exercise: fix the prompt (sample AI answers written and approved by a person) ---------- */
  function exercise(n, k, it) {
    var id = it.topic;
    if (!EX || EX.id !== id) {
      EX = { id: id, n: n, k: k, sel: [], sent: null, attempts: 0, thinking: true, solved: !!S.done[it.key] && false };
      setTimeout(function () { if (EX && EX.id === id && EX.thinking && EX.sent === null) { EX.thinking = false; EX.sent = []; if ($("exb")) renderEx(); } }, 900);
      return renderEx();
    }
    EX.n = n; EX.k = k;
    renderEx(EX.solved ? "me" : "cmp");
  }
  function renderEx(scrollTo) {
    var tp = TOP[EX.id], ex = tp.exercise, oks = okIdx(ex), sent = EX.sent || [];
    var edited = EX.sent && !same(sent, EX.sel);
    var missing = oks.filter(function (i) { return sent.indexOf(i) < 0; });
    var h = '<div class="ex"><div class="top"><button class="pill" id="back" aria-label="Back">←</button><span class="pill">' + tp.icon + " " + esc(t("exercise")) + '</span><span class="grow"></span><span class="pill">🔥 ' + daysDone() + "</span></div>";
    h += '<div class="ex-body" id="exb"><div class="task"><div class="hand">' + esc(t("yourTask")) + "</div><p>" + esc(ex.task) + "</p></div>";
    h += '<div class="bubble me" id="me"><small>You</small><p>' + esc(ex.base) + sent.map(function (i) { return " <mark>" + esc(ex.chips[i].t) + "</mark>"; }).join("") + "</p></div>";
    if (EX.thinking) {
      h += '<div class="bubble ai"><small>AI assistant</small><p class="typing"><i></i><i></i><i></i></p></div>';
    } else if (EX.sent) {
      h += '<div class="bubble ai' + (edited ? " stale" : "") + '"><small>AI assistant · sample answer</small><b>' + esc(ex.head) + '</b><ul class="lines">' +
        oks.map(function (i) {
          var c = ex.chips[i], has = sent.indexOf(i) >= 0;
          return '<li class="' + (has ? "ok" : "no") + '"><span>' + esc(has ? c.yes : c.no) + "</span><em>" + (has ? "✓ " + esc(c.good) : "✗ " + esc(c.bad)) + "</em></li>";
        }).join("") + "</ul>" +
        sent.filter(function (i) { return !ex.chips[i].ok; }).map(function (i) { return '<p class="dnote">– ' + esc(ex.chips[i].note) + "</p>"; }).join("") + "</div>";
      /* a wrong answer is the third way to get help: offer the shortest snippet for the first line that still misses */
      if (EX.attempts > 0 && missing.length && !edited) {
        var mc = ex.chips[missing[0]], st = A.ladderFor(LIB, mc.concept);
        if (st.length) h += '<button class="helpcard" id="hc"><span class="len">' + A.lenLabel(st[0].dur) + '</span><span><small>Stuck on “' + esc(mc.bad) + '”? Watch this.</small><b>' + esc(CON[mc.concept].title) + "</b></span><span>▶</span></button>";
      }
    }
    if (EX.solved) {
      h += '<div class="banner good"><h3>That works.</h3><p>Same AI, same topic. The details you added made the difference.</p></div>';
    } else {
      var hint = EX.thinking ? "…" : EX.attempts === 0 ? "The answer misses in " + missing.length + " places. Pick the details that would fix it, then send."
        : (missing.length === 1 ? "Close: one line still misses." : missing.length + " lines still miss.") + " Change your picks and send again, or tap “" + t("stuck") + "”.";
      h += '<div class="composer" id="cmp"><div class="hand" style="font-size:23px">' + esc(t("addToPrompt")) + '</div><p class="sub" style="font-size:13px">' + esc(hint) + '</p><div class="pchips">' +
        ex.chips.map(function (c, i) {
          var on = EX.sel.indexOf(i) >= 0;
          return '<button class="pchip ' + (on ? "on" : "") + '" data-c="' + i + '" aria-pressed="' + on + '">' + (on ? "✓ " : "+ ") + esc(c.t) + "</button>";
        }).join("") + "</div></div>";
    }
    h += '</div><div class="ex-foot">';
    if (EX.solved) h += '<button class="btn" id="fin">' + esc(t("next")) + " →</button>";
    else h += '<div class="row"><button class="btn stuck-btn' + (EX.attempts > 0 && !edited ? " pulse" : "") + '" id="stuck">🙋 ' + esc(t("stuck")) + "</button>" +
      '<button class="btn" id="send"' + (EX.thinking ? " disabled" : "") + ">" + esc(EX.attempts > 0 ? t("sendAgain") : t("send")) + " ➤</button></div>";
    h += "</div></div>";
    var keep = $("exb") ? $("exb").scrollTop : 0;
    app.innerHTML = h;
    var body = $("exb"), target = scrollTo && $(scrollTo);
    body.scrollTop = target ? Math.max(0, target.offsetTop - body.offsetTop - 8) : keep;
    if ($("hc") && scrollTo === "me") {            // after a wrong answer, keep the offered help clip on screen
      var hc = $("hc"); body.scrollTop = Math.max(body.scrollTop, hc.offsetTop - body.offsetTop + hc.offsetHeight - body.clientHeight + 14);
    }
    $("back").onclick = function () { go("/home"); };
    if (EX.solved) { $("fin").onclick = function () { var n = EX.n, k = EX.k; EX = null; nextAfter(n, k); }; return; }
    app.querySelectorAll("[data-c]").forEach(function (b) {
      b.onclick = function () { var i = +b.getAttribute("data-c"), k = EX.sel.indexOf(i); if (k >= 0) EX.sel.splice(k, 1); else EX.sel.push(i); renderEx(); };
    });
    var ctx = function () {
      return { topic: EX.id, missed: missing.map(function (i) { return ex.chips[i].concept; }), all: oks.map(function (i) { return ex.chips[i].concept; }), attempts: EX.attempts };
    };
    $("stuck").onclick = function () { openStuck(ctx()); };
    if ($("hc")) $("hc").onclick = function () {
      var mc = ex.chips[missing[0]];
      startHelp({ steps: A.ladderFor(LIB, mc.concept), q: CON[mc.concept].q, concept: mc.concept, topic: EX.id, via: "wrong answer", t0: performance.now() });
    };
    $("send").onclick = function () {
      if (EX.thinking) return;
      if (!EX.sel.length) { toast("Pick at least one detail to add first."); return renderEx("cmp"); }
      if (EX.sent && same(EX.sent, EX.sel) && EX.attempts > 0) { toast("Nothing changed. Add or remove a detail first."); return renderEx("cmp"); }
      var id = EX.id;
      EX.thinking = true; EX.sent = EX.sel.slice(); renderEx("me");
      setTimeout(function () {
        if (!EX || EX.id !== id) return;
        EX.thinking = false; EX.attempts++;
        EX.solved = oks.every(function (i) { return EX.sent.indexOf(i) >= 0; });
        if (EX.solved) finishItem(EX.n, EX.k, 60, EX.attempts === 1);
        if ($("exb")) renderEx("me");
      }, 800);
    };
  }

  /* ---------- quick check: one multiple-choice question per concept ---------- */
  function check(n, k, it) {
    var c = CON[it.concept];
    if (!CHK || CHK.id !== c.id) CHK = { id: c.id, n: n, k: k, picked: [], right: false };
    CHK.n = n; CHK.k = k;
    var ck = c.check, last = CHK.picked[CHK.picked.length - 1];
    var h = '<div class="ex"><div class="top"><button class="pill" id="back" aria-label="Back">←</button><span class="pill">✅ Quick check</span><span class="grow"></span><span class="pill">🔥 ' + daysDone() + "</span></div>" +
      '<div class="ex-body" id="exb"><div class="task"><div class="hand">' + esc(c.title) + "</div><p>" + esc(ck.stem) + '</p></div><div class="stack">' +
      ck.options.map(function (o, i) {
        var tried = CHK.picked.indexOf(i) >= 0;
        return '<button class="opt ' + (tried ? (o.ok ? "good" : "bad") : "") + '" data-o="' + i + '"' + (CHK.right || tried ? " disabled" : "") + ">" + esc(o.t) +
          (tried ? '<span class="why">' + (o.ok ? "✓ " : "✗ ") + esc(o.why) + "</span>" : "") + "</button>";
      }).join("") + "</div>";
    if (last != null && !ck.options[last].ok) {
      var st = A.ladderFor(LIB, c.id);
      if (st.length) h += '<button class="helpcard" id="hc"><span class="len">' + A.lenLabel(st[0].dur) + "</span><span><small>Not sure why? Watch this.</small><b>" + esc(c.title) + "</b></span><span>▶</span></button>";
    }
    h += '</div><div class="ex-foot">' + (CHK.right ? '<button class="btn" id="fin">' + esc(t("next")) + " →</button>"
      : '<button class="btn stuck-btn" id="stuck">🙋 ' + esc(t("stuck")) + "</button>") + "</div></div>";
    app.innerHTML = h;
    $("back").onclick = function () { go("/home"); };
    app.querySelectorAll("[data-o]").forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute("data-o"); CHK.picked.push(i);
        if (ck.options[i].ok) { CHK.right = true; finishItem(n, k, 20, CHK.picked.length === 1); }
        check(n, k, it);
      };
    });
    if ($("hc")) $("hc").onclick = function () { startHelp({ steps: A.ladderFor(LIB, c.id), q: c.q, concept: c.id, topic: c.topic, via: "wrong answer", t0: performance.now() }); };
    if ($("stuck")) $("stuck").onclick = function () { openStuck({ topic: c.topic, missed: [c.id], all: [c.id], attempts: CHK.picked.length }); };
    if ($("fin")) $("fin").onclick = function () { CHK = null; nextAfter(n, k); };
  }

  /* ---------- I'm stuck: the just-in-time finder ---------- */
  function openStuck(ctx) {
    var t0 = performance.now(), tp = TOP[ctx.topic];
    var order = ctx.missed.concat(ctx.all.filter(function (c) { return ctx.missed.indexOf(c) < 0; }));
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    var scrim = document.createElement("div"); scrim.className = "scrim";
    scrim.innerHTML = '<div class="sheet" role="dialog" aria-label="' + esc(t("stuck")) + '"><div class="grab"></div><h3>' + esc(t("stuckOn")) + "</h3>" +
      '<p class="sub" style="font-size:13px">' + (ctx.attempts > 0 ? "Sorted by what your last answer still misses." : "Pick the one closest to your problem.") + "</p>" +
      '<div class="stack">' + order.map(function (c) { return '<button class="qbtn" data-q="' + c + '">“' + esc(CON[c].q) + "”</button>"; }).join("") +
      '<button class="qbtn" data-q="' + tp.intro + '">“I don’t understand the task.”</button></div>' +
      '<p class="sub" style="font-size:13px">' + esc(t("askOwn")) + "</p>" +
      '<form class="search" id="sf"><input id="sq" placeholder="e.g. the questions are too hard" autocomplete="off" aria-label="' + esc(t("askOwn")) + '">' +
      (Rec ? '<button type="button" id="mic" aria-label="Speak your question">🎤</button>' : "") + '<button type="submit">' + esc(t("find")) + "</button></form>" +
      '<div class="stack" id="res"></div><button class="btn ghost" id="close">' + esc(t("backToExercise")) + "</button></div>";
    app.appendChild(scrim);
    var q$ = function (s) { return scrim.querySelector(s); };
    q$("#close").onclick = function () { scrim.remove(); };
    scrim.onclick = function (e) { if (e.target === scrim) scrim.remove(); };
    scrim.querySelectorAll("[data-q]").forEach(function (b) {
      b.onclick = function () {
        var c = b.getAttribute("data-q"), st = A.ladderFor(LIB, c);
        if (c === tp.intro) st = [A.pickLen(A.forConcept(LIB, c).filter(function (s) { return s.kind !== "class"; }), "1m")].concat(st.filter(function (s) { return s.bucket === "section" || s.bucket === "class"; })).filter(Boolean);
        startHelp({ steps: st, q: c === tp.intro ? "I don’t understand the task." : CON[c].q, concept: c, topic: ctx.topic, via: "tap", t0: t0 });
      };
    });
    if (Rec) q$("#mic").onclick = function () {
      var r = new Rec(), b = this; r.lang = ({ en: "en-IN", hi: "hi-IN", te: "te-IN" })[S.lang] || "en-IN"; b.textContent = "…";
      r.onresult = function (e) { q$("#sq").value = e.results[0][0].transcript; b.textContent = "🎤"; q$("#sf").requestSubmit ? q$("#sf").requestSubmit() : null; };
      r.onerror = r.onend = function () { b.textContent = "🎤"; };
      try { r.start(); } catch (e) { b.textContent = "🎤"; }
    };
    q$("#sf").onsubmit = function (e) {
      e.preventDefault();
      var q = q$("#sq").value.trim(); if (!q) return;
      var r = A.search(IX, q, { topic: ctx.topic, concepts: ctx.missed }), res = q$("#res");
      if (r.none) {
        S.unanswered.push({ q: q, topic: ctx.topic, at: Date.now() }); save();
        res.innerHTML = '<div class="banner bad"><h3>No video answers this yet</h3><p>We do not guess. Your question has been saved for the teaching team, so a teacher can record an answer.</p></div>';
      } else {
        var g = r.groups[0], more = r.groups.slice(1, 3);
        res.innerHTML = '<div class="hand" style="font-size:22px">Best match first</div>' + g.steps.map(function (sn, k) {
          return '<button class="hit ' + (k === 0 ? "best" : "") + '" data-g="0" data-r="' + k + '"><span class="len">' + A.lenLabel(sn.dur) + "</span><span><b>" + esc(k === 0 ? g.title : sn.title) + "</b><small>" +
            esc(kindLabel(sn)) + " · from " + A.clock(sn.start) + " of “" + esc(CLS[sn.class].title) + "”</small></span></button>";
        }).join("") + (more.length ? '<p class="sub" style="font-size:13px">Not what you meant? Other matches:</p>' + more.map(function (m, j) {
          return '<button class="hit" data-g="' + (j + 1) + '" data-r="0"><span class="len">' + A.lenLabel(m.steps[0].dur) + "</span><span><b>" + esc(m.title) + "</b><small>" + esc(TOP[CON[m.concept].topic].name) + "</small></span></button>";
        }).join("") : "");
        res.querySelectorAll("[data-r]").forEach(function (b) {
          b.onclick = function () {
            var grp = r.groups[+b.getAttribute("data-g")];
            startHelp({ steps: grp.steps, k: +b.getAttribute("data-r"), q: q, concept: grp.concept, topic: CON[grp.concept].topic, via: "typed", t0: t0,
              others: r.groups.filter(function (x) { return x !== grp; }).slice(0, 2) });
          };
        });
      }
      res.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    };
  }
  function startHelp(h) {
    if (!h.steps || !h.steps.length) return toast("No approved video for this yet.");
    HELP = Object.assign({ k: 0, back: location.hash.slice(1), timed: false }, h);
    S.stuckLog.push({ q: h.q, concept: h.concept, topic: h.topic, via: h.via, at: Date.now() }); S.clips++; S.xp += 5; PLAN = null; save();
    go("/help");
  }
  function helpScreen() {
    if (!HELP) return go("/home");
    var sn = HELP.steps[HELP.k], nx = HELP.steps[HELP.k + 1];
    var backTo = function () { var b = HELP.back; HELP = null; go(b); };
    player(sn, {
      badge: "⚡ " + A.lenLabel(sn.dur) + " · " + kindLabel(sn),
      kicker: "Here to help with: “" + HELP.q + "”",
      back: backTo,
      onPlaying: function () { if (!HELP.timed) { HELP.timed = true; S.tth.push(Math.round((performance.now() - HELP.t0) / 100) / 10); save(); } },
      foot: function (ended) {
        return '<button class="btn teal" id="bk">✓ ' + esc(t("gotIt")) + " · " + esc(t("backToExercise")) + "</button>" +
          (nx ? '<button class="btn ghost" id="more">' + esc(t("stillStuck")) + " → " + A.lenLabel(nx.dur) + " " + esc(kindLabel(nx)) + "</button>" : "") +
          (HELP.others && HELP.others.length ? '<button class="link" id="nott">Not this. Try “' + esc(HELP.others[0].title) + "”</button>" : "");
      },
      bind: function () {
        $("bk").onclick = backTo;
        if ($("more")) $("more").onclick = function () { HELP.k++; S.clips++; save(); stopPlayer(); helpScreen(); };
        if ($("nott")) $("nott").onclick = function () { var o = HELP.others.shift(); HELP.steps = o.steps; HELP.k = 0; HELP.concept = o.concept; S.clips++; save(); stopPlayer(); helpScreen(); };
      }
    });
  }

  /* ---------- day done ---------- */
  function done(n) {
    n = +n; var pl = plan(), d = pl.days[n]; if (!d) return go("/home");
    var seen = [], nxt = pl.days[n + 1];
    d.items.forEach(function (i) { if (i.concept && seen.indexOf(i.concept) < 0 && CON[i.concept].prereq.length) seen.push(i.concept); if (i.type === "exercise") TOP[i.topic].exercise.chips.forEach(function (c) { if (c.ok && seen.indexOf(c.concept) < 0) seen.push(c.concept); }); });
    app.innerHTML = '<div class="screen"><div class="grow"></div><div class="confetti">🎉</div><div class="hand" style="text-align:center">' + esc(dayName(n)) + " · " + esc(t("lessonDone")) + '</div>' +
      '<div class="stat-row"><div class="stat"><b>' + S.xp + '</b><span>XP</span></div><div class="stat"><b>🔥 ' + daysDone() + "</b><span>" + esc(t("streak")) + "</span></div></div>" +
      (seen.length ? '<div class="banner good"><h3>What you practised</h3><ul class="plain">' + seen.map(function (c) { return "<li>" + esc(CON[c].title) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div class="grow"></div>' + (nxt ? '<button class="btn ghost" data-go="/item/' + (n + 1) + '/0">Next: ' + esc(nxt.items[0].title) + "</button>" : "") +
      '<button class="btn" data-go="/home">' + esc(t("seeWeek")) + "</button></div>";
    bind();
  }

  /* ---------- home / plan ---------- */
  function home() {
    var pl = plan(), lv = levelObj();
    var today = -1; pl.days.forEach(function (d, i) { if (today < 0 && !dayDone(d)) today = i; });
    var h = '<div><div class="hand">' + esc(t("yourWeek")) + "</div><h2>" + esc(roleObj().name) + "</h2>" +
      '<p class="sub">' + esc(t(lv.key)) + " · " + S.mins + " " + esc(t("min")) + " / day · " + pl.days.length + " days</p></div>";
    h += '<div class="stack">' + pl.days.map(function (d, i) {
      var n = d.items.filter(function (x) { return S.done[x.key]; }).length, ok = n === d.items.length;
      var topics = []; d.items.forEach(function (x) { var nm = TOP[x.topic].name; if (topics.indexOf(nm) < 0) topics.push(nm); });
      var v = d.items.filter(function (x) { return x.type === "video"; }).length, p = d.items.length - v;
      return (i === 5 ? '<div class="hand" style="font-size:22px">Next week</div>' : "") +
        '<button class="day ' + (i === today ? "today" : "") + '" data-day="' + i + '"><span class="dn">' + dayName(i) + '</span><span class="grow"><span class="tag">' + esc(d.refresher ? "Where you got stuck" : topics.join(" + ")) +
        "</span><br><b>" + esc(d.items[0].title) + '</b><span class="sub" style="display:block;font-size:13px">' + v + (v === 1 ? " video" : " videos") + (p ? " + " + p + " practice" : "") + " · " + Math.max(1, Math.round(d.minutes)) + " min" +
        (n && !ok ? " · " + n + "/" + d.items.length + " done" : "") + '</span></span><span class="chk ' + (ok ? "ok" : "") + '">' + (ok ? "✓" : "") + "</span></button>";
    }).join("") + "</div>";
    h += '<p class="note">This plan was put together by rules from ' + pl.snippets + " approved snippets of " + pl.classes + (pl.classes === 1 ? " class" : " classes") +
      ": your topics, in order, with each idea after the ones it builds on, packed into " + S.mins + "-minute days. Ask for help in an exercise and a refresher day is added.</p>";
    shell(h, "home");
    app.querySelectorAll("[data-day]").forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute("data-day"), d = pl.days[i], k = 0;
        while (k < d.items.length - 1 && S.done[d.items[k].key]) k++;
        if (dayDone(d)) k = 0;
        go("/item/" + i + "/" + k);
      };
    });
  }

  /* ---------- progress ---------- */
  function progress() {
    var pl = plan(), n = daysDone(), med = median(S.tth);
    var full = Object.keys(S.seen).reduce(function (a, id) { return a + (CLS[id] ? CLS[id].video_bytes : 0); }, 0);
    var h = '<div><div class="hand">' + esc(t("progress")) + "</div><h2>" + n + " / " + pl.days.length + "</h2></div>" +
      '<div class="week">' + pl.days.slice(0, 5).map(function (d, i) { var ok = dayDone(d); return "<div>" + dayName(i) + '<i class="' + (ok ? "ok" : "") + '">' + (ok ? "✓" : "") + "</i></div>"; }).join("") + "</div>" +
      '<div class="stat-row"><div class="stat"><b>🔥 ' + n + "</b><span>" + esc(t("streak")) + '</span></div><div class="stat"><b>' + S.xp + '</b><span>XP</span></div><div class="stat"><b>' + S.clips + "</b><span>help clips</span></div></div>" +
      '<div class="stat-row"><div class="stat"><b>' + (med == null ? "–" : med + "s") + '</b><span>from “stuck” to a video playing</span></div><div class="stat"><b>' + (S.bytes ? mb(S.bytes) : "–") + "</b><span>data used on video" +
      (full && S.bytes ? " · the same classes in full: " + mb(full) : "") + "</span></div></div>";
    if (S.stuckLog.length) {
      h += "<h3>Where you got stuck</h3><div class=\"stack\">" + S.stuckLog.slice(-4).reverse().map(function (s) {
        return '<div class="lb"><span>⚡</span><span class="grow"><b>' + esc(s.q) + '</b><br><small class="sub">' + esc(CON[s.concept] ? CON[s.concept].title : "") + " · " + esc(s.via || "") + "</small></span></div>";
      }).join("") + '</div><p class="note">A refresher on these has been added to the end of your plan.</p>';
    } else {
      h += '<p class="note">Tap “' + esc(t("stuck")) + '” inside any exercise. What you ask about shows up here, and your plan adds a refresher on it.</p>';
    }
    if (S.unanswered.length) h += "<h3>Questions with no video yet</h3><div class=\"stack\">" + S.unanswered.slice(-3).map(function (u) { return '<div class="lb"><span>❓</span><span class="grow">' + esc(u.q) + "</span></div>"; }).join("") + "</div>";
    h += '<button class="btn ghost" data-go="/home">' + esc(t("plan")) + "</button>";
    shell(h, "progress");
  }

  /* ---------- cohort (sample data; real cohorts come with the pilot) ---------- */
  function cohort() {
    var c = COHORTS[S.role] || COHORTS.teacher;
    var rows = c.people.map(function (p) { return { n: p[0], xp: p[1] }; });
    rows.push({ n: t("you"), xp: S.xp, me: true });
    rows.sort(function (a, b) { return b.xp - a.xp; });
    var h = '<div><div class="hand">' + esc(t("cohort")) + "</div><h2>" + esc(c.name) + '</h2><p class="sub">' + esc(t("leaderboard")) + " · sample cohort</p></div>" +
      '<div class="stack">' + rows.map(function (r, k) {
        return '<div class="lb ' + (r.me ? "me" : "") + '"><span class="rk">' + (k + 1) + '</span><span class="av">' + esc(r.n.charAt(0)) + '</span><span class="grow"><b>' + esc(r.n) + "</b></span><b>" + r.xp + " XP</b></div>";
      }).join("") + '</div><p class="note">Cohorts and leaderboards are part of the pilot stage. Your XP here is real; the other names are made up.</p>';
    shell(h, "cohort");
  }

  /* ---------- start ---------- */
  $("restart").onclick = function () { stopPlayer(); resetProfile({ lang: S.lang }); go("/welcome"); };
  app.innerHTML = '<div class="screen"><div class="hero"><div class="logo">AI Launchpad</div><p class="sub">Loading the library…</p></div></div>';
  fetch("data/library.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (raw) {
    var overlay = null; try { overlay = JSON.parse(localStorage.getItem(RKEY) || "null"); } catch (e) {}
    LIB = A.applyReview(raw, overlay); IX = A.buildIndex(LIB);
    CLS = A.byId(LIB.classes); SN = A.byId(LIB.snippets); CON = A.byId(LIB.concepts); TOP = A.byId(LIB.topics);
    S.topics = S.topics.filter(function (x) { return TOP[x] && A.topicLive(LIB, TOP[x]); });
    if (overlay && Object.keys(overlay.snippets || {}).length && $("revnote")) $("revnote").hidden = false;
    route();
  }).catch(function (e) {
    app.innerHTML = '<div class="screen"><div class="hero"><div class="logo">AI Launchpad</div><p class="sub">The library could not be loaded (' + esc(e.message) + "). Open this page through a web server, not as a file.</p></div></div>";
  });
})();
