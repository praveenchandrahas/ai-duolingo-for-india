/* AI Launchpad: click-through prototype (v2).
   Vanilla JS, no build step. Content comes from data.js; state lives in localStorage (best effort).

   Flow:  #/welcome -> #/role -> #/topics -> #/level -> #/lang -> #/minutes -> #/building
          -> #/learn/<topic>   short explainer video
          -> #/try/<topic>     exercise, with "I'm stuck" -> #/clip (20 sec -> 1 min -> 10 min) -> back to the exercise
          -> #/done/<topic> -> #/home (week plan), #/progress, #/cohort */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var KEY = "launchpad-proto-v2";
  var DEFAULT = { role: null, topics: [], level: null, lang: "en", mins: 10, done: [], firstTry: {}, xp: 0, stuckLog: [], clips: 0 };
  var S = load();
  var EX = null;      // exercise in progress: survives a detour to a help clip
  var HELP = null;    // help clip being watched
  var P = null;       // player state
  var timer = null, auto = null;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  var FROM = ["01:20", "03:05", "04:40", "02:15", "05:10"];

  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return Object.assign({}, DEFAULT, JSON.parse(raw)); } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function t(k) { return (I18N[S.lang] && I18N[S.lang][k]) || I18N.en[k] || k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function label(v) { return v.replace("m", " min").replace("s", " sec"); }
  function fmt(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2); }
  function roleObj() { return ROLES.filter(function (r) { return r.id === S.role; })[0]; }
  function levelObj() { return LEVELS.filter(function (l) { return l.id === S.level; })[0] || LEVELS[0]; }
  function presenter() { return PRESENTERS[S.role] || PRESENTERS.teacher; }
  function topicList() { return TOPICS[S.role] || []; }
  function topic(id) { return topicList().filter(function (x) { return x.id === id; })[0]; }
  function chosen() { return S.topics.map(topic).filter(Boolean); }
  function okIdx(tp) { var a = []; tp.chips.forEach(function (c, i) { if (c.ok) a.push(i); }); return a; }
  function $(id) { return document.getElementById(id); }

  /* ---------- router ---------- */
  function go(path) { if (location.hash === "#" + path) route(); else location.hash = path; }
  window.addEventListener("hashchange", route);

  function route() {
    stopTimer();
    if (auto) { clearTimeout(auto); auto = null; }
    var p = (location.hash || "#/welcome").slice(1).split("/").filter(Boolean);
    var name = p[0] || "welcome", arg = p[1];
    var ready = S.role && S.topics.length && S.level;
    if (["building", "home", "learn", "try", "clip", "done", "progress", "cohort"].indexOf(name) >= 0 && !ready) return go("/welcome");
    var fn = { welcome: welcome, role: pickRole, topics: pickTopics, level: pickLevel, lang: pickLang, minutes: pickMins, building: building,
      home: home, learn: learn, "try": tryIt, clip: clipScreen, done: done, progress: progress, cohort: cohort }[name] || welcome;
    fn(arg);
  }

  /* ---------- shared bits ---------- */
  function person(tone) {
    return '<svg class="person" viewBox="0 0 200 220" aria-hidden="true">' +
      '<g fill="' + tone + '" stroke="#1F2A44" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M30 220 Q36 150 100 140 Q164 150 170 220 Z" fill="#1F2A44"/>' +
      '<path d="M84 140 L84 120 L116 120 L116 140" fill="#F3D2B3"/>' +
      '<ellipse cx="100" cy="86" rx="38" ry="44" fill="#F3D2B3"/>' +
      '<path d="M60 84 Q56 36 100 34 Q146 36 140 84 Q128 56 100 58 Q72 56 60 84 Z" fill="#1F2A44"/>' +
      '<path d="M84 94 L84 98 M116 94 L116 98" fill="none"/>' +
      '<path d="M86 112 Q100 122 114 112" fill="none"/>' +
      "</g></svg>";
  }
  function topbar() {
    var langs = Object.keys(LANGS), next = langs[(langs.indexOf(S.lang) + 1) % langs.length];
    return '<div class="top"><span class="pill">🔥 ' + S.done.length + '</span><span class="pill">⭐ ' + S.xp + '</span><span class="grow"></span>' +
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
    setTimeout(function () { el.remove(); }, 2400);
  }

  /* ---------- onboarding ---------- */
  function welcome() {
    app.innerHTML = '<div class="screen"><div class="hero">' +
      '<div class="logo">AI Launchpad</div><h1>' + esc(t("tagline")) + "</h1>" +
      '<div class="hero-art">' + person("#CFE8E4") + "</div>" +
      '<p class="sub">Real people explain it. Short videos, in your language, built around your work.</p>' +
      '<button class="btn" data-go="/role">' + esc(t("start")) + "</button></div></div>";
    bind();
  }

  function pickRole() {
    app.innerHTML = '<div class="screen">' + steps(1, "/welcome") +
      "<h2>" + esc(t("pickRole")) + '</h2><p class="sub">' + esc(t("pickRoleSub")) + '</p><div class="stack">' +
      ROLES.map(function (r) {
        return '<button class="choice ' + (r.live ? (S.role === r.id ? "on" : "") : "off") + '" data-role="' + r.id + '"' + (r.live ? "" : " disabled") + ">" +
          '<span class="ic">' + r.icon + "</span>" + esc(r.name) + (r.live ? "" : "<small>" + esc(t("soon")) + "</small>") + "</button>";
      }).join("") + "</div></div>";
    bind();
    app.querySelectorAll("[data-role]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-role");
        if (S.role !== id) { S = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), { role: id, lang: S.lang, mins: S.mins, level: S.level }); EX = null; }
        save(); go("/topics");
      };
    });
  }

  function pickTopics() {
    if (!S.role) return go("/role");
    var list = topicList();
    app.innerHTML = '<div class="screen">' + steps(2, "/role") +
      "<h2>" + esc(t("pickTopics")) + '</h2><p class="sub">' + esc(t("pickTopicsSub")) + '</p><div class="stack">' +
      list.map(function (tp) {
        var k = S.topics.indexOf(tp.id);
        return '<button class="choice ' + (k >= 0 ? "on" : "") + '" data-tp="' + tp.id + '" aria-pressed="' + (k >= 0) + '"><span class="ic">' + tp.icon + "</span>" + esc(tp.name) +
          '<small class="num">' + (k >= 0 ? k + 1 : "") + "</small></button>";
      }).join("") + '</div><p class="sub" style="font-size:13px">The number shows the order your plan follows.</p><div class="grow"></div>' +
      '<button class="btn" id="nx"' + (S.topics.length ? "" : " disabled") + ">" + esc(t("next")) + "</button></div>";
    bind();
    app.querySelectorAll("[data-tp]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-tp"), k = S.topics.indexOf(id);
        if (k >= 0) S.topics.splice(k, 1);
        else if (S.topics.length >= 3) return toast("Pick up to 3. Tap one again to remove it.");
        else S.topics.push(id);
        save(); pickTopics();
      };
    });
    $("nx").onclick = function () { if (S.topics.length) go("/level"); };
  }

  function pickLevel() {
    app.innerHTML = '<div class="screen">' + steps(3, "/topics") +
      "<h2>" + esc(t("pickLevel")) + '</h2><p class="sub">' + esc(t("pickLevelSub")) + '</p><div class="stack">' +
      LEVELS.map(function (l) {
        return '<button class="choice ' + (S.level === l.id ? "on" : "") + '" data-lv="' + l.id + '"><span class="ic">' + l.icon + "</span><span>" + esc(t(l.key)) + '<span class="sm">' + esc(t(l.sub)) + "</span></span></button>";
      }).join("") + "</div></div>";
    bind();
    app.querySelectorAll("[data-lv]").forEach(function (b) { b.onclick = function () { S.level = b.getAttribute("data-lv"); save(); go("/lang"); }; });
  }

  function pickLang() {
    app.innerHTML = '<div class="screen">' + steps(4, "/level") + "<h2>" + esc(t("pickLang")) + '</h2><p class="sub">' + esc(t("pickLangSub")) + '</p><div class="stack">' +
      Object.keys(LANGS).map(function (k) {
        return '<button class="choice ' + (S.lang === k ? "on" : "") + '" data-l="' + k + '"><span class="ic">🗣️</span><span>' + LANGS[k].native + '<span class="sm">' + LANGS[k].name + "</span></span></button>";
      }).join("") + "</div></div>";
    bind();
    app.querySelectorAll("[data-l]").forEach(function (b) { b.onclick = function () { S.lang = b.getAttribute("data-l"); save(); go("/minutes"); }; });
  }

  function pickMins() {
    app.innerHTML = '<div class="screen">' + steps(5, "/lang") + "<h2>" + esc(t("pickMins")) + '</h2><p class="sub">' + esc(t("pickMinsSub")) + "</p>" +
      '<div class="mins">' + [5, 10, 15].map(function (m) {
        return '<button class="choice ' + (S.mins === m ? "on" : "") + '" data-m="' + m + '"><b>' + m + "</b>" + esc(t("min")) + "</button>";
      }).join("") + '</div><p class="note">' + esc(dayMix()) + '</p><div class="grow"></div><button class="btn" id="build">' + esc(t("build")) + "</button></div>";
    bind();
    app.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { S.mins = +b.getAttribute("data-m"); save(); pickMins(); }; });
    $("build").onclick = function () { save(); go("/building"); };
  }
  function dayMix() {
    var ex = label(levelObj().explainer) + " explainer + 1 exercise";
    return "Each day: " + (S.mins <= 5 ? ex : S.mins <= 10 ? ex + " + 1 stretch task" : ex + " + 1 stretch task + a 5-min deep dive") + ".";
  }

  /* Short "plan is being built" step, then straight into the first explainer. */
  function building() {
    var tps = chosen(), first = tps[0], pr = presenter();
    var lines = [
      roleObj().name + ": " + tps.map(function (x) { return x.name; }).join(", "),
      levelObj().plan,
      S.mins + " minutes a day, in " + LANGS[S.lang].name,
      "Snippets picked from " + pr.name + "'s classes"
    ];
    app.innerHTML = '<div class="screen"><div class="hand">' + esc(t("building")) + "</div><h2>" + esc(roleObj().name) + '</h2><div class="stack">' +
      lines.map(function (l, i) { return '<div class="bl" style="--d:' + (i * 0.45) + 's"><span>✓</span>' + esc(l) + "</div>"; }).join("") + "</div>" +
      '<div class="bl day today" style="--d:1.9s"><span class="dn">' + DAYS[0] + '</span><span class="grow"><span class="tag">' + esc(first.name) + "</span><br><b>" + esc(first.ex.title) + "</b></span></div>" +
      '<div class="grow"></div><button class="btn" id="st">' + esc(t("startLesson")) + " →</button></div>";
    $("st").onclick = function () { go("/learn/" + first.id); };
    auto = setTimeout(function () { go("/learn/" + first.id); }, reduce ? 2500 : 3600);
  }

  /* ---------- player (explainers and help clips) ---------- */
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function startPlayer(clip, hooks) {
    var dur = DURATIONS[clip.v];
    P = { clip: clip, t: 0, dur: dur, speed: dur > 60 ? 30 : 3, playing: true, hooks: hooks };
    renderPlayer();
    stopTimer();
    timer = setInterval(function () { if (P && P.playing) tick(0.1 * P.speed); }, 100);
  }
  function renderPlayer() {
    var c = P.clip, pr = presenter();
    app.innerHTML = '<div class="player">' +
      '<div class="top"><button class="pill" id="back" aria-label="Back">←</button><span class="grow"></span><span class="pill">🔥 ' + S.done.length + "</span></div>" +
      '<div class="stage" style="background:' + pr.tone + '">' + person(pr.tone) +
      '<span class="badge">' + esc(c.badge) + " · " + esc(LANGS[S.lang].name) + " voice</span>" +
      '<span class="ph">Placeholder footage</span><div class="caption" id="cap"></div></div>' +
      '<div class="bar" id="bar" role="slider" aria-label="Seek"><i id="fill"></i></div>' +
      '<div class="controls"><button class="round" id="pp" aria-label="Play or pause">❚❚</button><span id="time" class="sub tnum"></span><span class="grow"></span>' +
      [1, 3, 30].map(function (s) { return '<button class="chip ' + (P.speed === s ? "on" : "") + '" data-sp="' + s + '">' + s + "×</button>"; }).join("") + "</div>" +
      '<div class="meta"><div class="hand" style="font-size:22px">' + esc(c.kicker) + "</div><h3>" + esc(c.title) + '</h3><p class="sub" style="font-size:13px">' + esc(c.sub) + "</p></div>" +
      '<div class="foot" id="foot"></div></div>';
    $("back").onclick = function () { P.hooks.back(); };
    $("pp").onclick = function () { if (P.clip && P.t >= P.dur) P.t = 0; P.playing = !P.playing; tick(0); renderFoot(); };
    app.querySelectorAll("[data-sp]").forEach(function (b) {
      b.onclick = function () { P.speed = +b.getAttribute("data-sp"); app.querySelectorAll("[data-sp]").forEach(function (x) { x.classList.toggle("on", x === b); }); };
    });
    $("bar").onclick = function (e) { var r = this.getBoundingClientRect(); P.t = Math.min(P.dur - 0.5, Math.max(0, (e.clientX - r.left) / r.width * P.dur)); tick(0); renderFoot(); };
    renderFoot(); tick(0);
  }
  function renderFoot() { var f = $("foot"); if (!f || !P) return; f.innerHTML = P.hooks.foot(P.t >= P.dur); P.hooks.bind(); }
  function tick(dt) {
    if (!P) return;
    var fill = $("fill"); if (!fill) return;
    var was = P.t >= P.dur, c = P.clip;
    P.t = Math.min(P.dur, P.t + dt);
    fill.style.width = (P.t / P.dur * 100) + "%";
    $("cap").textContent = c.lines[Math.min(c.lines.length - 1, Math.floor(P.t / P.dur * c.lines.length))];
    $("time").textContent = fmt(P.t) + " / " + fmt(P.dur);
    $("pp").textContent = (P.playing && P.t < P.dur) ? "❚❚" : "▶";
    if (!was && P.t >= P.dur) { P.playing = false; renderFoot(); }
  }

  /* ---------- explainer ---------- */
  function learn(id) {
    var tp = topic(id); if (!tp) return go("/home");
    var pr = presenter(), v = levelObj().explainer, L = tp.ex.lines;
    var lines = v === "1m" ? L : v === "20s" ? [L[2], L[3]] : [L[2]];
    var dayNo = S.topics.indexOf(id);
    startPlayer({ v: v, badge: "▶ " + label(v) + " explainer", title: tp.ex.title, lines: lines, kicker: pr.name + " · " + pr.title,
      sub: tp.name + (dayNo >= 0 ? " · " + DAYS[dayNo] : "") + " · next: a hands-on exercise" }, {
      back: function () { go("/home"); },
      foot: function (ended) {
        return ended ? '<button class="btn" id="nx">' + esc(t("nowYouTry")) + " →</button>" : '<button class="btn ghost" id="nx">' + esc(t("skipToExercise")) + "</button>";
      },
      bind: function () { $("nx").onclick = function () { go("/try/" + id); }; }
    });
  }

  /* ---------- exercise: fix the prompt ---------- */
  function tryIt(id) {
    var tp = topic(id); if (!tp) return go("/home");
    if (!EX || EX.id !== id) {
      EX = { id: id, sel: [], sent: null, attempts: 0, thinking: true, solved: false };
      setTimeout(function () { if (EX && EX.id === id && EX.thinking && EX.sent === null) { EX.thinking = false; EX.sent = []; if ($("exb")) renderEx(); } }, 900);
      return renderEx();
    }
    renderEx(EX.solved ? "me" : "cmp");
  }
  function same(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); }

  /* Chat layout: task, the prompt as last sent, the AI's answer, then the details the learner can add.
     Only "I'm stuck" and "Send" stay fixed at the bottom, so the answer is readable on small phones. */
  function renderEx(scrollTo) {
    var tp = topic(EX.id), oks = okIdx(tp), sent = EX.sent || [];
    var edited = EX.sent && !same(sent, EX.sel);
    var miss = oks.filter(function (i) { return sent.indexOf(i) < 0; }).length;
    var h = '<div class="ex"><div class="top"><button class="pill" id="back" aria-label="Back">←</button><span class="pill">' + tp.icon + " " + esc(t("exercise")) + '</span><span class="grow"></span><span class="pill">🔥 ' + S.done.length + "</span></div>";
    h += '<div class="ex-body" id="exb"><div class="task"><div class="hand">' + esc(t("yourTask")) + "</div><p>" + esc(tp.task) + "</p></div>";
    h += '<div class="bubble me" id="me"><small>You</small><p>' + esc(tp.base) + sent.map(function (i) { return " <mark>" + esc(tp.chips[i].t) + "</mark>"; }).join("") + "</p></div>";
    if (EX.thinking) {
      h += '<div class="bubble ai"><small>AI assistant</small><p class="typing"><i></i><i></i><i></i></p></div>';
    } else if (EX.sent) {
      h += '<div class="bubble ai' + (edited ? " stale" : "") + '"><small>AI assistant · sample answer</small><b>' + esc(tp.head) + '</b><ul class="lines">' +
        oks.map(function (i) {
          var c = tp.chips[i], has = sent.indexOf(i) >= 0;
          return '<li class="' + (has ? "ok" : "no") + '"><span>' + esc(has ? c.yes : c.no) + "</span><em>" + (has ? "✓ " + esc(c.good) : "✗ " + esc(c.bad)) + "</em></li>";
        }).join("") + "</ul>" +
        sent.filter(function (i) { return !tp.chips[i].ok; }).map(function (i) { return '<p class="dnote">– ' + esc(tp.chips[i].note) + "</p>"; }).join("") + "</div>";
    }
    if (EX.solved) {
      h += '<div class="banner good"><h3>That works.</h3><p>Same AI, same topic. The details you added made the difference.</p></div>';
    } else {
      var hint = EX.thinking ? "…" : EX.attempts === 0 ? "The answer misses in " + miss + " places. Pick the details that would fix it, then send."
        : (miss === 1 ? "Close: one line still misses." : miss + " lines still miss.") + " Change your picks and send again, or tap “" + t("stuck") + "”.";
      h += '<div class="composer" id="cmp"><div class="hand" style="font-size:23px">' + esc(t("addToPrompt")) + '</div><p class="sub" style="font-size:13px">' + esc(hint) + '</p><div class="pchips">' +
        tp.chips.map(function (c, i) {
          var on = EX.sel.indexOf(i) >= 0;
          return '<button class="pchip ' + (on ? "on" : "") + '" data-c="' + i + '" aria-pressed="' + on + '">' + (on ? "✓ " : "+ ") + esc(c.t) + "</button>";
        }).join("") + "</div></div>";
    }
    h += '</div><div class="ex-foot">';
    if (EX.solved) {
      h += '<button class="btn" id="fin">' + esc(t("finish")) + " →</button>";
    } else {
      h += '<div class="row"><button class="btn stuck-btn' + (EX.attempts > 0 && !edited ? " pulse" : "") + '" id="stuck">🙋 ' + esc(t("stuck")) + "</button>" +
        '<button class="btn" id="send"' + (EX.thinking ? " disabled" : "") + ">" + esc(EX.attempts > 0 ? t("sendAgain") : t("send")) + " ➤</button></div>";
    }
    h += "</div></div>";
    var keep = $("exb") ? $("exb").scrollTop : 0;
    app.innerHTML = h;
    var body = $("exb"), target = scrollTo && $(scrollTo);
    body.scrollTop = target ? Math.max(0, target.offsetTop - body.offsetTop - 8) : keep;
    $("back").onclick = function () { go("/home"); };
    if (EX.solved) { $("fin").onclick = function () { var id = EX.id; EX = null; go("/done/" + id); }; return; }
    app.querySelectorAll("[data-c]").forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute("data-c"), k = EX.sel.indexOf(i);
        if (k >= 0) EX.sel.splice(k, 1); else EX.sel.push(i);
        renderEx();
      };
    });
    $("stuck").onclick = openStuck;
    $("send").onclick = function () {
      if (EX.thinking) return;
      if (!EX.sel.length) { toast("Pick at least one detail to add first."); return renderEx("cmp"); }
      if (EX.sent && same(EX.sent, EX.sel) && EX.attempts > 0) { toast("Nothing changed. Add or remove a detail first."); return renderEx("cmp"); }
      var id = EX.id;
      EX.thinking = true; EX.sent = EX.sel.slice(); renderEx("me");
      setTimeout(function () {
        if (!EX || EX.id !== id) return;
        EX.thinking = false; EX.attempts++;
        EX.solved = okIdx(topic(id)).every(function (i) { return EX.sent.indexOf(i) >= 0; });
        if (EX.solved && S.done.indexOf(id) < 0) {
          var first = EX.attempts === 1;
          S.done.push(id); S.firstTry[id] = first; S.xp += 60 + (first ? 20 : 0); save();
        }
        if ($("exb")) renderEx("me");
      }, 800);
    };
  }

  /* ---------- I'm stuck: the just-in-time finder ---------- */
  function openStuck() {
    var tp = topic(EX.id), pr = presenter(), oks = okIdx(tp), sent = EX.sent || [];
    // questions about lines that still miss come first
    var order = oks.filter(function (i) { return sent.indexOf(i) < 0; }).concat(oks.filter(function (i) { return sent.indexOf(i) >= 0; }));
    var scrim = document.createElement("div"); scrim.className = "scrim";
    scrim.innerHTML = '<div class="sheet" role="dialog" aria-label="' + esc(t("stuck")) + '"><div class="grab"></div><h3>' + esc(t("stuckOn")) + "</h3>" +
      '<p class="sub" style="font-size:13px">' + (EX.attempts > 0 ? "Sorted by what your last answer still misses." : "Pick the one closest to your problem.") + "</p>" +
      '<div class="stack">' + order.map(function (i) { return '<button class="qbtn" data-i="' + i + '">“' + esc(tp.chips[i].q) + "”</button>"; }).join("") +
      '<button class="qbtn" data-i="-1">“I don’t understand the task.”</button></div>' +
      '<p class="sub" style="font-size:13px">' + esc(t("askOwn")) + "</p>" +
      '<form class="search" id="sf"><input id="sq" placeholder="…" autocomplete="off" aria-label="' + esc(t("askOwn")) + '"><button type="submit">' + esc(t("find")) + "</button></form>" +
      '<div class="stack" id="res"></div><button class="btn ghost" id="close">' + esc(t("backToExercise")) + "</button></div>";
    app.appendChild(scrim);
    var q$ = function (s) { return scrim.querySelector(s); };
    q$("#close").onclick = function () { scrim.remove(); };
    scrim.onclick = function (e) { if (e.target === scrim) scrim.remove(); };
    function play(chip, rung, q) {
      HELP = { id: EX.id, chip: chip, rung: rung, q: q };
      S.stuckLog.push({ topic: EX.id, q: q }); S.clips++; S.xp += 5; save();
      go("/clip");
    }
    scrim.querySelectorAll("[data-i]").forEach(function (b) {
      b.onclick = function () { var i = +b.getAttribute("data-i"); if (i < 0) play(-1, 1, "I don’t understand the task."); else play(i, 0, tp.chips[i].q); };
    });
    q$("#sf").onsubmit = function (e) {
      e.preventDefault();
      var q = q$("#sq").value.trim(); if (!q) return;
      var words = q.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; });
      var scored = order.map(function (i, pos) {
        var c = tp.chips[i], hay = (c.q + " " + c.title + " " + c.tip.join(" ") + " " + c.bad + " " + c.t).toLowerCase();
        return { i: i, s: words.reduce(function (a, w) { return a + (hay.indexOf(w) >= 0 ? 1 : 0); }, 0) - pos * 0.01 };
      }).sort(function (a, b) { return b.s - a.s; });
      var best = scored[0].i, c = tp.chips[best], from = FROM[best % FROM.length];
      var hits = [
        { len: "20 sec", title: c.title, sub: pr.name + " · from " + from + " of the full class", rung: 0 },
        { len: "1 min", title: "Worked example: the same fix, shown on screen", sub: pr.name + " · from " + from + ", continued", rung: 1 },
        { len: "10 min", title: "Full class: " + tp.name, sub: pr.name + " · the whole section, uncut", rung: 2 }
      ];
      q$("#res").innerHTML = '<div class="hand" style="font-size:22px">Best match first</div>' + hits.map(function (hh, k) {
        return '<button class="hit ' + (k === 0 ? "best" : "") + '" data-r="' + k + '"><span class="len">' + hh.len + "</span><span><b>" + esc(hh.title) + "</b><small>" + esc(hh.sub) + "</small></span></button>";
      }).join("");
      q$("#res").querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { play(best, hits[+b.getAttribute("data-r")].rung, q); }; });
      q$("#res").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    };
  }

  function helpClip() {
    var tp = topic(HELP.id), pr = presenter(), c = HELP.chip >= 0 ? tp.chips[HELP.chip] : null, r = HELP.rung;
    var from = FROM[Math.max(0, HELP.chip) % FROM.length], kicker = "Here to help with: “" + HELP.q + "”";
    if (r === 0) return { v: "20s", badge: "⚡ 20 sec clip", title: c.title, lines: c.tip, kicker: kicker, sub: "Clip of " + pr.name + ", starting " + from + " in the full class" };
    if (r === 1 && c) return { v: "1m", badge: "💡 1 min example", title: "Worked example: " + lower(c.title), kicker: kicker, sub: "Clip of " + pr.name + ", from " + from + ", continued",
      lines: ["Here is the prompt before: “" + tp.base + "”", "Now I add one detail: “" + c.t + "”", "Look at the answer now: " + lower(c.good) + ".", c.tip[1]] };
    if (r === 1) return { v: "1m", badge: "▶ 1 min explainer", title: tp.ex.title, lines: tp.ex.lines, kicker: kicker, sub: pr.name + " explains the idea behind this exercise" };
    var all = tp.ex.lines.slice();
    okIdx(tp).forEach(function (i) { all = all.concat(tp.chips[i].tip); });
    return { v: "10m", badge: "🔍 10 min class", title: "Full class: " + tp.name, lines: all, kicker: kicker, sub: "The whole section of " + pr.name + "'s class, uncut" };
  }
  function clipScreen() {
    if (!HELP || !EX || !topic(HELP.id)) return go("/home");
    var backToEx = function () { var id = HELP.id; HELP = null; go("/try/" + id); };
    startPlayer(helpClip(), {
      back: backToEx,
      foot: function (ended) {
        if (!ended) return '<button class="btn ghost" id="bk">' + esc(t("backToExercise")) + "</button>";
        return '<button class="btn teal" id="bk">✓ ' + esc(t("gotIt")) + " · " + esc(t("backToExercise")) + "</button>" +
          (HELP.rung < 2 ? '<button class="btn ghost" id="more">' + esc(t("stillStuck")) + " → " + (HELP.rung === 0 ? "1 min worked example" : "10 min full class") + "</button>" : "");
      },
      bind: function () {
        $("bk").onclick = backToEx;
        if ($("more")) $("more").onclick = function () { HELP.rung++; S.clips++; save(); clipScreen(); };
      }
    });
  }

  /* ---------- lesson done ---------- */
  function done(id) {
    var tp = topic(id); if (!tp) return go("/home");
    var first = S.firstTry[id], rest = chosen().filter(function (x) { return S.done.indexOf(x.id) < 0; })[0];
    app.innerHTML = '<div class="screen"><div class="grow"></div><div class="confetti">🎉</div><div class="hand" style="text-align:center">' + esc(t("lessonDone")) + '</div>' +
      '<h2 style="align-self:center;text-align:center">' + esc(tp.name) + "</h2>" +
      '<div class="stat-row"><div class="stat"><b>+' + (60 + (first ? 20 : 0)) + '</b><span>XP' + (first ? " · first try" : "") + '</span></div><div class="stat"><b>🔥 ' + S.done.length + "</b><span>" + esc(t("streak")) + "</span></div></div>" +
      '<div class="banner good"><h3>What made the difference</h3><ul class="plain">' + okIdx(tp).map(function (i) { return "<li>" + esc(tp.chips[i].title) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="grow"></div>' + (rest ? '<button class="btn ghost" data-go="/learn/' + rest.id + '">Next: ' + esc(rest.name) + "</button>" : "") +
      '<button class="btn" data-go="/home">' + esc(t("seeWeek")) + "</button></div>";
    bind();
  }

  /* ---------- home / plan ---------- */
  function weekDays() {
    var tps = chosen(), days = tps.map(function (tp) { return { tp: tp, title: tp.ex.title, tag: tp.name }; });
    tps.forEach(function (tp) { days.push({ title: tp.next, tag: tp.name, locked: true }); });
    [["Fix a weak AI answer", "Core skill"], ["A real task from your own week", "Practice"], ["Share your best prompt with your cohort", "Cohort"]].forEach(function (g) { days.push({ title: g[0], tag: g[1], locked: true }); });
    return days.slice(0, 5);
  }
  function home() {
    var days = weekDays(), pr = presenter(), lv = levelObj();
    var nd = -1; days.forEach(function (d, i) { if (nd < 0 && d.tp && S.done.indexOf(d.tp.id) < 0) nd = i; });
    var h = '<div><div class="hand">' + esc(t("yourWeek")) + "</div><h2>" + esc(roleObj().name) + "</h2>" +
      '<p class="sub">' + esc(t(lv.key)) + " · " + LANGS[S.lang].name + " · " + S.mins + " " + esc(t("min")) + " / day · " + esc(pr.name) + "</p></div>";
    h += '<div class="stack">' + days.map(function (d, i) {
      var isDone = d.tp && S.done.indexOf(d.tp.id) >= 0;
      return '<button class="day ' + (i === nd ? "today" : "") + (d.locked ? " locked" : "") + '" data-day="' + i + '"><span class="dn">' + DAYS[i] + '</span><span class="grow"><span class="tag">' + esc(d.tag) + "</span><br><b>" + esc(d.title) + '</b><span class="sub" style="display:block;font-size:13px">' +
        (d.locked ? "Unlocks after the days before it" : label(lv.explainer) + " video + exercise") + '</span></span><span class="chk ' + (isDone ? "ok" : "") + '">' + (isDone ? "✓" : d.locked ? "🔒" : "") + "</span></button>";
    }).join("") + "</div>";
    h += '<p class="note">' + esc(dayMix()) + " In this prototype the video and the exercise are playable. The plan is assembled from pre-cut snippets of " + esc(pr.name) + "'s classes.</p>";
    shell(h, "home");
    app.querySelectorAll("[data-day]").forEach(function (b) {
      b.onclick = function () {
        var d = days[+b.getAttribute("data-day")];
        if (d.locked) return toast("This lesson unlocks after the days before it.");
        if (EX && EX.id !== d.tp.id) EX = null;
        go("/learn/" + d.tp.id);
      };
    });
  }

  /* ---------- progress ---------- */
  function progress() {
    var days = weekDays(), n = S.done.length;
    var h = '<div><div class="hand">' + esc(t("progress")) + "</div><h2>" + n + " / 5</h2></div>" +
      '<div class="week">' + DAYS.map(function (d, i) { var ok = days[i].tp && S.done.indexOf(days[i].tp.id) >= 0; return "<div>" + d + '<i class="' + (ok ? "ok" : "") + '">' + (ok ? "✓" : "") + "</i></div>"; }).join("") + "</div>" +
      '<div class="stat-row"><div class="stat"><b>🔥 ' + n + "</b><span>" + esc(t("streak")) + '</span></div><div class="stat"><b>' + S.xp + '</b><span>XP</span></div><div class="stat"><b>' + S.clips + "</b><span>help clips</span></div></div>";
    if (S.stuckLog.length) {
      h += '<h3>Where you got stuck</h3><div class="stack">' + S.stuckLog.slice(-4).map(function (s) {
        var tp = topic(s.topic);
        return '<div class="lb"><span>⚡</span><span class="grow"><b>' + esc(s.q) + '</b><br><small class="sub">' + esc(tp ? tp.name : "") + "</small></span></div>";
      }).join("") + '</div><p class="note">Next week\'s plan adds a short refresher on these, picked from the same classes.</p>';
    } else {
      h += '<p class="note">Tap “' + esc(t("stuck")) + '” inside any exercise. What you ask about shows up here, and next week\'s plan adapts to it.</p>';
    }
    h += '<button class="btn ghost" data-go="/home">' + esc(t("plan")) + "</button>";
    shell(h, "progress");
  }

  /* ---------- cohort ---------- */
  function cohort() {
    var c = COHORTS[S.role] || COHORTS.teacher;
    var rows = c.people.map(function (p) { return { n: p[0], xp: p[1] }; });
    rows.push({ n: t("you"), xp: S.xp, me: true });
    rows.sort(function (a, b) { return b.xp - a.xp; });
    var h = '<div><div class="hand">' + esc(t("cohort")) + "</div><h2>" + esc(c.name) + '</h2><p class="sub">' + esc(t("leaderboard")) + " · sample cohort</p></div>" +
      '<div class="stack">' + rows.map(function (r, k) {
        return '<div class="lb ' + (r.me ? "me" : "") + '"><span class="rk">' + (k + 1) + '</span><span class="av">' + esc(r.n.charAt(0)) + '</span><span class="grow"><b>' + esc(r.n) + "</b></span><b>" + r.xp + " XP</b></div>";
      }).join("") + '</div><p class="note">Cohorts form around a college, employer or association. Names above are made up for the demo.</p>';
    shell(h, "cohort");
  }

  $("restart").onclick = function () { S = JSON.parse(JSON.stringify(DEFAULT)); EX = null; HELP = null; P = null; save(); go("/welcome"); };
  route();
})();
