"""The checker (tools/controlla_teoria.py) must compute the same heading ids as assets/teoria.js at runtime; fragment links accept them."""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import controlla_teoria as ct  # noqa: E402

SAMPLES = ["Introduzione", "Perché è così? (Né più né meno)", "Ionizzazione per elettrospray (ESI)", "Δm/z e m/z: 1.2–3.4", "   ", "!!!", "Çà ñ ü ß Ø",
           "A" * 60 + " fine", "Spazio  doppio\ttab", "H₂O e CO₂"]
JS = ROOT / "assets" / "teoria.js"


def js_slugs(texts):
    src = JS.read_text(encoding="utf-8")
    m = re.search(r"function slug\(s\) \{.*?\n  \}", src, re.S)
    assert m, "slug() not found in assets/teoria.js"
    code = m.group(0) + "\nconsole.log(JSON.stringify(" + json.dumps(texts) + ".map(slug)));"
    return json.loads(subprocess.run(["node", "-e", code], check=True, capture_output=True, encoding="utf-8").stdout)


def test_slug_matches_js():
    if not shutil.which("node"):
        pytest.skip("node not available")
    assert [ct.slug(t) for t in SAMPLES] == js_slugs(SAMPLES)


def test_generated_ids_repeated_and_existing():
    page = ct.parse('<main><h2>Metodo</h2><h3>Metodo</h3><h3 id="x">Metodo</h3><h4>Perché?</h4><h2>Metodo-2</h2><h2>!!!</h2><h2>???</h2></main><h2>Fuori</h2><p id="metodo-4">x</p>')
    assert ct.generated_ids(page) == {"metodo", "metodo-2", "perche", "metodo-2-2", "sezione", "sezione-2"}


def test_fragment_accepts_generated_id(tmp_path):
    (tmp_path / "a.html").write_text("<main><h2>Perché è così</h2><h3>Perché è così</h3></main>", encoding="utf-8")
    page = ct.parse("<main></main>")
    f = tmp_path / "b.html"
    assert ct.link_error("a.html#perche-e-cosi", f, tmp_path, page) is None
    assert ct.link_error("a.html#perche-e-cosi-2", f, tmp_path, page) is None
    assert "not found" in ct.link_error("a.html#perche-e-cosi-3", f, tmp_path, page)
    assert "not found" in ct.link_error("a.html#nope", f, tmp_path, page)
