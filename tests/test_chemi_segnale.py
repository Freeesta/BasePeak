"""Chapters 22 and 23 of part VII: pure functions of assets/sim-chemi-segnale.js and assets/sim-chemi-formati.js, checked in node with known answers.
The same numbers are quoted in the chapter text (worked examples)."""
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent

PRELUDE = """
const assert = require("node:assert/strict");
const CHEMI = require("%s/assets/chemi-common.js");
require("%s/assets/sim-chemi-segnale.js"); require("%s/assets/sim-chemi-formati.js");
const F = CHEMI.fn, close = (a, b, e, m) => assert.ok(Math.abs(a - b) <= e, `${m || ""} ${a} vs ${b}`);
""" % ((ROOT.as_posix(),) * 3)


def node(body):
    exe = shutil.which("node")
    assert exe, "node is required"
    r = subprocess.run([exe, "-e", "(async () => {" + PRELUDE + body + "})().catch(e => { console.error(e); process.exit(1); })"], capture_output=True, encoding="utf-8")
    assert r.returncode == 0, r.stdout + r.stderr


def test_pure_functions_are_exported_without_a_dom():
    node("""
    // without a DOM the files only define the pure part
    assert.equal(typeof F.cPar, "function"); assert.equal(typeof F.encode, "function"); assert.equal(typeof F.run, "function");
    """)


def test_three_point_centroids_worked_example():
    # 200.10 .. 200.14 with intensities 1 4 8 6 2: apex 200.12, neighbours a=4 b=8 c=6
    node("""
    const mz = [200.10, 200.11, 200.12, 200.13, 200.14], y = [1, 4, 8, 6, 2];
    close(F.vertex(4, 8, 6), 1 / 6, 1e-12, "delta");
    close(F.cMax(mz, y), 200.12, 1e-12);
    close(F.cPar(mz, y), 200.12 + 0.01 / 6, 1e-12, "parabola");            // 200.1217
    const a = F.cArea(mz, y, 0.5); close(a.mz, (200.11 * 4 + 200.12 * 8 + 200.13 * 6) / 18, 1e-12, "area"); assert.equal(a.sum, 18); assert.equal(a.n, 3);  // 200.1211
    close(a.mz, 200.121111, 1e-6);
    """)


def test_gaussian_vertex_is_exact_on_a_noise_free_gaussian():
    node("""
    for (const x0 of [100.0037, 100.0121, 100.0049]) {
      const mz = [], y = []; for (let i = 0; i < 41; i++) { const x = 99.8 + i * 0.01; mz.push(x); y.push(1000 * CHEMI.gauss(x, x0, 0.02)); }
      close(F.cGau(mz, y), x0, 1e-9, "gaussian variant");
      assert.ok(Math.abs(F.cPar(mz, y) - x0) < 2e-4, "parabola is close but not exact");
      assert.ok(Math.abs(F.cPar(mz, y) - x0) > 1e-9, "parabola is biased on a Gaussian");
    }
    """)


def test_formulas_quoted_in_the_text():
    node("""
    close(F.mdaToPpm(1, 100), 10, 1e-12);
    close(F.fwhm(300, 50000), 0.006, 1e-12);
    close(F.tdcObserved(1), 0.6321205588, 1e-9); close(F.tdcObserved(0.1), 0.0951625820, 1e-9);
    close(F.sigmaCentroid(0.006, 10000) / 300 * 1e6, 0.0849, 1e-3);          // 10 000 ions, R 50 000 at m/z 300
    close(CHEMI.ppm(300.0015, 300), 5, 1e-9);
    """)


def test_peak_is_deterministic_and_seed_sensitive():
    node("""
    const o = { mz: 300.1234, R: 50000, ppf: 5, offset: 0.3, snr: 100, ions: 0, seed: 4 };
    assert.deepEqual(F.peak(o).y, F.peak(o).y);
    assert.notDeepEqual(F.peak(o).y, F.peak(Object.assign({}, o, { seed: 5 })).y);
    const p = Object.assign({}, o, { ions: 2000 }); assert.deepEqual(F.peak(p).y, F.peak(p).y);
    assert.ok(F.peak(p).y.every(v => Number.isInteger(v) && v >= 0), "Poisson counts are integers");
    assert.deepEqual(F.repeat(o, "par", 0.5, 50), F.repeat(o, "par", 0.5, 50));
    """)


def test_two_hundred_draws_numbers_quoted_in_the_text():
    # R 50 000, 5 points per FWHM, S/N 100, peak 0.3 step off the nearest point, Gaussian noise: bias and spread per algorithm
    node("""
    const o = { mz: 300.1234, R: 50000, ppf: 5, offset: 0.3, snr: 100, ions: 0 }, s = a => F.repeat(o, a, 0.5, 200);
    const mx = s("max"), pa = s("par"), ga = s("gau"), ar = s("area");
    close(mx.mean, 1.2, 0.01); assert.ok(mx.sd < 1e-6, "the apex is a grid point: no spread");
    assert.ok(Math.abs(pa.mean) < 0.05 && pa.sd > 0.15 && pa.sd < 0.25, JSON.stringify(pa));
    assert.ok(Math.abs(ga.mean) < 0.06 && ga.sd > 0.15 && ga.sd < 0.25, JSON.stringify(ga));
    assert.ok(ar.mean > 0.7 && ar.mean < 0.8 && ar.sd < 0.06, JSON.stringify(ar));
    """)


def test_calibration_run_known_answers():
    node("""
    const base = { sd: 1e-9, mzs: [300, 300], mzLock: 300, seed: 1 };
    const a = F.run(Object.assign({ drift: 4, step: 0, lock: true }, base));
    close(a.mabsBefore, 2.0, 1e-6, "mean |drift| over t = 0..60 min is half of 4 ppm");
    close(a.mabsAfter, 0, 1e-6, "one-point recalibration removes a pure drift");
    const b = F.run(Object.assign({ drift: 0, step: 2, lock: true }, base));
    close(b.mabsBefore, 2 * 7 / 13, 1e-6, "step of 2 ppm present at 7 of 13 times"); close(b.mabsAfter, 0, 1e-6);
    const c = F.run(Object.assign({ drift: 4, step: 0, lock: false }, base)); close(c.mabsAfter, c.mabsBefore, 1e-12);
    // random error stays: the scatter after the correction is not zero
    const d = F.run({ drift: 3, step: 0, lock: true, sd: 2, mzs: [120, 180, 240, 300, 360, 420, 480, 540], mzLock: 300, seed: 5 });
    assert.ok(d.mabsAfter > 1 && d.mabsAfter < d.mabsBefore + 1);
    assert.deepEqual(d, F.run({ drift: 3, step: 0, lock: true, sd: 2, mzs: [120, 180, 240, 300, 360, 420, 480, 540], mzLock: 300, seed: 5 }));
    // the m/z dependent part of the drift is not removed by a single lock mass
    const w = F.run({ drift: 5, step: 0, lock: true, sd: 1e-9, mzs: [150, 1100], mzLock: 300, seed: 1 });
    assert.ok(w.mabsAfter > 0.5, "wide m/z range leaves a residual: " + w.mabsAfter);
    """)


def test_base64_known_values_and_roundtrip_of_float_arrays():
    node("""
    const enc = s => F.b64enc(Uint8Array.from(Buffer.from(s)));
    assert.equal(enc("Man"), "TWFu"); assert.equal(enc("Ma"), "TWE="); assert.equal(enc("M"), "TQ=="); assert.equal(enc(""), "");
    for (const kind of ["centroid", "profile"]) {
      const x = F.mzArray(777, kind, 9);
      for (const bits of [32, 64]) for (const be of [false, true]) {
        const u8 = F.toBytes(x, bits, be), back = F.fromBytes(F.b64dec(F.b64enc(u8)), bits, be);
        assert.equal(back.length, x.length); assert.deepEqual(F.b64dec(F.b64enc(u8)), u8, "base64 round trip is exact");
        const e = F.maxErr(x, back);
        if (bits === 64) assert.equal(e.abs, 0, "float64 round trip is exact");
        else assert.ok(e.ppm <= F.floatBound(24) * 1e6 + 1e-12, "float32 error <= 2^-24 relative: " + e.ppm);
      }
    }
    close(F.floatBound(24) * 1e6, 0.0596, 1e-4);
    const le = F.toBytes([1], 32), bg = F.toBytes([1], 32, true);
    assert.deepEqual(Array.from(le), [0, 0, 128, 63]); assert.deepEqual(Array.from(bg), [63, 128, 0, 0]);
    """)


def test_encode_chain_sizes_and_errors():
    node("""
    const o = { n: 500, kind: "profile", bits: 64, comp: "none", seed: 3 };
    const r = await F.encode(o); assert.equal(r.plain, 4000); assert.equal(r.raw, 4000); assert.equal(r.b64len, 5336); assert.equal(r.abs, 0);
    const r32 = await F.encode(Object.assign({}, o, { bits: 32, kind: "centroid" })); assert.equal(r32.raw, 2000); assert.ok(r32.ppm < 0.0597 && r32.ppm > 0.01);
    const lp = await F.encode(Object.assign({}, o, { comp: "lp" })); assert.ok(lp.packed < 600, "uniform profile grid: about 1 byte per point"); assert.ok(lp.abs <= 5e-6 + 1e-12);
    const lc = await F.encode(Object.assign({}, o, { comp: "lp", kind: "centroid" })); assert.ok(lc.abs <= 5.01e-6); assert.ok(lc.packed < 4000);
    assert.deepEqual(await F.encode(o), await F.encode(o), "deterministic");
    if (F.hasZlib()) {
      const z = await F.encode(Object.assign({}, o, { comp: "zlib" })); assert.ok(z.packed < z.raw && z.abs === 0, "zlib is lossless");
      const u8 = F.toBytes(F.mzArray(300, "centroid", 2), 64); assert.deepEqual(await F.unzlib(await F.zlib(u8)), u8);
    }
    const x = F.mzArray(200, "centroid", 1); assert.deepEqual(Array.from(F.lpDecode(F.lpEncode(x)), v => Math.round(v * 1e5)), Array.from(x, v => Math.round(v * 1e5)));
    """)


def test_synthetic_spectrum_in_five_formats():
    node("""
    for (const f of ["mzml", "mzxml", "mgf", "msp", "mztab"]) { const t = F.render(f, false), m = F.render(f, true); assert.ok(t.length > m.length && m.length > 0, f); assert.equal(t, F.render(f, false)); }
    const t = F.render("mzml");
    for (const a of ["MS:1000511", "MS:1000127", "MS:1000130", "MS:1000016", "UO:0000031", "MS:1000744", "MS:1000041", "MS:1000045", "MS:1000523", "MS:1000576", "MS:1000514", "MS:1000515"]) assert.ok(t.includes(a), a);
    const x = F.render("mzxml").match(/>\\s*([A-Za-z0-9+\\/=]{20,})\\s*<\\/peaks>/)[1], v = F.fromBytes(F.b64dec(x), 32, true);
    assert.equal(v.length, 12); close(v[0], 91.0542, 1e-4); close(v[3], 1800, 0);
    const mgf = F.render("mgf"); assert.ok(mgf.startsWith("BEGIN IONS") && mgf.endsWith("END IONS") && mgf.includes("PEPMASS=285.1234") && mgf.includes("CHARGE=1+"));
    assert.ok(F.render("msp").includes("Num Peaks: 6"));
    assert.equal(F.KEEP.length, 7); F.KEEP.forEach(r => { assert.equal(r[1].length, 5); assert.equal(r[2].length, 5); });
    """)
