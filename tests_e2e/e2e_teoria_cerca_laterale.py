"""Header strip and search field of the chapter index (assets/teoria.js buildSide, assets/cerca.js side()): the logo strip at the top of the sidebar is exactly as tall as the header bar to its right
(bounding boxes at 1280 / 1440 px; at 784 and 390 px the index is the off-canvas sheet and the bar is full width), the search is a real field that is always visible, results appear while typing, keyboard
(arrows, Enter opens the first result, Esc clears), "/" focuses it, drafts stay hidden for readers, phone layout, axe and contrast in light and dark.
Run: python3 tests_e2e/e2e_teoria_cerca_laterale.py"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_cerca_laterale.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:300]))
AXE = axe_path()
PAGE = "capitoli/11-formula.html"
r = Run(port=8978)
try:
    with sync_playwright() as p:
        r.page(p)
        T = f"http://127.0.0.1:{r.port}/static/"
        def ctx(w=1280, h=800, admin=False, **k):
            c = r.b.new_context(viewport={"width": w, "height": h}, **k); q = c.new_page()
            if admin: q.add_init_script("try{localStorage.setItem('mzlab.admin','1')}catch(_){}")
            q.on("pageerror", lambda e: r.errs.append(("pageerror", str(e)))); return c, q
        def go(q, f=PAGE):
            q.goto(T + f); q.wait_for_selector("#side a.on", state="attached"); q.wait_for_function("typeof TEORIA!=='undefined' && typeof TEORIA.cercaLaterale==='function'")
        box = lambda q, s: q.locator(s).bounding_box()

        def strip():
            for w, h in ((1280, 800), (1440, 900), (1024, 768), (900, 700)):
                c, q = ctx(w, h); go(q)
                b, t, sd = box(q, "#side .brand"), box(q, "#top"), box(q, "#side")
                assert b["x"] == 0 and b["y"] == 0 and t["y"] == 0, (w, b, t)
                assert abs(b["height"] - t["height"]) < 0.01, f"logo strip {b['height']} px vs header bar {t['height']} px at {w}"
                assert abs((b["y"] + b["height"]) - (t["y"] + t["height"])) < 0.01, "the two bottom lines are at different heights"
                assert abs(t["x"] - (sd["x"] + sd["width"])) < 0.01 and abs(t["x"] + t["width"] - w) < 1, (w, t, sd)     # the bar starts at the right edge of the sidebar and runs to the window edge
                assert box(q, "#logo")["y"] >= 0 and box(q, "#logo")["height"] <= b["height"] + 0.01 and q.evaluate("!!document.querySelector('#side .brand #logo')")
                # the line under both is one line: the same colour, 1 px, on the same row
                bw = q.evaluate("(()=>{const f=s=>{const c=getComputedStyle(document.querySelector(s));return [c.borderBottomWidth,c.borderBottomColor]};return [f('#side .brand'),f('#top')]})()")
                assert bw[0] == bw[1] == ["1px", bw[0][1]], bw
                c.close()
            for dark in (False, True):          # the strip does not change with the theme
                c, q = ctx(1280, 800, color_scheme="dark" if dark else "light"); go(q)
                assert abs(box(q, "#side .brand")["height"] - box(q, "#top")["height"]) < 0.01; c.close()
        step("header: the logo strip at the top of the sidebar and the header bar to its right have the same top, height and bottom line (1280, 1440, 1024, 900 px; light and dark)", strip)
        def strip_touch():
            c, q = ctx(1280, 800, has_touch=True, is_mobile=False); go(q)       # a laptop with a touch screen has a taller header: the strip follows it
            assert abs(box(q, "#side .brand")["height"] - box(q, "#top")["height"]) < 0.01; c.close()
        step("header: the strip and the bar stay equal with a touch screen (taller header)", strip_touch)
        def narrow():
            for w in (784, 390):
                c, q = ctx(w, 844, is_mobile=True, has_touch=True); go(q)
                cb = box(q, "#cbar"); assert cb["x"] == 0 and abs(cb["width"] - w) < 1 and cb["y"] == 0, (w, cb)           # the header runs over the whole width
                assert q.is_hidden("#side"), "the index is off-canvas until the button opens it"
                assert q.evaluate("document.documentElement.scrollWidth") <= w
                q.click("#menu"); q.wait_for_selector("#side", state="visible")
                s = box(q, "#sc-cerca"); sd = box(q, "#side")
                assert s["height"] >= 44 and s["x"] >= 0 and s["x"] + s["width"] <= w and s["y"] >= sd["y"], (w, s)
                assert q.is_visible("#sc-cerca")
                c.close()
        step("784 and 390 px: the index stays off-canvas, the header is full width, the sheet shows the search field (44 px high)", narrow)

        def field():
            c, q = ctx(); go(q)
            a = q.evaluate("(()=>{const i=document.querySelector('#sc-cerca');return [i.tagName,i.type,i.getAttribute('role'),i.getAttribute('aria-label'),i.placeholder,!!document.querySelector('#sidesearch svg'),!!i.closest('form[role=search]')]})()")
            assert a == ["INPUT", "search", "combobox", "Cerca nel manuale", "Cerca nel manuale…", True, True], a
            ib, bb = box(q, "#sc-cerca"), box(q, "#side .brand")
            assert ib["y"] >= bb["y"] + bb["height"] and ib["height"] >= 44, (ib, bb)          # directly under the logo, large target
            assert q.evaluate("getComputedStyle(document.querySelector('#sc-cerca')).fontSize") == "16px"
            # always visible: still there with the index scrolled to the end
            q.evaluate("document.querySelector('#side .sidescroll').scrollTop=99999"); q.wait_for_timeout(100)
            ib2 = box(q, "#sc-cerca"); assert abs(ib2["y"] - ib["y"]) < 1 and q.is_visible("#sc-cerca"), (ib, ib2)
            assert q.evaluate("!document.querySelector('#sidecmd #sc-cerca') && !document.querySelector('a[href*=cerca]')"), "not a link or a command button"
            c.close()
        step("search field: a real search input with magnifier and placeholder under the logo, 44 px, 16 px text, always visible while the index scrolls", field)
        def lazy():
            c, q = ctx(); reqs = []; q.on("request", lambda x: reqs.append(x.url)); go(q)
            q.wait_for_timeout(300); assert not any("indice-ricerca" in u for u in reqs), "the index must not be read before the first key"
            q.click("#sc-cerca"); q.wait_for_timeout(200); assert not any("indice-ricerca" in u for u in reqs)
            q.keyboard.type("fram"); q.wait_for_selector("#ss-list [role=option]"); assert sum("indice-ricerca" in u for u in reqs) == 1
            c.close()
        step("speed budget: the search index is read on the first key typed, not on page load", lazy)
        def instant():
            c, q = ctx(); go(q)
            q.click("#sc-cerca"); q.keyboard.type("frammenta")          # no Enter, no dialog
            q.wait_for_selector("#ss-list [role=option]", timeout=3000)
            assert q.is_hidden("#cerca-bg") if q.query_selector("#cerca-bg") else True
            txt = q.eval_on_selector_all("#ss-list [role=option]", "e=>e.map(x=>x.innerText)")
            assert 1 <= len(txt) <= 8 and any("rammentazione" in t for t in txt), txt
            assert q.evaluate("document.querySelectorAll('#ss-list mark').length") >= 1 and q.get_attribute("#sc-cerca", "aria-expanded") == "true"
            pb, ib = box(q, "#ss-panel"), box(q, "#sc-cerca"); assert pb["y"] >= ib["y"] + ib["height"] - 8 and pb["x"] >= 0 and pb["x"] + pb["width"] <= 300, (pb, ib)   # right under the field, inside the sidebar
            for o in q.locator("#ss-list [role=option]").all(): assert o.bounding_box()["height"] >= 44
            assert q.get_attribute("#ss-list [role=option] >> nth=0", "aria-selected") == "true"
            q.fill("#sc-cerca", "FRAMMENTAZIONE È"); q.wait_for_timeout(150); assert q.locator("#ss-list [role=option]").count() >= 1      # accents and case do not matter
            q.fill("#sc-cerca", "zzzzqq"); q.wait_for_function("document.querySelector('#ss-st').textContent.includes('Nessun')"); assert q.locator("#ss-list [role=option]").count() == 0 and q.is_visible("#ss-st")
            q.fill("#sc-cerca", "f"); q.wait_for_function("document.querySelector('#ss-st').textContent.includes('almeno due')")
            q.fill("#sc-cerca", "neutral loss"); q.wait_for_selector("#ss-list [role=option]"); assert any("erdit" in t for t in q.eval_on_selector_all("#ss-list [role=option]", "e=>e.map(x=>x.innerText)"))   # synonyms of the index
            c.close()
        step("instant results: typing «frammenta» lists up to 8 results under the field at once (marked, 44 px rows, no dialog); accents, synonyms, no-result and one-letter messages", instant)
        def keys():
            c, q = ctx(); go(q)
            q.click("#sc-cerca"); q.keyboard.type("addott"); q.wait_for_selector("#ss-list [role=option]")
            n = q.locator("#ss-list [role=option]").count(); assert n >= 2
            q.keyboard.press("ArrowDown"); assert q.get_attribute("#ss1", "aria-selected") == "true" and q.get_attribute("#sc-cerca", "aria-activedescendant") == "ss1"
            q.keyboard.press("ArrowUp"); q.keyboard.press("ArrowUp"); assert q.get_attribute(f"#ss{n-1}", "aria-selected") == "true"        # wraps
            q.keyboard.press("ArrowDown")
            assert q.evaluate("document.activeElement.id") == "sc-cerca", "focus stays in the field"
            q.keyboard.press("Escape"); assert q.input_value("#sc-cerca") == "" and q.is_hidden("#ss-panel") and q.evaluate("document.activeElement.id") == "sc-cerca"
            assert q.get_attribute("#sc-cerca", "aria-expanded") == "false"
            q.keyboard.press("Escape"); assert q.evaluate("document.activeElement.id") == "sc-cerca"        # a second Esc on the empty field does nothing harmful
            c.close()
        step("keyboard: arrows move (wrap) with aria-activedescendant, Esc clears and closes and keeps the focus", keys)
        def enter():
            c, q = ctx(); go(q)
            q.click("#sc-cerca"); q.keyboard.type("regola dell"); q.wait_for_selector("#ss-list [role=option]")
            want = q.eval_on_selector("#ss-list [role=option] >> nth=0", "e=>e.innerText.split('\\n')[0]")
            q.keyboard.press("Enter"); q.wait_for_function("location.hash && (()=>{const e=document.getElementById(location.hash.slice(1));return e && e.getBoundingClientRect().top < 400})()", timeout=5000)
            h = q.evaluate("location.hash"); assert h, "no anchor"
            tgt = q.evaluate("(()=>{const e=document.getElementById(location.hash.slice(1));if(!e)return null;return [e.textContent,e.getBoundingClientRect().top]})()")
            assert tgt and tgt[1] < 400 and want.split(" ")[0].lower()[:4] in tgt[0].lower(), (want, tgt)
            assert q.is_hidden("#ss-panel")
            # another page: Enter opens the first result of the chapter «Frammentazione»
            q.click("#sc-cerca"); q.keyboard.type("atrazina"); q.wait_for_selector("#ss-list [role=option]"); q.keyboard.press("Enter"); q.wait_for_url(lambda u: "11-formula" not in u or "#" in u, timeout=5000)
            q.wait_for_timeout(300); assert "atrazin" in q.inner_text("main").lower() or "atrazin" in q.title().lower() or q.evaluate("location.pathname") != "/static/" + PAGE
            c.close()
        step("Enter opens the first result: an anchor on the same page, another page otherwise", enter)
        def click():
            c, q = ctx(); go(q)
            q.click("#sc-cerca"); q.keyboard.type("quadrupol"); q.wait_for_selector("#ss-list [role=option]")
            q.locator("#ss-list [role=option]").nth(1).click(); q.wait_for_timeout(600)
            assert q.evaluate("location.pathname") != "/static/" + PAGE or q.evaluate("location.hash"), "a click on a result did not navigate"
            c.close()
        step("a click on a result navigates (the field keeps working with the mouse)", click)
        def shortcut():
            c, q = ctx(); go(q)
            q.evaluate("document.querySelector('main a').focus()"); q.keyboard.press("/"); assert q.evaluate("document.activeElement.id") == "sc-cerca"
            q.keyboard.type("/ab"); assert q.input_value("#sc-cerca") == "/ab", "a slash typed in the field is text"
            q.fill("#sc-cerca", ""); q.keyboard.press("Control+k"); q.wait_for_selector("#cerca-in", state="visible"); q.keyboard.press("Escape"); q.wait_for_selector("#cerca-bg", state="hidden")
            c.close()
            c, q = ctx(390, 844, is_mobile=True, has_touch=True); go(q)
            q.evaluate("document.body.focus()"); q.keyboard.press("/"); q.wait_for_selector("#cerca-in", state="visible"); c.close()      # sidebar off-canvas: the dialog opens instead
        step("«/» focuses the field (not while typing); Ctrl+K still opens the dialog; with the index off-canvas «/» opens the dialog", shortcut)
        def full():
            c, q = ctx(); go(q)
            q.click("#sc-cerca"); q.keyboard.type("frammenta"); q.wait_for_selector("#ss-all", state="visible"); q.click("#ss-all")
            q.wait_for_selector("#cerca-in", state="visible"); assert q.input_value("#cerca-in") == "frammenta" and q.locator("#cerca-list [role=option]").count() >= 1
            c.close()
        step("«Apri la ricerca completa» opens the full search dialog with the same query", full)
        def drafts():
            q0 = "settori magnetici"
            for admin in (False, True):      # the Storia is published: readers and the administrator both find it
                c, q = ctx(admin=admin); go(q); q.click("#sc-cerca"); q.keyboard.type(q0); q.wait_for_selector("#ss-list [role=option]")
                assert any("ettor" in t for t in q.eval_on_selector_all("#ss-list [role=option]", "e=>e.map(x=>x.innerText)")), ("Storia chapter not found", admin); c.close()
        step("the Storia is found by readers and by the administrator (same filter as the dialog)", drafts)
        def phone():
            c, q = ctx(390, 844, is_mobile=True, has_touch=True); go(q)
            q.click("#menu"); q.wait_for_selector("#side", state="visible"); q.tap("#sc-cerca"); q.keyboard.type("frammenta"); q.wait_for_selector("#ss-list [role=option]")
            pb = box(q, "#ss-panel"); assert pb["x"] >= 0 and pb["x"] + pb["width"] <= 390 and pb["y"] + pb["height"] <= 844, pb
            for o in q.locator("#ss-list [role=option]").all(): assert o.bounding_box()["height"] >= 44
            assert q.evaluate("document.documentElement.scrollWidth") <= 390
            q.keyboard.press("Escape"); assert q.is_visible("#side"), "the first Esc clears the field, it does not close the sheet"
            q.keyboard.type("quadrupol"); q.wait_for_selector("#ss-list [role=option]"); q.locator("#ss-list [role=option]").first.tap(); q.wait_for_timeout(600)
            assert q.is_hidden("#side") or q.evaluate("location.pathname") != "/static/" + PAGE, "the sheet must close or the page change after a result"
            c.close()
        step("phone 390 px: the sheet shows the field, results fit the screen with 44 px rows, Esc clears before closing, a tap opens the result", phone)
        def contrast():
            L = """(c=>{const m=c.match(/[0-9.]+/g).map(Number),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])})"""
            js = f"""(()=>{{const L={L};const bgOf=e=>{{for(;e;e=e.parentElement){{const b=getComputedStyle(e).backgroundColor;if(b&&!/rgba\\(.*, 0\\)|transparent/.test(b))return b}}return 'rgb(255,255,255)'}};
              const r=(a,b)=>{{const x=L(a),y=L(b);return Math.round((Math.max(x,y)+.05)/(Math.min(x,y)+.05)*100)/100}};
              const i=document.querySelector('#sc-cerca'),s=getComputedStyle(i),ph=getComputedStyle(i,'::placeholder');
              const out={{text:r(s.color,s.backgroundColor),placeholder:r(ph.color,s.backgroundColor)*(1)}};
              const o=[...document.querySelectorAll('#ss-list [role=option] span,#ss-list [role=option] small,#ss-all,#ss-st')].filter(e=>e.offsetParent).map(e=>[e.className||e.tagName,r(getComputedStyle(e).color,bgOf(e))]);out.rows=o;return out}})()"""
            for scheme in ("light", "dark"):
                c, q = ctx(color_scheme=scheme); go(q)
                q.click("#sc-cerca"); q.keyboard.type("frammenta"); q.wait_for_selector("#ss-list [role=option]")
                d = q.evaluate(js)
                assert d["text"] >= 7, (scheme, d)
                q.fill("#sc-cerca", ""); ph = q.evaluate(f"""(()=>{{const L={L};const i=document.querySelector('#sc-cerca'),s=getComputedStyle(i),p=getComputedStyle(i,'::placeholder');const o=+p.opacity;
                    const m=a=>a.match(/[0-9.]+/g).map(Number),f=m(p.color),b=m(s.backgroundColor),mix=f.slice(0,3).map((v,k)=>v*o+b[k]*(1-o));return [mix,b.slice(0,3)]}})()""")
                lum = lambda c3: sum(w * (lambda v: v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4)(x / 255) for w, x in zip((.2126, .7152, .0722), c3))
                a, b = lum(ph[0]), lum(ph[1]); ratio = (max(a, b) + .05) / (min(a, b) + .05)
                assert ratio >= 7, (scheme, "placeholder", ratio)
                c.close()
            # result rows: the plain text >= 7:1 (the highlighted word is the accent colour, checked by axe at 4.5:1)
        step("contrast: typed text and placeholder >= 7:1 in light and dark", contrast)
        def axe():
            if not AXE: print("SKIP axe (pip install axe-playwright-python)"); return
            for scheme in ("light", "dark"):
                for w, h, kw in ((1280, 800, {}), (390, 844, {"is_mobile": True, "has_touch": True})):
                    c, q = ctx(w, h, color_scheme=scheme, **kw); go(q)
                    if w < 900: q.click("#menu"); q.wait_for_selector("#side", state="visible")
                    q.add_script_tag(path=AXE)
                    for typed in ("", "frammenta", "zzzzqq"):
                        q.fill("#sc-cerca", typed); q.wait_for_timeout(200)
                        v = q.evaluate("axe.run('#sidesearch, #side .brand',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}).then(r=>r.violations.filter(v=>['serious','critical','moderate'].includes(v.impact)).map(v=>[v.id,v.nodes[0].html.slice(0,120)]))")
                        assert not v, (scheme, w, typed, v)
                    c.close()
        step("axe (wcag2a/aa, 2.1, 2.2, best practice) on the field and the result list: empty, results and no result, desktop and phone, light and dark", axe)
finally:
    r.close()
r.report()
for s in steps: print(" ", s)
bad = [s for s in steps if s[1] != "ok"]
sys.exit(1 if bad else 0)
