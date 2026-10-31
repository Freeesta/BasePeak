"""Reference chemistry for the tests, independent of the JavaScript code under test: a formula parser and the monoisotopic mass summed in Python from the isotope table of
assets/masse.js (the data of the Teoria; it is plain JSON after `const ELEMENTS =`)."""
import json
import re
from pathlib import Path

_SRC = (Path(__file__).resolve().parent.parent / "assets" / "masse.js").read_text(encoding="utf-8")
_START = _SRC.index("\nconst ELEMENTS = ") + len("\nconst ELEMENTS = ")
ELEMENTS = {e["s"]: e for e in json.loads(_SRC[_START:_SRC.index("\n];", _START) + 2])}


def parse_formula(f: str) -> dict:
    """'C6H5Cl' -> {'C': 6, 'H': 5, 'Cl': 1}."""
    out = {}
    for el, n in re.findall(r"([A-Z][a-z]?)(\d*)", f):
        out[el] = out.get(el, 0) + (int(n) if n else 1)
    return out


def mass(comp: dict) -> float:
    """Monoisotopic mass: the most abundant isotope of every element."""
    return sum(max(ELEMENTS[el]["iso"], key=lambda i: i[2])[1] * n for el, n in comp.items())
