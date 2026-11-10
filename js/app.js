/* AI Launchpad: click-through prototype.
   Vanilla JS, no build step. Hash routes: #/welcome #/role #/lang #/minutes #/home
   #/watch/<day> #/check/<day> #/progress #/cohort
   State lives in localStorage (best effort). Content comes from data.js. */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var DEFAULT = { role: null, lang: "en", mins: 10, done: [], firstTry: {}, xp: 0, stuckLog: [], clips: 0 };
  var S = load();

  function load() {
    try { var raw = localStorage.getItem("launchpad-proto"); if (raw) return Object.assign({}, DEFAULT, JSON.parse(raw)); } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() { try { localStorage.setItem("launchpad-proto", JSON.stringify(S)); } catch (e) {} }

  function t(k) { return (I18N[S.lang] && I18N[S.lang][k]) || I18N.en[k] || k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function plan() { return PLANS[S.role] || PLANS.teacher; }
  function presenter() { return PRESENTERS[S.role] || PRESENTERS.teacher; }
  function mainVariant() { return S.mins <= 5 ? "5m" : S.mins <= 10 ? "10m" : "15m"; }
  function fmt(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2); }
  function label(v) { return v.replace("m", " min").replace("s", " sec"); }
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  /* ---------- router ---------- */
  function go(path) { if (location.hash === "#" + path) route(); else location.hash = path; }
  window.addEventListener("hashchange", route);

  function route() {
    stopTimer();
    var p = (location.hash || "#/welcome").slice(1).split("/").filter(Boolean);
    var name = p[0] || "welcome", arg = p[1];
    if (["home", "watch", "check", "progress", "cohort"].indexOf(name) >= 0 && !S.role) { return go("/welcome"); }
    var fn = { welcome: welcome, role: pickRole, lang: pickLang, minutes: pickMins, home: home, watch: watch, check: check, progress: progress, cohort: cohort }[name] || welcome;
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
      '</g></svg>';
  }
  function topbar() {
    var langs = Object.keys(LANGS), next = langs[(langs.indexOf(S.lang) + 1) % langs.length];
    return '<div class="top">' +
      '<span class="pill" title="streak">🔥 ' + S.done.length + '</span>' +
      '<span class="pill">⭐ ' + S.xp + '</span>' +
      '<span class="grow"></span>' +
      '<button class="pill" data-lang="' + next + '" aria-label="Change language">🌐 ' + LANGS[S.lang].native + '</button></div>';
  }
  function tabbar(active) {
    var items = [["home", "🗺️", t("plan")], ["progress", "📈", t("progress")], ["cohort", "👥", t("cohort")]];
    return '<nav class="tabs">' + items.map(function (i) {
      return '<button data-go="/' + i[0] + '" class="' + (active === i[0] ? "on" : "") + '"><span>' + i[1] + "</span>" + i[2] + "</button>";
    }).join("") + "</nav>";
  }
  function shell(inner, active) { app.innerHTML = topbar() + '<div class="screen">' + inner + "</div>" + tabbar(active); bind(); }
  function bind() {
    app.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-go")); }; });
    app.querySelectorAll("[data-lang]").forEach(function (b) { b.onclick = function () { S.lang = b.getAttribute("data-lang"); save(); route(); }; });
  }
  function progressDots(n) { var h = ""; for (var i = 0; i < 3; i++) h += '<i class="' + (i < n ? "on" : "") + '"></i>'; return '<div class="dots">' + h + "</div>"; }
  function toast(msg) {
    var el = document.createElement("div"); el.className = "toast"; el.textContent = msg; app.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }

  /* ---------- onboarding ---------- */
  function welcome() {
    app.innerHTML = '<div class="screen"><div class="hero">' +
      '<div class="logo">AI Launchpad</div><h1>' + esc(t("tagline")) + '</h1>' +
      '<div style="background:var(--mint);border:3px solid var(--ink);border-radius:24px;padding:14px 0 0;display:grid;place-items:end center;height:200px;overflow:hidden">' + person("#CFE8E4").replace("<svg", '<svg style="height:100%;filter:url(#wobble)"') + "</div>" +
      '<p class="sub">Real people explain it. Short videos, in your language, built around your work.</p>' +
      '<button class="btn" data-go="/role">' + esc(t("start")) + "</button></div></div>";
    bind();
  }
  function pickRole() {
    app.innerHTML = '<div class="screen">' + progressDots(1) +
      "<h2>" + esc(t("pickRole")) + '</h2><p class="sub">' + esc(t("pickRoleSub")) + "</p><div class=\"stack\">" +
      ROLES.map(function (r) {
        return '<button class="choice ' + (r.live ? (S.role === r.id ? "on" : "") : "off") + '" data-role="' + r.id + '"' + (r.live ? "" : " disabled") + ">" +
          '<span class="ic">' + r.icon + "</span>" + esc(r.name) + (r.live ? "" : "<small>" + esc(t("soon")) + "</small>") + "</button>";
      }).join("") + "</div></div>";
    app.querySelectorAll("[data-role]").forEach(function (b) { b.onclick = function () { S.role = b.getAttribute("data-role"); S.done = []; S.xp = 0; S.stuckLog = []; S.firstTry = {}; save(); go("/lang"); }; });
  }
  function pickLang() {
    app.innerHTML = '<div class="screen">' + progressDots(2) + "<h2>" + esc(t("pickLang")) + '</h2><p class="sub">' + esc(t("pickLangSub")) + '</p><div class="stack">' +
      Object.keys(LANGS).map(function (k) {
        return '<button class="choice ' + (S.lang === k ? "on" : "") + '" data-l="' + k + '"><span class="ic">🗣️</span><span>' + LANGS[k].native + '<span class="sm">' + LANGS[k].name + "</span></span></button>";
      }).join("") + "</div></div>";
    app.querySelectorAll("[data-l]").forEach(function (b) { b.onclick = function () { S.lang = b.getAttribute("data-l"); save(); go("/minutes"); }; });
  }
  function pickMins() {
    app.innerHTML = '<div class="screen">' + progressDots(3) + "<h2>" + esc(t("pickMins")) + '</h2><p class="sub">' + esc(t("pickMinsSub")) + '</p>' +
      '<div class="mins">' + [5, 10, 15].map(function (m) {
        return '<button class="choice ' + (S.mins === m ? "on" : "") + '" data-m="' + m + '"><b>' + m + "</b>" + esc(t("min")) + "</button>";
      }).join("") + '</div><div class="grow"></div><button class="btn" id="build">' + esc(t("build")) + "</button></div>";
    app.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { S.mins = +b.getAttribute("data-m"); save(); pickMins(); }; });
    document.getElementById("build").onclick = function () { save(); go("/home"); };
  }

  /* ---------- home / plan ---------- */
  function nextDay() { for (var i = 0; i < 5; i++) if (S.done.indexOf(i) < 0) return i; return -1; }
  function home() {
    var pl = plan(), nd = nextDay(), role = ROLES.filter(function (r) { return r.id === S.role; })[0];
    var html = '<div><div class="hand">' + esc(t("yourWeek")) + "</div><h2>" + esc(role.name) + "</h2>" +
      '<p class="sub">' + LANGS[S.lang].name + " · " + S.mins + " " + esc(t("min")) + " / day · " + esc(presenter().name) + "</p></div>";
    html += '<div class="stack">' + pl.map(function (d, i) {
      var done = S.done.indexOf(i) >= 0, today = i === nd;
      return '<button class="day ' + (today ? "today" : "") + '" data-day="' + i + '"><span class="dn">' + DAYS[i] + '</span><span class="grow"><span class="tag">' + esc(d.kind) + " · " + label(mainVariant()) + "</span><br><b>" + esc(d.title) + '</b><span class="sm sub" style="display:block;font-size:13px">' + esc(d.blurb) + '</span></span><span class="chk ' + (done ? "ok" : "") + '">' + (done ? "✓" : "") + "</span></button>";
    }).join("") + "</div>";
    html += '<p class="note">This plan was assembled from ' + (pl.length * 4) + " pre-cut snippets of " + esc(presenter().name) + "'s videos. In the real product the plan is built from the whole library.</p>";
    shell(html, "home");
    app.querySelectorAll("[data-day]").forEach(function (b) { b.onclick = function () { P = null; go("/watch/" + b.getAttribute("data-day")); }; });
  }

  /* ---------- player ---------- */
  var P = null, timer = null, reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function mainSnippet(i) {
    var d = plan()[i], v = mainVariant();
    return { kind: "main", day: i, v: v, title: d.title, lines: d.transcript, from: "00:00", dur: DURATIONS[v], t: 0 };
  }
  function helpSnippet(i, item, returnTo) {
    return { kind: "help", day: i, v: item.v, title: item.title, lines: item.lines, from: item.from, dur: DURATIONS[item.v], t: 0, returnTo: returnTo };
  }
  function synth(i, v) {
    var d = plan()[i];
    if (v === "20s") return { v: "20s", title: "The short version", from: "00:30", lines: [d.transcript[0], d.transcript[d.transcript.length - 1]] };
    if (v === "1m") return { v: "1m", title: "A worked example", from: "02:00", lines: d.transcript.slice(1, 4) };
    return { v: "10m", title: "The full walkthrough: " + d.title, from: "00:00", lines: d.transcript };
  }
  function pickVariant(i, v) {
    var s = plan()[i].stuck.filter(function (x) { return x.v === v; })[0];
    return s || synth(i, v);
  }

  function watch(arg) {
    var i = +arg;
    if (!P || P.day !== i) P = { cur: mainSnippet(i), saved: null, speed: 30, playing: true, day: i };
    renderPlayer();
    startTimer();
  }

  function renderPlayer() {
    var c = P.cur, pr = presenter(), i = P.day, d = plan()[i];
    var helping = c.kind === "help";
    app.innerHTML = '<div class="player">' +
      '<div class="top"><button class="pill" id="back">←</button><span class="grow"></span><span class="pill">🔥 ' + S.done.length + "</span></div>" +
      '<div class="stage" style="background:' + pr.tone + '">' + person(pr.tone) +
      '<span class="badge">' + (helping ? "⚡ " + label(c.v) + " clip" : "▶ " + label(c.v) + " lesson") + " · " + esc(LANGS[S.lang].name) + " voice</span>" +
      '<span class="ph">Placeholder footage</span>' +
      '<div class="caption" id="cap"></div></div>' +
      '<div class="bar" id="bar" role="slider" aria-label="Seek"><i id="fill"></i></div>' +
      '<div class="controls"><button class="round" id="pp" aria-label="Play or pause">❚❚</button><span id="time" class="sub" style="font-variant-numeric:tabular-nums"></span><span class="grow"></span>' +
      [1, 10, 30].map(function (s) { return '<button class="chip ' + (P.speed === s ? "on" : "") + '" data-sp="' + s + '">' + (s === 1 ? "1×" : s + "×") + "</button>"; }).join("") + "</div>" +
      '<div class="meta"><div class="hand" style="font-size:22px">' + (helping ? "Here to help with: " + esc(c.q || d.title) : esc(pr.name) + " · " + esc(pr.title)) + "</div>" +
      "<h3>" + esc(c.title) + "</h3>" +
      '<p class="sub" style="font-size:13px">' + (helping ? "Clip of " + esc(pr.name) + ", starting " + c.from + " in the longer video" : esc(d.kind) + " · " + DAYS[i]) + "</p></div>" +
      '<div class="foot" id="foot"></div></div>';
    document.getElementById("back").onclick = function () { stopTimer(); P = null; go("/home"); };
    document.getElementById("pp").onclick = function () { P.playing = !P.playing; tick(0); };
    app.querySelectorAll("[data-sp]").forEach(function (b) { b.onclick = function () { P.speed = +b.getAttribute("data-sp"); app.querySelectorAll("[data-sp]").forEach(function (x) { x.classList.toggle("on", x === b); }); }; });
    document.getElementById("bar").onclick = function (e) { var r = this.getBoundingClientRect(); P.cur.t = Math.min(P.cur.dur - 0.5, Math.max(0, (e.clientX - r.left) / r.width * P.cur.dur)); tick(0); };
    renderFoot();
    tick(0);
  }

  function renderFoot() {
    var foot = document.getElementById("foot"); if (!foot) return;
    var c = P.cur, ended = c.t >= c.dur;
    if (c.kind === "main") {
      foot.innerHTML = ended
        ? '<button class="btn" id="go-check">' + esc(t("quickCheck")) + " →</button>"
        : '<button class="btn stuck-btn" id="stuck">🙋 ' + esc(t("stuck")) + "</button>";
    } else {
      foot.innerHTML = ended
        ? '<button class="btn teal" id="gotit">✓ ' + esc(t("gotIt")) + " · " + esc(c.returnTo === "check" ? t("tryAgain") : t("backToLesson")) + '</button><button class="btn ghost" id="still">' + esc(t("stillStuck")) + "</button>"
        : '<button class="btn ghost" id="skip">' + esc(c.returnTo === "check" ? t("tryAgain") : t("backToLesson")) + "</button>";
    }
    var $ = function (id) { return document.getElementById(id); };
    if ($("stuck")) $("stuck").onclick = openStuck;
    if ($("go-check")) $("go-check").onclick = function () { go("/check/" + P.day); };
    if ($("gotit")) $("gotit").onclick = leaveHelp;
    if ($("skip")) $("skip").onclick = leaveHelp;
    if ($("still")) $("still").onclick = function () { openStuck(true); };
  }

  function leaveHelp() {
    var rt = P.cur.returnTo, day = P.day;
    if (rt === "check") { P.cur = P.saved; P.saved = null; stopTimer(); go("/check/" + day); return; }
    P.cur = P.saved; P.saved = null; P.playing = true; renderPlayer(); startTimer();
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(function () { if (P && P.playing) tick(0.1 * P.speed); }, 100);
  }
  function tick(dt) {
    if (!P) return;
    var c = P.cur, wasEnded = c.t >= c.dur;
    c.t = Math.min(c.dur, c.t + dt);
    var fill = document.getElementById("fill"); if (!fill) return;
    fill.style.width = (c.t / c.dur * 100) + "%";
    var li = Math.min(c.lines.length - 1, Math.floor(c.t / c.dur * c.lines.length));
    document.getElementById("cap").textContent = c.lines[li];
    document.getElementById("time").textContent = fmt(c.t) + " / " + fmt(c.dur);
    document.getElementById("pp").textContent = (P.playing && c.t < c.dur) ? "❚❚" : "▶";
    if (!wasEnded && c.t >= c.dur) { P.playing = false; renderFoot(); }
    if (wasEnded && c.t < c.dur) renderFoot();
  }

  /* ---------- I'm stuck: the just-in-time finder ---------- */
  function openStuck(escalate) {
    if (!P) return;
    P.playing = false; tick(0);
    var i = P.day, d = plan()[i], scrim = document.createElement("div");
    scrim.className = "scrim";
    var items = d.stuck;
    scrim.innerHTML = '<div class="sheet" role="dialog" aria-label="' + esc(t("stuck")) + '"><div class="grab"></div>' +
      "<h3>" + esc(t("howCanWeHelp")) + "</h3>" +
      '<div class="quick"><button data-q="20s">⚡ ' + esc(t("shorter")) + '<br><small>20 sec</small></button><button data-q="1m">💡 ' + esc(t("example")) + '<br><small>1 min</small></button><button data-q="10m">🔍 ' + esc(t("deeper")) + '<br><small>10 min</small></button></div>' +
      '<div class="stack" id="qs">' + items.map(function (it, k) { return '<button class="qbtn" data-i="' + k + '">“' + esc(it.q) + "”</button>"; }).join("") + "</div>" +
      '<p class="sub" style="font-size:13px">' + esc(t("askOwn")) + '</p>' +
      '<form class="search" id="sf"><input id="sq" placeholder="…" autocomplete="off"><button type="submit">' + esc(t("find")) + '</button></form>' +
      '<div class="stack" id="res"></div>' +
      '<button class="btn ghost" id="close">✕</button></div>';
    app.appendChild(scrim);
    var $ = function (s) { return scrim.querySelector(s); };
    function close() { scrim.remove(); if (P && P.cur.t < P.cur.dur) { P.playing = true; tick(0); } }
    $("#close").onclick = close;
    scrim.onclick = function (e) { if (e.target === scrim) close(); };
    function choose(item, q) {
      scrim.remove();
      S.stuckLog.push({ day: i, q: q || item.title }); S.clips++; S.xp += 5; save();
      P.saved = P.cur;
      var snip = helpSnippet(i, item, "lesson"); snip.q = q || item.title;
      P.cur = snip; P.playing = true; renderPlayer(); startTimer();
    }
    scrim.querySelectorAll("[data-q]").forEach(function (b) { b.onclick = function () { var v = b.getAttribute("data-q"); choose(pickVariant(i, v), t(v === "20s" ? "shorter" : v === "1m" ? "example" : "deeper")); }; });
    scrim.querySelectorAll("[data-i]").forEach(function (b) { b.onclick = function () { var it = items[+b.getAttribute("data-i")]; choose(it, it.q); }; });
    function showResults(q) {
      var words = q.toLowerCase().split(/\W+/).filter(function (w) { return w.length > 2; });
      var scored = items.map(function (it) {
        var hay = (it.q + " " + it.title + " " + it.lines.join(" ")).toLowerCase();
        return { it: it, s: words.reduce(function (a, w) { return a + (hay.indexOf(w) >= 0 ? 1 : 0); }, 0) };
      }).sort(function (a, b) { return b.s - a.s; });
      var top = scored.slice(0, 3).map(function (x) { return x.it; });
      // always offer a longer option last
      if (!top.some(function (x) { return x.v === "10m"; })) top.push(synth(i, "10m"));
      $("#res").innerHTML = '<div class="hand" style="font-size:22px">Best match first</div>' + top.map(function (it, k) {
        return '<button class="hit ' + (k === 0 && scored[0].s > 0 ? "best" : "") + '" data-r="' + k + '"><span class="len">' + label(it.v) + '</span><span><b>' + esc(it.title) + "</b><small>" + esc(presenter().name) + " · from " + it.from + " of the full video</small></span></button>";
      }).join("");
      $("#res").querySelectorAll("[data-r]").forEach(function (b) { b.onclick = function () { choose(top[+b.getAttribute("data-r")], q); }; });
      $("#res").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    }
    $("#sf").onsubmit = function (e) { e.preventDefault(); var q = $("#sq").value.trim(); if (q) showResults(q); };
    if (escalate === true) { showResults("deeper full walkthrough"); }
  }

  /* ---------- quick check ---------- */
  function check(arg) {
    var i = +arg, d = plan()[i], ck = d.check;
    var tried = (check._tried && check._tried[i]) || [];
    check._tried = check._tried || {}; check._tried[i] = tried;
    app.innerHTML = '<div class="screen">' +
      '<div class="row"><button class="pill" id="b">←</button><span class="grow"></span></div>' +
      '<div class="hand">' + esc(t("quickCheck")) + "</div><h2>" + esc(ck.q) + '</h2><div class="stack" id="opts">' +
      ck.options.map(function (o, k) { return '<button class="opt" data-o="' + k + '">' + esc(o) + "</button>"; }).join("") +
      '</div><div id="fb"></div></div>';
    document.getElementById("b").onclick = function () { go("/watch/" + i); };
    app.querySelectorAll("[data-o]").forEach(function (b) {
      b.onclick = function () {
        var k = +b.getAttribute("data-o"), fb = document.getElementById("fb");
        if (k === ck.correct) {
          b.classList.add("good");
          var first = tried.length === 0;
          if (S.done.indexOf(i) < 0) { S.done.push(i); S.xp += 60 + (first ? 20 : 0); S.firstTry[i] = first; save(); }
          app.querySelectorAll("[data-o]").forEach(function (x) { x.disabled = true; });
          fb.innerHTML = '<div class="banner good"><div class="confetti">🎉</div><h3>' + esc(t("lessonDone")) + "</h3><p>+" + (60 + (first ? 20 : 0)) + " XP · 🔥 " + S.done.length + " " + esc(t("streak")) + '</p></div><button class="btn" id="c">' + esc(t("continue")) + "</button>";
          document.getElementById("c").onclick = function () { P = null; go(S.done.length >= 5 ? "/progress" : "/home"); };
        } else {
          b.classList.add("bad"); b.disabled = true; tried.push(k);
          fb.innerHTML = '<div class="banner bad"><h3>Not quite.</h3><p>Here is a ' + label(ck.help.v) + " clip that covers exactly this.</p></div>" +
            '<button class="btn" id="w">⚡ ' + esc(ck.help.title) + " · " + label(ck.help.v) + "</button>";
          document.getElementById("w").onclick = function () {
            S.stuckLog.push({ day: i, q: ck.help.title }); S.clips++; S.xp += 5; save();
            P = { day: i, speed: 30, playing: true, saved: mainSnippet(i), cur: helpSnippet(i, ck.help, "check") };
            P.saved.t = P.saved.dur; P.cur.q = ck.q;
            go("/watch/" + i);
          };
        }
      };
    });
  }

  /* ---------- progress ---------- */
  function progress() {
    var html = "<div><div class=\"hand\">" + esc(t("progress")) + "</div><h2>" + S.done.length + " / 5</h2></div>" +
      '<div class="week">' + DAYS.map(function (d, i) { return "<div>" + d + '<i class="' + (S.done.indexOf(i) >= 0 ? "ok" : "") + '">' + (S.done.indexOf(i) >= 0 ? "✓" : "") + "</i></div>"; }).join("") + "</div>" +
      '<div class="stat-row"><div class="stat"><b>🔥 ' + S.done.length + "</b><span>" + esc(t("streak")) + '</span></div><div class="stat"><b>' + S.xp + "</b><span>XP</span></div><div class=\"stat\"><b>" + S.clips + "</b><span>help clips</span></div></div>";
    if (S.stuckLog.length) {
      html += "<h3>Where you got stuck</h3><div class=\"stack\">" + S.stuckLog.slice(-4).map(function (s) {
        return '<div class="lb"><span>⚡</span><span class="grow"><b>' + esc(s.q) + '</b><br><small class="sub">' + DAYS[s.day] + " · " + esc(plan()[s.day].title) + "</small></span></div>";
      }).join("") + "</div>" +
      '<p class="note">Next week\'s plan adds a short refresher on these topics, picked from the same videos.</p>';
    } else {
      html += '<p class="note">Tap “I’m stuck” inside any lesson. The topics you ask about come back here, and next week’s plan adapts to them.</p>';
    }
    html += '<button class="btn ghost" data-go="/home">' + esc(t("plan")) + "</button>";
    shell(html, "progress");
  }

  /* ---------- cohort ---------- */
  function cohort() {
    var c = COHORTS[S.role] || COHORTS.teacher;
    var rows = c.people.map(function (p) { return { n: p[0], xp: p[1] }; });
    rows.push({ n: t("you"), xp: S.xp, me: true });
    rows.sort(function (a, b) { return b.xp - a.xp; });
    var html = '<div><div class="hand">' + esc(t("cohort")) + "</div><h2>" + esc(c.name) + '</h2><p class="sub">' + esc(t("leaderboard")) + " · sample cohort</p></div>" +
      '<div class="stack">' + rows.map(function (r, k) {
        return '<div class="lb ' + (r.me ? "me" : "") + '"><span class="rk">' + (k + 1) + '</span><span class="av">' + esc(r.n.charAt(0)) + '</span><span class="grow"><b>' + esc(r.n) + "</b></span><b>" + r.xp + " XP</b></div>";
      }).join("") + "</div>" +
      '<p class="note">Cohorts form around a college, employer or association. Names above are made up for the demo.</p>';
    shell(html, "cohort");
  }

  document.getElementById("restart").onclick = function () { S = JSON.parse(JSON.stringify(DEFAULT)); check._tried = {}; P = null; save(); go("/welcome"); };
  route();
})();
