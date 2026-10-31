"""Part VII (chapters 22-32) in the browser, light and dark: axe-core (serious/critical = 0), accessible names, Tab reaching the controls with a visible focus indicator,
lazy figures (no sim-chemi- request for a figure far below the fold; after scrollIntoView every .sim[data-sim] gets data-ready="1" within 3 s, also while the figure file is a stub),
and with reduced motion no requestAnimationFrame loop left running after 1 s. Fails (does not skip) when axe is missing."""
import sys, os, re; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

AXE = axe_path()
if not AXE:
    print("FAIL axe-core not available (pip install axe-playwright-python)"); sys.exit(1)
js = (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")
PAGES = re.findall(r'\["capitoli/((?:2[2-9]|3[0-2])-[^"]+)\.html", "\d+", "[^"]+", "VII\. Chemioinformatica"', js)
assert len(PAGES) == 11, PAGES
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        steps.append((name, "FAIL " + str(e).replace("\n", " ")[:900]))
RUN = """() => axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})
  .then(r => r.violations.filter(v => ['serious','critical'].includes(v.impact)).map(v => [v.id, v.impact, v.nodes.length, v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')]))"""
VISIBLE = """() => [...document.querySelectorAll('button, select, input:not([type=hidden]), a[href], [role=button], [tabindex="0"], summary')]
  .filter(e => e.offsetParent !== null && !e.disabled && e.tabIndex >= 0 && !e.closest('[hidden], [inert]') && e.checkVisibility({contentVisibilityAuto: true, visibilityProperty: true}))"""
NAME = """() => (%s)().filter(e => { const n = (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') && (document.getElementById(e.getAttribute('aria-labelledby').split(' ')[0]) || {}).textContent
    || e.title || e.textContent || (e.labels && e.labels[0] && e.labels[0].textContent) || e.placeholder || e.value || ''); return !String(n).trim(); })
  .map(e => e.tagName + '#' + (e.id || e.className))""" % VISIBLE
RAF = """() => { window.__raf = 0; const f = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => { window.__raf++; return f(cb); }; }"""

def axe_ok(pg):
    if not pg.evaluate("typeof axe !== 'undefined'"): pg.add_script_tag(path=AXE)
    v = pg.evaluate(RUN); assert not v, v
def names(pg):
    bad = pg.evaluate(NAME); assert not bad, bad[:15]
def tabs(pg):
    pg.evaluate("document.activeElement && document.activeElement.blur(); window.scrollTo(0,0)")
    want = pg.evaluate("(" + VISIBLE + ")().length"); seen, bad = set(), []
    assert want > 0, "no visible control found: the test would prove nothing"
    for i in range(want * 2 + 30):
        pg.keyboard.press("Tab")
        info = pg.evaluate("""() => { const e = document.activeElement; if (!e || e === document.body) return null;
            const s = getComputedStyle(e), r = e.getBoundingClientRect();
            const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none');
            return [e.tagName + '#' + (e.id || e.className) + '#' + [...document.querySelectorAll(e.tagName)].indexOf(e), !!ring, r.width * r.height > 0]; }""")
        if info is None: continue
        if info[0] in seen and len(seen) >= want: break
        seen.add(info[0])
        if not info[1] and info[2]: bad.append(info[0])
    assert len(seen) >= want * 0.9, f"Tab reached {len(seen)} of {want} visible controls"
    assert not bad, "no visible focus indicator on: " + ", ".join(bad[:12])
def lazy(pg, reqs, base):
    """Figures far below the fold are not requested before scrolling; each figure gets data-ready=1 after scrollIntoView."""
    figs = pg.evaluate("""() => [...document.querySelectorAll('.sim[data-sim]')].map(e => [e.id, e.getAttribute('data-sim').split('/').pop(), e.getBoundingClientRect().top + scrollY])""")
    assert figs, "no .sim[data-sim] on the page"
    vh = pg.evaluate("innerHeight")
    near = {f for _, f, top in figs if top < vh + 700}
    far = {f for _, f, top in figs if top >= vh + 700} - near
    asked = {u.rsplit("/", 1)[-1] for u in reqs if "/sim-chemi-" in u}
    assert not (asked & far), f"requested before scrolling: {sorted(asked & far)}"
    for fid, f, _ in figs:
        pg.evaluate("id => document.getElementById(id).scrollIntoView()", fid)
        pg.wait_for_function("id => document.getElementById(id).dataset.ready === '1'", arg=fid, timeout=3000)
    return len(far)
def no_loop(pg):
    pg.wait_for_timeout(1000); pg.evaluate("window.__raf = 0"); pg.wait_for_timeout(1000)
    n = pg.evaluate("window.__raf"); assert n == 0, f"{n} requestAnimationFrame calls in 1 s with reduced motion"

r = Run(port=8872, wd="/tmp/wd_chemi")
far_total = 0
try:
    with sync_playwright() as p:
        r.page(p).close()
        base = f"http://127.0.0.1:{r.port}/static/"
        for scheme in ("light", "dark"):
            q = r.b.new_page(viewport={"width": 1280, "height": 900}, color_scheme=scheme, reduced_motion="reduce")
            q.add_init_script("(" + RAF + ")()")
            reqs = []
            q.on("request", lambda rq: reqs.append(rq.url))
            q.on("pageerror", lambda e: r.errs.append(("pageerror", str(e))))
            try:
                for pr in PAGES:
                    reqs.clear()
                    q.goto(base + "capitoli/" + pr + ".html"); attendi(q, "document.readyState === 'complete' && document.body.innerText.length > 100")
                    attendi(q, "document.documentElement.dataset.theme === %r" % scheme)
                    q.wait_for_timeout(300)
                    step(f"{pr} ({scheme}): no sim-chemi- script for far figures; ready after scroll", lambda: globals().__setitem__("far_total", far_total + lazy(q, list(reqs), base)))
                    for what, fn in (("axe", axe_ok), ("accessible names", names), ("Tab and focus indicator", tabs), ("no running rAF loop (reduced motion)", no_loop)):
                        step(f"{pr} ({scheme}): {what}", lambda fn=fn: fn(q))
            finally: q.close()
        step("some figure was far enough below the fold to prove laziness", lambda: far_total > 0 or (_ for _ in ()).throw(AssertionError("every figure was near the top: the lazy check proved nothing")))
    r.close()
except Exception as e:
    steps.append(("run", "FAIL " + str(e)[:300]))
    try: r.close()
    except Exception: pass
for n, s in steps: print(s.split(" ")[0].upper(), n, s if s != "ok" else "")
r.report()
