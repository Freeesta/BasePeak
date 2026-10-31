"""Chapter numbering: the chapters run 1..N without gaps (file prefix, CHAPTERS, kicker, figure numbers), and every old name still redirects."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAP = ROOT / "capitoli"
# names that were published before the renumbering (3..23 -> 1..21): they must stay redirects to the chapter that now has the same slug
OLD_NUMBERS = range(3, 24)


def chapter_rows():
    js = (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")
    block = js[js.index("const CHAPTERS = ["):]
    block = block[:block.index("\n];")]
    return re.findall(r'\["(capitoli/[^"]+)", "(\d+)"', block)


def stub_target(p):
    m = re.search(r'http-equiv="refresh" content="0; url=([^"]+)"', p.read_text(encoding="utf-8"))
    return m.group(1) if m else None


def test_numbers_run_from_1_without_gaps():
    rows = chapter_rows()
    assert [int(n) for _, n in rows] == list(range(1, len(rows) + 1)) and len(rows) == 42
    for f, n in rows:
        assert Path(f).name.startswith(f"{int(n):02d}-"), (f, n)
        assert (ROOT / f).is_file(), f


def test_kicker_and_figures_follow_the_number():
    for f, n in chapter_rows():
        text = (ROOT / f).read_text(encoding="utf-8")
        assert f'<div class="kicker">Capitolo {n}</div>' in text, f
        assert not re.findall(rf"Figura (?!{n}\.)\d+\.\d+", text) or "McLafferty" in text, f
        src = (ROOT / "capitoli" / "src" / (Path(f).stem + ".md")).read_text(encoding="utf-8")
        assert f"{{kicker: Capitolo {n}}}" in src, f


def test_old_names_redirect_to_the_same_chapter():
    new = {Path(f).name.split("-", 1)[1]: Path(f).name for f, _ in chapter_rows()}     # slug.html -> NN-slug.html
    for n in OLD_NUMBERS:
        olds = [p for p in CAP.glob(f"{n:02d}-*.html")]
        assert olds, n
    for p in sorted(CAP.glob("*.html")):
        t = stub_target(p)
        if t is None:
            continue
        assert (CAP / t).resolve().is_file(), (p.name, t)
        assert t == "../index.html" or t in new.values(), (p.name, t)       # a redirect never points to another redirect
    # the 21 names of the chapters before the renumbering
    for f, n in chapter_rows()[:21]:      # parts VII (22-32) and VII Storia (33-42) are new: it never had an old name
        slug = Path(f).name.split("-", 1)[1]
        old = CAP / f"{int(n) + 2:02d}-{slug}"
        assert stub_target(old) == Path(f).name, (old.name, Path(f).name)


def draft_stems():
    """File stems of the rows still flagged as administrator-only drafts (5th field `true`) in CHAPTERS."""
    js = (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")
    block = js[js.index("const CHAPTERS = ["):]
    return {Path(f).stem for f in re.findall(r'\["(capitoli/[^"]+)", "[^"]*", "[^"]*", "[^"]*", true\]', block[:block.index("\n];")])}


def test_no_chapter_contains_a_construction_placeholder():
    """No chapter file may carry a «in costruzione» box. The only files not scanned are the drafts still hidden from readers (5th field `true`), which
    are being written: they cannot be published (flag removed) while the words are in them, because from then on this test covers them too."""
    drafts = draft_stems()
    bad = [str(p.relative_to(ROOT)) for p in sorted(CAP.rglob("*")) if p.is_file() and p.stem not in drafts and "in costruzione" in p.read_text(encoding="utf-8", errors="replace").lower()]
    assert not bad, bad
