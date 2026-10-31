"""Image licence and size test (plan docs/piani/storia-ms.md, section 4.3): every image is listed in docs/IMMAGINI.md with an allowed licence,
the files are small and safe, and every <img> in the pages is lazy, sized, described and credited in its caption."""
import fnmatch
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
EXT = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".avif"}
LICENCES = [r"Pubblico dominio", r"CC0 1\.0", r"CC BY (2\.0|2\.5|3\.0|4\.0)", r"Originale \(CC BY 4\.0, BasePeak\)", r"MIT \(BasePeak\)"]
STORIA_LICENCES = LICENCES[:4]
RASTER_MAX, SVG_MAX, DATA_URI_MAX = 92160, 25600, 1024
CAPTION_WORD = [(r"Pubblico dominio", "pubblico dominio"), (r"CC0 1\.0", "cc0"), (r"CC BY (\d\.\d)", None), (r"Originale", "disegno originale")]
FIELDS = ["file", "mostra", "fonte", "autore", "data", "licenza", "attribuzione", "modifiche", "stato"]


def rows(md):
    """Rows of the tables of IMMAGINI.md: dicts keyed by FIELDS (file without backticks)."""
    out = []
    for line in md.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if line.startswith("|") and len(cells) == len(FIELDS) and cells[0].startswith("`"):
            d = dict(zip(FIELDS, cells))
            d["file"] = d["file"].strip("`")
            out.append(d)
    return out


def images(root):
    return sorted(p for p in (root / "assets").rglob("*") if p.is_file() and p.suffix.lower() in EXT)


def matches(rel, pattern):
    return rel == pattern or fnmatch.fnmatchcase(rel, pattern)


def is_storia(rel):
    return rel.startswith("assets/img/storia/")


def check_listing(root, table):
    """Checks 1-4 and 9. Returns a list of problems."""
    bad, files = [], [p.relative_to(root).as_posix() for p in images(root)]
    for rel in files:
        n = sum(matches(rel, r["file"]) for r in table)
        if n != 1:
            bad.append(f"{rel}: {n} rows in IMMAGINI.md (need exactly 1)")
    for r in table:
        if not any(matches(f, r["file"]) for f in files):
            bad.append(f"{r['file']}: row without a file")
        allowed = STORIA_LICENCES if is_storia(r["file"]) else LICENCES
        if not any(re.fullmatch(a, r["licenza"]) for a in allowed):
            bad.append(f"{r['file']}: licence not allowed here: {r['licenza']!r}")
        if not r["stato"].startswith("verificata"):
            bad.append(f"{r['file']}: stato must start with 'verificata'")
        if not (r["fonte"].startswith("https://") or r["fonte"] == "disegno originale"):
            bad.append(f"{r['file']}: fonte must be an https:// URL or 'disegno originale'")
        if not r["autore"] or not r["attribuzione"]:
            bad.append(f"{r['file']}: autore and attribuzione must not be empty")
    terzi = (root / "LICENZE-TERZI.md").read_text(encoding="utf-8") if (root / "LICENZE-TERZI.md").exists() else ""
    for rel in files:
        if rel.startswith("assets/img/storia/foto/") and Path(rel).name not in terzi:
            bad.append(f"{rel}: not named in LICENZE-TERZI.md")
    return bad


def check_files(root):
    """Checks 5 and 6."""
    bad = []
    for p in images(root):
        rel, size = p.relative_to(root).as_posix(), p.stat().st_size
        if not rel.startswith("assets/img/"):
            continue
        if p.suffix.lower() == ".svg":
            if size > SVG_MAX:
                bad.append(f"{rel}: SVG {size} bytes > {SVG_MAX}")
            t = p.read_text(encoding="utf-8", errors="replace")
            if re.search(r"<script", t, re.I) or re.search(r"\son\w+\s*=", t, re.I) or re.search(r"(xlink:)?href\s*=\s*[\"']https?:", t, re.I):
                bad.append(f"{rel}: SVG with script, event handler or external href")
            for m in re.finditer(r"<image\b[^>]*>", t, re.I):
                u = re.search(r"data:[^\"']*", m.group(0))
                if u and len(u.group(0)) > DATA_URI_MAX:
                    bad.append(f"{rel}: <image> with a data URI over 1 KB")
        elif p.suffix.lower() not in (".webp", ".jpg", ".jpeg"):
            bad.append(f"{rel}: raster under assets/img/ must be .webp/.jpg/.jpeg")
        elif size > RASTER_MAX:
            bad.append(f"{rel}: raster {size} bytes > {RASTER_MAX}")
    return bad


def check_pages(root, table):
    """Checks 7 and 8."""
    bad, pages = [], [root / "index.html", *sorted((root / "capitoli").glob("*.html")), *sorted((root / "pratica").glob("*.html"))]
    for page in pages:
        if not page.exists():
            continue
        text = page.read_text(encoding="utf-8")
        for m in re.finditer(r"<(img|source)\b([^>]*)>", text, re.I):
            attrs = dict(re.findall(r'([\w-]+)\s*=\s*"([^"]*)"', m.group(2)))
            src = attrs.get("src", "")
            if re.match(r"(https?:|//)", src):
                bad.append(f"{page.name}: external {m.group(1)} src {src}")
            if m.group(1).lower() != "img":
                continue
            target = (page.parent / src).resolve()
            try:
                rel = target.relative_to(root).as_posix()
            except ValueError:
                continue
            if not rel.startswith("assets/img/"):
                continue
            if attrs.get("loading") != "lazy" or attrs.get("decoding") != "async":
                bad.append(f"{page.name}: {rel} needs loading=\"lazy\" decoding=\"async\"")
            if not (attrs.get("width", "").isdigit() and attrs.get("height", "").isdigit()):
                bad.append(f"{page.name}: {rel} needs numeric width and height")
            if not attrs.get("alt", "").strip():
                bad.append(f"{page.name}: {rel} needs a non-empty alt")
            row = next((r for r in table if matches(rel, r["file"])), None)
            fig = None
            for f in re.finditer(r"<figure\b.*?</figure>", text, re.S | re.I):
                if f.start() < m.start() < f.end():
                    fig = f.group(0)
            cap = re.search(r"<figcaption\b.*?</figcaption>", fig or "", re.S | re.I)
            if row is None or cap is None:
                bad.append(f"{page.name}: {rel} must be listed and sit in a <figure> with a <figcaption>")
                continue
            lic = row["licenza"]
            word = "pubblico dominio" if lic.startswith("Pubblico") else "cc0" if lic.startswith("CC0") else lic.lower() if lic.startswith("CC BY") else "disegno originale"
            if word not in cap.group(0).lower():
                bad.append(f"{page.name}: caption of {rel} must contain {word!r}")
    return bad


def load():
    return rows((ROOT / "docs" / "IMMAGINI.md").read_text(encoding="utf-8"))


def test_every_image_is_listed_with_an_allowed_licence():
    assert check_listing(ROOT, load()) == []


def test_files_are_small_and_safe():
    assert check_files(ROOT) == []


def test_images_in_pages_are_lazy_sized_described_and_credited():
    assert check_pages(ROOT, load()) == []


# ---- the checks must fail on a deliberately bad case (tmp_path fixture) ----

HEAD = "| File | Mostra | Fonte | Autore | Data | Licenza | Attribuzione | Modifiche | Stato |\n|---|---|---|---|---|---|---|---|---|\n"


def row(path, lic="CC BY 4.0", fonte="https://commons.wikimedia.org/wiki/File:X.jpg"):
    return f"| `{path}` | prova | {fonte} | Autore | 1950 | {lic} | Autore, CC BY 4.0 | nessuna | verificata 2026-10-31 |\n"


@pytest.fixture
def site(tmp_path):
    (tmp_path / "assets" / "img" / "storia" / "foto").mkdir(parents=True)
    (tmp_path / "capitoli").mkdir()
    (tmp_path / "LICENZE-TERZI.md").write_text("foto.webp x.svg", encoding="utf-8")
    return tmp_path


def put(site, rel, data=b"x"):
    p = site / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    return p


def page(site, img, fig=True):
    body = f"<figure>{img}<figcaption>Autore, CC BY 4.0</figcaption></figure>" if fig else img
    (site / "capitoli" / "01-x.html").write_text(f"<main>{body}</main>", encoding="utf-8")


GOOD_IMG = '<img src="../assets/img/storia/foto/foto.webp" alt="Un apparecchio" width="10" height="10" loading="lazy" decoding="async">'


def test_good_case_passes(site):
    put(site, "assets/img/storia/foto/foto.webp")
    table = rows(HEAD + row("assets/img/storia/foto/foto.webp"))
    page(site, GOOD_IMG)
    assert check_listing(site, table) == [] and check_files(site) == [] and check_pages(site, table) == []


def test_unlisted_image_fails(site):
    put(site, "assets/img/storia/foto/foto.webp")
    assert any("0 rows" in b for b in check_listing(site, rows(HEAD)))


def test_non_commercial_licence_fails(site):
    put(site, "assets/img/storia/foto/foto.webp")
    assert any("licence not allowed" in b for b in check_listing(site, rows(HEAD + row("assets/img/storia/foto/foto.webp", "CC BY-NC 4.0"))))


def test_120_kb_webp_fails(site):
    put(site, "assets/img/storia/foto/foto.webp", b"x" * 120 * 1024)
    assert any("raster" in b for b in check_files(site))


def test_img_without_lazy_fails(site):
    put(site, "assets/img/storia/foto/foto.webp")
    table = rows(HEAD + row("assets/img/storia/foto/foto.webp"))
    page(site, GOOD_IMG.replace(' loading="lazy"', ""))
    assert any("lazy" in b for b in check_pages(site, table))


def test_svg_with_script_fails(site):
    put(site, "assets/img/storia/schemi/x.svg", b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>")
    assert any("script" in b for b in check_files(site))


def test_external_src_and_missing_caption_fail(site):
    put(site, "assets/img/storia/foto/foto.webp")
    table = rows(HEAD + row("assets/img/storia/foto/foto.webp"))
    page(site, GOOD_IMG.replace("../assets", "https://example.org/assets"))
    assert any("external" in b for b in check_pages(site, table))
    page(site, GOOD_IMG, fig=False)
    assert any("figcaption" in b for b in check_pages(site, table))


def test_photo_not_named_in_third_party_licences_fails(site):
    put(site, "assets/img/storia/foto/altra.webp")
    assert any("LICENZE-TERZI" in b for b in check_listing(site, rows(HEAD + row("assets/img/storia/foto/altra.webp"))))


def test_storia_skeleton_has_no_placeholder_text():
    """Federico's rule: no «in costruzione» / «in preparazione» box or sentence in any chapter, drafts included."""
    for p in sorted((ROOT / "capitoli").glob("*-storia-*.html")) + sorted((ROOT / "capitoli" / "src").glob("*-storia-*.md")):
        t = p.read_text(encoding="utf-8").lower()
        assert "in costruzione" not in t and "in preparazione" not in t and "todo" not in t, p.name
