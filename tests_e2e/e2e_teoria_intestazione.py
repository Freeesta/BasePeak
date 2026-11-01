"""Header and layout of the Teoria pages: the article does not move when the index is hidden (desktop), the gear and the other header icon buttons are icon-only with an accessible name, a
44 px target and a visible focus ring, previous / next live only in the header and show the number AND a good part of the title of the neighbour (no overflow at 390 / 784 / 1280 px), axe in light and dark.
Run: python3 tests_e2e/e2e_teoria_intestazione.py"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_intestazione.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:300]))
AXE = axe_path()
PAGE = "capitoli/12-frammentazione-esi.html"      # neighbours 11 «Dalla massa alla formula» and 13 «Risolvere uno spettro EI: il metodo»
r = Run(port=8979)
try:
    with sync_playwright() as p:
        r.page(p)
        T = f"http://127.0.0.1:{r.port}/static/"
        def ctx(w=1280, h=800, **k):
            c = r.b.new_context(viewport={"width": w, "height": h}, **k); q = c.new_page()
            q.on("pageerror", lambda e: r.errs.append(("pageerror", str(e)))); return c, q
        def go(q, f=PAGE):
            q.goto(T + f); q.wait_for_selector("#side a.on", state="attached"); q.wait_for_selector("#tbar"); q.wait_for_selector("#a11y-btn", state="attached")
        box = lambda q, s: q.locator(s).bounding_box()

        def article_fixed():
            for w in (1280, 1440, 1024, 900):
                c, q = ctx(w, 800); go(q)
                assert q.is_visible("#side")
                m1 = box(q, "main"); h1 = box(q, "main h1"); t1 = box(q, "#top")
                q.click("#tc-indice"); q.wait_for_selector("#side", state="hidden")
                m2 = box(q, "main"); h2 = box(q, "main h1"); t2 = box(q, "#top")
                assert abs(m1["x"] - m2["x"]) <= 1 and abs(m1["width"] - m2["width"]) <= 1, (w, m1, m2)
                assert abs(h1["x"] - h2["x"]) <= 1 and abs(h1["width"] - h2["width"]) <= 1, (w, h1, h2)
                assert abs(t1["x"] - t2["x"]) <= 1 and abs(t1["width"] - t2["width"]) <= 1, "the header bar must not move either"
                assert abs(m1["y"] - m2["y"]) <= 1, "no vertical jump (the text does not reflow)"
                q.click("#tc-indice"); q.wait_for_selector("#side", state="visible"); m3 = box(q, "main")
                assert abs(m3["x"] - m1["x"]) <= 1 and abs(m3["width"] - m1["width"]) <= 1, (w, m1, m3)
                c.close()
        step("the article keeps its left edge and width (and the header bar its place) when the index is hidden and shown again at 1280, 1440, 1024 and 900 px", article_fixed)
        def phone_unchanged():
            c, q = ctx(390, 844, is_mobile=True, has_touch=True); go(q)
            assert q.is_hidden("#side") and q.evaluate("document.documentElement.scrollWidth") <= 390
            q.click("#menu"); q.wait_for_selector("#side", state="visible"); c.close()
        step("phone: the index is still off-canvas and opens as a sheet", phone_unchanged)

        def gear():
            c, q = ctx(); go(q)
            for sel, name in (("#a11y-btn", "Impostazioni"), ("#tc-schermo", None)):
                if not q.query_selector(sel): continue
                txt = q.evaluate(f"(()=>{{const b=document.querySelector('{sel}');return [b.innerText.trim(),b.textContent.trim(),!!b.querySelector('svg'),b.getAttribute('aria-label'),b.title]}})()")
                assert txt[0] == "" and txt[1] == "" and txt[2] is True and txt[3] and txt[4], (sel, txt)      # no visible text, an icon, a name and a tooltip
                if name: assert txt[3] == name and txt[4] == name, txt
                b = box(q, sel); assert b["width"] >= 44 and b["height"] >= 44, (sel, b)
            q.focus("#a11y-btn"); q.keyboard.press("Tab"); q.keyboard.press("Shift+Tab")
            assert q.evaluate("document.activeElement.id") == "a11y-btn"
            assert q.evaluate("(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2})()"), "no visible focus ring on the gear"
            q.keyboard.press("Enter"); q.wait_for_selector("#a11y-panel", state="visible"); assert q.get_attribute("#a11y-btn", "aria-expanded") == "true"
            q.keyboard.press("Escape"); q.wait_for_selector("#a11y-panel", state="hidden")
            q.click("#a11y-btn"); q.wait_for_selector("#a11y-panel", state="visible")
            c.close()
        step("the gear is icon-only (no text, aria-label «Impostazioni» + tooltip), >= 44 px, visible focus ring, opens the settings by Enter and by click", gear)

        def no_body_buttons():
            for w, kw in ((1280, {}), (784, {"is_mobile": True, "has_touch": True}), (390, {"is_mobile": True, "has_touch": True})):
                c, q = ctx(w, 844, **kw); go(q)
                bad = q.evaluate("[...document.querySelectorAll('main a,main button,main nav')].filter(e=>/(Precedente|Successivo)/.test(e.textContent+(e.getAttribute('aria-label')||''))).map(e=>e.className||e.tagName)")
                assert bad == [] and q.locator("main .pn, main .pnt").count() == 0, (w, bad)
                c.close()
        step("no «Precedente» / «Successivo» buttons in the page body (top or bottom) at 1280, 784 and 390 px", no_body_buttons)
        def titles():
            c, q = ctx(); go(q)
            for sel, start, part in (("#tc-prec", "11", "Dalla massa"), ("#tc-succ", "13", "Risolvere uno spettro")):
                t = " ".join(q.inner_text(sel).split()); assert t.startswith(start) and part in t, (sel, t)
                lab = q.get_attribute(sel, "aria-label"); assert part in lab and q.get_attribute(sel, "title") == lab or part in q.get_attribute(sel, "title"), (sel, lab)
            c.close()
        step("header previous / next show the number and the title of the neighbour; the full title is in aria-label and title", titles)
        def visible_chars():
            # the chapter whose neighbour has the longest title: at 1280 px at least 24 characters of it are visible
            c, q = ctx(); go(q)
            best = q.evaluate("(()=>{let b=null,n=0;CHAPTERS.forEach((c,i)=>{[CHAPTERS[i-1],CHAPTERS[i+1]].forEach(x=>{if(x&&!x[4]&&x[2].length>n){n=x[2].length;b=[c[0],x[2]]}})});return b})()")
            c.close()
            for w in (1280, 1024):
                c, q = ctx(w, 800); go(q, best[0])
                tgt = q.evaluate("t=>{const e=[...document.querySelectorAll('#tbar .nb .lt')].find(x=>x.textContent===t);if(!e)return null;return [e.textContent.length,e.clientWidth,e.scrollWidth]}", best[1])
                assert tgt, (best, w)
                vis = tgt[0] if tgt[2] <= tgt[1] + 1 else int(tgt[0] * tgt[1] / tgt[2])
                assert vis >= 24, (w, best, tgt, vis)
                c.close()
        step("1280 and 1024 px: at least 24 characters of the longest neighbour title are visible (the other items shrink first)", visible_chars)
        def no_overflow():
            for w, kw in ((1280, {}), (1000, {}), (900, {}), (784, {"is_mobile": True, "has_touch": True}), (390, {"is_mobile": True, "has_touch": True})):
                for f in (PAGE, "capitoli/22-segnale.html", "index.html"):
                    c, q = ctx(w, 800, **kw); go(q, f)
                    d = q.evaluate("[document.documentElement.scrollWidth, document.querySelector('#top').scrollWidth, document.querySelector('#top').clientWidth, innerWidth]")
                    assert d[0] <= d[3] and d[1] <= d[2] + 1, (w, f, d)
                    h = q.evaluate("document.querySelector('#top').getBoundingClientRect().height"); assert h < 80, (w, f, h)
                    c.close()
        step("no horizontal overflow and one header row at 1280, 1000, 900, 784 and 390 px", no_overflow)
        def narrow_buttons():
            c, q = ctx(390, 844, is_mobile=True, has_touch=True); go(q)
            for sel in ("#cb-prec", "#cb-succ"):
                lab = q.get_attribute(sel, "aria-label"); assert lab and len(lab) > 14, (sel, lab)       # the sheet bar keeps the number; the full title is in the name
                b = box(q, sel); assert b["width"] >= 44 and b["height"] >= 44 and b["x"] + b["width"] <= 390, (sel, b)
            c.close()
        step("narrow screens: the arrows next to the index button keep the full title in their name, 44 px, inside the screen", narrow_buttons)
        def axe():
            if not AXE: print("SKIP axe (pip install axe-playwright-python)"); return
            for scheme in ("light", "dark"):
                for w, kw in ((1280, {}), (390, {"is_mobile": True, "has_touch": True})):
                    c, q = ctx(w, 844, color_scheme=scheme, **kw); go(q); q.add_script_tag(path=AXE)
                    v = q.evaluate("axe.run('#top, #cbar',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}).then(r=>r.violations.filter(v=>['serious','critical','moderate'].includes(v.impact)).map(v=>[v.id,v.nodes[0].html.slice(0,120)]))")
                    assert not v, (scheme, w, v)
                    c.close()
        step("axe (names, contrast, target size) on the header bar in light and dark, desktop and phone", axe)
finally:
    r.close()
r.report()
for s in steps: print(" ", s)
bad = [s for s in steps if s[1] != "ok"]
sys.exit(1 if bad else 0)
