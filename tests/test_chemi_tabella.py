"""Chapters 26 and 27 (DEV-CHEMI-03): known-answer checks of the pure functions of sim-chemi-gruppi.js, sim-chemi-tabella.js and sim-chemi-esplora.js.
Node runs the functions (no DOM); the numbers quoted in the chapters are checked against masse.js and hand calculations."""
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAP = ROOT / "capitoli"
A = ROOT / "assets"


def table_values(page, table_id):
    """{data-f: value} of the rows of <table id=...> (decimal comma)."""
    t = (CAP / page).read_text(encoding="utf-8")
    body = re.search(rf'<table id="{table_id}">(.*?)</table>', t, re.S).group(1)
    return {m.group(1): float(m.group(2).replace(",", ".")) for m in re.finditer(r'<tr data-f="([^"]+)">.*?<td class="n">([\d,]+)</td>', body, re.S)}


NODE = r"""
const assert = require("node:assert/strict");
globalThis.CHEMI = require(process.env.ROOT + "/assets/chemi-common.js");
const { MASSE: M } = require(process.env.ROOT + "/assets/masse.js");
for (const f of ["sim-chemi-gruppi", "sim-chemi-tabella", "sim-chemi-esplora"]) require(process.env.ROOT + "/assets/" + f + ".js");
const F = CHEMI.fn, near = (a, b, t, m) => assert.ok(Math.abs(a - b) <= t, `${m || ""}: ${a} vs ${b}`);
const T = JSON.parse(process.env.TABLES), e = f => M.exact(f), H = e("H");

// ---- delta m of the chapter 26 tables, recomputed from masse.js (within 0.0001 u)
const calc = { "Na-H": e("Na") - H, "NH4-H": e("NH3"), "K-H": e("K") - H, "Cl+H": e("Cl") + H, "HCOO+H": e("CH2O2"), H2O: e("H2O"), NH3: e("NH3"), CO2: e("CO2"),
  "13C": 13.00335483507 - 12, "37Cl": 36.965902602 - 34.968852682, "81Br": 80.9162897 - 78.9183376 };
assert.equal(Object.keys(T).length, 11);
for (const k in T) near(T[k], calc[k], 1e-4, "table " + k);
// the rules of the figure use the same numbers
const R = Object.fromEntries(F.RULES.map(r => [r.k, r.dms]));
near(R.na[0], calc["Na-H"], 1e-4); near(R.nh4[0], calc["NH4-H"], 1e-4); near(R.k[0], calc["K-H"], 1e-4); near(R.h2o[0], calc.H2O, 1e-4);
near(R.c13[0], calc["13C"], 1e-4); near(R.cl[0], calc["37Cl"], 1e-4); near(R.cl[1], calc["81Br"], 1e-4);

// ---- the synthetic compounds: every m/z agrees with masse.js to 0.0001 u (proton = 1.00727646, Na+ = Na - electron)
const PR = 1.00727646, EL = M.ELECTRON;
const add = { "[M+H]+": m => m + PR, "13C": m => m + PR + calc["13C"], "37Cl": m => m + PR + calc["37Cl"], "[M+Na]+": m => m + e("Na") - EL, "[M+NH4]+": m => m + e("NH4") - EL, "[M+H-H2O]+": m => m + PR - calc.H2O, "[2M+H]+": m => 2 * m + PR };
for (const c of F.COMPOUNDS.slice(0, 3)) {
  const m = e(c[0].split(" ")[0]);
  for (const f of c[3]) near(f[1], add[f[0]](m), 1e-4, c[0] + " " + f[0]);
}

// ---- Pearson, by hand: x = 1,2,3 and y = 1,3,2 give r = 1/2
near(F.pearson([1, 2, 3], [1, 3, 2], 0, 2), 0.5, 1e-12); near(F.pearson([1, 2, 3, 4], [2, 4, 6, 8], 0, 3), 1, 1e-12); near(F.pearson([1, 2, 3, 4], [8, 6, 4, 2], 0, 3), -1, 1e-12);
// chapter text, equation 26.2: 15 C and 2 N give 16.8 %
near(15 * 1.07 + 2 * 0.37, 16.8, 0.05);

// ---- grouping: deterministic, three compounds found at the default settings, random links appear with the second compound
const rules = { c13: true, cl: true, na: true, nh4: true, k: false, h2o: true, dimer: true }, o = { drt: 0.06, rmin: 0.8, ppm: 5, rules };
assert.deepEqual(F.makeFeatures(7, true).map(f => f.eic[100]), F.makeFeatures(7, true).map(f => f.eic[100]), "same seed, same data");
assert.notDeepEqual(F.makeFeatures(7, true).map(f => f.eic[100]), F.makeFeatures(8, true).map(f => f.eic[100]), "other seed, other data");
let g = F.groupFeatures(F.makeFeatures(7, false), o);
assert.equal(g.truth, 3); assert.equal(g.wrong, 0); assert.ok(g.groups.length <= 5, "groups " + g.groups.length);
g = F.groupFeatures(F.makeFeatures(7, true), o); assert.equal(g.wrong, 0, "second compound is kept apart at r >= 0.8");
g = F.groupFeatures(F.makeFeatures(7, true), Object.assign({}, o, { rmin: 0.5 })); assert.ok(g.wrong >= 1, "casual link at r >= 0.5");
const fs0 = F.makeFeatures(7, false), lowest = fs0.find(f => f.base && Math.abs(f.rt - 6.2) < 0.01);
assert.equal(F.matchRule({ mz: 237.1022, h: 100 }, { mz: 259.0842, h: 20 }, { ppm: 5, rules }).rule, "na", "Na adduct");
assert.equal(F.matchRule({ mz: 237.1022, h: 100 }, { mz: 238.1056, h: 16.8 }, { ppm: 5, rules }).rule, "c13");
assert.equal(F.matchRule({ mz: 237.1022, h: 10 }, { mz: 238.1056, h: 100 }, { ppm: 5, rules }), null, "an isotope cannot be stronger than its monoisotopic peak");
assert.equal(F.matchRule({ mz: 237.1022, h: 100 }, { mz: 259.0842, h: 20 }, { ppm: 5, rules: Object.assign({}, rules, { na: false }) }), null, "rule off, no link");

// ---- LOWESS: a line is returned exactly; one wrong point is ignored with the robustness passes
const xs = Array.from({ length: 20 }, (_, i) => i), ys = xs.map(x => 3 + 2 * x), f1 = F.lowess(xs, ys, 0.5, 3);
xs.forEach(x => near(f1(x), 3 + 2 * x, 1e-8, "line"));
const bad = ys.slice(); bad[10] += 40;
assert.ok(Math.abs(F.lowess(xs, bad, 0.5, 0)(10) - 23) > 3, "without robustness the outlier pulls");
near(F.lowess(xs, bad, 0.5, 3)(10), 23, 1e-6, "robust");

// ---- DTW recursion on a 4x4 matrix worked by hand (equation 27.2) and on the 2x2 example of the questions
const c4 = [[1, 2, 2, 5], [3, 6, 5, 1], [4, 2, 4, 2], [1, 3, 3, 5]], d4 = F.dtw(c4);
assert.deepEqual(d4.D, [[1, 3, 5, 10], [4, 7, 8, 6], [8, 6, 10, 8], [9, 9, 9, 13]]);
assert.equal(d4.total, 13); assert.deepEqual(d4.path, [[0, 0], [0, 1], [0, 2], [1, 3], [2, 3], [3, 3]]);
assert.equal(F.dtw([[1, 2], [3, 1]]).total, 2);
assert.equal(F.dtw(c4, 0).total, 1 + 6 + 4 + 5, "band 0 forces the diagonal");

// ---- alignment: LOWESS removes most of the drift, the same seed gives the same model
const mo = { shape: "cur", anchors: 20, outliers: 0, method: "lowess", span: 0.5 };
const m1 = F.alignModel(7, mo), er = F.alignError(m1, F.alignRun(m1, mo), "cur");
assert.deepEqual(F.alignModel(7, mo).B, m1.B); assert.ok(er.after < er.before / 10, `${er.after} vs ${er.before}`);
const md = Object.assign({}, mo, { method: "dtw" }), er2 = F.alignError(m1, F.alignRun(m1, md), "cur"); assert.ok(er2.after < er2.before / 3);

// ---- peak density on a fixed three-sample example: samples 0-2 at ~100 s, samples 0-1 at ~400 s
const P = (s, mz, rt) => ({ s, mz, rt, h: 1000, cpd: 0 });
const pk = [P(0, 200.0001, 100), P(1, 200.0002, 102), P(2, 200.0000, 98), P(0, 200.0001, 400), P(1, 200.0002, 405)];
let pd = F.peakDensity(pk, { bw: 5, minFraction: 0.5, bin: 0.01, ns: 3 });
assert.equal(pd.features.length, 2); assert.deepEqual(pd.features.map(x => x.length).sort(), [2, 3]);
pd = F.peakDensity(pk, { bw: 5, minFraction: 0.9, bin: 0.01, ns: 3 }); assert.equal(pd.features.length, 1, "the group seen in 2 of 3 samples is dropped");
pd = F.peakDensity(pk, { bw: 150, minFraction: 0.5, bin: 0.01, ns: 3 }); assert.equal(pd.features.length, 1, "a wide kernel merges both groups");
// ---- filled cells are flagged, detected ones are not
const dat = F.makePeaks(7, { drift: 3 }), res = F.peakDensity(dat.peaks, { bw: 8, minFraction: 0.5, bin: 0.01 });
const tf = F.featureTable(res.features, dat.present, true), tn = F.featureTable(res.features, dat.present, false);
tf.forEach((r, i) => { assert.equal(r.cells.filter(x => !x.filled).length, r.n); assert.equal(r.cells.filter(x => x.filled).length, 6 - r.n); assert.ok(tn[i].cells.every(x => x.filled === false)); });
assert.ok(tf.some(r => r.n < 6), "some detections are missing"); assert.ok(tn.some(r => r.cells.some(x => x.v === null)));
assert.deepEqual(F.makePeaks(7, { drift: 3 }).peaks, dat.peaks); assert.notDeepEqual(F.makePeaks(8, { drift: 3 }).peaks, dat.peaks);

// ---- the explorer: five planted artefacts, three removed by the three filters, all five with the annotation filter
const st = F.study(3), ev = x => F.evalStudy(st, Object.assign({ fold: 5, minRep: 4, maxRsd: 30, norm: "none", annot: false }, x));
assert.equal(st.feats.length, 60); assert.deepEqual(st.feats.filter(f => f.art).map(f => f.art).sort(), ["contaminante", "deriva", "frammento", "isotopo", "rumore"]);
let out = ev({}).filter(r => r.f.art && !r.keep).map(r => r.f.art).sort(); assert.deepEqual(out, ["contaminante", "deriva", "isotopo", "rumore"].filter(a => out.includes(a)));
assert.ok(out.includes("contaminante") && out.includes("rumore") && out.includes("deriva"));
assert.equal(ev({ annot: true }).filter(r => r.f.art && !r.keep).length, 5);
assert.ok(ev({ fold: 1, minRep: 1, maxRsd: 1000 }).filter(r => r.keep).length >= 58, "filters off: almost everything stays");
assert.ok(ev({ fold: 20 }).filter(r => r.keep).length < ev({ fold: 1 }).filter(r => r.keep).length, "stricter blank filter, fewer features");
ev({}).filter(r => !r.keep).forEach(r => assert.ok(r.why.length > 0 && r.why.every(w => typeof w === "string")));
// PQN follows a dilution: doubling a sample doubles its factor
const f0 = F.normFactors(st, "pqn"), st2 = JSON.parse(JSON.stringify(st)); st2.feats.forEach(f => { f.samp[2] *= 2; });
near(F.normFactors(st2, "pqn")[2] / f0[2], 2, 0.1, "pqn factor"); near(F.normFactors(st2, "tot")[2] / F.normFactors(st, "tot")[2], 2, 0.2, "total factor");
assert.deepEqual(F.normFactors(st, "none"), Array(10).fill(1));
console.log("ok");
"""


def test_functions_in_node():
    node = shutil.which("node")
    assert node, "node is required"
    tables = {**table_values("26-gruppi.html", "tab-delta-m"), **table_values("26-gruppi.html", "tab-isotopi")}
    import os
    r = subprocess.run([node, "-e", NODE], capture_output=True, encoding="utf-8", env={**os.environ, "ROOT": str(ROOT), "TABLES": json.dumps(tables)})
    assert r.returncode == 0 and r.stdout.strip() == "ok", r.stdout + r.stderr


def test_figures_registered_and_numbered():
    reg = {f: re.findall(r'C\.register\("([^"]+)"', (A / f).read_text(encoding="utf-8")) for f in ("sim-chemi-gruppi.js", "sim-chemi-tabella.js", "sim-chemi-esplora.js")}
    assert reg == {"sim-chemi-gruppi.js": ["sim-chemi-gruppi"], "sim-chemi-tabella.js": ["sim-chemi-allinea", "sim-chemi-corrispondenza"], "sim-chemi-esplora.js": ["sim-chemi-tabella"]}
    t26, t27 = (CAP / "26-gruppi.html").read_text(encoding="utf-8"), (CAP / "27-tabella.html").read_text(encoding="utf-8")
    assert re.findall(r"Figura (26\.\d)", t26) == ["26.1"]
    assert re.findall(r"<h[34]>Figura (27\.\d) ", t27) == ["27.1", "27.2", "27.3"]
    assert 'id="sim-chemi-allinea" data-sim="../assets/sim-chemi-tabella.js"' in t27 and 'id="sim-chemi-tabella" data-sim="../assets/sim-chemi-esplora.js"' in t27


def test_each_chapter_cites_its_literature():
    t26, t27 = (CAP / "26-gruppi.html").read_text(encoding="utf-8"), (CAP / "27-tabella.html").read_text(encoding="utf-8")
    for key in ("Kuhl et al., 2012", "Broeckling et al., 2014"):
        assert key in t26, key
    for key in ("Sakoe e Chiba, 1978", "Cleveland, 1979", "Prince e Marcotte, 2006", "Smith et al., 2006", "Lange et al., 2008", "Pluskal et al., 2010", "Dieterle et al., 2006", "Dunn et al., 2011", "Broadhurst e colleghi (2018)"):
        assert key in t27, key
    assert len(re.findall(r'<li><span class="tag">articolo</span>', t26)) == 2 and len(re.findall(r'<li><span class="tag">articolo</span>', t27)) == 9
    for t in (t26, t27):
        assert not re.search(r"TODO|\?\?\?|da verificare|fotocatal|TiO", t)
