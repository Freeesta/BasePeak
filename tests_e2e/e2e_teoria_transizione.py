"""Transition between chapters: cross-document view transitions (header and index stay still, the content fades), no flash of colour, no animation
with reduced motion, the CSS fade when view transitions do not exist, scroll at the top / index scroll kept / anchors, prefetch of the neighbours."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import lib
real_wait = lib._real_wft
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e: steps.append((name, "FAIL " + str(e).split("\n")[0][:300]))
# recorded by every page at pagereveal (sessionStorage survives the navigation): was there a view transition, which animations ran, the html background
SPY = """(()=>{addEventListener('pagereveal',e=>{try{sessionStorage.length}catch(x){return}const bg=[getComputedStyle(document.documentElement).backgroundColor];
 const o={vt:!!e.viewTransition,bg,anims:[],side:document.querySelectorAll('#side li').length,top:!!document.querySelector('#top')};sessionStorage.setItem('__rev',JSON.stringify(o));
 if(e.viewTransition)e.viewTransition.ready.then(()=>{o.anims=document.documentElement.getAnimations({subtree:true}).map(a=>(a.effect.pseudoElement||'')+':'+a.animationName+':'+a.effect.getTiming().duration);
  bg.push(getComputedStyle(document.documentElement).backgroundColor);sessionStorage.setItem('__rev',JSON.stringify(o))}).catch(()=>{})});
 window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)))})();"""
def rev(pg): return pg.evaluate("JSON.parse(sessionStorage.getItem('__rev')||'null')")
def ctxpage(b, init=SPY, **kw):
    ctx = b.new_context(viewport={"width": 1280, "height": 800}, **kw); ctx.add_init_script(init); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    return ctx, pg, errs
r = Run(port=8976, wd="/tmp/wd_tt")
try:
    with sync_playwright() as p:
        r.page(p); b = r.b; T = f"http://127.0.0.1:{r.port}/static/"
        def click_chapter(pg, href):
            href = href.replace("../", ""); pg.click(f'#side li a[href$="{href}"]'); pg.wait_for_url("**/" + href); pg.wait_for_function("document.readyState==='complete'"); real_wait(pg, 500)
        def vt():
            for attempt in range(3):   # a loaded machine may reveal the page before the index exists: the transition is then skipped on purpose
                ctx, pg, errs = ctxpage(b, color_scheme="dark"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 400)
                click_chapter(pg, "capitoli/06-vuoto.html"); click_chapter(pg, "capitoli/04-esi.html"); o = rev(pg)   # the second hop has the scripts in cache, as a reader has
                if o and o["side"] > 20 and o["anims"]: break
                ctx.close()
            assert o and o["vt"], o
            assert o["side"] > 20 and o["top"], ("index and header are already built when the new page is first revealed", o)
            names = " ".join(o["anims"]); assert "::view-transition-new(root):vt-in:180" in names, o["anims"]
            assert all(x == "rgb(20, 23, 27)" for x in o["bg"]), o["bg"]
            nm = pg.evaluate("[getComputedStyle(document.querySelector('#top')).viewTransitionName,getComputedStyle(document.querySelector('#side')).viewTransitionName]")
            assert nm == ["vt-top", "vt-side"], nm
            assert not errs, errs; ctx.close()
        step("click on another chapter: view transition with a 180 ms fade of the content, header and index named, dark background throughout, no console errors", vt)
        def slow():
            ctx, pg, errs = ctxpage(b, color_scheme="dark"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 400)
            import time
            pg.route("**/assets/teoria.js", lambda rt: (time.sleep(0.8), rt.continue_()))   # a loaded machine: the script arrives late
            click_chapter(pg, "capitoli/06-vuoto.html"); o = rev(pg)
            assert o and (o["side"] > 20 or not o["anims"]), ("a transition never starts over a page without index", o)
            assert not errs, errs; ctx.close()
        step("slow script: no transition over a page that has no index yet, no errors", slow)
        def scroll():
            ctx, pg, errs = ctxpage(b); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 400)
            pg.click("#navall")   # every part open (kept for the next page): a long list to scroll
            pg.evaluate("document.querySelector('#side').scrollTop=150"); pg.evaluate("scrollTo(0,900)"); real_wait(pg, 200)
            before = pg.evaluate("document.querySelector('#side').scrollTop"); assert before > 100, before
            href = pg.evaluate("(()=>{const s=document.querySelector('#side').getBoundingClientRect();return [...document.querySelectorAll('#side ol a[href$=html]')].find(a=>{const r=a.getBoundingClientRect();return r.top>s.top+80&&r.bottom<s.bottom-80&&!a.classList.contains('on')}).getAttribute('href')})()")
            click_chapter(pg, href)
            y = pg.evaluate("scrollY"); st = pg.evaluate("document.querySelector('#side').scrollTop")
            assert y == 0, y; assert abs(st - before) <= 2, (st, before); assert not errs, errs; ctx.close()
        step("new chapter starts at the top and the index keeps its scroll position", scroll)
        def anchor():
            ctx, pg, errs = ctxpage(b); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 400)
            pg.goto(T + "capitoli/06-vuoto.html"); real_wait(pg, 300)
            hid = pg.evaluate("document.querySelectorAll('main h2')[2].id")
            pg.evaluate("location.href=location.pathname+'#" + hid + "'"); real_wait(pg, 700)
            y1 = pg.evaluate("scrollY"); top = pg.evaluate(f"document.getElementById('{hid}').getBoundingClientRect().top"); real_wait(pg, 600)
            y2 = pg.evaluate("scrollY"); assert y1 > 100 and y1 == y2 and 0 <= top < 140, (y1, y2, top)
            ctx.close()
        step("anchor in the page: scrolls to the heading and stays there", anchor)
        def anchor_nav():
            ctx, pg, errs = ctxpage(b); pg.goto(T + "capitoli/06-vuoto.html"); real_wait(pg, 300)
            hid = pg.evaluate("document.querySelectorAll('main h2')[2].id")
            pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 300)
            pg.evaluate(f"location.href='06-vuoto.html#{hid}'"); pg.wait_for_url("**#" + hid); real_wait(pg, 1200)
            y1 = pg.evaluate("scrollY"); top = pg.evaluate(f"document.getElementById('{hid}').getBoundingClientRect().top")
            assert y1 > 100 and 0 <= top < 140, (y1, top); assert not errs, errs; ctx.close()
        step("navigating to chapter#section lands on the section after the transition", anchor_nav)
        def reduced():
            ctx, pg, errs = ctxpage(b, reduced_motion="reduce"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 400)
            click_chapter(pg, "capitoli/06-vuoto.html"); o = rev(pg)
            assert o and not o["vt"], o
            assert pg.evaluate("document.documentElement.hasAttribute('data-a11y-reduce')")
            assert pg.evaluate("getComputedStyle(document.querySelector('main')).animationName") == "none"
            assert not errs, errs; ctx.close()
        step("prefers-reduced-motion: no view transition and no animation", reduced)
        def a11y_reduce():
            ctx, pg, errs = ctxpage(b, init=SPY + "try{localStorage.setItem('mzlab.a11y',JSON.stringify({motion:'always'}))}catch(e){}"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 400)
            click_chapter(pg, "capitoli/06-vuoto.html"); o = rev(pg)
            assert not o["anims"], o
            ctx.close()
        step("data-a11y-reduce (Lettura facilitata): the fade does not run", a11y_reduce)
        def fallback():
            ctx, pg, errs = ctxpage(b, init="delete window.PageRevealEvent;"); pg.goto(T + "capitoli/04-esi.html")
            assert pg.evaluate("document.documentElement.classList.contains('vt-no')")
            n = pg.evaluate("(()=>{const m=document.querySelector('main');return getComputedStyle(m).animationName+':'+getComputedStyle(m).animationDuration})()")
            assert n == "vt-fade:0.12s", n; assert not errs, errs; ctx.close()
        step("without view transitions: 120 ms CSS fade of the content (html.vt-no)", fallback)
        def fallback_reduced():
            ctx, pg, errs = ctxpage(b, init="delete window.PageRevealEvent;", reduced_motion="reduce"); pg.goto(T + "capitoli/04-esi.html")
            assert pg.evaluate("getComputedStyle(document.querySelector('main')).animationName") == "none"; ctx.close()
        step("without view transitions and with reduced motion: no fade", fallback_reduced)
        def prefetch():
            ctx, pg, errs = ctxpage(b); pg.goto(T + "capitoli/06-vuoto.html"); real_wait(pg, 400)
            urls = pg.evaluate("[...document.querySelectorAll('script[type=speculationrules]')].map(s=>JSON.parse(s.textContent).prefetch[0].urls)")
            assert len(urls) == 1 and len(urls[0]) == 2 and all(u.endswith(".html") for u in urls[0]), urls; ctx.close()
            ctx, pg, errs = ctxpage(b, init="Object.defineProperty(navigator,'connection',{get:()=>({saveData:true,effectiveType:'4g'})});")
            pg.goto(T + "capitoli/06-vuoto.html"); real_wait(pg, 400)
            assert pg.evaluate("document.querySelectorAll('script[type=speculationrules]').length") == 0
            ctx.close()
            ctx, pg, errs = ctxpage(b, init="Object.defineProperty(navigator,'connection',{get:()=>({saveData:false,effectiveType:'3g'})});")
            pg.goto(T + "capitoli/06-vuoto.html"); real_wait(pg, 400)
            assert pg.evaluate("document.querySelectorAll('script[type=speculationrules]').length") == 0; ctx.close()
        step("prefetch of the previous and next chapter; none with Save-Data or a slow connection", prefetch)
        # ---- light <-> dark: one slow, gentle cross-fade (--theme-fade, 1.2-1.6 s, ease-in-out) of the whole page; instant with reduced motion
        THEME_SPY = """(()=>{window.__vt=[];const o=document.startViewTransition&&document.startViewTransition.bind(document);if(o)document.startViewTransition=cb=>{const t=o(cb);window.__vt.push(t);
          t.ready.then(()=>{t.__anims=document.documentElement.getAnimations({subtree:true}).filter(a=>/view-transition-(old|new)\\(root\\)/.test(a.effect.pseudoElement||'')).map(a=>[a.effect.pseudoElement,a.effect.getTiming().duration,a.effect.getTiming().easing]);window.__anims=t.__anims}).catch(()=>{});return t}})()"""
        LUM = "(c=>{const m=c.match(/[0-9.]+/g).map(Number),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])})"
        def ratio(pg): return pg.evaluate("(()=>{const L=" + LUM + ";const a=L(getComputedStyle(document.body).color),b=L(getComputedStyle(document.body).backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)})()")
        def settled(pg): pg.wait_for_function("!document.documentElement.classList.contains('theme-x')", timeout=6000)
        def theme_fade():
            ctx, pg, errs = ctxpage(b, init=THEME_SPY, color_scheme="light"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 600)
            var = pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-fade').trim()"); assert var.endswith("ms") and 1200 <= float(var[:-2]) <= 1600, var   # ONE named variable
            assert pg.evaluate("document.documentElement.dataset.theme") == "light"
            pg.evaluate("QTEMA.set('dark')"); pg.wait_for_function("window.__anims", timeout=5000)
            an = pg.evaluate("window.__anims"); names = {a[0] for a in an}; assert names == {"::view-transition-old(root)", "::view-transition-new(root)"}, an
            for nm, dur, ease in an: assert 1200 <= dur <= 1600, an
            for ps in ("::view-transition-old(root)", "::view-transition-new(root)"): assert pg.evaluate("p=>getComputedStyle(document.documentElement,p).animationTimingFunction", ps) == "ease-in-out", ps
            assert pg.evaluate("document.documentElement.dataset.theme") == "dark" and pg.evaluate("location.href.indexOf('04-esi')>0"), "no reload: the page is the same"
            assert pg.evaluate("document.documentElement.classList.contains('theme-vt')")
            settled(pg); assert not pg.evaluate("document.documentElement.classList.contains('theme-vt')") and ratio(pg) >= 7, ratio(pg)
            assert pg.evaluate("document.querySelectorAll('#side li').length") > 20 and not errs, errs; ctx.close()
        step("light -> dark is ONE cross-fade of 1.2-1.6 s with ease-in-out on the whole page (--theme-fade), no reload, contrast >= 7:1 at the end", theme_fade)
        def theme_back_and_canvas():
            ctx, pg, errs = ctxpage(b, init=THEME_SPY, color_scheme="light"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 1200)
            mid = "(()=>{const c=document.querySelector('.sim canvas');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>128){s+=(d[i]+d[i+1]+d[i+2])/3;n++}return n?s/n:-1})()"
            light = pg.evaluate(mid); assert light > 140, light            # light theme: mostly light pixels (white panel)
            pg.evaluate("QTEMA.set('dark')"); settled(pg); real_wait(pg, 500)
            assert pg.evaluate(mid) < light - 40, ("the drawing on canvas keeps the colours of the light theme after the fade", light, pg.evaluate(mid))
            sty = pg.evaluate("[...document.querySelectorAll('body style')].map(s=>s.textContent).join('').toLowerCase()")
            pg.evaluate("QTEMA.set('light')"); settled(pg); real_wait(pg, 500)
            assert pg.evaluate("document.documentElement.dataset.theme") == "light" and abs(pg.evaluate(mid) - light) < 20, "back to light: the drawing is drawn with the light ink again"
            assert ratio(pg) >= 7 and pg.evaluate("[...document.querySelectorAll('body style')].map(s=>s.textContent).join('').toLowerCase()") != sty or "#fff" not in sty
            assert not errs, errs; ctx.close()
        step("dark and back to light in place: canvas drawings and figure styles follow both ways", theme_back_and_canvas)
        def theme_double():
            ctx, pg, errs = ctxpage(b, init=THEME_SPY, color_scheme="light"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 600)
            pg.evaluate("QTEMA.set('dark'); setTimeout(()=>QTEMA.set('light'), 150); setTimeout(()=>QTEMA.set('dark'), 300)"); real_wait(pg, 500)
            settled(pg)
            assert pg.evaluate("document.documentElement.dataset.theme") == "dark" and ratio(pg) >= 7, "the last choice wins"
            assert pg.evaluate("!document.documentElement.classList.contains('theme-vt') && !document.documentElement.classList.contains('theme-x')"), "an intermediate state is stuck"
            pg.evaluate("QTEMA.set('light'); QTEMA.set('dark'); QTEMA.set('light')"); settled(pg)
            assert pg.evaluate("document.documentElement.dataset.theme") == "light" and ratio(pg) >= 7 and not errs, errs; ctx.close()
        step("toggling twice (or three times) quickly: the last choice wins, no state is left stuck, contrast >= 7:1", theme_double)
        def theme_reduced():
            for how in ("system", "page"):
                ctx, pg, errs = ctxpage(b, init=THEME_SPY, color_scheme="light", **({"reduced_motion": "reduce"} if how == "system" else {})); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 600)
                if how == "page": pg.evaluate("QA11Y.write(Object.assign(QA11Y.read(),{motion:'always'}))")
                assert pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--theme-fade').trim()") == "0ms", how
                pg.evaluate("QTEMA.set('dark')")
                assert pg.evaluate("document.documentElement.dataset.theme") == "dark", "the theme did not change at once"          # synchronous: no animation at all
                assert pg.evaluate("window.__vt.length") == 0 and not pg.evaluate("document.documentElement.classList.contains('theme-x')"), how
                assert pg.evaluate("document.documentElement.getAnimations({subtree:true}).filter(a=>(a.effect.pseudoElement||'').includes('view-transition')).length") == 0
                assert ratio(pg) >= 7 and not errs, (how, errs); ctx.close()
        step("reduced motion (system setting and the page's own): the theme switches at once, no view transition, no CSS fade", theme_reduced)
        def theme_fallback():
            ctx, pg, errs = ctxpage(b, init="document.startViewTransition=undefined;", color_scheme="light"); pg.goto(T + "capitoli/04-esi.html"); real_wait(pg, 600)
            pg.evaluate("QTEMA.set('dark')"); assert pg.evaluate("document.documentElement.classList.contains('theme-x')")
            assert pg.evaluate("parseFloat(getComputedStyle(document.body).transitionDuration)*1000") >= 1200, "no CSS fade without view transitions"
            settled(pg); pg.wait_for_function("getComputedStyle(document.body).color === 'rgb(228, 231, 235)'", timeout=10000)      # the transition has run to its end state
            assert pg.evaluate("document.documentElement.dataset.theme") == "dark" and ratio(pg) >= 7 and not errs, errs; ctx.close()
        step("without view transitions: the same duration as a CSS transition on every element, cleaned afterwards", theme_fallback)
    r.close()
except Exception as e:
    steps.append(("run", "FAIL " + str(e)[:300]))
    try: r.close()
    except Exception: pass
for n, s in steps: print(s.split(" ")[0].upper(), n, s if s != "ok" else "")
