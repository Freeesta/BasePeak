"""Link integrity of the published site (index.html, capitoli/, pratica/, assets/): every relative href / src / @import / import in every html, css and js file
points to an existing file, nothing is absolute (the site opens from disk with a double click) and the published set holds nothing else."""
import json
import re
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
PUBLISHED = ("index.html", "capitoli", "pratica", "assets")
EXT = {".html", ".css", ".js"}

ATTR = re.compile(r"""\b(?:href|src|poster)\s*=\s*(["'])(.*?)\1""", re.S)
REFRESH = re.compile(r"""content\s*=\s*["']\s*\d+\s*;\s*url=([^"']+)["']""", re.I)
CSS_URL = re.compile(r"""url\(\s*["']?([^"')]+)["']?\s*\)""")
CSS_IMPORT = re.compile(r"""@import\s+["']([^"']+)["']""")
JS_IMPORT = re.compile(r"""\bimport\s*(?:[\w{}*,\s]+from\s*)?\(?\s*["']([^"']+)["']""")


# Known gaps inherited from the mzLab import, kept visible here instead of hidden (each one is a follow-up for the COO; remove the entry when fixed):
# - the structure editor of the EI game loads Ketcher, which is not shipped in this repository (the e2e tests stub it);
# - on http(s) the header offers tabs to the mzLab program (../../#/data, ../../#/draw), which does not exist next to this site.
KNOWN_MISSING = {
    ("pratica/gioco-ei.js", "../assets/vendor/ketcher/index.html"),
    ("assets/teoria.js", "../../#/data"), ("assets/teoria.js", "../../#/draw"), ("assets/lettura.js", "../../#/data"),
}


def site_files():
    out = []
    for name in PUBLISHED:
        p = ROOT / name
        out += [p] if p.is_file() else sorted(f for f in p.rglob("*") if f.is_file())
    return out


def is_relative(ref):
    """False for what is not a file of the site: anchors, other schemes, templates built at run time, empty."""
    return bool(ref) and not re.match(r"(#|[a-z][a-z0-9+.-]*:|//|\{|\$|\s)", ref, re.I) and "${" not in ref and "{{" not in ref


def refs(path):
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".html":
        return [m.group(2) for m in ATTR.finditer(text)] + REFRESH.findall(text) + [m for u in CSS_URL.findall(text) for m in [u]]
    if path.suffix == ".css":
        return CSS_URL.findall(text) + CSS_IMPORT.findall(text)
    # a script: the imports (relative to the file) and the links written as literals in the markup it builds (relative to the pages that use it)
    return [m for m in JS_IMPORT.findall(text) if m.startswith(".")] + [m.group(2) for m in ATTR.finditer(text)]


def base_of(path):
    """Folder a reference is resolved from: the file itself; for the markup literals of a script the pages of its folder (pratica/ pages sit in pratica/)."""
    return path.parent


def test_there_is_something_to_check():
    files = site_files()
    assert len([f for f in files if f.suffix == ".html"]) > 40 and len([f for f in files if f.suffix == ".js"]) > 20


def test_every_relative_reference_exists():
    bad, seen = [], set()
    for f in site_files():
        if f.suffix not in EXT:
            continue
        for ref in refs(f):
            if not is_relative(ref):
                continue
            target = (base_of(f) / unquote(re.split(r"[?#]", ref)[0])).resolve()
            if not re.split(r"[?#]", ref)[0]:
                continue
            if not target.is_file():
                if (f.relative_to(ROOT).as_posix(), ref) in KNOWN_MISSING:
                    seen.add((f.relative_to(ROOT).as_posix(), ref))
                else:
                    bad.append(f"{f.relative_to(ROOT)} -> {ref}")
    assert not bad, "\n".join(bad)
    assert seen == KNOWN_MISSING, f"fixed? remove from KNOWN_MISSING: {KNOWN_MISSING - seen}"


def test_nothing_is_absolute_and_no_base_tag():
    bad = []
    for f in site_files():
        if f.suffix == ".html":
            text = f.read_text(encoding="utf-8")
            if re.search(r"<base\b", text, re.I):
                bad.append(f"{f.relative_to(ROOT)}: <base>")
            bad += [f"{f.relative_to(ROOT)}: {m.group(2)}" for m in ATTR.finditer(text) if m.group(2).startswith("/") and not m.group(2).startswith("//")]
        elif f.suffix == ".css":
            bad += [f"{f.relative_to(ROOT)}: {u}" for u in CSS_URL.findall(f.read_text(encoding="utf-8")) if u.startswith("/") and not u.startswith("//")]
    assert not bad, "\n".join(bad)


def test_site_files_listed_in_the_data_exist():
    """The chapter list, the search index, the glossary name pages relative to the site root."""
    js = (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")
    block = js[js.index("const CHAPTERS = ["):]
    block = block[:block.index("\n];")]
    listed = re.findall(r'\["([^"]+\.html)"', block)
    assert len(listed) > 25
    index = [e[2] for e in json.loads("[" + (ROOT / "assets" / "indice-ricerca.js").read_text(encoding="utf-8").split("const INDICE_RICERCA = [")[1].rsplit("];", 1)[0] + "]")]
    gloss = re.findall(r'"h": "([^"]+)"', (ROOT / "assets" / "glossario-dati.js").read_text(encoding="utf-8"))
    bad = [r for r in listed + index + gloss if r and not (ROOT / r.split("#")[0]).is_file()]
    assert not bad, bad


def test_pages_workflow_publishes_only_the_site():
    wf = (ROOT / ".github" / "workflows" / "pages.yml").read_text(encoding="utf-8")
    m = re.search(r'cp -R ([^\n"]+) "\$SITE_DIR"/', wf)
    assert m, "the assembly step of pages.yml changed: update this test"
    assert set(m.group(1).split()) == set(PUBLISHED)
    assert "path: ${{ env.SITE_DIR }}" in wf and "SITE_DIR: _site" in wf
    for name in PUBLISHED:
        assert (ROOT / name).exists(), name


def test_published_set_has_no_stray_file():
    """Everything the workflow copies is a file of index.html, capitoli/, pratica/ or assets/; nothing like tests/, tools/, docs/ or editor/ is inside them."""
    for f in site_files():
        rel = f.relative_to(ROOT).parts
        assert rel[0] in PUBLISHED, f
        assert not any(p in ("tests", "tools", "docs", "editor", "tests_e2e", "__pycache__") for p in rel[1:]), f
        assert f.suffix != ".py" and f.name != "LEGGIMI.md", f
