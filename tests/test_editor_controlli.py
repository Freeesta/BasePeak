"""Checks of the page editor: the JavaScript (assets/editor-controlli.js, run by node) and the Python (tools/controlla_modifica.py) give the same errors on every page and on
samples; the cut of <main> into blocks rebuilds every page exactly; the size of the editor stays small."""
import gzip
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import controlla_modifica as cm  # noqa: E402

SAMPLES = [
    "<main><h1>Uno</h1><p>testo</main>",
    "<main><h1>A</h1><h2>B</h2><h4>C</h4><img src=\"a.png\"><img src=\"b.png\" alt=\"\"></main>",
    "<main><h1>A</h1><div id=\"x\"></div><p id=\"x\">in costruzione</p></b></main>",
    "<main><h1>A</h1><div class=\"box key\"><b>Capitolo in costruzione</b><p>Scrivi qui il testo.</p></div></main>",
    "<main><h1>A</h1><svg><path d=\"M0 0\"/></svg><script>var a = '<div>';</script><!-- <p> --><br><p>ok</p></main>",
    "<main><h1>A</h1><a href='x>y'>link</a><p>fine</p></main>",
]
NODE = shutil.which("node")


@pytest.fixture(scope="module")
def js():
    if not NODE:
        pytest.skip("node not available")
    r = subprocess.run([NODE, str(ROOT / "tests" / "editor_controlli_node.mjs")], input=json.dumps(SAMPLES), capture_output=True, text=True, timeout=120)
    assert r.returncode == 0, r.stderr[-800:]
    return json.loads(r.stdout)


def test_js_and_python_agree_on_every_page(js):
    for f, d in js["pages"].items():
        src = (ROOT / f).read_text(encoding="utf-8")
        assert [list(x) for x in cm.controlla(src)] == d["errors"], f


def test_js_and_python_agree_on_samples(js):
    for s, got in zip(SAMPLES, js["samples"]):
        assert [list(x) for x in cm.controlla(s)] == got, s


def test_samples_say_what_to_fix():
    m = lambda s: [x[2] for x in cm.controlla(s)]       # noqa: E731
    assert any("non è chiuso" in x and "<p>" in x for x in m(SAMPLES[0]))
    assert any("Salto di titolo" in x and "Usa h3" in x for x in m(SAMPLES[1]))
    assert any("non ha la descrizione" in x for x in m(SAMPLES[1]))
    assert any("usato più volte" in x for x in m(SAMPLES[2])) and any("in costruzione" in x for x in m(SAMPLES[2])) and any("senza il <b>" in x for x in m(SAMPLES[2]))
    assert not any("costruzione" in x for x in m(SAMPLES[3])) and any("Scrivi qui" in x for x in m(SAMPLES[3]))
    assert m(SAMPLES[4]) == [] and m(SAMPLES[5]) == []


def test_main_is_cut_and_rebuilt_exactly(js):
    cut = {f: d for f, d in js["pages"].items() if d["seg"] is not None}
    assert len(cut) >= 40
    assert all(d["rebuilt"] for d in cut.values())


def test_editor_stays_small():
    """The editor is read only in administrator mode, but it is read: < 15 KB compressed for the three files together (the old editor alone was 4.5 KB)."""
    total = sum(len(gzip.compress((ROOT / "assets" / f).read_bytes(), 9)) for f in ("editor.js", "editor-controlli.js", "editor.css"))
    assert total < 15 * 1024, total
