"""tools/controlla_modifica.py: the fast check of the pages edited by hand (Italian messages that say what to fix): the whole site has no new error, and each kind of mistake is caught."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import controlla_modifica as cm  # noqa: E402

PAGE = """<!doctype html><html lang="it"><head><meta charset="utf-8"><title>T</title></head><body><main>
<h1>Titolo</h1>
%s
</main></body></html>"""


def check(tmp_path, body, name="prova.html"):
    p = tmp_path / name
    p.write_text(PAGE % body, encoding="utf-8")
    return cm.errori_pagina(p)


def test_the_whole_site_has_no_new_error():
    nuovi, _ = cm.run(cm.pagine(), cm.json.loads(cm.BASE.read_text(encoding="utf-8")))
    assert nuovi == {}, "\n".join(f"{n}: {m}" for n, e in nuovi.items() for m in e)


def test_the_base_only_holds_heading_jumps():
    """What the base forgives is the h2 -> h4 of figure titles; every other kind of error must be fixed in the page, not listed."""
    base = cm.json.loads(cm.BASE.read_text(encoding="utf-8"))
    assert all(m.startswith("Salto di titolo") for e in base.values() for m in e)


def test_a_clean_page_passes(tmp_path):
    (tmp_path / "x.svg").write_text("<svg/>", encoding="utf-8")
    assert check(tmp_path, '<h2 id="a">Sezione</h2><p>Testo con <b>grassetto</b> e H<sub>2</sub>O.</p><img src="x.svg" alt="x"><p><a href="#a">su</a></p>') == []


def test_each_mistake_has_a_message_in_italian(tmp_path):
    (tmp_path / "altra.html").write_text(PAGE % '<h2 id="si">Sì</h2>', encoding="utf-8")
    cases = [
        ("<p>aperto <b>senza chiusura</p>", "non è chiuso"),
        ("<p>chiuso</p></div>", "senza il <div>"),
        ('<div id="a"></div><div id="a"></div>', "usato più volte"),
        ("<h2>A</h2><h4>B</h4>", "Salto di titolo"),
        ('<img src="figura.png">', "non ha la descrizione"),
        ("<p>Questa parte è in costruzione.</p>", "in costruzione"),
        ("<p>Scrivi qui il testo.</p>", "Scrivi qui"),
        ('<p><a href="non-esiste.html">x</a></p>', "il file non esiste"),
        ('<p><a href="altra.html#no">x</a></p>', "non c'è la sezione"),
        ('<p><a href="#niente">x</a></p>', "nella pagina non c'è"),
    ]
    for body, frag in cases:
        out = check(tmp_path, body)
        assert any(frag in m for m in out), (body, out)


def test_the_skeleton_box_title_is_allowed(tmp_path):
    assert not any("costruzione" in m for m in check(tmp_path, '<div class="box key"><b>Capitolo in costruzione</b><p>Ancora in scrittura.</p></div>'))


def test_generated_files_follow_the_pages(monkeypatch):
    assert cm.errori_globali() == []
    import genera_glossario
    monkeypatch.setattr(genera_glossario, "render", lambda: "x")
    out = cm.errori_globali()
    assert len(out) == 1 and "glossario-dati.js" in out[0] and "È normale" in out[0] and "rigenera gli indici della mia modifica (PR n)" in out[0]


def test_body_text_edits_do_not_demand_regeneration_but_titles_and_glossary_do(tmp_path, monkeypatch):
    """Only a changed title or glossary word makes the generated files stale: a paragraph edit leaves the check green."""
    import shutil
    import genera_glossario as GL
    import genera_indice_teoria as G
    shutil.copytree(ROOT / "capitoli", tmp_path / "capitoli", ignore=shutil.ignore_patterns("src"))
    shutil.copytree(ROOT / "assets", tmp_path / "assets", ignore=shutil.ignore_patterns("fonts", "vendor", "img", "icone"))
    shutil.copytree(ROOT / "pratica", tmp_path / "pratica", ignore=shutil.ignore_patterns("*.js"))
    shutil.copy(ROOT / "index.html", tmp_path / "index.html")
    for mod, attrs in ((G, ("D",)), (GL, ("D", "CAPITOLI"))):
        for a in attrs:
            monkeypatch.setattr(mod, a, tmp_path / "capitoli" if a == "CAPITOLI" else tmp_path)
    monkeypatch.setattr(G, "OUT", tmp_path / "assets" / "indice-ricerca.js")
    monkeypatch.setattr(cm, "ROOT", tmp_path)
    assert cm.errori_globali() == []
    page = tmp_path / "capitoli" / "05-ei-ci.html"
    page.write_text(page.read_text(encoding="utf-8").replace("Tutto avviene nel <b>vuoto</b>", "Tutto avviene proprio nel <b>vuoto</b>"), encoding="utf-8")
    assert cm.errori_globali() == []
    page.write_text(page.read_text(encoding="utf-8").replace("<h2>La sorgente EI</h2>", "<h2>La sorgente EI, rivista</h2>"), encoding="utf-8")
    out = cm.errori_globali()
    assert len(out) == 1 and "indice-ricerca.js" in out[0] and "rigenera gli indici della mia modifica (PR n)" in out[0]


def test_no_tool_or_script_reads_the_markdown_twins():
    """The html is the only source: no tool or script of the site reads capitoli/src/*.md (the tests only look at a twin that happens to exist)."""
    import re
    for d in ("tools", "assets"):
        for f in (ROOT / d).glob("*.*"):
            if f.suffix in (".py", ".js", ".mjs"):
                assert not re.search(r"[\"'`]capitoli/src|\"capitoli\" / \"src\"", f.read_text(encoding="utf-8")), f.name      # a path in code, not a word in a comment
