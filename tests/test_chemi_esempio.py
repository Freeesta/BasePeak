"""Chapter 32 (part VII): pure functions of the worked example, run in node without a DOM.
The numbers checked here are the ones quoted in the chapter text."""
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PRELUDE = """
const vm = require("vm"), fs = require("fs");
const R = %r;
vm.runInThisContext(fs.readFileSync(R + "/assets/masse.js", "utf8") + ";globalThis.MASSE = MASSE;");
require(R + "/assets/chemi-common.js");
require(R + "/assets/sim-chemi-esempio.js");
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


def test_cosine_by_hand(tmp_path):
    # sqrt weights: dot = sqrt(100*100) + sqrt(25*100) = 150; norms sqrt(125), sqrt(200); cos = 150 / sqrt(25000) = 0.9487
    o = node("""
out.a = F.cosine([[100, 100], [150, 25]], [[100, 100], [150, 100]], 0.01);
out.b = F.cosine([[100, 100]], [[200, 100]], 0.01);
out.c = F.cosine([[100, 100], [100.005, 50]], [[100.002, 100]], 0.01);
""", tmp_path)
    assert abs(o["a"]["cos"] - 0.9487) < 1e-4 and len(o["a"]["pairs"]) == 2
    assert o["b"]["cos"] == 0 and o["b"]["pairs"] == []
    assert len(o["c"]["pairs"]) == 1          # each library peak is matched once


def test_masses_and_centroid(tmp_path):
    o = node("""
out.mh = F.EX.compounds.slice(0, 3).map(c => MASSE.exact(c.f) + 1.00727646688);
const x = [], y = [];
for (let i = 0; i < 21; i++) { x.push(100 + 0.001 * i); y.push(1000 * Math.exp(-Math.pow((0.001 * i - 0.0103) / 0.003, 2) / 2)); }
out.cen = F.centroids(x, y, 10);
""", tmp_path)
    assert [round(m, 4) for m in o["mh"]] == [237.1022, 252.0898, 279.1452]
    assert len(o["cen"]) == 1 and abs(o["cen"][0]["mz"] - 100.0103) < 2e-5


def test_peak_area_and_chain(tmp_path):
    o = node("""
const c = CHEMI.chrom({ t0: 4, t1: 12, dt: 0.02, peaks: [{ rt: 8, h: 1000, s: 0.04 }], seed: 1 });
out.p = F.pick(c.t, c.y, 10);
out.truth = c.truth[0].area;
out.feat = F.features().map(f => [f.id, f.keep, Math.round(f.rt * 10) / 10]);
out.lev = [0, 1, 2].map(k => F.livelloEx(F.evidence(k)));
out.cos = [0, 1].map(k => F.search(k, 5, 0.01)[0].cos);
out.iso = F.search(0, 5, 0.01).length;
out.noms2 = F.query(2).length;
out.fm = F.formulae(F.evidence(2).feat.mz, 3, null).map(q => q.f);
""", tmp_path)
    assert len(o["p"]) == 1 and abs(o["p"][0]["area"] / o["truth"] - 1) < 0.03
    assert o["feat"] == [["F1", True, 5.4], ["F2", True, 7.2], ["F3", True, 8.2], ["F4", False, 10.5]]
    assert o["lev"] == ["1", "2a", "4"]
    assert all(c > 0.99 for c in o["cos"]) and o["iso"] == 2 and o["noms2"] == 0
    assert o["fm"] == ["C13H18N4O3"]


def test_deterministic(tmp_path):
    body = "out.f = F.features(); out.q = F.query(0); out.s = F.xic(1, 2).y.slice(0, 5);"
    assert node(body, tmp_path) == node(body, tmp_path)
