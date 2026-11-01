"""Page editor (editor.js, administrator mode): the button only for the administrator; a paragraph and a ready-made box edited; the save without server and without token
(clipboard + download, then a 3-step dialog whose first button opens the GitHub web editor of that file in a new tab) gives the page identical to the source except the edit; the GitHub address
for three pages including file://; invalid HTML is flagged and blocks the save; keyboard, contrast >= 7:1 in every theme, no animation, no request outside the site."""
import sys, os, difflib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
sys.path.insert(0, str(ROOT / "tools"))
import controlla_modifica as cm
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_modifica.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:300]))
def fine(q, loc):
    """Caret at the end of the text of the element (the End key stops at the end of the visual line)."""
    loc.evaluate("e => { e.scrollIntoView({block: 'center'}); const r = document.createRange(); r.selectNodeContents(e); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.querySelector('main').focus(); }")
ADMIN = "try{localStorage.setItem('mzlab.admin','1')}catch(_){}"
GH = "https://github.com/Freeesta/BasePeak/edit/main/"
UP = "https://github.com/Freeesta/BasePeak/upload/main/"
PAGE = "capitoli/05-ei-ci.html"
r = Run(port=8977, wd="/tmp/wd_teoria_modifica")
try:
    with sync_playwright() as p:
        r.page(p)
        T = f"http://127.0.0.1:{r.port}/static/"
        reqs = []
        def ctx(admin=True, **kw):
            c = r.b.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True, **kw)
            c.route("https://github.com/**", lambda route: route.fulfill(body="<html><title>gh</title></html>", content_type="text/html"))
            c.on("request", lambda q: reqs.append(q.url))
            if admin: c.add_init_script(ADMIN)
            q = c.new_page(); q.on("pageerror", lambda e: r.errs.append(("pageerror", str(e)))); return c, q
        def apri(q, url):
            q.goto(url); q.wait_for_selector("#tc-editor", timeout=10000)
            q.click("#tc-editor"); q.wait_for_selector("#ed-bar", timeout=8000)
        src = (ROOT / PAGE).read_text(encoding="utf-8")
        def reader():
            c, q = ctx(admin=False); q.goto(T + PAGE); q.wait_for_function("!!window.TEORIA_EDITOR", timeout=8000); q.wait_for_selector("#a11y-btn", state="attached")
            assert q.locator("#tc-editor").count() == 0; q.keyboard.press("Alt+E"); assert q.locator("#ed-bar").count() == 0
            assert q.evaluate("document.querySelector('main').isContentEditable") is False; c.close()
            c, q = ctx(); q.goto(T + PAGE); q.wait_for_selector("#tc-editor", timeout=8000)
            assert q.inner_text("#tc-editor").strip() == "Modifica questa pagina" or "Modifica questa pagina" in q.get_attribute("#tc-editor", "aria-label")
            q.keyboard.press("Alt+E"); q.wait_for_selector("#ed-bar", timeout=8000); assert q.evaluate("document.querySelector('main').isContentEditable")
            q.keyboard.press("Alt+E"); q.wait_for_url("**/05-ei-ci.html", timeout=8000); c.close()
        step("the button «Modifica questa pagina» and Alt+E exist only in administrator mode", reader)
        def edit_and_save():
            c, q = ctx(permissions=["clipboard-read", "clipboard-write"]); apri(q, T + PAGE)
            q.wait_for_function("document.querySelector('#ed-bar')", timeout=5000)
            # nothing touched: nothing to propose, nothing downloaded
            q.click("[data-act=salva]"); q.wait_for_function("document.getElementById('ed-msg').textContent.includes('Non hai cambiato niente')", timeout=5000)
            p0 = q.locator("main > p").nth(1); old = next(l for l in src.split("\n") if l.startswith("<p>Tutto avviene nel <b>vuoto"))
            fine(q, p0); q.keyboard.type(" AGGIUNTA")
            q.click("[data-act=box-key]"); assert q.locator("main .box.key").count() == src.count('class="box key"') + 1
            sel = q.evaluate("getSelection().toString()"); assert sel == "Scrivi qui il testo.", sel
            q.keyboard.type("Testo del nuovo riquadro.")
            with q.expect_download() as dl:
                q.click("[data-act=salva]")
            new = open(dl.value.path(), encoding="utf-8").read()
            assert dl.value.suggested_filename == "05-ei-ci.html"
            q.wait_for_selector("#ed-pannello .ed-passi", timeout=5000)
            assert q.evaluate("(() => { const a = document.querySelector('#ed-pannello [data-p=apri]'); a.scrollIntoView({block: 'center', behavior: 'instant'}); const b = a.getBoundingClientRect(), e = document.elementFromPoint(b.x + 5, b.y + 5); return !!e && !!e.closest('#ed-pannello'); })()"), "the side menu covers the dialog"
            with c.expect_page() as pp: q.click("#ed-pannello [data-p=apri]")   # step 1 opens GitHub in a new tab; it does not open by itself
            assert pp.value.url == GH + PAGE, pp.value.url
            assert q.evaluate("navigator.clipboard.readText()") == new
            d = [l for l in difflib.unified_diff(src.split("\n"), new.split("\n"), lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---")]
            minus = [l for l in d if l[0] == "-"]; plus = [l for l in d if l[0] == "+"]
            assert len(minus) == 1 and minus[0][1:] == old, minus
            assert len(plus) == 2 and plus[0][1:].replace("&nbsp;", " ").endswith("AGGIUNTA</p>") and plus[0][1:].startswith(old[:-4]) and '<div class="box key"><b>Concetto chiave</b><p>Testo del nuovo riquadro.</p></div>' in plus[1], plus
            assert not [x for x in cm.controlla(new) if x[1] == "struttura"]
            panel = q.inner_text("#ed-pannello")
            # obsolete: the four steps (select, paste, write, Propose changes / Create pull request) became three; the clipboard now holds the page before GitHub opens
            for frag in ("Apri GitHub", "Testo copiato", "Commit changes", "solo dopo che hai incollato", "pochi minuti", "Alternativa: trascina il file"): assert frag in panel, frag
            assert q.locator("#ed-pannello .ed-passi > li").count() == 3
            assert q.get_attribute("#ed-pannello [data-p=apri]", "href") == GH + PAGE
            assert q.get_attribute("#ed-pannello [data-p=carica]", "href") == UP + "capitoli"
            assert "Ctrl+A" in panel and "Ctrl+V" in panel and "⌘" not in panel
            c.close()
        step("edit a paragraph and insert a box; the save gives the source plus only that edit (download, exact clipboard text, 3-step dialog, GitHub tab opened by its button)", edit_and_save)
        def urls():
            f = "file://" + str(ROOT / PAGE)
            q0 = r.b.new_context().new_page(); q0.goto(T + PAGE); q0.wait_for_function("!!window.TEORIA_EDITOR", timeout=8000)
            for u, exp in [("https://freeesta.github.io/BasePeak/capitoli/02-lc.html", "capitoli/02-lc.html"), ("https://freeesta.github.io/BasePeak/pratica/ei.html?x=1#a", "pratica/ei.html"),
                           ("https://freeesta.github.io/BasePeak/", "index.html"), ("https://freeesta.github.io/BasePeak/capitoli/21-tempi", "capitoli/21-tempi.html"), (f, PAGE),
                           ("file:///C:/Users/f/BasePeak%20nuovo/pratica/orale.html", "pratica/orale.html")]:
                assert q0.evaluate("u => TEORIA_EDITOR.percorso(u)", u) == exp, (u, exp)
            assert q0.evaluate("TEORIA_EDITOR.urlGitHub('capitoli/02-lc.html')") == GH + "capitoli/02-lc.html"
            for pg, up in [("capitoli/02-lc.html", "capitoli"), ("pratica/ei.html", "pratica"), ("index.html", "")]:
                assert q0.evaluate("p => TEORIA_EDITOR.urlCarica(p)", pg) == (UP + up).rstrip("/") or q0.evaluate("p => TEORIA_EDITOR.urlCarica(p)", pg) == UP + up, pg
            assert q0.evaluate("TEORIA_EDITOR.urlCarica('index.html')") == UP.rstrip("/") and q0.evaluate("TEORIA_EDITOR.urlGitHub('index.html')") == GH + "index.html"
            # from file:// the browser cannot read the source: the file is chosen once, then the same flow
            c, q = ctx(permissions=["clipboard-read", "clipboard-write"]); apri(q, f)
            fine(q, q.locator("main > p").nth(1)); q.keyboard.type(" DADISCO")
            q.click("[data-act=salva]"); q.wait_for_selector("#ed-file", timeout=5000)
            q.set_input_files("#ed-file", str(ROOT / "capitoli/03-gc.html")); q.wait_for_function("document.getElementById('ed-pst').textContent.includes('giusto')", timeout=5000)
            q.set_input_files("#ed-file", str(ROOT / PAGE)); q.wait_for_function("document.getElementById('ed-pst').textContent.includes('File letto')", timeout=5000)
            with q.expect_download() as dl: q.click("[data-act=salva]")
            with c.expect_page() as pp: q.click("#ed-pannello [data-p=apri]")
            new = open(dl.value.path(), encoding="utf-8").read()
            assert pp.value.url == GH + PAGE and new.count("DADISCO") == 1 and new.replace("&nbsp; DADISCO", "").replace(" DADISCO", "") == src, pp.value.url
            c.close()
            for page in ("capitoli/01-cromatografia.html",):          # the live-site shape on the local server: the address follows the page
                c, q = ctx(); apri(q, T + page); fine(q, q.locator("main > p").first); q.keyboard.type(" X")
                with q.expect_download(): q.click("[data-act=salva]")
                with c.expect_page() as pp: q.click("#ed-pannello [data-p=apri]")
                assert pp.value.url == GH + page, pp.value.url
                assert q.get_attribute("#ed-pannello [data-p=carica]", "href") == UP + page.rsplit("/", 1)[0]; c.close()
        step("the GitHub address is right for 3+ pages, live-site shape and file:// (file chosen once)", urls)
        def copy_fallback():
            # clipboard API refused (file://, permission denied): the hidden textarea + execCommand('copy') copies; if even that fails the button «Copia il testo» and the file alternative show
            c, q = ctx(); apri(q, T + PAGE)
            q.evaluate("""() => { navigator.clipboard.writeText = () => Promise.reject(new Error('denied')); window.__copiato = null;
              const ec = document.execCommand.bind(document); document.execCommand = (c, ...a) => { if (c === 'copy') { window.__copiato = document.activeElement.value; return true; } return ec(c, ...a); }; }""")
            fine(q, q.locator("main > p").nth(1)); q.keyboard.type(" FALLBACK")
            with q.expect_download() as dl: q.click("[data-act=salva]")
            new = open(dl.value.path(), encoding="utf-8").read(); q.wait_for_selector("#ed-pannello .ed-passi")
            assert q.evaluate("window.__copiato") == new and "FALLBACK" in new
            assert "Testo copiato" in q.inner_text("#ed-pst")
            q.evaluate("() => { document.execCommand = (c) => c === 'copy' ? false : true; }")
            with q.expect_download(): q.click("[data-act=salva]")
            q.wait_for_function("document.getElementById('ed-pst').textContent.includes('non è stato copiato')", timeout=5000)
            assert q.is_visible("#ed-pannello [data-p=copia]") and q.locator("#ed-pannello details.ed-alt[open]").count() == 1
            c.close()
        step("clipboard refused: fallback copy works; if it fails too the «Copia il testo» button and the file alternative are shown", copy_fallback)
        def mac_keys():
            c, q = ctx(permissions=["clipboard-read", "clipboard-write"]); q.add_init_script("Object.defineProperty(navigator, 'platform', {get: () => 'MacIntel'})"); apri(q, T + PAGE)
            fine(q, q.locator("main > p").nth(1)); q.keyboard.type(" MAC")
            with q.expect_download(): q.click("[data-act=salva]")
            q.wait_for_selector("#ed-pannello .ed-passi"); t = q.inner_text("#ed-pannello .ed-passi"); assert "⌘+A" in t and "⌘+V" in t and "Ctrl" not in t, t
            c.close()
        step("the dialog shows ⌘ keys on a Mac and Ctrl on Windows/Linux", mac_keys)
        def invalid():
            c, q = ctx(); apri(q, T + PAGE)
            q.click("[data-act=vista-code]"); q.wait_for_selector("#ed-ta"); q.wait_for_function("document.getElementById('ed-esito').className==='ok'", timeout=5000)
            assert "in ordine" in q.inner_text("#ed-esito")
            q.evaluate("() => { const t = document.getElementById('ed-ta'); t.value = t.value.replace('</h2>', ''); t.dispatchEvent(new Event('input')); }")
            q.wait_for_function("document.getElementById('ed-esito').className==='ko'", timeout=5000)
            e = q.inner_text("#ed-esito"); assert "non è chiuso" in e and "Riga" in e and "<h2>" in e, e
            q.click("[data-act=salva]"); q.wait_for_function("document.getElementById('ed-msg').textContent.includes('Correggi')", timeout=5000)
            q.click("[data-act=vista-visual]"); assert q.locator("#ed-code").count() == 1                      # cannot leave with errors
            q.evaluate("() => { const t = document.getElementById('ed-ta'); t.value = t.value.replace('<p>', '<p>CODICE ', 1) + '<div id=\"x\"></div><div id=\"x\"></div>'; t.dispatchEvent(new Event('input')); }")
            q.wait_for_function("document.getElementById('ed-esito').textContent.includes('usato più volte')", timeout=5000)
            c.close()
        step("invalid HTML in the Codice tab is flagged in Italian, with the line, and blocks saving and leaving", invalid)
        def code_ok():
            c, q = ctx(); apri(q, T + PAGE)
            q.click("[data-act=vista-code]"); q.wait_for_selector("#ed-ta")
            q.evaluate("() => { const t = document.getElementById('ed-ta'); t.value = t.value.replace('<p>', '<p>CODICE ', 1); t.dispatchEvent(new Event('input')); }")
            q.wait_for_function("document.getElementById('ed-esito').className==='ok'", timeout=5000)
            new = q.evaluate("TEORIA_EDITOR.anteprima()"); assert new.count("CODICE ") == 1 and new.replace("CODICE ", "", 1) == src
            q.click("[data-act=vista-visual]"); q.wait_for_selector("#ed-code", state="detached"); assert q.locator("main p", has_text="CODICE").count() == 1
            c.close()
        step("a change made in the Codice tab is applied and saved exactly", code_ok)
        def a11y():
            c, q = ctx(); apri(q, T + PAGE)
            names = q.evaluate("[...document.querySelectorAll('#ed-bar button')].map(b => (b.getAttribute('aria-label') || b.textContent).trim())"); assert all(names) and len(names) >= 18, names
            q.focus("#tc-editor"); q.keyboard.press("Shift+Tab"); q.focus("#ed-bar [data-act=bold]")
            q.keyboard.press("Tab"); fo = q.evaluate("(() => { const s = getComputedStyle(document.activeElement); return [s.outlineStyle, parseFloat(s.outlineWidth)]; })()")
            assert fo[0] == "solid" and fo[1] >= 3, fo
            assert q.evaluate("document.getAnimations().length") == 0
            q.click("[data-act=vista-code]"); q.wait_for_selector("#ed-ta"); q.click("[data-act=vista-visual]")
            fine(q, q.locator("main > p").nth(1)); q.keyboard.type(" Z"); q.click("[data-act=salva]"); q.wait_for_selector("#ed-pannello", timeout=8000)
            q.evaluate("document.getElementById('ed-pannello').dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}))")
            q.click("[data-act=vista-code]"); q.wait_for_selector("#ed-ta")
            lum = """(() => {
              const f = c => { const m = c.match(/[\\d.]+/g).map(Number); return m; };
              const L = c => { const [r, g, b] = f(c).slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
              const bgOf = el => { for (let e = el; e; e = e.parentElement) { const m = f(getComputedStyle(e).backgroundColor); if (m.length < 4 || m[3] > .99) { if (m[0] || m[1] || m[2] || m.length < 4 || m[3] > .99) return getComputedStyle(e).backgroundColor; } } return "rgb(255,255,255)"; };
              let worst = 99, who = "";
              document.querySelectorAll('#ed-bar, #ed-bar *, #ed-code *, #ed-pannello, #ed-pannello *').forEach(el => {
                if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
                const a = L(getComputedStyle(el).color), b = L(bgOf(el)), cr = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
                if (cr < worst) { worst = cr; who = el.tagName + "." + el.className + " " + el.textContent.trim().slice(0, 20); }
              });
              return [worst, who]; })()"""
            for th in ("light", "dark"):
                for bg in (None, "cream", "blue", "hc"):
                    q.evaluate("([t, b]) => { const R = document.documentElement; R.setAttribute('data-theme', t); b ? R.setAttribute('data-a11y-bg', b) : R.removeAttribute('data-a11y-bg'); }", [th, bg])
                    w = q.evaluate(lum); assert w[0] >= 7, (th, bg, w)
            c.close()
        step("keyboard names, visible focus, no animation, contrast >= 7:1 in light, dark, cream, blue and high contrast", a11y)
        def nonet():
            outside = [u for u in reqs if not u.startswith(f"http://127.0.0.1:{r.port}/") and not u.startswith(GH) and not u.startswith("file://") and not u.startswith("data:") and not u.startswith("blob:")]
            assert not outside, outside
        step("no request outside the site (the GitHub tab aside)", nonet)
finally:
    r.close()
r.report()
for s in steps: print(" ", s)
sys.exit(1 if [s for s in steps if s[1] != "ok"] else 0)
