"""Teoria 'Scarica' dialog.
1. Layout: in every row the format label (left) and its two buttons share the same top/bottom (1 px tolerance), at desktop and 400 px width, light and dark; buttons >= 40 px tall.
2. Downloads on a published-like layout (the site assembled like .github/workflows/pages.yml does: index.html, capitoli/, pratica/, assets/ only, without capitoli/src, served under
   /BasePeak/ like GitHub Pages): the real «Scarica» button is clicked, every format of the single chapter and of the whole handbook must produce a download event with a valid,
   non-empty file (Markdown, Word, HTML; HTML also opened offline); the PDF buttons open the print dialog, and with print media the sidebar and the bars are gone and the PDF is made of
   the page(s) of the chapter / of every chapter. No console error or page error in all of this. From file:// the chapter downloads and the package says why it cannot.
Run: python3 tests_e2e/e2e_teoria_scarica.py"""
import sys, os, re, shutil, tempfile, threading, http.server, pathlib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_scarica.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:260]))
r = Run(port=8977, wd="/tmp/wd_teoria_scarica")

# ---- the site as GitHub Pages gets it (pages.yml: cp -R index.html capitoli pratica assets; rm -rf capitoli/src), served under /BasePeak/
SITE = pathlib.Path(tempfile.mkdtemp(prefix="_site_")) / "_site"; SITE.mkdir()
for n in ("index.html", "capitoli", "pratica", "assets"):
    (shutil.copy if (ROOT / n).is_file() else shutil.copytree)(ROOT / n, SITE / n)
shutil.rmtree(SITE / "capitoli" / "src", ignore_errors=True)
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(SITE), **k)
    def translate_path(self, path):
        path = path.split("?")[0].split("#")[0]
        return super().translate_path(path[len("/BasePeak"):] if path.startswith("/BasePeak/") else "/__none__")
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
PUB = f"http://127.0.0.1:{srv.server_address[1]}/BasePeak/"

ROWS = """() => [...document.querySelectorAll('.exp-tab tbody tr')].map(tr => {
  const b = e => { const q = e.getBoundingClientRect(); return [q.top, q.bottom, q.height]; };
  return { th: b(tr.querySelector('th')), btns: [...tr.querySelectorAll('button')].map(b) };
})"""
BAD_REL = re.compile(r'(?:href|src)="(?!https?:|data:|#|mailto:|about:)[^"]+"')     # a relative address in a downloaded file: it would break offline
try:
    with sync_playwright() as p:
        r.page(p)
        T = f"http://127.0.0.1:{r.port}/static/capitoli/01-cromatografia.html"
        def check(w, theme):
            c = r.b.new_context(viewport={"width": w, "height": 900}, color_scheme=theme); q = c.new_page()
            q.on("pageerror", lambda e: r.errs.append(("pageerror", str(e))))
            q.goto(T); q.wait_for_function("!!window.TEORIA && !!TEORIA.esporta", timeout=10000)
            q.evaluate("TEORIA.esporta()"); q.wait_for_selector(".exp-tab tbody tr")
            rows = q.evaluate(ROWS); assert len(rows) == 4 and all(len(x["btns"]) == 2 for x in rows)
            for x in rows:
                for bt in x["btns"]:
                    assert bt[0] >= x["th"][0] - 1, x
                    assert bt[1] <= x["th"][1] + 1 and bt[2] >= 40, x
                assert abs(x["btns"][0][0] - x["btns"][1][0]) <= 1, x
            tops = [x["th"][0] for x in rows]; bots = [x["th"][1] for x in rows]
            assert all(abs(tops[i + 1] - bots[i]) <= 1 for i in range(3)), (tops, bots)   # rows are contiguous: shared borders
            c.close()
        for w in (1280, 400):
            for th in ("light", "dark"):
                step(f"rows aligned at {w}px, {th}", lambda w=w, th=th: check(w, th))

        # ------------------------------------------------------------------ downloads on the published-like layout
        errs = []
        def newpage(w=1280, h=800, **k):
            c = r.b.new_context(viewport={"width": w, "height": h}, accept_downloads=True, **k); q = c.new_page()
            q.on("pageerror", lambda e: errs.append(("pageerror", str(e))))
            q.on("console", lambda m: errs.append(("console." + m.type, m.text)) if m.type == "error" else None)
            q.on("response", lambda x: errs.append(("http " + str(x.status), x.url)) if x.status >= 400 else None)
            return c, q
        def opened(q, page, phone=False):
            q.goto(PUB + page); q.wait_for_function("!!window.TEORIA && !!TEORIA.esporta && !!document.querySelector('#sc-esporta')", timeout=15000)
            if phone: q.click("#menu"); q.wait_for_selector("#side", state="visible")
            q.click("#sc-esporta"); q.wait_for_selector(".exp-tab tbody tr", state="visible")
        def grab(q, sel, timeout=60000):
            with q.expect_download(timeout=timeout) as d: q.click(sel)
            dl = d.value; data = pathlib.Path(dl.path()).read_bytes(); assert dl.failure() is None, dl.failure()
            return dl.suggested_filename, data.decode("utf-8")
        def chapters(q): return q.evaluate("CHAPTERS.filter(c=>!c[0].startsWith('pratica')).map(c=>[c[1],c[2]])")

        def check_md(name, txt, full, titles):
            assert name.endswith(".md") and txt.startswith("# "), (name, txt[:40])
            for junk in ("Salta al contenuto", "Il sito non è ottimizzato", "undefined", "[object", "Interattivo ·"): assert junk not in txt, junk
            for m in re.finditer(r"^#{1,4} (.+)\n\n#{1,4} (.+)$", txt, re.M): assert m.group(1) != m.group(2), "duplicated heading: " + m.group(1)
            assert len(txt) > (250_000 if full else 3_000), len(txt)
            if full:
                assert txt.count("\n# Capitolo ") + txt.startswith("# Capitolo ") == len(titles), (txt.count("\n# Capitolo "), len(titles))
                for n, t in titles: assert t in txt, t
            assert not re.search(r"\]\((?!https?:|#|mailto:)[^)]+\)", txt), "relative link in the Markdown"
        def check_doc(name, txt, full, titles):
            assert name.endswith(".doc") and txt.startswith("<html xmlns:o=") and txt.rstrip().endswith("</html>") and "<body>" in txt, (name, txt[:60])
            assert len(txt) > (300_000 if full else 8_000), len(txt)
            assert not re.search(r"<script|Salta al contenuto|Il sito non è ottimizzato", txt)
            assert not BAD_REL.search(txt), BAD_REL.search(txt).group(0)
            if full:
                for n, t in titles: assert t.replace("&", "&amp;") in txt or t in txt, t
        def check_html(name, txt, full, titles):
            assert name.endswith(".html") and txt.startswith("<!doctype html>") and "<title>" in txt and txt.rstrip().endswith("</html>"), (name, txt[:50])
            assert len(txt) > (300_000 if full else 8_000), len(txt)
            assert not re.search(r"<script|Salta al contenuto|Il sito non è ottimizzato", txt)
            assert not BAD_REL.search(txt), BAD_REL.search(txt).group(0)      # self-contained: absolute links, images embedded
            assert "<h1" in txt and "<h2" in txt
        CHECK = {"md": check_md, "doc": check_doc, "html": check_html}
        def offline_html(q0, name, txt, tmp):
            """The downloaded HTML opened from the disk with every network request refused still shows its text."""
            f = pathlib.Path(tmp) / name; f.write_text(txt, encoding="utf-8")
            c, q = newpage(); bad = []
            c.route(re.compile(r"^https?://"), lambda route: (bad.append(route.request.url), route.abort())[1])
            q.goto(f.as_uri()); assert q.locator("h1").count() >= 1 and len(q.inner_text("body")) > 2000
            assert not bad, bad[:3]; c.close()

        tmp = tempfile.mkdtemp(prefix="dl_")
        def all_formats(page, phone=False):
            c, q = newpage(*((390, 844) if phone else (1280, 800)), **(dict(is_mobile=True, has_touch=True) if phone else {})); titles = None
            for scope in ("cur", "all"):
                for fmt in ("md", "doc", "html"):
                    opened(q, page, phone); titles = titles or chapters(q)
                    name, txt = grab(q, f"#exp-{scope}-{fmt}")
                    CHECK[fmt](name, txt, scope == "all", titles)
                    assert (name.startswith("BasePeak_Teoria_Completa") if scope == "all" else not name.startswith("mzLab")), name
                    if fmt == "html" and not phone: offline_html(q, name, txt, tmp)
            c.close()
        for pg in ("capitoli/07-quadrupolo.html", "index.html"):
            step(f"{pg}: single chapter and whole handbook in Markdown / Word / HTML download valid files (published layout, 1280 px)", lambda pg=pg: all_formats(pg))
        step("phone 390 px (drawer): single chapter and whole handbook in Markdown / Word / HTML download valid files", lambda: all_formats("capitoli/11-formula.html", True))
        def pratica_page():
            c, q = newpage(); opened(q, "pratica/orale.html"); name, txt = grab(q, "#exp-cur-md"); assert txt.startswith("# ") and len(txt) > 500; c.close()
        step("a Pratica page exports its own text (Markdown)", pratica_page)

        # ---- PDF: the print dialog of the page, with a print stylesheet that leaves only the text
        PRINT_STATE = """() => { const v = s => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; };
          const m = document.querySelector('main').getBoundingClientRect();
          return { hidden: ['#side', '#top', '#cbar', '#tbar', '.pn', '.navtop', '.skip', '#export-modal'].filter(s => !v(s)), mainLeft: m.left, mainW: m.width, vw: innerWidth }; }"""
        def pdf_pages(b): return len(re.findall(rb"/Type\s*/Page\b", b))
        def pdf_single():
            c, q = newpage(); opened(q, "capitoli/07-quadrupolo.html")
            q.evaluate("window.__p = 0; window.print = () => { window.__p++; }; null")
            q.click("#exp-cur-pdf"); assert q.evaluate("window.__p") == 1, "the PDF button did not open the print dialog"
            assert q.evaluate("getComputedStyle(document.getElementById('export-modal')).display") == "none"
            q.emulate_media(media="print"); st = q.evaluate(PRINT_STATE)
            assert st["hidden"] == [] and st["mainLeft"] < 40 and st["mainW"] > st["vw"] - 80, st     # no sidebar, no bars, the text takes the page
            b = q.pdf(); assert b[:5] == b"%PDF-" and len(b) > 30_000 and pdf_pages(b) >= 3, (len(b), pdf_pages(b))
            c.close()
        step("PDF, chapter: opens the print dialog; in print the sidebar and the bars are hidden and the text takes the page; a real PDF comes out", pdf_single)
        def pdf_all():
            c, q = newpage(); opened(q, "capitoli/07-quadrupolo.html"); n = len(chapters(q))
            q.evaluate("window.__p = 0; window.print = () => { window.__p++; }; window.__pop = 0; window.open = () => { window.__pop++; return null; }; null")
            q.click("#exp-all-pdf"); q.wait_for_function("window.__p === 1", timeout=60000)
            assert q.evaluate("window.__pop") == 0, "the package PDF must not need a pop-up window"
            assert q.evaluate("document.querySelectorAll('#print-pack .chapter-block').length") == n
            assert q.evaluate("getComputedStyle(document.getElementById('print-pack')).display") == "none", "the print block must not show on screen"
            q.emulate_media(media="print")
            assert q.evaluate("getComputedStyle(document.getElementById('print-pack')).display") == "block"
            assert q.evaluate("[...document.body.children].filter(e => e.id !== 'print-pack' && getComputedStyle(e).display !== 'none' && !e.matches('script,style,link')).length") == 0
            b = q.pdf(); assert b[:5] == b"%PDF-" and pdf_pages(b) >= 2 * n, (len(b), pdf_pages(b), n)
            q.evaluate("window.dispatchEvent(new Event('afterprint'))")
            assert q.evaluate("!document.getElementById('print-pack') && !document.documentElement.classList.contains('packing')"), "not cleaned after printing"
            c.close()
        step("PDF, whole handbook: every chapter in the page's own print block (no pop-up), a real multi-page PDF, cleaned after printing", pdf_all)

        # ---- file:// (double click): the chapter downloads; the package says why it cannot and creates nothing
        def from_disk():
            c = r.b.new_context(viewport={"width": 1280, "height": 800}, accept_downloads=True); q = c.new_page()
            q.goto((ROOT / "capitoli/07-quadrupolo.html").as_uri()); q.wait_for_function("!!window.TEORIA && !!TEORIA.esporta && !!document.querySelector('#sc-esporta')")
            q.click("#sc-esporta"); name, txt = grab(q, "#exp-cur-md"); check_md(name, txt, False, [])
            got = []; q.on("download", lambda d: got.append(d)); q.click("#exp-all-md"); q.wait_for_selector("#exp-status.err", timeout=20000); q.wait_for_timeout(500)
            assert not got, "a partial package was downloaded"
            assert "Dal disco" in q.inner_text("#exp-status") and "server_teoria" in q.inner_text("#exp-status"), q.inner_text("#exp-status")
            c.close()
        step("file://: the chapter downloads; the whole handbook explains the limit and downloads nothing (never a partial file)", from_disk)

        # ---- keyboard and focus of the dialog
        def keyboard():
            c, q = newpage(); q.goto(PUB + "capitoli/07-quadrupolo.html"); q.wait_for_selector("#sc-esporta"); q.focus("#sc-esporta"); q.keyboard.press("Enter")
            q.wait_for_selector(".exp-tab", state="visible"); assert q.evaluate("document.activeElement.id") == "exp-btn-close", "focus not moved into the dialog"
            for _ in range(15): q.keyboard.press("Tab"); assert q.evaluate("!!document.activeElement.closest('#export-modal')"), "focus left the dialog"
            q.keyboard.press("Escape"); assert q.evaluate("getComputedStyle(document.getElementById('export-modal')).display") == "none"
            assert q.evaluate("document.activeElement.id") == "sc-esporta", "focus not returned"
            c.close()
        step("the dialog takes the focus, keeps it, closes with Esc and gives it back", keyboard)
        def no_errors():
            assert not errs, errs[:5]
        step("no console error, page error or HTTP error (>= 400) in all the downloads above (the published layout has no capitoli/src and none is asked for)", no_errors)
finally:
    r.close(); srv.shutdown(); shutil.rmtree(SITE.parent, ignore_errors=True)
r.report()
for s in steps: print(" ", s)
sys.exit(1 if [s for s in steps if s[1] != "ok"] else 0)
