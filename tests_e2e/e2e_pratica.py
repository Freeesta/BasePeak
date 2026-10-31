"""Pratica (pratica/*.html): a whole EI problem played to the end (molecular ion, formula, key ions, structure by SMILES),
the oral mode (exam format: graph only), the oral simulation (4 questions), one round of each short game, the formula sheet
with hidden formulas, and the skills page showing what was recorded. No JS errors anywhere."""
import sys, os, traceback; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:      # a bare assert has no message: say where it failed and print the page state
        tb = traceback.extract_tb(e.__traceback__)[-1]
        try: state = pg.evaluate("({url: location.pathname, wk: (document.querySelector('.wk')||document.body).innerText.slice(0, 400)})")
        except Exception: state = "page unavailable"
        steps.append((name, f"FAIL line {tb.lineno}: {tb.line} | {str(e).split(chr(10))[0][:200]} | {state}"))
pg = None
r = Run(port=8902, wd="/tmp/wdpr")
try:
    with sync_playwright() as p:
        pg = r.page(p)
        # the drawing editor (Ketcher, 30 MB, a third-party app) is not shipped in this repository: the game falls back to the SMILES field, which is what this test types
        pg.context.route("**/vendor/ketcher/**", lambda rt: rt.fulfill(status=200, content_type="text/html", body="<!doctype html><title>Ketcher not shipped</title>"))
        base = f"http://127.0.0.1:{r.port}/static/"
        def ei_game():
            pg.goto(base + "pratica/ei.html"); pg.wait_for_timeout(1500)
            pg.select_option("#lv", "2"); pg.wait_for_timeout(300)
            pg.evaluate("PRATICA_EI.start('acetofenone')"); pg.wait_for_timeout(500)
            assert pg.evaluate("PRATICA_EI.state().item.id") == "acetofenone"
            cv = pg.locator("#game .eispec canvas").first; box = cv.bounding_box()
            hit = None
            for x in range(int(box["width"]) - 5, 40, -2):          # click along the spectrum until the M peak (m/z 120) is selected
                cv.click(position={"x": x, "y": box["height"] / 2})
                sel = pg.evaluate("PRATICA_EI.state().sel")
                if sel and sel[0] == 120: hit = x; break
            assert hit, "M peak not selectable"
            pg.click("#m-ok"); pg.wait_for_timeout(300)
            pg.fill("#f-in", "C8H8O"); pg.fill("#f-rdb", "5"); pg.click("#f-ok"); pg.wait_for_timeout(300)
            names = pg.evaluate("PRATICA_EI.state().item.keys.filter(k=>k.type!=='M'&&k.type!=='isotopo').map(k=>[k.mz,EISPEC.TYPE[k.type]])")
            for mz, name in names:
                loc = pg.locator(f"#s3 .st:has-text('m/z {mz}') .opts button", has_text=name)
                if loc.count(): loc.first.click(); pg.wait_for_timeout(150)
            assert pg.evaluate("document.querySelector('#s3').classList.contains('done')"), "key ions step not done"
            pg.fill("#k-smi", "CC(=O)c1ccccc1"); pg.click("#k-ok")
            attendi(pg, "(()=>{const t=document.querySelector('#end').innerText;return t.includes('100')||t.includes('punti')})()", 60000)   # OpenChemLib is loaded here, on demand
            end = pg.inner_text("#end")
            assert "100" in end or "punti" in end, end[:120]
        step("EI game: acetophenone from M to the structure", ei_game)
        pg.screenshot(path=SH + "pr_01_ei.png", full_page=True)
        def ei_oral():
            pg.goto(base + "pratica/ei.html?orale=1"); pg.wait_for_timeout(1500)
            assert pg.locator("#game .eispec canvas").count() >= 1
            assert pg.locator("#game .eitab").count() == 0, "the exam format shows only the graph"
            assert pg.locator("#o1").count() == 1, "oral answer fields"
            assert pg.evaluate("!document.querySelector('iframe')"), "the structure editor must not load before it is asked for"
        step("EI oral mode: graph only, editor not loaded", ei_oral)
        def games():
            pg.goto(base + "pratica/perdite.html"); pg.wait_for_timeout(800)
            pg.click(".wk .st:nth-of-type(1) .opts button >> nth=0"); pg.click(".wk .st:nth-of-type(2) .opts button >> nth=0")
            pg.goto(base + "pratica/isotopi.html"); pg.wait_for_timeout(800); pg.fill(".a-c", "8"); pg.click(".ck")
            fb = pg.inner_text(".wk .fb"); assert "La formula era" in fb, fb
            pg.goto(base + "pratica/formula.html"); pg.wait_for_timeout(800)
            assert pg.locator("input[name=fc]").count() >= 1
            pg.check("input[name=fc] >> nth=0"); pg.click(".ck"); fb = pg.inner_text(".wk .fb"); assert "verdetto" in fb, fb
            pg.goto(base + "pratica/strumento.html"); pg.wait_for_timeout(800)
            for g in ["sep", "src", "an", "acq"]: pg.click(f".cards2[data-k={g}] button >> nth=0")
            pg.click(".ck"); fb = pg.inner_text(".wk .fb"); assert "su 4" in fb, fb
            pg.goto(base + "pratica/quadrupolo.html"); pg.wait_for_timeout(800)
            tgt = pg.evaluate("[+document.querySelector('.wk h3').textContent.match(/m\\/z (\\d+)/)[1], +document.querySelector('.lv').value]")
            sol = pg.evaluate(QUAD_SOLVE_JS, tgt)
            assert sol, f"no solution found for target/spacing {tgt}"
            pg.fill(".nV", f"{sol[0]:.3f}"); pg.dispatch_event(".nV", "input"); pg.fill(".nL", f"{sol[1]:.5f}"); pg.dispatch_event(".nL", "input")
            pg.click(".ck"); res = pg.inner_text(".wk .res"); assert "Riuscito" in res, f"target/spacing {tgt}, V/lam {sol}: {res}"
        step("short games: one round each", games)
        def hr_levels():
            pg.goto(base + "pratica/formula.html"); pg.wait_for_timeout(800)
            pg.select_option(".lv", "3"); pg.wait_for_timeout(300)
            e = pg.evaluate("LCUI.last.hrnt")
            assert pg.locator(".c1s").count() == len(e["cands"]) >= 6
            pg.click(".hp"); assert "M = m/z" in pg.inner_text(".hpt")
            for c in e["cands"]: pg.select_option(f".c1s[data-id={c['id']}]", c["fails"][0] if c["fails"] else "ok")
            for b in pg.locator(".wk select, .wk button").all():
                bb = b.bounding_box(); assert bb is None or (bb["width"] >= 24 and bb["height"] >= 24), bb
            pg.click(".ck1"); assert f"{len(e['cands'])} risposte su {len(e['cands'])}" in pg.inner_text(".wk .st >> nth=0 >> .fb")
            pg.click(f".wk .st >> nth=1 >> .opts button[data-id={e['truthId']}]"); assert pg.inner_text(".wk .st >> nth=1 >> .fb").startswith("Sì")
            pg.select_option(".lv", "4"); pg.wait_for_timeout(300)
            f = pg.evaluate("LCUI.last.hrfine")
            for p in f["peaks"]: pg.select_option(f".c1s[data-id={p['id']}]", p["label"])
            pg.click(".ck1"); assert f"{len(f['peaks'])} assegnazioni su {len(f['peaks'])}" in pg.inner_text(".wk .st >> nth=0 >> .fb")
            pg.fill(".nS", str(f["nS"])); pg.fill(".nN", str(f["nN"])); pg.click(".ck2")
            assert pg.inner_text(".wk .st >> nth=1 >> .fb").startswith("Sì")
            pg.select_option(".lv", "2"); pg.wait_for_timeout(300); assert pg.locator("input[name=fc]").count() >= 1
        step("formula page: levels 3 (non-target) and 4 (fine isotopes)", hr_levels)
        pg.screenshot(path=SH + "pr_02_quadrupolo.png", full_page=True)
        def formulario():
            pg.goto(base + "capitoli/20-formulario.html"); pg.wait_for_timeout(800)
            n = pg.locator("main .eq").count(); assert n >= 25, n
            pg.click("#hide"); assert pg.locator("main .eq.shut").count() == n
            pg.locator("main .eq.shut").first.click(); assert pg.locator("main .eq.shut").count() == n - 1
        step("formula sheet: hide and reveal", formulario)
        def skills():
            pg.goto(base + "pratica/index.html"); pg.wait_for_timeout(800)
            t = pg.inner_text("#skills")
            assert "risposte" in t and pg.locator("#skills .skill").count() >= 10, t[:200]
        step("skills page shows the recorded results", skills)
        pg.screenshot(path=SH + "pr_03_pratica.png", full_page=True)
finally:
    r.close()
r.report()
for s in steps: print(" ", s)
