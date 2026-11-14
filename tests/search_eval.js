/* Runs the search test list (library/questions.json) against the published library with the same code the
   learner app uses.  node tests/search_eval.js [--write] [--quiet]   (--write stores the result in poc/data/metrics.json) */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const A = require(path.join(root, "poc/js/core.js"));
const lib = JSON.parse(fs.readFileSync(path.join(root, "poc/data/library.json"), "utf8"));
const Q = JSON.parse(fs.readFileSync(path.join(root, "library/questions.json"), "utf8")).questions;
const ix = A.buildIndex(lib), C = A.byId(lib.concepts);
let n = 0, top1 = 0, top3 = 0, none = 0, noneOk = 0; const misses = [];
for (const q of Q) {
  const r = A.search(ix, q.q, null), got = r.none ? null : r.groups[0].concept;
  if (q.concept === null) { none++; if (r.none) noneOk++; else misses.push(`  should say "no video": "${q.q}" -> ${got}`); continue; }
  n++;
  if (got === q.concept) top1++; else misses.push(`  "${q.q}" -> ${got || "no video"} (wanted ${q.concept})`);
  if (!r.none && r.groups.slice(0, 3).some(g => g.concept === q.concept)) top3++;
}
const res = { questions: n, top1, top3, top1_rate: +(top1 / n).toFixed(3), top3_rate: +(top3 / n).toFixed(3), unanswerable: none, unanswerable_caught: noneOk,
  list: "library/questions.json (starter list; replace with questions from real learners)" };
if (!process.argv.includes("--quiet")) {
  console.log(`search test: right idea first ${top1}/${n} (${Math.round(top1 / n * 100)}%), in first three ${top3}/${n} (${Math.round(top3 / n * 100)}%), "no video yet" caught ${noneOk}/${none}`);
  if (misses.length) console.log(misses.join("\n"));
}
if (process.argv.includes("--write")) {
  const p = path.join(root, "poc/data/metrics.json"), m = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
  m.search = res; fs.writeFileSync(p, JSON.stringify(m, null, 1));
}
module.exports = res;
