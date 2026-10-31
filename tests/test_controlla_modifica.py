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
    assert len(out) == 1 and "glossario-dati.js" in out[0] and "COO" in out[0]


def test_nothing_reads_the_markdown_twins_as_a_source():
    """The html is the only source: the only code that still looks at capitoli/src/*.md is a test that checks a twin IF it exists."""
    import re
    quelli = set()
    for d in ("tests", "tools", "assets"):
        for f in (ROOT / d).glob("*.*"):
            if f.suffix in (".py", ".js", ".mjs") and f.name != "test_controlla_modifica.py" and re.search(r"capitoli/src|\"capitoli\" / \"src\"", f.read_text(encoding="utf-8")):
                quelli.add(f.name)
    assert quelli == {"test_numerazione.py"}, quelli
