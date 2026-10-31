"""Chapters 30 and 31 (part VII): pure functions of the figures, run in node without a DOM.
Worked numbers are the ones quoted in the chapter text; the level truth table follows Schymanski 2014 and MSI 2007 as written in chapter 31."""
import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
CAP = ROOT / "capitoli"

PRELUDE = """
const vm = require("vm"), fs = require("fs");
const R = %r;
vm.runInThisContext(fs.readFileSync(R + "/assets/masse.js", "utf8") + ";globalThis.MASSE = MASSE;");
require(R + "/assets/chemi-common.js");
require(R + "/assets/sim-chemi-candidati.js");
require(R + "/assets/sim-chemi-confidenza.js");
const F = CHEMI.fn;
const out = {};
""" % str(ROOT)


def node(body, tmp_path):
    exe = shutil.which("node")
    assert exe, "node is required"
    f = tmp_path / "t.js"
    f.write_text(PRELUDE + body + "\nconsole.log(JSON.stringify(out));\n", encoding="utf-8")
    r = subprocess.run([exe, str(f)], capture_output=True, encoding="utf-8", timeout=120)
    assert r.returncode == 0, r.stdout + r.stderr
    return json.loads(r.stdout.strip().splitlines()[-1])


def test_formula_enumeration_finds_the_true_formula_with_bounded_work(tmp_path):
    o = node("""
out.rows = [];
const ALL = {P: 1, S: 1, Cl: 1, Br: 1, F: 1};
for (const [n, P] of Object.entries(F.FORMULA_PRESETS)) {
  const truth = F.fstr(MASSE.parse(P.formula));
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const m = F.measuredMz(P.formula, P.ion, seed);
    const r = F.enumFormulas(m.mz, P.ion, 5, ALL);
    out.rows.push([n, seed, Math.abs(m.err) <= 3.5, r.some(x => F.fstr(x.f) === truth), r.iterations, r.truncated, r.every(x => Math.abs(x.ppm) <= 5)]);
  }
  const ideal = F.enumFormulas(F.ionMass(P.formula, P.ion), P.ion, 0.5, ALL);
  out.rows.push([n, 0, true, ideal.some(x => F.fstr(x.f) === truth), ideal.iterations, ideal.truncated, true]);
}
""", tmp_path)
    assert len(o["rows"]) == 6 * 9
    for name, seed, small, found, iters, cut, inwin in o["rows"]:
        assert small and found, (name, seed)
        assert not cut and iters < 600000, (name, seed, iters)
        assert inwin, (name, seed)


def test_enumeration_respects_element_set_and_ion_type(tmp_path):
    o = node("""
const m = F.ionMass("C8H14ClN5", "[M+H]+");
const noCl = F.enumFormulas(m, "[M+H]+", 5, {}), withCl = F.enumFormulas(m, "[M+H]+", 5, {Cl: 1});
out.noCl = noCl.some(x => x.f.Cl > 0); out.hasTruthWithCl = withCl.some(x => F.fstr(x.f) === "C8H14ClN5");
const wrong = F.enumFormulas(m, "[M+Na]+", 5, {Cl: 1, S: 1});
out.wrongIon = wrong.some(x => F.fstr(x.f) === "C8H14ClN5");
out.rdb = [F.rdb({C: 8, H: 14, Cl: 1, N: 5}), F.rdb({C: 6, H: 6})];
""", tmp_path)
    assert o["noCl"] is False and o["hasTruthWithCl"] is True and o["wrongIon"] is False
    assert o["rdb"] == [4, 4]


def test_isotope_score(tmp_path):
    o = node("""
const t = MASSE.pattern("C8H14ClN5", 4);
out.t = t; out.self = F.isoScore(t, t);
out.good = F.isoScore([100, 10, 30, 3], t); out.noM2 = F.isoScore([100, t[1], 0, 0], t);
out.selfAll = Object.values(F.FORMULA_PRESETS).map(P => { const p = MASSE.pattern(P.formula, 4); return F.isoScore(p, p); });
const mp = (q) => F.measuredPattern("C8H14ClN5", q, 7);
out.q = ["good", "sat", "m2"].map(q => F.isoScore(mp(q), t));
""", tmp_path)
    assert o["self"] == 1 and all(v == 1 for v in o["selfAll"])
    assert [round(x, 2) for x in o["t"]] == [100, 10.64, 32.51, 3.42]          # numbers quoted in the chapter
    assert round(o["good"], 3) == 0.923 and round(o["noM2"], 2) == 0.23
    good, sat, m2 = o["q"]
    assert good > 0.9 > sat and m2 < 0.5


def test_funnel_narrows_and_is_deterministic(tmp_path):
    o = node("""
const P = F.FORMULA_PRESETS.atrazina, m = F.measuredMz(P.formula, P.ion, 7), meas = F.measuredPattern(P.formula, "good", 7);
const run = () => F.funnel({ mz: m.mz, ion: P.ion, tol: 5, use: {S: 1, Cl: 1}, rules: {rdb: true, hc: true, iso: true}, meas, minIso: 0.9 });
const a = run(), b = run();
out.same = JSON.stringify(a.list) === JSON.stringify(b.list) && JSON.stringify(a.counts) === JSON.stringify(b.counts);
out.counts = a.counts; out.top = a.list.map(x => x.name);
const off = F.funnel({ mz: m.mz, ion: P.ion, tol: 5, use: {S: 1, Cl: 1}, rules: {}, meas, minIso: 0.9 });
out.off = off.counts;
const sat = F.funnel({ mz: m.mz, ion: P.ion, tol: 5, use: {S: 1, Cl: 1}, rules: {rdb: true, hc: true, iso: true}, meas: F.measuredPattern(P.formula, "sat", 7), minIso: 0.9 });
out.sat = sat.counts;
out.seeds = [1, 2, 3].map(s => F.measuredMz(P.formula, P.ion, s).mz);
out.again = [1, 2, 3].map(s => F.measuredMz(P.formula, P.ion, s).mz);
""", tmp_path)
    assert o["same"] and o["top"][0] == "C8H14ClN5"
    c = o["counts"]
    assert c[0] >= c[1] >= c[2] >= c[3] >= 1
    assert o["off"][0] == o["off"][1] == o["off"][2] == o["off"][3]            # switched-off rules let everything through
    assert o["sat"][3] == 0                                                    # a saturated pattern loses even the true formula
    assert o["seeds"] == o["again"] and len(set(o["seeds"])) == 3


def test_isomers_tie_and_numbers_match_the_text(tmp_path):
    o = node("""
const pk = F.peaks(3), pk2 = F.peaks(3), pk4 = F.peaks(4);
out.same = JSON.stringify(pk) === JSON.stringify(pk2); out.diff = JSON.stringify(pk) !== JSON.stringify(pk4);
out.w = [0, 1, 2].map(w => F.ISOMERS.map(c => F.explained(pk, c, 10, w).frac));
out.tight = F.ISOMERS.map(c => F.explained(pk, c, 0.01, 1).frac);
out.mz = F.ionMass("C8H8O2", "[M+H]+");
""", tmp_path)
    assert o["same"] and o["diff"]
    a, b, c = o["w"][1]
    assert abs(b - c) < 1e-12 and round(b, 2) == 0.90 and round(a, 2) == 0.13        # B and C tie at 90 %, A explains 13 %
    assert round(o["mz"], 4) == 137.0597
    assert max(o["tight"]) < 0.2 and o["w"][0][0] < o["w"][0][1]                      # an extremely tight window explains almost nothing


LEVELS = [
    # mass, formula, ms2, lib, score, peaks, diag, std  ->  Schymanski, MSI
    (0, 0, 0, 0, 0.9, 6, 0, 0, None, None),
    (1, 0, 0, 0, 0.9, 6, 0, 0, "5", "4"),
    (1, 1, 0, 0, 0.9, 6, 0, 0, "4", "4"),
    (1, 1, 1, 0, 0.9, 6, 0, 0, "3", "2-3"),
    (1, 1, 0, 0, 0.9, 6, 1, 0, "3", "2-3"),
    (1, 1, 1, 1, 0.95, 6, 0, 0, "2a", "2"),
    (1, 1, 1, 1, 0.50, 6, 0, 0, "3", "2-3"),              # score below the threshold: no library match
    (1, 1, 1, 1, 0.95, 2, 0, 0, "3", "2-3"),              # too few matched peaks
    (1, 1, 1, 0, 0.9, 6, 1, 0, "2b", "2"),
    (1, 1, 1, 1, 0.99, 10, 1, 0, "2a", "2"),              # library beats diagnostic evidence; still not level 1
    (1, 1, 1, 1, 0.80, 6, 1, 1, "1", "1"),
    (1, 0, 1, 0, 0.0, 0, 0, 1, "1", "1"),                 # the standard alone confirms (MS, MS2, RT all coincide)
    (1, 1, 0, 0, 0.9, 6, 0, 1, "4", "4"),                 # a standard without an MS2 cannot confirm
    (0, 1, 1, 1, 0.99, 10, 1, 1, None, None),             # nothing without the exact mass
]


def test_level_truth_table(tmp_path):
    cases = [dict(zip(["mass", "formula", "ms2", "lib", "score", "peaks", "diag", "std"], map(float, r[:8]))) for r in LEVELS]
    o = node("const cs = %s; out.r = cs.map(c => { const r = F.livello(c); return [r.level, r.msi, r.missing.length > 0]; });" % json.dumps(cases), tmp_path)
    for row, got in zip(LEVELS, o["r"]):
        assert got[:2] == [row[8], row[9]], (row, got)
        assert got[2]


def test_score_alone_never_gives_level_1(tmp_path):
    o = node("""
let bad = [], n = 0;
for (let m = 0; m < 2; m++) for (let f = 0; f < 2; f++) for (let s2 = 0; s2 < 2; s2++) for (let l = 0; l < 2; l++) for (let d = 0; d < 2; d++)
  for (let sc = 0; sc <= 1.0001; sc += 0.05) for (let p = 0; p <= 10; p++) {
    const r = F.livello({ mass: m, formula: f, ms2: s2, lib: l, score: sc, peaks: p, diag: d, std: 0 }); n++;
    if (r.level === "1") bad.push([m, f, s2, l, d, sc, p]);
  }
out.bad = bad; out.n = n;
// raising the score with everything else fixed never beats 2a without a standard
const order = ["5", "4", "3", "2b", "2a", "1"];
let top = null;
for (let sc = 0; sc <= 1.0001; sc += 0.01) { const r = F.livello({ mass: 1, formula: 1, ms2: 1, lib: 1, score: sc, peaks: 8, diag: 1, std: 0 }); if (!top || order.indexOf(r.level) > order.indexOf(top)) top = r.level; }
out.top = top;
""", tmp_path)
    assert o["n"] > 1000 and o["bad"] == []
    assert o["top"] == "2a"


def test_chapter_30_quotes_the_worked_numbers():
    t = (CAP / "30-candidati.html").read_text(encoding="utf-8")
    for s in ("0,923", "215,0938", "100 : 10,64 : 32,51 : 3,42", "3,57", "46,57"):
        assert s in t, s
    assert "masse.js" in t and "data-sim=\"../assets/sim-chemi-candidati.js\"" in t
    assert "Figura 30.1" in t and "Figura 30.2" in t


def test_chapter_31_level_names_match_the_figure():
    t = re.sub(r"<[^>]+>", "", (CAP / "31-confidenza.html").read_text(encoding="utf-8"))
    js = (ROOT / "assets" / "sim-chemi-confidenza.js").read_text(encoding="utf-8")
    names = [n for n in re.findall(r'^\s+"(?:1|2a|2b|3|4|5|2)": "([^"]+)",?$', js, re.M) if n.endswith(")")]
    assert len(names) == 10
    for n in names:
        assert n in t, n
