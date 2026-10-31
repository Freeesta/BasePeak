// Node test of assets/chemi-common.js (pure functions only; run from tests/test_chemi.py).
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const CHEMI = createRequire(import.meta.url)("../assets/chemi-common.js");

const seq = (seed, n = 20) => { const r = CHEMI.rng(seed); return Array.from({ length: n }, r); };
assert.deepEqual(seq(7), seq(7), "same seed, same sequence");
assert.notDeepEqual(seq(7), seq(8), "different seed, different sequence");
assert.ok(seq(3, 1000).every(v => v >= 0 && v < 1), "rng in [0,1)");

assert.equal(CHEMI.gauss(5, 5, 2), 1, "gauss peak = 1");
assert.ok(Math.abs(CHEMI.gauss(5 + 2 * 1.1774, 5, 2) - 0.5) < 1e-3, "gauss is 0.5 at half the FWHM");
assert.ok(Math.abs(CHEMI.ppm(100.001, 100) - 10) < 1e-6, "ppm(100.001, 100) = 10");
assert.equal(CHEMI.ppm(200, 200), 0);

const r = CHEMI.rng(11), z = Array.from({ length: 4000 }, () => CHEMI.normal(r));
const mean = z.reduce((a, b) => a + b) / z.length, sd = Math.sqrt(z.reduce((a, b) => a + (b - mean) ** 2, 0) / z.length);
assert.ok(Math.abs(mean) < 0.06 && Math.abs(sd - 1) < 0.06, `normal mean ${mean} sd ${sd}`);
for (const lam of [3, 50]) {
  const p = CHEMI.rng(5), k = Array.from({ length: 4000 }, () => CHEMI.poisson(p, lam));
  assert.ok(k.every(Number.isInteger) && Math.abs(k.reduce((a, b) => a + b) / k.length - lam) < 0.1 * lam, `poisson ${lam}`);
}

let emgMax = 0;
for (let x = 0; x < 30; x += 0.01) emgMax = Math.max(emgMax, CHEMI.emg(x, 10, 0.5, 1));
assert.ok(emgMax > 0.97 && emgMax <= 1.02, `emg height ~1 (${emgMax})`);
assert.equal(CHEMI.emg(10, 10, 0.5, 0), 1, "tau = 0 is a Gaussian");

const opt = { t0: 0, t1: 60, dt: 0.5, peaks: [{ rt: 20, h: 100, s: 1 }, { rt: 40, h: 50, s: 1, tau: 1 }], noise: 2, baseline: 5, spikes: 1, seed: 4 };
const a = CHEMI.chrom(opt), b = CHEMI.chrom(opt);
assert.deepEqual(a, b, "chrom is deterministic");
assert.equal(a.t.length, a.y.length);
assert.equal(a.truth.length, 2);
assert.ok(Math.max(...a.y) > 90, "chrom has the peak");

const popt = { peaks: [{ mz: 500, h: 1000 }], R: 50000, pointsPerFwhm: 8, noise: 1, seed: 2 };
const p1 = CHEMI.profile(popt), p2 = CHEMI.profile(popt);
assert.deepEqual(p1, p2, "profile is deterministic");
assert.ok(Math.abs(p1.fwhm - 0.01) < 1e-12 && Math.abs(p1.step - 0.00125) < 1e-12, "fwhm = mz/R, step = fwhm/points");

CHEMI.preset("x", { a: 1 });
assert.deepEqual(CHEMI.preset("x"), { a: 1 });
assert.equal(CHEMI.preset("none"), undefined);
assert.equal(CHEMI.fmtIt(1.5, 2), "1,50");
console.log("chemi-common: all node checks passed");
