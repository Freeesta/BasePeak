"""Chapters 24-25 (part VII): the pure functions of assets/sim-chemi-tracce.js and assets/sim-chemi-picchi.js, run with node (no DOM).
Known answers are the numbers quoted in the chapters. node must exist: a missing node is a failure, not a skip."""
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PRELUDE = """
const C = require(process.env.ROOT + "/assets/chemi-common.js");
require(process.env.ROOT + "/assets/sim-chemi-tracce.js");
require(process.env.ROOT + "/assets/sim-chemi-picchi.js");
const F = C.fn, out = {};
"""


def run(body):
    node = shutil.which("node")
    assert node, "node is required"
    r = subprocess.run([node, "-e", PRELUDE + body + "\nconsole.log(JSON.stringify(out));"], capture_output=True, encoding="utf-8",
                       env={"ROOT": str(ROOT), "PATH": "/usr/bin:/usr/local/bin"})
    assert r.returncode == 0, r.stdout + r.stderr
    return json.loads(r.stdout.strip().splitlines()[-1])


def close(a, b, tol=1e-9):
    assert abs(a - b) <= tol, (a, b)


# ---------------------------------------------------------------- chapter 24

def test_xic_window_arithmetic():
    o = run("""
      out.hw = F.halfWidth(300.1234, 5);
      out.hw25 = F.halfWidth(500, 25);
      out.R = F.minR(300.1234, 300.1234 * (1 + 12e-6));
      out.apart = [F.apart(300, 300.002, 5), F.apart(300, 300.0012, 5)];
      const scans = [{ mz: [300.0000, 300.0010, 300.0100], i: [10, 20, 40] }, { mz: [299.9990, 300.0020], i: [5, 7] }];
      out.sum = F.xic(scans, 300, 5, "sum"); out.max = F.xic(scans, 300, 5, "max"); out.wide = F.xic(scans, 300, 40, "sum");
    """)
    close(o["hw"], 300.1234 * 5e-6)
    close(o["hw25"], 0.0125)
    assert round(o["R"]) == 83334                       # quoted in chapter 24: R >= about 83 000 for 12 ppm at m/z 300
    assert o["apart"] == [True, False]
    assert o["sum"] == [30, 5] and o["max"] == [20, 5], (o["sum"], o["max"])   # window +-1.5 mDa: 300.0010 in, 300.0020 out, 299.9990 in
    assert o["wide"] == [70, 12]                         # +-12 mDa takes everything


def test_roi_builder_on_a_six_scan_example():
    o = run("""
      const sc = [[[100.0000, 500], [200.0000, 50]], [[100.0005, 600], [200.0010, 60]], [[100.0004, 700]],
                  [[100.0003, 400], [200.0002, 70]], [[100.0002, 300], [150.0000, 900]], [[100.0001, 100]]];
      const o1 = { ppm: 10, gap: 1, minScans: 3, k: 2, imin: 100 };
      const sum = rs => rs.map(r => ({ n: r.pts.length, first: r.pts[0].s, mean: r.mean, v: F.roiVerdict(r, o1) }));
      out.a = sum(F.roiBuild(sc, o1));
      out.b = F.roiBuild(sc, Object.assign({}, o1, { gap: 0 })).map(r => [r.pts.length, r.pts[0].s]);
      out.c = F.roiBuild(sc, Object.assign({}, o1, { ppm: 1 })).map(r => r.pts.length);
      out.step = F.roiRun(sc, o1, 2).rois.map(r => r.pts.length);
    """)
    a = o["a"]
    assert [r["n"] for r in a] == [6, 3, 1]
    assert [r["first"] for r in a] == [0, 0, 4]
    assert [r["v"]["keep"] for r in a] == [True, False, False]
    # weighted mean of the first ROI: 100 + (0*500 + 5*600 + 4*700 + 3*400 + 2*300 + 1*100) * 1e-4 / 2600
    close(a[0]["mean"], 100 + 7700e-4 / 2600, 1e-9)
    assert a[0]["v"]["why"] == "6 scansioni, 6 con I ≥ 100"
    assert a[1]["v"]["why"] == "0 scansioni con I ≥ 100, ne servono 2"
    assert a[2]["v"]["why"] == "1 scansione < 3"
    assert o["b"] == [[6, 0], [2, 0], [1, 3], [1, 4]], o["b"]       # gap 0 breaks the 200 trace in two and 150 starts later
    assert max(o["c"]) <= 3 and len(o["c"]) >= 7, o["c"]              # 1 ppm is below the scatter: the 100 trace falls apart in many short ROIs
    assert o["step"] == [2, 2]                                        # after two scans: two open ROIs of two points


def test_fixed_bins():
    o = run("""
      const sc = [{ mz: [300.04, 300.06, 300.16], i: [10, 30, 5] }, { mz: [300.05], i: [20] }];
      const b = F.binXic(sc, 0.1);
      out.keys = Object.keys(b).length; out.bin = b[F.binOf(300.05, 0.1)]; out.of = [F.binOf(300.04, 0.1), F.binOf(300.16, 0.1)];
    """)
    assert o["keys"] == 2 and o["bin"] == [30, 20] and o["of"][1] - o["of"][0] == 1


def test_synthetic_data_are_deterministic():
    o = run("""
      const p = { seed: 7, sd: 2, idep: 0, isoPpm: 12, isoRel: 40, R: 120000 };
      out.same = JSON.stringify(F.xicScans(p)) === JSON.stringify(F.xicScans(p));
      out.other = JSON.stringify(F.xicScans(p)) === JSON.stringify(F.xicScans(Object.assign({}, p, { seed: 8 })));
      out.roi = JSON.stringify(F.roiScans(11)) === JSON.stringify(F.roiScans(11));
      out.pic = JSON.stringify(F.picchiData({ seed: 5, rs: 1, noise: 20 })) === JSON.stringify(F.picchiData({ seed: 5, rs: 1, noise: 20 }));
      out.q = JSON.stringify(F.qualData({ tau: 2, dt: 0.25, noise: 10, slope: 1, seed: 3 }).y) === JSON.stringify(F.qualData({ tau: 2, dt: 0.25, noise: 10, slope: 1, seed: 3 }).y);
    """)
    assert o == {"same": True, "other": False, "roi": True, "pic": True, "q": True}


def test_xic_window_too_narrow_or_too_wide():
    o = run("""
      const d = F.xicScans({ seed: 7, sd: 2, idep: 0, isoPpm: 12, isoRel: 40, R: 120000 });
      out.n = F.xicAreas(d, 0.5); out.ok = F.xicAreas(d, 6); out.w = F.xicAreas(d, 30);
      const u = F.xicScans({ seed: 7, sd: 2, idep: 0, isoPpm: 12, isoRel: 40, R: 20000 });
      out.merged = u.scans.some(s => s.c.some(c => c.tag === "m")); out.res = d.scans.some(s => s.c.some(c => c.tag === "m"));
    """)
    assert o["n"]["rec"] < 0.35                                  # a window narrower than the scatter (SD 2 ppm) loses most of the signal
    assert o["ok"]["rec"] > 0.9 and o["ok"]["iso"] < 0.01       # +-6 ppm: whole target, no isobar (12 ppm away)
    assert o["w"]["rec"] > 0.99 and o["w"]["iso"] > 0.3         # +-30 ppm: the isobar comes in
    assert o["merged"] is True and o["res"] is False           # R = 20 000 cannot resolve 3.6 mDa at m/z 300; R = 120 000 can


# ---------------------------------------------------------------- chapter 25

def test_savitzky_golay_coefficients():
    o = run("""
      out.c5 = F.sgCoef(5, 2).map(v => v * 35); out.c7 = F.sgCoef(7, 2).map(v => v * 21);
      out.sum = F.sgCoef(9, 3).reduce((a, b) => a + b);
      out.ex = F.sg([10, 14, 13, 15, 11, 12, 9], 5, 2)[2]; out.ma = F.movavg([10, 14, 13, 15, 11], 5)[2];
      out.line = F.sg([1, 2, 3, 4, 5, 6, 7, 8, 9], 5, 2);
    """)
    for got, want in zip(o["c5"], [-3, 12, 17, 12, -3]):
        close(got, want, 1e-9)
    for got, want in zip(o["c7"], [-2, 3, 6, 7, 6, 3, -2]):
        close(got, want, 1e-9)
    close(o["sum"], 1, 1e-9)
    close(o["ex"], (-3 * 10 + 12 * 14 + 17 * 13 + 12 * 15 - 3 * 11) / 35, 1e-9)    # 506/35 = 14.457, quoted in chapter 25
    close(o["ma"], 12.6)
    for a, b in zip(o["line"][2:-2], [3, 4, 5, 6, 7]):
        close(a, b, 1e-9)                                                          # a polynomial of order 2 passes unchanged


def test_gaussian_numbers_quoted_in_the_text():
    o = run("""
      const d = F.qualData({ tau: 0, dt: 0.05, noise: 0, slope: 0, seed: 3 }), m = F.qualMetrics(d);
      out.area = d.area; out.fwhm = m.fwhm; out.as = m.as; out.tf = m.tf; out.r2 = m.r2;
      const e = F.qualData({ tau: 4, dt: 0.05, noise: 0, slope: 0, seed: 3 }), n = F.qualMetrics(e);
      out.as4 = n.as; out.tf4 = n.tf; out.r24 = n.r2;
    """)
    close(o["area"], 1000 * 1.5 * (2 * 3.141592653589793) ** 0.5, 0.5)         # h sigma sqrt(2 pi) = 3759.9
    close(o["fwhm"], 2.3548 * 1.5, 0.05)
    close(o["as"], 1.0, 0.03)
    close(o["tf"], 1.0, 0.03)
    assert o["r2"] > 0.99
    assert o["as4"] > 1.8 and o["tf4"] > 1.4 and o["r24"] < 0.95               # a tail raises As and Tf and lowers the Gaussian R^2


def test_points_across_the_peak_change_the_numbers():
    o = run("""
      const g = dt => F.qualMetrics(F.qualData({ tau: 0, dt, noise: 0, slope: 0, seed: 3 }));
      out.fine = g(0.05); out.coarse = g(1);
    """)
    assert o["fine"]["above"] >= 60 and o["coarse"]["above"] <= 5
    assert abs(o["coarse"]["err"]) > abs(o["fine"]["err"])


def test_noise_and_baseline_estimates():
    o = run("""
      const r = C.rng(4), y = []; for (let i = 0; i < 2000; i++) y.push(5 + 0.01 * i + 3 * C.normal(r));
      out.noise = F.noiseEst(y);
      const z = []; for (let i = 0; i < 200; i++) z.push(10 + 500 * C.gauss(i, 100, 6));
      const b = F.snip(z, 30); out.base = [b[10], b[100], b[190]];
    """)
    assert abs(o["noise"] - 3) < 0.25, o["noise"]
    assert all(abs(v - 10) < 1 for v in o["base"]), o["base"]


def test_peak_detection_finds_the_planted_peaks_and_flags_the_spike():
    o = run("""
      const d = F.picchiData({ seed: 5, rs: 1, noise: 20 });
      const opt = (algo, sm, minW, snth) => ({ algo, sm: { kind: sm, w: 7 }, snth: snth || 6, minW, w0: 6, w1: 20 });
      const run = (algo, sm, minW, snth) => { const r = F.detect(d.t, d.y, opt(algo, sm, minW, snth)), g = r.cands.filter(c => c.ok); return { r, g, cmp: F.compare(d.truth, g, 6) }; };
      const mf = run("mf", "sg", 5), cwt = run("cwt", "sg", 5), loc = run("loc", "sg", 5), locRaw = run("loc", "none", 5), locRaw0 = run("loc", "none", 0);
      out.truth = d.truth.map(q => Math.round(q.rt));
      out.mf = { rt: mf.g.map(c => c.rt), miss: mf.cmp.missed, fp: mf.cmp.falsePos };
      out.cwt = { rt: cwt.g.map(c => c.rt), miss: cwt.cmp.missed, fp: cwt.cmp.falsePos };
      out.loc = { n: loc.g.length, miss: loc.cmp.missed };
      out.spike = locRaw.r.cands.filter(c => Math.abs(c.rt - d.spike) <= 2).map(c => [c.ok, c.why]);
      out.spike0 = locRaw0.cmp.falsePos;
      out.area = mf.g.map((c, i) => c.area / d.truth[mf.cmp.match[i]].area);
      out.same = JSON.stringify(F.detect(d.t, d.y, opt("cwt", "sg", 5)).cands) === JSON.stringify(F.detect(d.t, d.y, opt("cwt", "sg", 5)).cands);
      const strict = run("mf", "sg", 5, 10); out.strict = strict.cmp.missed;
      const low = F.picchiData({ seed: 5, rs: 0.6, noise: 20 }), rl = F.detect(low.t, low.y, opt("loc", "sg", 5)).cands.filter(c => c.ok);
      out.rs06 = [rl.length, F.detect(low.t, low.y, opt("cwt", "sg", 5)).cands.filter(c => c.ok).length];
    """)
    assert o["truth"] == [45, 94, 142, 158, 225]
    assert o["mf"] == {"rt": [45, 94, 142, 158, 225], "miss": [], "fp": 0}, o["mf"]       # all five found, nothing false
    assert o["cwt"] == {"rt": [45, 94, 142, 158, 225], "miss": [], "fp": 0}, o["cwt"]
    assert o["loc"]["n"] == 4 and o["loc"]["miss"] == [4]                                 # S/N ~ 5 peak lost by local maxima
    assert o["spike"] == [[False, "troppo stretto"]]                                      # the spike is found and flagged
    assert o["spike0"] >= 1                                                               # without the width test it becomes a false peak
    assert all(0.85 < a < 1.1 for a in o["area"][:4]), o["area"]                          # the four large peaks: area within 15 %
    assert o["same"] is True
    assert 4 in o["strict"]                                                               # a stricter S/N threshold loses the small peak again
    assert o["rs06"][0] < o["rs06"][1]                                                    # Rs 0.6: local maxima merge the pair, CWT still separates it


def test_cwt_ridges_need_several_scales():
    o = run("""
      const y = []; for (let i = 0; i < 300; i++) y.push(1000 * C.gauss(i, 100, 4) + 1000 * (i === 200 ? 1 : 0));
      const sig = [1, 1.5, 2.2, 3.3, 5], W = F.cwt(y, sig, 1), rd = F.ridges(W.C, W.nz, sig, 6, 3);
      out.at = rd.map(r => r.at); out.len = rd.map(r => r.len); out.best = rd.map(r => r.best);
    """)
    assert o["at"] == [100, 200] and min(o["len"]) >= 3
    assert o["best"][0] >= 2 and o["best"][1] == 0           # the peak is strongest at a scale close to its width, the one-point spike at the smallest scale


def test_compare_matches_each_true_peak_once():
    o = run("""
      const truth = [{ rt: 10 }, { rt: 20 }, { rt: 40 }];
      out.a = F.compare(truth, [{ rt: 11 }, { rt: 19 }, { rt: 60 }], 3);
      out.b = F.compare(truth, [{ rt: 12 }, { rt: 13 }], 3);
    """)
    assert o["a"] == {"match": [0, 1, -1], "missed": [2], "falsePos": 1}
    assert o["b"] == {"match": [0, -1], "missed": [1, 2], "falsePos": 1}
