"""Chapters 28-29 (part VII): the pure functions behind the four figures sim-chemi-specchio, -purezza, -libreria, -rete, run in node with known answers.
Hand-computed values are the ones quoted in the chapter text. No DOM, no network; a missing node is a failure, not a skip."""
import json
import math
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / "assets"


def js(body):
    node = shutil.which("node")
    assert node, "node is required"
    code = (f'const CHEMI = require({json.dumps(str(A / "chemi-common.js"))}); require({json.dumps(str(A / "sim-chemi-somiglianza.js"))}); '
            f'require({json.dumps(str(A / "sim-chemi-librerie.js"))}); const F = CHEMI.fn; const out = (() => {{ {body} }})(); console.log(JSON.stringify(out));')
    r = subprocess.run([node, "-e", code], capture_output=True, encoding="utf-8")
    assert r.returncode == 0, r.stdout + r.stderr
    return json.loads(r.stdout)


# ---------------------------------------------------------------- python references (independent of the JS code)
def entropy(v):
    t = sum(v)
    return -sum(x / t * math.log(x / t) for x in v if x > 0)


def weighted(v):
    """The reference code of Li et al. (math_distance.py, _weight_intensity_by_entropy): sum 1, if S < 3 then w = 0.25 + 0.25 S."""
    t = sum(v)
    p = [x / t for x in v]
    s = entropy(p)
    if s < 3:
        w = 0.25 + (1 - 0.25) / 3 * s
        p = [x ** w for x in p]
        t = sum(p)
        p = [x / t for x in p]
    return p


def entropy_similarity(a, b):
    """a, b: dict mz -> intensity, peaks of the two spectra already identical or well separated (exact key match)."""
    mz = sorted(set(a) | set(b))
    wa = weighted([v for v in a.values()])
    wb = weighted([v for v in b.values()])
    pa = dict(zip(a.keys(), wa))
    pb = dict(zip(b.keys(), wb))
    merged = [(pa.get(m, 0) + pb.get(m, 0)) / 2 for m in mz]
    return 1 - (2 * entropy(merged) - entropy(wa) - entropy(wb)) / math.log(4)


# ---------------------------------------------------------------- chapter 28
def test_cosine_by_hand_three_peaks():
    # A: 100 (1.0), 150 (0.5), 200 (0.2); B: 100 (0.8), 150 (0.4), 250 (0.6). Matched pairs: 100-100 and 150-150; 200 and 250 stay in the norms.
    ref = (1.0 * 0.8 + 0.5 * 0.4) / (math.sqrt(1 + 0.25 + 0.04) * math.sqrt(0.64 + 0.16 + 0.36))
    got = js("const a=[[100,1],[150,.5],[200,.2]], b=[[100,.8],[150,.4],[250,.6]], p=F.match(a,b,{tol:.02}); return [F.cosine(a,b,p), p.length];")
    assert got[1] == 2 and got[0] == pytest.approx(ref, abs=1e-12) and round(ref, 2) == 0.82


def test_identical_and_disjoint_spectra():
    r = js("""const a=[[100,1],[150,.5],[200,.2]], b=[[300,1],[350,.5]], o={tol:.02};
      return [F.cosine(a,a,F.match(a,a,o)), F.entSim(a,a,o).s, F.cosine(a,b,F.match(a,b,o)), F.entSim(a,b,o).s];""")
    assert r[0] == pytest.approx(1, abs=1e-12) and r[1] == pytest.approx(1, abs=1e-12)
    assert r[2] == 0 and r[3] == pytest.approx(0, abs=1e-12)


def test_entropy_similarity_matches_the_reference_formula():
    a = {100.0: 50, 150.0: 30, 200.0: 20, 210.0: 5}
    b = {100.0: 40, 150.0: 35, 200.0: 5, 260.0: 20}
    got = js(f"const a={json.dumps([[k, v] for k, v in a.items()])}, b={json.dumps([[k, v] for k, v in b.items()])}; return F.entSim(a,b,{{tol:.02}}).s;")
    assert got == pytest.approx(entropy_similarity(a, b), abs=1e-9)
    assert 0 < got < 1


def test_entropy_worked_example_quoted_in_the_chapter():
    # chapter 28, Verifica: A = (50, 30, 20) at 100, 150, 200 and B = (50, 30, 20) at 100, 150, 250 -> S = 1.03, w = 0.51, weighted 0.42 0.32 0.26 (S' = 1.08), similarity 0.74
    r = js("""const a=[[100,50],[150,30],[200,20]], b=[[100,50],[150,30],[250,20]]; return [F.entropy([50,30,20]), F.entWeight([50,30,20]), F.entSim(a,b,{tol:.02})];""")
    assert r[0] == pytest.approx(1.03, abs=0.005) and 0.25 + 0.25 * r[0] == pytest.approx(0.51, abs=0.005)
    assert [round(x, 2) for x in r[1]] == [0.42, 0.32, 0.26] and entropy(r[1]) == pytest.approx(1.08, abs=0.005)
    assert r[2]["s"] == pytest.approx(0.74, abs=0.005) and r[2]["n"] == 2


def test_entropy_weighting_rule():
    v = [50, 30, 20]
    got = js(f"return F.entWeight({v});")
    assert got == pytest.approx(weighted(v), abs=1e-12)
    flat = [1] * 40                                    # S = ln 40 = 3.69 >= 3: no weighting
    assert js(f"return F.entWeight({flat});") == pytest.approx([1 / 40] * 40, abs=1e-12)


def test_weighted_cosine_by_hand_and_n_zero_is_cosine():
    # A: 100 (1), 200 (1); B: 100 (1), 200 (0.25). Weights (mz^1 I^1): A = 100, 200; B = 100, 50 -> (1e4 + 1e4) / (sqrt(5e4) sqrt(1.25e4))
    r = js("""const a=[[100,1],[200,1]], b=[[100,1],[200,.25]], o={tol:.02}, W=n=>{const x=F.weigh(a,1,n), y=F.weigh(b,1,n); return F.cosine(x,y,F.match(x,y,o));}; return [W(1), W(0)];""")
    assert r[0] == pytest.approx((100 * 100 + 200 * 50) / (math.sqrt(100**2 + 200**2) * math.sqrt(100**2 + 50**2)), abs=1e-12)
    assert r[1] == pytest.approx((1 + 0.25) / (math.sqrt(2) * math.sqrt(1.0625)), abs=1e-12)


def test_modified_cosine_recovers_an_analogue():
    r = js("""const {q, l} = F.presets("analogo"), s = F.scores(q, l, {tol:.02, p:.5, n:1, rem:true, rev:false});
      return [s.cos, s.mcos, s.nCos, s.nMod, s.pairs.filter(k=>k.sh).length, q.prec - l.prec];""")
    assert r[1] > 0.99 and r[0] < 0.5
    assert r[3] > r[2] and r[4] >= 4
    assert r[5] == pytest.approx(14.0157, abs=1e-9)


def test_pair_rule_is_one_to_one_and_prefers_the_larger_product():
    # query peak 100.00 can match library 100.01 (product 0.9) or 99.99 (0.1): greedy takes the larger product, the other library peak stays free
    r = js("const a=[[100,1]], b=[[100.01,.9],[99.99,.1]]; return F.match(a,b,{tol:.02}).map(k=>[k.i,k.j]);")
    assert r == [[0, 0]]


def test_reverse_search_ignores_query_peaks_absent_from_the_library():
    r = js("""const {q, l} = F.presets("rumore"), o = {tol:.02, p:.5, n:1, rem:true};
      return [F.scores(q,l,Object.assign({rev:false},o)).cos, F.scores(q,l,Object.assign({rev:true},o)).cos];""")
    assert r[1] > r[0]


def test_presets_order_of_scores_and_determinism():
    r = js("""const o={tol:.02,p:.5,n:1,rem:true,rev:false}, S=n=>{const {q,l}=F.presets(n); return F.scores(q,l,o);};
      return ["identico","rumore","analogo","energia","diverso"].map(n=>[S(n).cos,S(n).ent]).concat([JSON.stringify(F.presets("rumore"))==JSON.stringify(F.presets("rumore"))]);""")
    assert r[0] == [pytest.approx(1), pytest.approx(1)] and r[-1] is True
    assert r[4][0] < r[1][0] and r[4][1] < r[1][1]


def test_precursor_removal_lowers_a_cosine_dominated_by_the_precursor():
    r = js("""const q={prec:300,pk:[[300,100],[100,5],[120,4]]}, l={prec:300,pk:[[300,100],[110,5],[130,4]]}, o={tol:.02,p:1,n:0,rev:false};
      return [F.scores(q,l,Object.assign({rem:false},o)).cos, F.scores(q,l,Object.assign({rem:true},o)).cos];""")
    assert r[0] > 0.99 and r[1] == 0


def test_chimeric_purity_and_cosine():
    r = js("""const base={w:2,d:.8,r:1,off:.1,t:0,s:.1}; return [F.chimera(base), F.chimera(Object.assign({},base,{w:.4})), F.chimera(Object.assign({},base,{r:3})), F.chimera(Object.assign({},base,{d:.8,off:0,r:0}))];""")
    pure = 1 / (1 + math.exp(-0.5))
    assert r[0]["purity"] == pytest.approx(pure, abs=1e-12)
    assert r[1]["inside"] == 0 and r[1]["purity"] == 1 and r[1]["cos"] == pytest.approx(1, abs=1e-12)
    assert r[2]["purity"] < r[0]["purity"] and r[2]["cos"] < r[0]["cos"] < 1
    assert r[3]["purity"] == 1 and r[3]["cos"] == pytest.approx(1, abs=1e-12)


# ---------------------------------------------------------------- chapter 29
def test_fdr_and_qvalues_by_hand():
    # four target best hits (0.9 0.8 0.7 0.6, the 0.6 one is wrong) and one decoy best hit at 0.65
    res = [{"bt": .9, "dec": False, "good": True}, {"bt": .8, "dec": False, "good": True}, {"bt": .7, "dec": False, "good": True},
           {"bt": .6, "dec": False, "good": False}, {"bt": .65, "dec": True, "good": False}]
    r = js(f"const res={json.dumps(res)}; return [F.fdrAt(res,.6), F.fdrAt(res,.7), F.qvalues(res)];")
    assert r[0]["T"] == 4 and r[0]["D"] == 1 and r[0]["est"] == pytest.approx(0.25) and r[0]["tru"] == pytest.approx(0.25)
    assert r[1]["T"] == 3 and r[1]["D"] == 0 and r[1]["est"] == 0
    assert r[2] == [0, 0, 0, 0.25, 1]


def test_qvalues_are_monotone_in_the_score():
    r = js("const d=F.draws(19), res=F.search(d,{N:1000,frac:.6,ri:false,mix:true}), q=F.qvalues(res); return res.map((x,i)=>[x.bt,q[i],x.dec]);")
    tg = sorted((s, q) for s, q, dec in r if not dec)
    assert all(a[1] >= b[1] - 1e-12 for a, b in zip(tg, tg[1:])), "q must not increase with the score"
    assert all(0 <= q <= 1 for _, q in tg)


def test_search_fixed_seed_numbers():
    r = js("const d=F.draws(7), res=F.search(d,{N:1000,frac:.6,ri:false,mix:true}), a=F.fdrAt(res,.8), b=F.fdrAt(res,.7); return [a,b,d.length];")
    assert r[2] == 500
    assert (r[0]["T"], r[0]["D"]) == (295, 17) and r[0]["est"] == pytest.approx(17 / 295)
    assert (r[1]["T"], r[1]["D"]) == (371, 88)


def test_same_seed_same_simulation():
    r = js("const p={N:500,frac:.5,ri:true,mix:true}; return [JSON.stringify(F.search(F.draws(7),p))===JSON.stringify(F.search(F.draws(7),p)), JSON.stringify(F.draws(7))===JSON.stringify(F.draws(19))];")
    assert r == [True, False]


def test_realistic_decoys_estimate_the_true_fdr_and_random_decoys_do_not():
    r = js("""const pm={N:1000,frac:.6,ri:false,mix:true}, pr=Object.assign({},pm,{mix:false}), m=[], q=[];
      [7,19,31,43,55,67].forEach(s=>{const d=F.draws(s), a=F.fdrAt(F.search(d,pm),.75), b=F.fdrAt(F.search(d,pr),.75); m.push(a.est-a.tru); q.push(b.est-b.tru);});
      return [m,q];""")
    assert all(abs(x) < 0.03 for x in r[0]), r[0]
    assert all(x < -0.05 for x in r[1]), r[1]


def test_bigger_library_and_ri_filter():
    r = js("""const d=F.draws(7), n=(N,ri)=>{const a=F.fdrAt(F.search(d,{N,frac:.6,ri,mix:true}),.7); return a.tru;};
      return [n(100,false), n(2000,false), n(1000,false), n(1000,true)];""")
    assert r[1] > r[0], "more library entries, more wrong hits above the same threshold"
    assert r[3] < r[2], "the retention-index window removes wrong candidates"


def test_hit_list_has_five_sorted_rows_and_is_deterministic():
    r = js("const d=F.draws(7), p={N:1000,frac:.6,ri:false,mix:true}; return [F.hitList(d,0,p), F.hitList(d,0,p)];")
    assert r[0] == r[1] and len(r[0]) == 5
    s = [h["score"] for h in r[0]]
    assert s == sorted(s, reverse=True) and all(h["rev"] >= h["score"] - 1e-12 for h in r[0])


def test_null_top_is_descending_and_grows_with_n():
    r = js("const U=[.5,.5,.5,.5,.5]; return [F.nullTop(U,100,5,6), F.nullTop(U,2000,5,6)];")
    for t in r:
        assert t == sorted(t, reverse=True) and all(0 < x < 1 for x in t)
    assert r[1][0] > r[0][0]


def test_network_families_and_thresholds():
    r = js("""const sp=F.netSpectra(), comps=(o)=>F.netComps(sp.length,F.netEdges(sp,o)).map(c=>c.length).sort((a,b)=>b-a);
      const E=F.netEdges(sp,{thr:.5,minN:4,topK:4,mod:true});
      return [sp.length, comps({thr:.5,minN:4,topK:4,mod:true}), comps({thr:.5,minN:4,topK:4,mod:false}), comps({thr:.5,minN:4,topK:1,mod:true}), comps({thr:.9,minN:4,topK:4,mod:true}), E.filter(e=>e.cross).length,
              F.netEdges(sp,{thr:.5,minN:4,topK:4,mod:false}).filter(e=>e.cross).length, comps({thr:.4,minN:4,topK:4,mod:false}).length];""")
    assert r[0] == 14
    assert r[1] == [5, 4, 3, 1, 1], "three families and two singletons at the default thresholds"
    assert max(r[2]) <= 2, "the plain cosine cannot link analogues whose fragments are shifted"
    assert max(r[3]) <= max(r[1]) and len(r[4]) > len(r[1]), "stricter filters split families"
    assert r[5] == 0 and r[6] == 1, "the bridge spectrum links two families only without the modification"


def test_network_is_deterministic_and_edges_respect_the_filters():
    r = js("""const a=JSON.stringify(F.netSpectra()), b=JSON.stringify(F.netSpectra()), sp=F.netSpectra(), E=F.netEdges(sp,{thr:.6,minN:5,topK:2,mod:true});
      const deg={}; E.forEach(e=>{deg[e.a]=(deg[e.a]||0)+1; deg[e.b]=(deg[e.b]||0)+1;});
      return [a===b, E.every(e=>e.s>=.6&&e.n>=5), Math.max(0,...Object.values(deg))];""")
    assert r[0] and r[1] and r[2] <= 2


def test_figure_files_are_valid_js():
    for f in ("sim-chemi-somiglianza.js", "sim-chemi-librerie.js"):
        r = subprocess.run([shutil.which("node"), "--check", str(A / f)], capture_output=True, encoding="utf-8")
        assert r.returncode == 0, r.stderr
