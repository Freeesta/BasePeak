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
    assert [int(n) for _, n in rows] == list(range(1, len(rows) + 1)) and len(rows) == 21
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
    for f, n in chapter_rows():
        slug = Path(f).name.split("-", 1)[1]
        old = CAP / f"{int(n) + 2:02d}-{slug}"
        assert stub_target(old) == Path(f).name, (old.name, Path(f).name)
