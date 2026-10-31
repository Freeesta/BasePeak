"""Navigation of the handbook (menu in three parts, 3-level index, scroll-spy, drawer on a phone, anchors on headings, breadcrumb, previous / next, keyboard, axe,
contrast >= 7:1 in every theme, WCAG 1.4.12 text spacing, reduced motion, file://). Run: python3 tests_e2e/e2e_teoria_indice.py"""
import sys, os, re, pathlib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_indice.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:300]))
AXE = axe_path()
SAMPLES = ["capitoli/07-quadrupolo.html", "pratica/ei.html", "capitoli/20-formulario.html"]   # a Teoria chapter, a Pratica page, a Reference page
LONG = "capitoli/07-quadrupolo.html"
r = Run(port=8975)
try:
    with sync_playwright() as p:
        r.page(p)
        T = f"http://127.0.0.1:{r.port}/static/"
        ADMIN_ON = "try{localStorage.setItem('mzlab.admin','1')}catch(_){}"      # administrator mode: unfinished chapters (part VII) are listed
        def ctx(w=1280, h=800, admin=False, **k):
            c = r.b.new_context(viewport={"width": w, "height": h}, **k); q = c.new_page()
            if admin: q.add_init_script(ADMIN_ON)
            q.on("pageerror", lambda e: r.errs.append(("pageerror", str(e)))); return c, q
        def go(q, f):
            q.goto(T + f); q.wait_for_selector("#side a.on"); q.wait_for_selector("main .ha")
        def contrast_js():
            return """(()=>{const L=c=>{const m=c.match(/[0-9.]+/g).map(Number),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
              const bgOf=e=>{for(;e;e=e.parentElement){const b=getComputedStyle(e).backgroundColor;if(b&&!/rgba\\(.*, 0\\)|transparent/.test(b))return b}return getComputedStyle(document.documentElement).backgroundColor};
              const out=[];document.querySelectorAll('#side a, #side h4, #side li.part, .crumbs a, .crumbs [aria-current], .pnt a').forEach(e=>{if(!e.offsetParent)return;
                const a=L(getComputedStyle(e).color),b=L(bgOf(e)),hi=Math.max(a,b),lo=Math.min(a,b);out.push([e.textContent.trim().slice(0,25),Math.round((hi+.05)/(lo+.05)*100)/100])});
              return out})()"""

        def sidebar():
            c, q = ctx()
            for f in SAMPLES:
                go(q, f)
                assert q.is_visible("#side"), f
                parts = q.eval_on_selector_all("#side h4", "e=>e.map(x=>x.textContent)"); assert parts == ["Teoria", "Pratica", "Reference"], parts
                cur = q.eval_on_selector_all("#side a[aria-current=page]", "e=>e.map(x=>x.getAttribute('href'))"); assert len(cur) == 1 and cur[0].endswith(f), (f, cur)
                assert q.evaluate("document.querySelector('#side a[aria-current=page]').closest('section.grp').querySelector('h4').textContent") == {"c": "Teoria", "p": "Pratica", "r": "Reference"}[
                    "c" if f.startswith("capitoli/07") else "p" if f.startswith("pratica") else "r"], f
                # the other chapters list only their title (no nested list)
                assert q.evaluate("[...document.querySelectorAll('#side li')].filter(l=>l.querySelector(':scope>ol.toc')&&!l.querySelector(':scope>a[aria-current=page]')).length") == 0
            c.close()
        step("sidebar with Teoria / Pratica / Reference and aria-current on the current chapter (3 pages)", sidebar)
        def nesting():
            c, q = ctx(); go(q, LONG)
            d = q.evaluate("""(()=>{const lv=a=>{let n=0;for(let e=a.parentElement;e&&e.id!=='side';e=e.parentElement)if(e.tagName==='OL')n++;return n};
                const cur=document.querySelector('#side a[aria-current=page]'),l1=lv(cur),sub=[...document.querySelectorAll('#side ol.toc a')];
                const h2=sub.filter(a=>lv(a)===l1+1),h3=sub.filter(a=>lv(a)===l1+2);return [h2.length,h3.length,cur.parentElement.querySelector(':scope>ol.toc')!==null]})()""")
            assert d[2] and d[0] >= 3 and d[1] >= 1, d
            # every entry points to an existing heading of the page, in page order
            hrefs = q.eval_on_selector_all("#side ol.toc a", "e=>e.map(a=>a.getAttribute('href'))")
            ids = q.eval_on_selector_all("main h2[id], main h3[id]", "e=>e.map(h=>'#'+h.id)")
            assert hrefs and all(h in ids for h in hrefs) and [i for i in ids if i in hrefs] == hrefs, (hrefs[:4], ids[:4])
            c.close()
        step("3 levels: chapter > h2 > h3 built from the page headings", nesting)
        def spy():
            c, q = ctx(); go(q, LONG)
            heads = q.eval_on_selector_all("#side ol.toc a", "e=>e.map(a=>a.getAttribute('href').slice(1))")
            seen = []
            for h in (heads[1], heads[len(heads) // 2], heads[-1]):
                q.evaluate("id=>{document.documentElement.style.scrollBehavior='auto';document.getElementById(id).scrollIntoView()}", h)
                q.wait_for_function("id=>{const a=document.querySelector('#side a[aria-current=location]');return a&&a.getAttribute('href')==='#'+id}", arg=h, timeout=5000)
                seen.append(h)
                assert q.evaluate("document.querySelectorAll('#side a[aria-current=location]').length") == 1
                assert q.evaluate("(()=>{const a=document.querySelector('#side a[aria-current=location]').getBoundingClientRect(),s=document.querySelector('#side').getBoundingClientRect();return a.top>=s.top-1&&a.bottom<=s.bottom+1})()"), "current section not scrolled into view in the menu"
            assert len(set(seen)) == 3
            q.evaluate("scrollTo(0,0)"); q.wait_for_function("!document.querySelector('#side a[aria-current=location]')", timeout=5000)
            c.close()
        step("scroll-spy: aria-current=location follows the scroll and is kept visible in the menu", spy)
        def anchors():
            c, q = ctx(); go(q, LONG)
            n = q.evaluate("[...document.querySelectorAll('main h2,main h3,main h4')].filter(h=>!h.querySelector(':scope>a.ha[aria-label=\"Link a questa sezione\"]')||h.querySelector('.ha').getAttribute('href')!=='#'+h.id||!h.id).length")
            assert n == 0, f"{n} headings without a working anchor"
            # ids already written in the page are kept
            src = q.request.get(T + LONG).text()
            for m in re.finditer(r'<h([234])[^>]*\sid="([^"]+)"', src): assert q.query_selector("#" + m.group(2)), m.group(2)
            ids = q.eval_on_selector_all("main [id]", "e=>e.map(x=>x.id)"); assert len(ids) == len(set(ids)), "duplicate ids"
            h = q.locator("main h2").nth(3); h.scroll_into_view_if_needed()
            a = h.locator(".ha"); assert q.evaluate("e=>getComputedStyle(e).opacity", a.element_handle()) == "0"
            h.hover(); assert q.evaluate("e=>getComputedStyle(e).opacity", a.element_handle()) == "1", "not shown on hover"
            q.mouse.move(0, 0); a.focus(); assert q.evaluate("e=>getComputedStyle(e).opacity", a.element_handle()) == "1", "not shown on focus"
            hid = h.get_attribute("id"); q.evaluate("scrollTo(0,0)")
            q.evaluate("id=>{document.getElementById(id).querySelector('.ha').click()}", hid)
            q.wait_for_function("id=>location.hash==='#'+id&&Math.abs(document.getElementById(id).getBoundingClientRect().top)<200", arg=hid, timeout=5000)
            c.close()
        step("anchors on every h2/h3/h4: kept ids, hover and focus show them, the hash link scrolls to the heading", anchors)
        def ids_stable():
            c, q = ctx(); go(q, LONG); a = q.eval_on_selector_all("main h2,main h3,main h4", "e=>e.map(h=>h.id)")
            q.reload(); q.wait_for_selector("main .ha"); b = q.eval_on_selector_all("main h2,main h3,main h4", "e=>e.map(h=>h.id)")
            assert a == b and all(a), "generated ids change between loads"; c.close()
        step("generated ids are stable between loads", ids_stable)
        def breadcrumb():
            c, q = ctx(); go(q, LONG)
            items = lambda: q.eval_on_selector_all(".crumbs li", "e=>e.map(x=>x.textContent.trim())")
            assert items() == ["BasePeak", "Teoria", "7. Il quadrupolo: teoria"], items()
            assert q.get_attribute(".crumbs [aria-current=page]", "class") is None and q.locator(".crumbs a").count() == 2
            go(q, "pratica/ei.html"); assert items()[1] == "Pratica", items()
            go(q, "capitoli/21-tempi.html"); assert items()[1] == "Reference", items()
            c.close()
        step("breadcrumb BasePeak > part > chapter", breadcrumb)
        def prevnext(admin):
            c, q = ctx(admin=admin); q.goto(T + "index.html"); q.wait_for_selector("#side")
            last = "capitoli/32-esempio.html" if admin else "capitoli/21-tempi.html"      # reader: part VII is absent, the Reference pages end the path
            order = q.evaluate("CHAPTERS.map(c=>c[0])"); assert order[0] == "index.html" and order[-1] == last, (admin, order[0], order[-1])
            groups = [("Teoria" if not f.startswith("pratica") and not re.search(r"/(19|20|21)-", f) else "Pratica" if f.startswith("pratica") else "Reference") for f in order]
            part7 = [f for f in order if re.search(r"capitoli/(2[2-9]|3[0-2])-", f)]      # part VII (22-32) is in the Teoria group but must follow row 21 (numbers run 1..32 in array order)
            assert len(part7) == (11 if admin else 0), (admin, part7)
            if admin:
                assert order[-len(part7):] == part7, "part VII is not the last block"
                assert order[order.index("capitoli/21-tempi.html") + 1] == "capitoli/22-segnale.html", "21 is not followed by 22"
                groups = groups[:-len(part7)]
            assert groups == sorted(groups, key={"Teoria": 0, "Pratica": 1, "Reference": 2}.get), "order is not Teoria > Pratica > Reference"
            for i, f in enumerate(order):
                q.goto(T + f); q.wait_for_selector("main .pn")
                for sel in (".pn", ".pnt"):
                    prev = q.eval_on_selector_all(f"main {sel} a[rel=prev]", "e=>e.map(a=>a.getAttribute('href'))"); nxt = q.eval_on_selector_all(f"main {sel} a[rel=next]", "e=>e.map(a=>a.getAttribute('href'))")
                    up = "../" * f.count("/")
                    assert prev == ([up + order[i - 1]] if i else []), (f, sel, prev)
                    assert nxt == ([up + order[i + 1]] if i < len(order) - 1 else []), (f, sel, nxt)
                for href in prev + nxt: assert q.request.get(q.evaluate("h=>new URL(h,location.href).href", href)).ok, (f, href)
            c.close()
        step("previous / next (top and bottom) resolve on every page; first has no previous, last no next (reader mode: last is 21)", lambda: prevnext(False))
        step("previous / next in administrator mode: 21 -> 22 ... 32 last", lambda: prevnext(True))
        def drafts():
            F = re.findall(r'"capitoli/((?:2[2-9]|3[0-2])-[^"]+\.html)", "\d+", "[^"]+", "VII\. Chemioinformatica"', (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")); assert len(F) == 11, F
            for admin in (False, True):
                c, q = ctx(admin=admin); q.goto(T + "index.html"); q.wait_for_selector("#side"); q.wait_for_selector("main h3")
                heads = q.eval_on_selector_all("main h3", "e=>e.map(h=>h.textContent.trim())"); cards = q.eval_on_selector_all("main .cards a", "e=>e.map(a=>a.getAttribute('href'))")
                menu = q.eval_on_selector_all("#side a", "e=>e.map(a=>a.getAttribute('href'))"); intro = q.inner_text("main p:has-text('parti di teoria')")
                has = lambda L: [h for h in L if re.search(r"(2[2-9]|3[0-2])-", h)]
                assert ("VII. Chemioinformatica" in heads) == admin and bool(has(cards)) == admin and bool(has(menu)) == admin, (admin, heads, has(cards), has(menu))
                assert intro.startswith("Sei parti" if admin else "Cinque parti"), (admin, intro)
                q.keyboard.press("Control+k"); q.wait_for_selector("#cerca-in", state="visible"); q.fill("#cerca-in", "centroide")
                q.wait_for_function("document.querySelector('#cerca-st').textContent.trim().length > 0")
                found = q.inner_text("#cerca-list")
                assert ("Cap. 22" in found) == admin and (not admin or "ntroide" in found), (admin, found[:200])
                q.keyboard.press("Escape")
                q.goto(T + "capitoli/19-glossario.html"); q.wait_for_selector("#side a.on")
                links = q.eval_on_selector_all("main dd a", "e=>e.map(a=>a.getAttribute('href'))")
                assert bool(has(links)) == admin, (admin, has(links)[:3])
                q.goto(T + "capitoli/01-cromatografia.html"); q.wait_for_selector("#side a.on")
                if not admin:
                    q.goto(T + "capitoli/22-segnale.html"); q.wait_for_selector("#bozza-avviso")
                    assert q.inner_text("#bozza-avviso h1") == "Questa pagina non è ancora pubblicata" and q.get_attribute("#bozza-avviso a", "href") == "../index.html"
                    assert q.locator("main .kicker, #side").count() == 0, "the chapter must not be shown to a reader"
                else:
                    q.goto(T + "capitoli/22-segnale.html"); q.wait_for_selector("#side a.on"); assert q.locator("#bozza-avviso").count() == 0
                c.close()
        step("draft chapters: absent for readers (home cards, heading count, menu, search, glossary links, direct URL notice), present in administrator mode", drafts)

        def drawer():
            c, q = ctx(390, 844, is_mobile=True, has_touch=True)
            q.goto(T + LONG); q.wait_for_selector("#menu"); q.wait_for_selector("main .ha", state="attached")
            assert q.is_visible("#menu") and q.inner_text("#menu").startswith("Indice"), q.inner_text("#menu")
            assert q.is_hidden("#side")
            q.keyboard.press("Tab"); assert q.evaluate("document.activeElement.className") == "skip", "skip link is not the first focusable on a phone"
            q.evaluate("document.activeElement.blur()")           # the skip link covers the button while it has the focus
            q.click("#menu"); q.wait_for_selector("#side", state="visible")
            assert q.get_attribute("#side", "role") == "dialog" and q.get_attribute("#side", "aria-modal") == "true" and q.get_attribute("#menu", "aria-expanded") == "true"
            assert q.evaluate("document.activeElement.closest('#side')!==null")
            for _ in range(70):
                q.keyboard.press("Tab"); assert q.evaluate("document.activeElement.closest('#side')!==null"), "focus left the drawer"
            for _ in range(70):
                q.keyboard.press("Shift+Tab"); assert q.evaluate("document.activeElement.closest('#side')!==null"), "focus left the drawer (backwards)"
            assert q.locator("#side ol.toc ol a").count() >= 1 and q.locator("#side h4").count() == 3
            q.keyboard.press("Escape"); assert q.is_hidden("#side") and q.get_attribute("#menu", "aria-expanded") == "false"
            assert q.evaluate("document.activeElement.id") == "menu", "focus not returned"
            assert q.evaluate("document.documentElement.scrollWidth") <= 390
            c.close()
        step("phone 390 px: button «Indice», drawer opens, traps focus, Esc closes and returns focus", drawer)
        def width_edge():
            c, q = ctx(899, 800); q.goto(T + LONG); q.wait_for_selector("#menu"); assert q.is_visible("#menu") and q.is_hidden("#side")
            q.set_viewport_size({"width": 900, "height": 800}); q.wait_for_timeout(200); assert q.is_visible("#side") and q.is_hidden("#cbar"); c.close()
        step("drawer below 900 px, fixed sidebar from 900 px", width_edge)
        def keyboard():
            c, q = ctx(); q.goto(T + LONG); q.wait_for_selector("main .ha")
            q.keyboard.press("Tab"); assert q.evaluate("document.activeElement.className+'|'+document.activeElement.textContent") == "skip|Salta al contenuto"
            q.keyboard.press("Enter"); assert q.evaluate("document.activeElement.tagName") == "MAIN"
            q.evaluate("document.activeElement.blur(); scrollTo(0,0)"); q.keyboard.press("Tab")        # back to the start: the menu is reached with Tab
            hit = None
            for _ in range(120):
                q.keyboard.press("Tab")
                if q.evaluate("document.activeElement.matches('#side ol.toc a')"): hit = q.evaluate("document.activeElement.getAttribute('href')"); break
            assert hit, "a section of the menu is not reachable with Tab"
            assert q.evaluate("(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2})()"), "no visible focus"
            q.keyboard.press("Enter"); q.wait_for_function("h=>location.hash===h&&document.querySelector(h).getBoundingClientRect().top<300", arg=hit, timeout=5000)
            # Tab from a heading's anchor: visible
            q.evaluate("id=>document.querySelector(id+' .ha').focus()", hit); assert q.evaluate("getComputedStyle(document.activeElement).opacity") == "1"
            c.close()
        step("keyboard only: skip link first, menu sections reachable, Enter jumps, anchor visible on focus", keyboard)
        def contrast():
            c, q = ctx(); go(q, LONG)
            for theme in ("light", "dark"):
                for bg in ("", "cream", "blue", "hc"):
                    q.evaluate("([t,b])=>{const d=document.documentElement;d.setAttribute('data-theme',t);if(b)d.setAttribute('data-a11y-bg',b);else d.removeAttribute('data-a11y-bg')}", [theme, bg])
                    q.wait_for_timeout(80); k = q.evaluate(contrast_js()); assert k and min(x[1] for x in k) >= 7, (theme, bg, sorted(k, key=lambda x: x[1])[:3])
            c.close()
        step("contrast >= 7:1 in the menu, breadcrumb and previous/next, light and dark, every background", contrast)
        def spacing():
            css = "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}"
            bad = "(()=>{const s=document.querySelector('#side'),o=[];if(s.scrollWidth>s.clientWidth+1)o.push('side h-scroll');s.querySelectorAll('*').forEach(e=>{if(!e.offsetParent)return;const c=getComputedStyle(e);if(e.scrollWidth>e.clientWidth+1&&c.display!=='inline'&&c.overflowX!=='auto'&&c.overflowX!=='visible')o.push(e.tagName+' clipped');if(c.textOverflow==='ellipsis'||c.overflowX==='hidden'&&e.scrollHeight>e.clientHeight+1)o.push(e.tagName+' cut')});return o})()"
            c, q = ctx(); go(q, LONG); q.add_style_tag(content=css); q.wait_for_timeout(150)
            assert q.evaluate(bad) == [], q.evaluate(bad)
            assert q.evaluate("(()=>{const s=document.querySelector('#side');return getComputedStyle(s).overflowY==='auto'&&s.scrollHeight>=s.clientHeight})()"), "menu cannot scroll"
            c.close()
            c, q = ctx(390, 844, is_mobile=True, has_touch=True); q.goto(T + LONG); q.wait_for_selector("#menu"); q.add_style_tag(content=css); q.click("#menu"); q.wait_for_timeout(200)
            assert q.evaluate(bad) == [], q.evaluate(bad)
            c.close()
        step("WCAG 1.4.12 text spacing: the menu does not clip (desktop and drawer)", spacing)
        def measure():
            c, q = ctx(); go(q, LONG)
            w = q.evaluate("(()=>{const p=document.querySelector('main p'),cs=getComputedStyle(p);const ch=(()=>{const s=document.createElement('span');s.style.cssText='position:absolute;visibility:hidden;width:100ch;font:'+cs.font;document.body.appendChild(s);const w=s.getBoundingClientRect().width/100;s.remove();return w})();return [p.getBoundingClientRect().width/ch,parseFloat(cs.lineHeight)/parseFloat(cs.fontSize),cs.textAlign,document.querySelector('#side').getBoundingClientRect().right<=document.querySelector('main').getBoundingClientRect().left]})()")
            assert 60 <= w[0] <= 75 and w[1] >= 1.5 and w[2] in ("start", "left") and w[3], w; c.close()
        step("text column 60-75 characters, line-height >= 1.5, left aligned, sidebar outside the column", measure)
        def motion():
            c, q = ctx(reduced_motion="reduce"); go(q, LONG)
            assert q.evaluate("getComputedStyle(document.documentElement).scrollBehavior") == "auto"
            assert q.evaluate("[...document.querySelectorAll('#side *,.crumbs *,.ha')].every(e=>getComputedStyle(e).transitionDuration.split(',').every(d=>parseFloat(d)===0))")
            c.close()
        step("reduced motion: no smooth scroll, no transitions in the new elements", motion)
        def offline():
            c, q = ctx(); q.goto((pathlib.Path(__file__).resolve().parent.parent / LONG).as_uri()); q.wait_for_selector("#side a.on"); q.wait_for_selector("main .ha")
            assert q.locator("#side ol.toc a").count() >= 3 and q.locator(".crumbs").count() == 1; c.close()
        step("works from file:// (double click)", offline)
        def keeps_scroll():
            c, q = ctx(1280, 600); go(q, LONG)
            link = q.locator("#side li a[href$='capitoli/09-risoluzione.html']")
            q.evaluate("(()=>{const s=document.querySelector('#side'),a=document.querySelector(\"#side li a[href$='capitoli/09-risoluzione.html']\");s.scrollTop+=a.getBoundingClientRect().top-s.getBoundingClientRect().top-150})()")
            assert link.is_visible()
            st = q.evaluate("document.querySelector('#side').scrollTop"); link.click(); q.wait_for_url("**/09-risoluzione.html"); q.wait_for_selector("#side a.on")
            q.wait_for_timeout(300); st2 = q.evaluate("document.querySelector('#side').scrollTop"); 
            # the sub-list of the old chapter collapses, so the numbers differ; what must hold: not reset to the top, the saved value was the old one, the current chapter is in view
            assert st > 0 and st2 > 0, (st, st2)
            assert q.evaluate("(()=>{const a=document.querySelector('#side a.on').getBoundingClientRect(),s=document.querySelector('#side').getBoundingClientRect();return a.top>=s.top-2&&a.bottom<=s.bottom+2})()"), "current chapter out of view"
            c.close()
        step("the menu keeps its scroll position between pages", keeps_scroll)
        def axe():
            if not AXE: print("SKIP axe (pip install axe-playwright-python)"); return
            for scheme in ("light", "dark"):
                for f in SAMPLES:
                    c, q = ctx(color_scheme=scheme); go(q, f); q.add_script_tag(path=AXE); q.evaluate("document.querySelector('main .ha').focus()")
                    v = q.evaluate("axe.run('#side, .navtop, main h2, main h3',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}).then(r=>r.violations.filter(v=>['serious','critical','moderate'].includes(v.impact)).map(v=>[v.id,v.nodes[0].html.slice(0,90)]))")
                    assert not v, (scheme, f, v); c.close()
            c, q = ctx(390, 844, is_mobile=True, has_touch=True); q.goto(T + LONG); q.wait_for_selector("#menu"); q.add_script_tag(path=AXE); q.click("#menu"); q.wait_for_timeout(250)
            v = q.evaluate("axe.run('#side',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then(r=>r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>[v.id,v.nodes[0].html.slice(0,90)]))")
            assert not v, v; c.close()
        step("axe: menu, breadcrumb, anchors on three pages (light and dark) and the open drawer", axe)
finally:
    r.close()
r.report()
for s in steps: print(" ", s)
sys.exit(1 if [s for s in steps if s[1] != "ok"] else 0)
