"""Header and side index of the standalone Teoria and Pratica (patRoon-handbook layout): no «Dati» / «Disegno» / «Teoria» tabs and no link to another app anywhere; the index is a
full-height column (top = 0, height = window) with the logo and the name at its top; the top bar (tools) starts at its right edge; below 900 px the bar is full width and the index
is the drawer; logo = link to the home page; keyboard, dark theme, file://. Run: python3 tests_e2e/e2e_teoria_nav.py"""
import sys, os, re, pathlib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_nav.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:240]))
IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
PAGES = ["index.html", "capitoli/01-cromatografia.html", "capitoli/04-esi.html", "capitoli/12-frammentazione-esi.html", "capitoli/20-formulario.html", "pratica/index.html", "pratica/ei.html", "pratica/orale.html", "pratica/formula.html"]
THREE = ["index.html", "capitoli/07-quadrupolo.html", "pratica/ei.html"]
r = Run(port=8972, wd="/tmp/wd_tnav")
# what is searched in the built DOM: the old tabs, their links to the app, the names of the app
APP_LINK = "a[href*='#/data'],a[href*='#/draw'],a[href^='../../'],[id^='tab-'],#tabs"
try:
    with sync_playwright() as p:
        r.page(p)
        U = f"http://127.0.0.1:{r.port}/"; T = U + "static/"
        def ctx(w, h=800, **k):
            c = r.b.new_context(viewport={"width": w, "height": h}, **k); q = c.new_page()
            q.on("pageerror", lambda e: r.errs.append(("pageerror", str(e)))); return c, q
        def idle(q):                                   # let the requests in flight finish: an aborted one makes the dev server print a traceback
            try: q.wait_for_load_state("networkidle", timeout=8000)
            except Exception: pass
        def go(q, url):
            idle(q); q.goto(url); q.wait_for_selector("#top"); q.wait_for_selector("#side a.on"); q.wait_for_selector("#tbar", state="attached")
        def no_tabs():
            for w, phone in ((1280, False), (390, True)):
                c, q = ctx(w, **(dict(is_mobile=True, has_touch=True, user_agent=IPHONE) if phone else {}))
                for pg in PAGES if not phone else THREE:
                    go(q, T + pg)
                    assert q.locator(APP_LINK).count() == 0, (pg, q.eval_on_selector_all(APP_LINK, "e=>e.map(x=>x.outerHTML.slice(0,80))"))
                    if phone: q.click("#menu"); q.wait_for_selector("#side", state="visible")
                    # the text of the bars and of the index (opened): no tab labels, no name of the program, no way back to it
                    txt = q.evaluate("[...document.querySelectorAll('#top,#side,#cbar')].map(e=>e.innerText).join('\\n')")
                    for dead in ("Dati", "Disegno", "Apri il programma", "mzLab"): assert not re.search(r"(^|\n)\s*" + dead + r"\s*($|\n)", txt), (pg, dead)
                    labels = q.evaluate("[...document.querySelectorAll('#top a,#top button,#side a,#side button,#cbar a,#cbar button')].map(e=>(e.getAttribute('aria-label')||e.title||'').toLowerCase()).join('|')")
                    assert "programma" not in labels and "disegno" not in labels, (pg, labels)
                c.close()
        step("no Dati / Disegno / Teoria tabs, no #tab-* / #tabs, no link to the program (../../, #/data, #/draw) on 9 pages at 1280 px and 3 at 390 px (bars and index, open)", no_tabs)
        def source_clean():
            root = pathlib.Path(__file__).resolve().parent.parent
            for f in ("assets/teoria.js", "assets/teoria.css", "assets/comandi.js", "assets/lettura.js", "assets/sblocco.js", "assets/impostazioni.js"):
                txt = (root / f).read_text(encoding="utf-8")
                for dead in ("#/data", "#/draw", "tab-dati", "tab-disegno", "tab-teoria", "#tabs", "Apri il programma"): assert dead not in txt, (f, dead)
        step("the code (js/css) has no trace of the tabs and of the links to the program", source_clean)
        def geometry():
            for pg in THREE:
                c, q = ctx(1280, 800); go(q, T + pg)
                sb = q.locator("#side").bounding_box(); tb = q.locator("#top").bounding_box()
                assert sb["y"] == 0 and abs(sb["height"] - 800) <= 0.5 and sb["x"] == 0, sb           # full height, from the very top to the bottom of the window
                assert tb["x"] >= sb["x"] + sb["width"] - 0.5, (tb, sb)                              # the bar starts to the RIGHT of the index
                assert tb["y"] == 0 and tb["height"] < 80 and abs(tb["x"] + tb["width"] - 1280) <= 1, tb
                lg = q.locator("#logo").bounding_box(); assert lg["y"] < 40 and lg["x"] + lg["width"] <= sb["x"] + sb["width"] and q.evaluate("!!document.querySelector('#side .brand #logo')"), lg
                assert q.evaluate("document.querySelector('#logo').getAttribute('href')") in ("index.html", "../index.html"), q.get_attribute("#logo", "href")
                assert "BasePeak" in q.inner_text("#logo")
                assert q.evaluate("document.documentElement.scrollWidth") <= 1280
                q.evaluate("scrollTo(0, 800)"); q.wait_for_timeout(100)           # scrolled: the index stays, the bar stays
                sb2 = q.locator("#side").bounding_box(); tb2 = q.locator("#top").bounding_box(); assert sb2["y"] == 0 and tb2["y"] == 0 and tb2["x"] >= sb2["x"] + sb2["width"] - 0.5, (sb2, tb2)
                tools = q.eval_on_selector_all("#top button, #top a", "e=>e.filter(x=>x.offsetParent).map(x=>x.id)"); assert "a11y-btn" in tools and "tc-indice" in tools and "tc-schermo" in tools, tools
                c.close()
        step("1280x800: the index is full height (top 0, height = window, from the top with the logo), the bar starts at its right edge, both stay when scrolling", geometry)
        def tall():
            c, q = ctx(1280, 1000); go(q, T + "capitoli/07-quadrupolo.html"); sb = q.locator("#side").bounding_box(); assert sb["y"] == 0 and abs(sb["height"] - 1000) <= 0.5, sb
            q.set_viewport_size({"width": 1600, "height": 640}); q.wait_for_timeout(150); sb = q.locator("#side").bounding_box(); assert sb["y"] == 0 and abs(sb["height"] - 640) <= 0.5, sb; c.close()
        step("the index follows the window height (1000 px, then 640 px)", tall)
        def widths():
            for w in (360, 768, 899, 900, 1280):
                c, q = ctx(w); go(q, T + "capitoli/04-esi.html")
                assert q.evaluate("document.documentElement.scrollWidth") <= w, (w, "horizontal scroll")
                tb = q.locator("#top").bounding_box(); sb = q.locator("#side").bounding_box() if q.is_visible("#side") else None
                if w < 900:
                    assert sb is None and tb["x"] == 0 and abs(tb["width"] - w) <= 1, (w, tb, sb)         # drawer: the bar is as wide as the window
                else:
                    assert sb and sb["y"] == 0 and tb["x"] >= sb["x"] + sb["width"] - 0.5 and abs(tb["x"] + tb["width"] - w) <= 1, (w, tb, sb)
                m = q.locator("main").bounding_box(); assert m["x"] >= 0 and m["x"] + m["width"] <= w + 1, (w, m)
                c.close()
        step("360 / 768 / 899 / 900 / 1280 px: no horizontal scroll; below 900 the bar is full width and the index is the drawer, from 900 it is the left column", widths)
        def phone():
            c = r.b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, user_agent=IPHONE); q = c.new_page()
            go(q, T + "capitoli/02-lc.html")
            tb = q.locator("#cbar").bounding_box(); assert tb["x"] == 0 and abs(tb["width"] - 390) <= 1, tb
            assert q.evaluate("document.documentElement.scrollWidth") <= 390
            q.click("#menu"); q.wait_for_selector("#side", state="visible")
            assert q.locator("#side #logo").is_visible() or q.evaluate("document.querySelector('#side #logo')!==null")      # the logo is at the top of the index (scrolled to the current chapter)
            q.evaluate("document.querySelector('#side').scrollTop = 0"); assert q.locator("#side #logo").is_visible() and q.locator("#logo").bounding_box()["height"] >= 44
            idle(q); c.close()
        step("phone: the bar is full width, the drawer carries the logo", phone)
        def dark():
            c, q = ctx(1280, color_scheme="dark"); go(q, T + "capitoli/10-dati.html")
            L = "(c=>{const m=c.match(/[0-9.]+/g).map(Number),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])})"
            k = q.evaluate("(()=>{const L=" + L + ";const bg=getComputedStyle(document.querySelector('#side')).backgroundColor;return ['#logo','#top .tb'].map(s=>{const a=L(getComputedStyle(document.querySelector(s)).color),b=L(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)})})()")
            assert min(k) >= 4.5, k; idle(q); c.close()
        step("dark theme: logo and tool text readable (>= 4.5:1)", dark)
        def keyboard():
            c, q = ctx(1280); go(q, T + "capitoli/11-formula.html")
            q.keyboard.press("Tab"); assert q.evaluate("document.activeElement.className") == "skip", "skip link is not the first focusable"
            q.evaluate("document.activeElement.blur(); scrollTo(0,0)")
            q.evaluate("document.querySelector('#logo').focus()"); assert q.evaluate("(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2})()"), "logo: no visible focus"
            q.keyboard.press("Enter"); q.wait_for_url("**/index.html", timeout=10000)
            idle(q); c.close()
        step("keyboard: the skip link is first, the logo has a visible focus and Enter goes to the home page", keyboard)
        def everywhere():
            c, q = ctx(1280)
            for pgname in PAGES:
                go(q, T + pgname); assert q.is_visible("#logo") and q.is_visible("#a11y-btn"), pgname
            idle(q); c.close()
        step("every page of the Teoria and of the Pratica has the logo and the tools", everywhere)
        def filep():
            c, q = ctx(1280); go(q, (pathlib.Path(__file__).resolve().parent.parent / "capitoli/02-lc.html").as_uri())
            assert q.locator("#logo").count() == 1 and q.evaluate("document.querySelector('#logo').href").endswith("/index.html") and q.locator(APP_LINK).count() == 0; idle(q); c.close()
        step("from file:// the logo goes to the index and nothing points to the program", filep)
finally:
    r.close()
r.report()
for s in steps: print(" ", s)
sys.exit(1 if [s for s in steps if s[1] != "ok"] else 0)
