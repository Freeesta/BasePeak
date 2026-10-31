"""BasePeak has no self-assessment sections: no review-question boxes, no "Domande di ripasso" / "Autoverifica" page or text,
and Pratica is numbered P1..Pn without gaps. The old page pratica/orale.html stays a redirect so old links do not 404."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FORBIDDEN = [re.compile(p, re.I) for p in (r'class="box oral"', r"Domande di ripasso", r"Autoverifica")]


def scanned_files():
    """capitoli/ (html and src, hidden drafts 22-42 included), index.html and pratica/ (pages and scripts)."""
    files = list((ROOT / "capitoli").rglob("*.html")) + list((ROOT / "capitoli" / "src").glob("*.md"))
    files += [ROOT / "index.html"] + [p for p in (ROOT / "pratica").iterdir() if p.suffix in {".html", ".js", ".css"}]
    return sorted(set(files))


def test_no_review_boxes_or_pages():
    hits = [(str(f.relative_to(ROOT)), p.pattern) for f in scanned_files() for p in FORBIDDEN if p.search(f.read_text(encoding="utf-8"))]
    assert not hits, hits


# Files that still carry the skeleton `<h2>Verifica</h2>` because other chats have them open (chemi 22-32, Storia 33-42).
# Their owners drop the section and delete the line here; no new file may be added to this set.
VERIFICA_PENDING = {
    "22-segnale.html",
    "23-formati.html",
    "24-tracce.html",
    "25-picchi.html",
    "26-gruppi.html",
    "27-tabella.html",
    "28-somiglianza.html",
    "29-librerie.html",
    "32-esempio.html",
    "33-storia-mappa.html",
    "34-storia-origini.html",
    "35-storia-aston-dempster.html",
    "36-storia-settori.html",
    "37-storia-tof.html",
    "38-storia-rf.html",
    "39-storia-ft.html",
    "40-storia-sorgenti.html",
    "41-storia-accoppiamenti.html",
    "42-storia-rivelatori-dati.html",
}


def test_no_verifica_section_outside_the_pending_files():
    tripped = {p.name for p in (ROOT / "capitoli").glob("*.html") if "<h2>Verifica</h2>" in p.read_text(encoding="utf-8")}
    assert tripped <= VERIFICA_PENDING, sorted(tripped - VERIFICA_PENDING)
    assert not (VERIFICA_PENDING - tripped), f"already clean, remove from VERIFICA_PENDING: {sorted(VERIFICA_PENDING - tripped)}"
    twins = {p.stem for p in (ROOT / "capitoli" / "src").glob("*.md") if re.search(r"^## Verifica$", p.read_text(encoding="utf-8"), re.M)}
    assert twins <= {Path(f).stem for f in VERIFICA_PENDING}, sorted(twins)


def test_new_chapter_skeleton_has_no_verifica():
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    import nuovo_capitolo
    t = nuovo_capitolo.build(25, "Prova", "scheda-x")
    assert "Verifica" not in t and 'class="q"' not in t


def test_no_review_page_data_or_menu_row():
    assert not (ROOT / "pratica" / "domande.js").exists()
    js = (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")
    assert "pratica/orale.html" not in js and "autoverifica" not in js.lower()


def test_old_review_page_redirects_to_pratica_home():
    stub = (ROOT / "pratica" / "orale.html").read_text(encoding="utf-8")
    assert re.search(r'http-equiv="refresh" content="0; url=index\.html"', stub) and "<h1" not in stub


def test_pratica_rows_numbered_without_gaps():
    js = (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")
    block = js[js.index("const CHAPTERS = ["):]
    block = block[:block.index("\n];")]
    nums = [n for f, n in re.findall(r'\["(pratica/[^"]+)", "(P\d*)"', block) if n != "P"]
    assert nums == [f"P{i}" for i in range(1, len(nums) + 1)] and len(nums) == 7, nums
