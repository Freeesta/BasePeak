"""Part VII "Chemioinformatica" (chapters 22-32): rows, files, twins, lazy figures, size budgets, anchors, DOI integrity.
No network. The node test of assets/chemi-common.js runs from here (node must exist: a missing node is a failure, not a skip)."""
import csv
import gzip
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
CAP = ROOT / "capitoli"
ASSETS = ROOT / "assets"
PART = "VII. Chemioinformatica"
NUMS = range(22, 33)
TSV = ROOT / "docs" / "piani" / "riferimenti-chemioinformatica.tsv"


def rows():
    js = (ASSETS / "teoria.js").read_text(encoding="utf-8")
    block = js[js.index("const CHAPTERS = ["):]
    block = block[:block.index("\n];")]
    return re.findall(r'\["(capitoli/[^"]+)", "(\d+)", "([^"]+)", "([^"]+)"', block)


def part_rows():
    return [r for r in rows() if int(r[1]) in NUMS]


def pages():
    return [ROOT / f for f, _, _, _ in part_rows()]


def text(p):
    return p.read_text(encoding="utf-8")


def gz(p):
    return len(gzip.compress(p.read_bytes(), 9))


def figure_files():
    return sorted(ASSETS.glob("sim-chemi-*.js"))


def slug(s):
    """Python port of slug() in assets/teoria.js."""
    s = unicodedata.normalize("NFD", s.lower())
    s = re.sub("[̀-ͯ]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"^-|-$", "", s)[:48]


def anchors(p):
    """Ids of a page: the explicit ones plus the ones teoria.js gives to the headings of main (same text, same id; a repeat gets -2, -3...)."""
    t = text(p)
    used = set(re.findall(r'\bid="([^"]+)"', t))
    out = set(used)
    main = t[t.index("<main>"):] if "<main>" in t else t
    for m in re.finditer(r"<h([234])([^>]*)>(.*?)</h\1>", main, re.S):
        if re.search(r'\bid="', m.group(2)):
            continue
        base = slug(re.sub(r"<[^>]+>", "", m.group(3)).replace("&amp;", "&").strip()) or "sezione"
        i, n = base, 2
        while i in used:
            i, n = f"{base}-{n}", n + 1
        used.add(i)
        out.add(i)
    return out


def site_pages():
    return [ROOT / "index.html"] + sorted(CAP.glob("*.html")) + sorted((ROOT / "pratica").glob("*.html"))


# ---------------------------------------------------------------- rows, files, twins

def test_rows_22_to_32():
    rs = part_rows()
    assert [int(n) for _, n, _, _ in rs] == list(NUMS)
    assert all(part == PART for _, _, _, part in rs)
    assert sum(1 for r in rows() if r[3] == PART) == 11
    names = [r[0] for r in rows()]
    first = names.index(rs[0][0])
    assert names[first:first + 11] == [r[0] for r in rs], "part VII rows come right after row 21, in order"
    assert rows()[first - 1][1] == "21", "row 21 comes just before part VII"
    for f, n, _, _ in rs:
        assert (ROOT / f).is_file(), f
        assert Path(f).name.startswith(f"{int(n):02d}-"), f
        # the .md twin is optional: the html is the only source (docs/COME-MODIFICARE.md); a twin that exists is not required to follow it


def test_public_pages_not_hidden():
    """The chapter files themselves carry no draft marker; whether part VII is visible is decided only by the 5th field of its CHAPTERS rows."""
    for p in pages():
        t = text(p)
        assert "data-esteso" not in t and "noindex" not in t, p.name


def test_parts_vii_and_viii_are_published():
    """Part VII is published: no row 22-32 carries the 5th field `true` (readers see it). The Storia rows 33-42 are published too: no 5th field."""
    js = text(ASSETS / "teoria.js")
    assert not re.findall(r'\["capitoli/(?:2[2-9]|3[0-2])-[^"]*", "\d+", "[^"]*", "[^"]*", true\]', js)
    published = re.findall(r'\["capitoli/((?:2[2-9]|3[0-2])-[^"]*)", "\d+", "[^"]*", "VII\. Chemioinformatica"\]', js)
    assert len(published) == 11, published
    assert not re.findall(r'\["capitoli/(?:3[3-9]|4[0-2])-[^"]*", "\d+", "[^"]*", "[^"]*", true\]', js)
    storia = re.findall(r'\["capitoli/(3[3-9]|4[0-2])-[^"]*", "\d+", "[^"]*", "VIII\. Storia"\]', js)
    assert len(storia) == 10, storia


def test_one_storia_per_chapter():
    for p in pages():
        assert len(re.findall(r'<details class="q storia">', text(p))) == 1, p.name


def test_chapter_loads_common_after_teoria_and_no_direct_figure_script():
    for p in pages():
        t = text(p)
        srcs = re.findall(r'<script src="([^"]+)"', t)
        assert "../assets/teoria.js" in srcs and "../assets/chemi-common.js" in srcs, p.name
        assert srcs.index("../assets/chemi-common.js") > srcs.index("../assets/teoria.js"), p.name
        assert not any("sim-chemi-" in s for s in srcs), p.name


def test_data_sim_targets_exist_and_ids_are_unique():
    seen = set()
    for p in pages():
        for m in re.finditer(r'<div class="sim" id="([^"]+)" data-sim="([^"]+)"', text(p)):
            i, src = m.groups()
            assert i.startswith("sim-chemi-"), (p.name, i)
            assert i not in seen, f"duplicate figure id {i}"
            seen.add(i)
            assert (p.parent / src).resolve().is_file(), (p.name, src)
            assert (p.parent / src).resolve().name.startswith("sim-chemi-"), (p.name, src)
    assert len(seen) == 20, f"design section 5 has 20 figures, found {len(seen)}"


def test_every_figure_file_is_used_and_owned():
    used = {Path(s).name for p in pages() for s in re.findall(r'data-sim="([^"]+)"', text(p))}
    assert used == {f.name for f in figure_files()}
    for f in figure_files():
        assert re.search(r"owned by DEV-CHEMI-0\d", text(f)), f.name


# ---------------------------------------------------------------- budgets and content rules

def test_gzip_budget():
    assert gz(ASSETS / "chemi-common.js") <= 4096
    for f in figure_files():
        assert gz(f) <= 15360, f.name
    for p in pages():
        assert p.stat().st_size <= 40960, p.name


def test_no_network_in_part_vii_scripts():
    for f in [ASSETS / "chemi-common.js"] + figure_files():
        t = text(f)
        assert not re.search(r"https?://", t), f.name
        assert not re.search(r"\bfetch\s*\(|XMLHttpRequest|WebSocket|importScripts|new Worker", t), f.name


def test_forbidden_topics_absent():
    for p in pages():
        assert not re.search(r"(?i:fotocatal|prodotti di trasformazione)|\bTiO", text(p)), p.name


def split_sections(t):
    main = t[t.index("<main>"):t.index("</main>")]
    return re.split(r"(?=<h2[ >])", main)


def words(html):
    return len(re.sub(r"<[^>]+>", " ", html).split())


def test_words_per_section_and_paragraph():
    for p in pages():
        t = text(p)
        for sec in split_sections(t)[1:]:
            assert words(sec) <= 350, (p.name, re.sub(r"<[^>]+>", "", sec[:50]), words(sec))
        for par in re.findall(r"<p[ >].*?</p>", t, re.S):
            assert words(par) <= 90, (p.name, par[:60])


def test_headings_do_not_skip_levels():
    for p in pages():
        prev = 0
        for lv in re.findall(r"<h([1-6])[ >]", text(p)):
            assert int(lv) <= prev + 1, (p.name, lv)
            prev = int(lv)


# ---------------------------------------------------------------- anchors

def test_anchors_resolve():
    ids = {p.name: anchors(p) for p in site_pages()}
    parts = {p.name for p in pages()}
    bad = []
    for p in site_pages():
        for h in re.findall(r'href="([^"]*#[^"]+)"', text(p)):
            if re.match(r"[a-z][a-z0-9+.-]*:", h):
                continue
            f, _, frag = h.partition("#")
            target = p.name if not f else Path(f).name
            if p.name not in parts and target not in parts:
                continue                                  # only chapters 22-32 and links into them
            if target not in ids or frag not in ids[target]:
                bad.append(f"{p.name} -> {h}")
    assert not bad, "\n".join(bad)


def test_slug_port_matches_known_ids():
    assert slug("Potere risolutivo e risoluzione") == "potere-risolutivo-e-risoluzione"
    assert slug("Che cosa c'è in un file di dati") == "che-cosa-c-e-in-un-file-di-dati"
    assert "potere-risolutivo-e-risoluzione" in anchors(CAP / "09-risoluzione.html")


# ---------------------------------------------------------------- node

def test_chemi_common_node():
    node = shutil.which("node")
    assert node, "node is required (the figure engine is tested in node)"
    r = subprocess.run([node, str(ROOT / "tests" / "chemi_common_node.mjs")], capture_output=True, encoding="utf-8")
    assert r.returncode == 0, r.stdout + r.stderr


# ---------------------------------------------------------------- DOI integrity (pytest -k doi)

def tsv_rows():
    with TSV.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh, delimiter="\t"))


def dois(p):
    return [d.rstrip(".,;)").lower() for d in re.findall(r'doi\.org/(10\.[^"\s<>]+)', text(p))]


def test_doi_every_published_doi_is_in_the_tsv():
    known = {r["doi"].lower() for r in tsv_rows() if r["doi"]}
    missing = sorted({d for p in site_pages() for d in dois(p) if d not in known})
    assert not missing, f"not in docs/piani/riferimenti-chemioinformatica.tsv: {missing}"


def test_doi_part_vii_dois_are_verified():
    status = {r["doi"].lower(): r["status"] for r in tsv_rows() if r["doi"]}
    for p in pages():
        for d in dois(p):
            assert status.get(d) == "verified", (p.name, d, status.get(d))
    g = text(CAP / "19-glossario.html")
    m = re.search(r"<h3>[^<]*Chemioinformatica[^<]*</h3>(.*?)(?=<h3>|</main>)", g, re.S)
    if m:
        for d in re.findall(r'doi\.org/(10\.[^"\s<>]+)', m.group(1)):
            assert status.get(d.lower()) == "verified", d


def test_doi_not_twice_in_the_glossary_bibliography():
    ds = dois(CAP / "19-glossario.html")
    assert len(ds) == len(set(ds)), sorted({d for d in ds if ds.count(d) > 1})


def test_doi_tsv_is_well_formed():
    rs = tsv_rows()
    assert len({r["key"] for r in rs}) == len(rs), "duplicate keys"
    assert {r["status"] for r in rs} <= {"verified", "to verify", "preexisting"}
    for r in rs:
        if r["status"] == "preexisting":
            assert r["doi"] and not r["citation"], r
        if r["status"] == "verified" and r["doi"]:
            assert r["doi"].startswith("10."), r
    dd = [r["doi"].lower() for r in rs if r["doi"]]
    assert len(dd) == len(set(dd)), "a DOI appears twice in the TSV"


# ---------------------------------------------------------------- glossary, formulary, back-links (DEV-CHEMI-07)

def part_files():
    return {Path(f).name: int(n) for f, n, _, _ in part_rows()}


def test_glossary_links_to_part_vii_point_to_the_right_chapter():
    files = part_files()
    g = text(CAP / "19-glossario.html")
    found = re.findall(r'<a href="((?:2[2-9]|3[0-2])-[^"#]*)">Cap\. (\d+)</a>', g)
    assert len(found) >= 50, len(found)
    for href, n in found:
        assert href in files and files[href] == int(n), (href, n)
        assert (CAP / href).is_file(), href
    # every part VII link sits inside a definition (teoria.js drops it for readers while the chapter is a draft)
    for dt, dd in re.findall(r"<dt[^>]*>(.*?)</dt><dd>(.*?)</dd>", g, re.S):
        assert dd.count("<a ") == dd.count("</a>"), dt


def test_formulary_section_6_names_chapters_that_contain_the_formula():
    files = part_files()
    f = text(CAP / "20-formulario.html")
    m = re.search(r'<details open>(\s*<summary>6\. Chemioinformatica.*?)</details>', f, re.S)
    assert m and "6. Chemioinformatica" in m.group(1)
    refs = re.findall(r'<span( data-(?:eq|k)="[^"]*")>Capitolo <a href="([^"#]+)">(\d+)</a>', m.group(1))
    assert len(refs) >= 19, len(refs)
    for attr, href, n in refs:
        assert files.get(href) == int(n), (href, n)
        body = text(CAP / href)
        flat = re.sub(r"<[^>]+>", "", body)
        kind, _, val = attr.strip().partition("=")
        val = val.strip('"')
        if kind == "data-eq":
            assert val.startswith(n + "."), (n, val)
            assert f'<span class="no">({val})</span>' in body, (href, val)
        elif kind == "data-k":
            assert val in flat or val in body, (href, val)
        else:
            raise AssertionError(("formula without a key", href))
    assert m.group(1).count('class="eq"') >= 18
    assert 'class="no"' not in m.group(1), "numbers of the chapters would trip the equation numbering check of chapter 20"


def test_back_links_to_part_vii_are_plain_visible_text():
    """Part VII is published: the pointers from the older chapters are no longer gated (no .solo-esteso, no hidden) and each names an existing chapter."""
    for p in sorted(CAP.glob("*.html")) + sorted((CAP / "src").glob("*.md")):
        # Storia is published too: no pointer anywhere is gated
        assert not re.search(r'<\w+[^>]*solo-esteso[^>]*\bhidden\b', text(p)), p.name
    # the six chapters of the plan carry the back-links, in the html and in the md twin
    for name in ("03-gc", "09-risoluzione", "10-dati", "11-formula", "17-hr-dda", "18-disegno"):
        h = text(CAP / f"{name}.html")
        m = text(CAP / "src" / f"{name}.md")
        n = h.count("Approfondimento: <a")
        assert n >= 1 and n == m.count("Approfondimento: <a"), name
        for t in (h, m):
            found = re.findall(r'Approfondimento: <a href="(\d\d-[a-z-]+\.html)">capitolo (\d+) \([^)]+\)</a>\.', t)
            assert len(found) == n, name
            for href, num in found:
                assert part_files().get(href) == int(num), (name, href)


def test_part_vii_bibliography_block_has_every_cited_doi_once():
    g = text(CAP / "19-glossario.html")
    m = re.search(r"<h3>Chemioinformatica e trattamento dei dati</h3>(.*?)(?=<h3>)", g, re.S)
    assert m
    block = {d.lower() for d in re.findall(r'doi\.org/(10\.[^"\s<>]+)', m.group(1))}
    rest = {d.lower() for d in re.findall(r'doi\.org/(10\.[^"\s<>]+)', g.replace(m.group(1), ""))}
    assert not (block & rest), block & rest
    assert all(re.search(r'<li><span class="tag">(articolo|libro|software|norma)</span>', li) for li in re.findall(r"<li>.*?</li>", m.group(1)))
    cited = set()
    for p in pages():
        mm = re.search(r"<h2>Per approfondire</h2>(.*?)</main>", text(p), re.S)
        cited |= {d.lower() for d in re.findall(r'doi\.org/(10\.[^"\s<>]+)', mm.group(1))} if mm else set()
    assert cited <= block | rest, sorted(cited - block - rest)
