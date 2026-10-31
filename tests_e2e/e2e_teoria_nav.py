"""Header of the standalone Teoria and Pratica: the tabs Dati · Disegno · Teoria (Teoria current), logo to the program, always visible at 360/768/1280 px,
dark theme, keyboard, one click from any page of the Teoria and of the Pratica to Dati and to Disegno, the session of the program is found again; phone: only logo and Teoria."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_nav.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:220]))
IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
PAGES = ["index.html", "capitoli/01-cromatografia.html", "capitoli/04-esi.html", "capitoli/12-frammentazione-esi.html", "capitoli/20-formulario.html", "pratica/index.html", "pratica/ei.html", "pratica/formula.html"]
r = Run(port=8972, wd="/tmp/wd_tnav")
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
            idle(q); q.goto(url)
        def tabs_ok(q, w):
            idle(q)
            q.wait_for_selector("#tabs")
            names = q.eval_on_selector_all("#tabs a", "e=>e.map(x=>x.textContent)"); assert names == ["Dati", "Disegno", "Teoria"], names
            cur = q.eval_on_selector_all("#tabs a[aria-current=page]", "e=>e.map(x=>x.textContent)"); assert cur == ["Teoria"], cur
            for a in q.locator("#tabs a").all():
                b = a.bounding_box(); assert b and b["height"] >= 32 and b["width"] >= 32 and b["x"] >= 0 and b["x"] + b["width"] <= w, (a.inner_text(), b)
            assert q.evaluate("document.documentElement.scrollWidth") <= w, "horizontal scroll"
            assert q.evaluate("document.querySelector('#top').getBoundingClientRect().height") < 80
            assert q.get_attribute("#tab-dati", "href") == "../../#/data" and q.get_attribute("#tab-disegno", "href") == "../../#/draw"
        def widths():
            for w in (360, 768, 1280):
                c, q = ctx(w); go(q, T + "capitoli/04-esi.html"); tabs_ok(q, w)
                go(q, T + "pratica/ei.html"); tabs_ok(q, w); idle(q); c.close()
        step("tabs Dati · Disegno · Teoria visible and ≥ 32 px with a mouse at 360, 768, 1280 px (Teoria and Pratica)", widths)
        def dark():
            c, q = ctx(360, color_scheme="dark"); go(q, T + "capitoli/10-dati.html"); tabs_ok(q, 360)
            L = "(c=>{const m=c.match(/[0-9.]+/g).map(Number),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])})"
            k = q.evaluate("(()=>{const L=" + L + ";const bg=getComputedStyle(document.querySelector('#top')).backgroundColor;return ['#tab-dati','#tab-teoria'].map(s=>{const a=L(getComputedStyle(document.querySelector(s)).color),b=L(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)})})()")
            assert min(k) >= 4.5, k; idle(q); c.close()
        step("dark theme: tab text readable (≥ 4.5)", dark)
        def keyboard():
            c, q = ctx(1280); go(q, T + "capitoli/11-formula.html"); q.wait_for_selector("#tabs")
            q.evaluate("document.querySelector('#tab-dati').focus()")
            ids = [q.evaluate("document.activeElement.id")]
            for _ in range(2):
                q.keyboard.press("Tab"); ids.append(q.evaluate("document.activeElement.id"))
            assert "tab-dati" in ids and "tab-disegno" in ids and "tab-teoria" in ids, ids
            q.evaluate("document.querySelector('#tab-disegno').focus()"); idle(q); q.keyboard.press("Enter")
            q.wait_for_url("**/#/draw"); idle(q); c.close()
        step("keyboard: Tab reaches the three tabs, Enter on Disegno opens it", keyboard)
        def everywhere():
            c, q = ctx(1280)
            for pgname in PAGES:
                go(q, T + pgname); q.wait_for_selector("#tabs")
                assert q.get_attribute("#tab-dati", "href") == "../../#/data" and q.get_attribute("#tab-disegno", "href") == "../../#/draw", pgname
                assert q.is_visible("#tab-dati") and q.is_visible("#tab-disegno"), pgname
            idle(q); c.close()
        step("every page of the Teoria and of the Pratica has the tabs", everywhere)
        def phone():
            c = r.b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, user_agent=IPHONE); q = c.new_page()
            go(q, T + "capitoli/02-lc.html"); q.wait_for_selector("#tabs")
            names = q.eval_on_selector_all("#tabs a", "e=>e.map(x=>x.textContent)"); assert names == ["Teoria"], names
            assert q.locator("#tab-teoria").bounding_box()["height"] >= 44
            assert q.evaluate("document.documentElement.scrollWidth") <= 390
            idle(q); c.close()
        step("phone: only Teoria in the header", phone)
        def filep():
            import pathlib
            c, q = ctx(1280); go(q, (pathlib.Path(__file__).resolve().parent.parent / "capitoli/02-lc.html").as_uri()); q.wait_for_selector("#top")
            assert q.locator("#tab-teoria").count() == 1; idle(q); c.close()
        step("from file:// tab Teoria is present", filep)
finally:
    r.close()
r.report()
for s in steps: print(" ", s)
sys.exit(1 if [s for s in steps if s[1] != "ok"] else 0)
