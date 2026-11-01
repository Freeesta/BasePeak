"""Teoria export: every downloaded file is «smart» (linked inside itself).
On the published-like layout (index.html, capitoli/, pratica/, assets/ only, served under /BasePeak/) the real «Scarica» buttons are clicked: single chapter and whole handbook, in Markdown, Word, HTML
(+ the print block of the PDF of the whole handbook). In every output: every internal link (#x) has a matching anchor in the same output (no dangling anchor), anchors are unique, the index has a link
for every chapter that is included, a link from a chapter to another included chapter is internal (never the website), in the single chapter the links to other chapters are absolute site URLs and the
list of the sections works. The PDF of the handbook keeps its links as real link annotations.
Run: python3 tests_e2e/e2e_teoria_scarica_link.py"""
import sys, os, re, shutil, tempfile, threading, http.server, pathlib
from html.parser import HTMLParser
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
steps = []
def step(name, fn):
    try: fn(); steps.append((name, "ok"))
    except Exception as e:
        import traceback; ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith("e2e_teoria_scarica_link.py")][-1]
        steps.append((name, f"FAIL (line {ln}) " + str(e).split("\n")[0][:300]))
r = Run(port=8978, wd="/tmp/wd_teoria_scarica_link")

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

class Scan(HTMLParser):
    """ids, <a name> bookmarks, hrefs and the anchor text of an HTML output."""
    def __init__(self):
        super().__init__(); self.ids, self.names, self.hrefs, self.dup = [], [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"): self.ids.append(a["id"])
        if tag == "a" and a.get("name"): self.names.append(a["name"])
        if tag == "a" and a.get("href"): self.hrefs.append(a["href"])
def scan_html(txt):
    s = Scan(); s.feed(txt); anchors = s.ids + s.names
    dup = sorted({x for x in anchors if anchors.count(x) > 1}); assert not dup, ("duplicate anchors", dup[:5])
    inner = [h[1:] for h in s.hrefs if h.startswith("#")]
    dang = sorted({x for x in inner if x not in set(anchors)}); assert not dang, ("dangling anchors", dang[:5], len(dang))
    return set(anchors), inner, s.hrefs
def scan_md(txt):
    anchors = re.findall(r'<a id="([^"]+)"></a>', txt)
    dup = sorted({x for x in anchors if anchors.count(x) > 1}); assert not dup, ("duplicate anchors", dup[:5])
    inner = re.findall(r"\]\(#([^)]+)\)", txt)
    dang = sorted({x for x in inner if x not in set(anchors)}); assert not dang, ("dangling anchors", dang[:5], len(dang))
    return set(anchors), inner, re.findall(r"\]\((https?:[^)]+)\)", txt)

try:
    with sync_playwright() as p:
        r.page(p)
        errs = []
        def newpage():
            c = r.b.new_context(viewport={"width": 1280, "height": 800}, accept_downloads=True); q = c.new_page()
            q.on("pageerror", lambda e: errs.append(("pageerror", str(e))))
            q.on("console", lambda m: errs.append(("console." + m.type, m.text)) if m.type == "error" else None)
            return c, q
        def opened(q, page):
            q.goto(PUB + page); q.wait_for_function("!!window.TEORIA && !!TEORIA.esporta && !!document.querySelector('#sc-esporta')", timeout=15000)
            q.click("#sc-esporta"); q.wait_for_selector(".exp-tab tbody tr", state="visible")
        def grab(q, sel):
            with q.expect_download(timeout=90000) as d: q.click(sel)
            dl = d.value; return dl.suggested_filename, pathlib.Path(dl.path()).read_bytes().decode("utf-8")
        c0, q0 = newpage(); q0.goto(PUB + "index.html"); q0.wait_for_function("typeof CHAPTERS !== 'undefined'")
        CH = q0.evaluate("CHAPTERS.filter(c => !c[0].startsWith('pratica')).map(c => c[0])"); c0.close()
        def NUM(f):   # the id of the block of a chapter: cap-NN from the number in the file name, else cap-<name> (as capIdOf() in assets/esporta.js)
            b = re.sub(r"\.html$", "", f.split("/")[-1]); m = re.match(r"\d+", b); return "cap-" + (m.group(0) if m else re.sub(r"[^a-z0-9]+", "-", b.lower()).strip("-"))
        CAPS = [NUM(f) for f in CH]
        assert len(CAPS) >= 30 and len(set(CAPS)) == len(CAPS), CAPS
        INCL = {PUB + f for f in CH}
        SCAN = {"md": scan_md, "doc": scan_html, "html": scan_html}
        ALL = {}
        def whole(fmt):
            c, q = newpage(); opened(q, "index.html"); name, txt = grab(q, f"#exp-all-{fmt}"); c.close(); ALL[fmt] = txt
            anchors, inner, ext = SCAN[fmt](txt)
            for cid in CAPS: assert cid in anchors, ("chapter block missing", cid)
            idx = set(inner)
            for cid in CAPS: assert cid in idx, ("no index link for chapter", cid)
            ns = [x for x in inner if "--" in x]; assert len(ns) > 50, ("too few in-file section / cross links", len(ns))
            # a chapter that links to another included chapter: the link is internal and the website address of that chapter is gone
            cross = [x for x in set(inner) if x.startswith("cap-") and "--" in x]
            assert cross, "no cross-reference"
            site_chapters = [h for h in ext if h.split("#")[0] in INCL]   # a chapter that is NOT in the file (a hidden draft) correctly keeps its site address
            assert not site_chapters, ("links to the website for chapters that are in the file", site_chapters[:3])
            if fmt == "html": assert 'class="back-index"' in txt and txt.count('href="#indice-dispensa"') >= len(CAPS), "torna all'indice"
            if fmt == "doc": assert len(re.findall(r'<a name="cap-[a-z0-9]+"></a>', txt)) >= len(CAPS), "Word bookmarks"
            if fmt == "md": assert "\n# Capitolo " in txt and re.search(r"^- \[Capitolo \d+: .+\]\(#cap-\d+\)$", txt, re.M)
        for fmt in ("md", "doc", "html"):
            step(f"whole handbook, {fmt}: no dangling or duplicate anchor, an index link per chapter, cross-references inside the file, none to the website", lambda fmt=fmt: whole(fmt))
        def cross_example():
            # chapter 20 (formulario) links to 22-segnale / 27-tabella with relative links in its text: inside the whole file they point at cap-22 / cap-27, from inside the block of cap-20
            for fmt, a, b in (("html", 'id="cap-20"', 'id="cap-21"'), ("doc", 'name="cap-20"', 'name="cap-21"'), ("md", '<a id="cap-20"></a>', '<a id="cap-21"></a>')):
                blk = ALL[fmt][ALL[fmt].index(a):ALL[fmt].index(b)]
                assert re.search(r"#cap-22(--[^)\"]*)?[)\"]", blk) and re.search(r"#cap-27(--[^)\"]*)?[)\"]", blk), fmt
        step("a link from a chapter (20-formulario) to other included chapters (22-segnale, 27-tabella) is an in-file anchor", cross_example)

        def single(page, fmt):
            c, q = newpage(); opened(q, page); name, txt = grab(q, f"#exp-cur-{fmt}"); c.close()
            anchors, inner, ext = SCAN[fmt](txt)
            cid = NUM(page); assert cid in anchors and f"{cid}-toc" in anchors if fmt != "md" else cid in anchors, (cid, sorted(anchors)[:4])
            toc = [x for x in inner if x.startswith(cid + "--")]; assert len(toc) >= 3, ("section list", len(toc))
            others = [h for h in ext if re.match(re.escape(PUB) + r"capitoli/\d+-[^/#]+\.html", h) and not h.startswith(PUB + page)]
            assert others, "links to the other chapters must stay absolute site URLs"
            assert not [x for x in inner if x.startswith("cap-") and not x.startswith(cid)], "an internal link to a chapter that is not in the file"
            return txt
        for fmt in ("md", "doc", "html"):
            step(f"single chapter (20-formulario), {fmt}: section list and in-chapter links work; links to other chapters are absolute site URLs", lambda fmt=fmt: single("capitoli/20-formulario.html", fmt))
        def pratica_single():
            c, q = newpage(); opened(q, "pratica/formula.html"); name, txt = grab(q, "#exp-cur-html"); c.close()
            anchors, inner, ext = scan_html(txt); assert "cap-formula" in anchors, sorted(anchors)[:3]
        step("a Pratica page (no chapter number), html: block id from its name, no dangling anchor", pratica_single)

        def pdf_pack():
            c, q = newpage(); opened(q, "index.html")
            q.evaluate("window.__p = 0; window.print = () => { window.__p++; }; null")
            q.click("#exp-all-pdf"); q.wait_for_function("window.__p === 1", timeout=90000)
            res = q.evaluate("""INCL => { const pk = document.getElementById('print-pack'), ids = [...document.querySelectorAll('[id]')].map(e => e.id);
              const hrefs = [...pk.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1));
              const dup = ids.filter((x, i) => ids.indexOf(x) !== i), dang = hrefs.filter(h => !document.getElementById(h));
              const idx = [...pk.querySelectorAll('nav[aria-label=Indice] a')].map(a => a.getAttribute('href').slice(1));
              const css = a => getComputedStyle(a); return { dup: dup.slice(0, 5), dang: dang.slice(0, 5), n: hrefs.length, idx, blocks: [...pk.querySelectorAll('.chapter-block')].map(b => b.id),
                tocs: pk.querySelectorAll('.cap-toc').length, site: [...pk.querySelectorAll('a[href]')].filter(a => INCL.includes(a.getAttribute('href').split('#')[0])).length }; }""", sorted(INCL))
            assert not res["dup"] and not res["dang"], res
            assert res["idx"] == CAPS and res["blocks"] == CAPS and res["tocs"] >= 30 and res["n"] > 400 and res["site"] == 0, {k: (v if k != "idx" else len(v)) for k, v in res.items() if k not in ("blocks",)}
            q.emulate_media(media="print")
            under = q.evaluate("(() => { const a = document.querySelector('#print-pack nav a'); const s = getComputedStyle(a); return [s.textDecorationLine, s.color, getComputedStyle(document.querySelector('#print-pack')).color]; })()")
            assert "underline" in under[0] and under[1] == under[2], under     # readable in print: underlined, same colour as the text
            b = q.pdf(); links = len(re.findall(rb"/Subtype\s*/Link", b)); assert b[:5] == b"%PDF-" and links > 400, ("link annotations in the PDF", links)
            q.evaluate("window.dispatchEvent(new Event('afterprint'))"); c.close()
        step("PDF of the whole handbook: index + section lists + cross-references are real links (no dangling / duplicate id, underlined in print, link annotations in the PDF)", pdf_pack)

        def pdf_single():
            c, q = newpage(); opened(q, "capitoli/20-formulario.html")
            q.evaluate("window.__p = 0; window.print = () => { window.__p++; }; null"); q.click("#exp-cur-pdf")
            assert q.evaluate("window.__p") == 1
            res = q.evaluate("""() => { const t = document.querySelector('.print-toc'); return t ? [...t.querySelectorAll('a')].map(a => !!document.getElementById(a.getAttribute('href').slice(1))) : null; }""")
            assert res and len(res) >= 3 and all(res), res
            assert q.evaluate("getComputedStyle(document.querySelector('.print-toc')).display") == "none", "the list must not show on screen"
            q.emulate_media(media="print"); assert q.evaluate("getComputedStyle(document.querySelector('.print-toc')).display") == "block"
            q.evaluate("window.dispatchEvent(new Event('afterprint'))"); assert q.evaluate("!document.querySelector('.print-toc')")
            c.close()
        step("PDF of a chapter: the list of its sections (links to the headings) shows in print only and is removed after printing", pdf_single)
        step("no console or page error", lambda: (lambda: None)() if not errs else (_ for _ in ()).throw(AssertionError(errs[:3])))
finally:
    r.close(); srv.shutdown(); shutil.rmtree(SITE.parent, ignore_errors=True)
r.report()
for s in steps: print(" ", s)
sys.exit(1 if [s for s in steps if s[1] != "ok"] else 0)
