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
