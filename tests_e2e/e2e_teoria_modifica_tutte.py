"""Page editor on every page of the site: opened and saved without a change, the page is rebuilt EXACTLY as the source (nothing of what teoria.js adds - anchors, glossary underlines,
table wrappers, figure names, sizes of the games - leaks into it); one changed heading, one changed table cell and one deleted block give a diff of just those lines."""
import sys, os, difflib, re; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
ADMIN = "try{localStorage.setItem('mzlab.admin','1')}catch(_){}"
r = Run(port=8978, wd="/tmp/wd_teoria_modifica_tutte")
bad = []
n = 0
try:
    with sync_playwright() as p:
        r.page(p)
        T = f"http://127.0.0.1:{r.port}/static/"
        c = r.b.new_context(viewport={"width": 1280, "height": 900}); c.add_init_script(ADMIN)
        q = c.new_page(); q.on("pageerror", lambda e: bad.append(("pageerror", str(e))))
        pages = ["index.html"] + sorted(f"capitoli/{f.name}" for f in (ROOT / "capitoli").glob("*.html")) + sorted(f"pratica/{f.name}" for f in (ROOT / "pratica").glob("*.html"))
        def diff(a, b): return [l for l in difflib.unified_diff(a.split("\n"), b.split("\n"), lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---")]
        for pg in pages:
            src = (ROOT / pg).read_text(encoding="utf-8")
            if 'http-equiv="refresh"' in src: continue
            n += 1
            q.goto(T + pg); q.wait_for_selector("#tc-editor", timeout=10000); q.wait_for_load_state("load"); q.wait_for_timeout(250)
            q.click("#tc-editor"); q.wait_for_selector("#ed-bar", timeout=8000)
            new = q.evaluate("TEORIA_EDITOR.anteprima()")
            if new != src:
                d = diff(src, new or ""); bad.append((pg, "unchanged page differs", [x[:200] for x in d[:4]])); continue
            # the first plain paragraph deleted: just its line goes away
            had = q.evaluate("() => { const e = document.querySelector('main > p:not(.lead)'); if (e) { e.remove(); } return !!e; }")
            dd = diff(src, q.evaluate("TEORIA_EDITOR.anteprima()"))
            if not had: pass
            elif not [x for x in dd if x[0] == "-"] or [x for x in dd if x[0] == "+"]: bad.append((pg, "delete diff", [x[:120] for x in dd[:5]]))
            # a changed heading and a changed table cell: only their lines change (the page is reloaded: the deletion above is gone)
            q.reload(); q.wait_for_selector("#tc-editor", timeout=10000); q.wait_for_timeout(250); q.click("#tc-editor"); q.wait_for_selector("#ed-bar", timeout=8000)
            res = q.evaluate("""async () => {
              const out = {}, m = document.querySelector('main');
              const h = m.querySelector(':scope > h2, :scope > h3'); if (h) { const t = [...h.childNodes].find(x => x.nodeType === 3); if (t) { t.nodeValue = t.nodeValue + ' PROVA'; out.h = true; } }
              const td = m.querySelector('td'); const blk = td && [...m.children].find(x => x.contains(td)); if (td && !blk.querySelector('button,select,input,textarea,canvas,.sim,[data-sim],iframe')) { const t = td.firstChild; if (t && t.nodeType === 3) { t.nodeValue = t.nodeValue + ' PROVA'; out.td = true; } }
              out.nuova = await TEORIA_EDITOR.anteprima(); return out; }""")
            d = diff(src, res["nuova"])
            plus = [x for x in d if x[0] == "+"]; minus = [x for x in d if x[0] == "-"]
            want = int(bool(res.get("h"))) + int(bool(res.get("td")))
            ok = len(minus) == want and len(plus) == want and all("PROVA" in x for x in plus) and not any(re.search(r'class="(ha|g|tw)"|contenteditable|aria-level|<tbody', x) for x in plus)
            if not ok: bad.append((pg, "edit diff", [x[:160] for x in d[:6]]))
finally:
    r.close()
r.report()
print(f"{n} pages checked")
for b in bad: print("FAIL", b)
sys.exit(1 if bad else 0)
