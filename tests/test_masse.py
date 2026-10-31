"""Own mass module (mzlab/web/teoria/masse.js) against known values, run with node. No mzLab dependency."""
import json
import shutil
import subprocess
from pathlib import Path

import pytest

SRC = Path(__file__).resolve().parents[1] / "mzlab" / "web" / "teoria" / "masse.js"
pytestmark = pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")


def run(js: str):
    prog = f"const {{ELEMENTS, MASSE}}=require({json.dumps(str(SRC))});console.log(JSON.stringify((()=>{{{js}}})()));"
    out = subprocess.run(["node", "-e", prog], capture_output=True, encoding="utf-8", timeout=60)
    assert out.returncode == 0, out.stderr
    return json.loads(out.stdout)


def test_exact_masses():
    r = run("return ['C6H12O6','C8H14ClN5','H2O','CCl4','C₆H₆'].map(MASSE.exact)")
    for got, want in zip(r, [180.063388, 215.093783, 18.010565, 151.875411, 78.046950]):
        assert abs(got - want) < 1e-5, (got, want)    # reference: NIST/AME2020 masses summed by hand


def test_parse():
    assert run("return [MASSE.parse('C6H5Cl'), MASSE.parse('Xy2'), MASSE.parse('c6'), MASSE.parse(''), MASSE.parse('C2H4C2')]") == \
        [{"C": 6, "H": 5, "Cl": 1}, None, None, None, {"C": 4, "H": 4}]
    assert run("return MASSE.exact('Zz')") is None  # NaN serialises as null


def test_isotope_patterns():
    cl2 = run("return MASSE.pattern('Cl2', 5)")
    assert [round(x, 1) for x in (cl2[0], cl2[2], cl2[4])] == [100.0, 64.0, 10.2]      # M : M+2 : M+4 = 100 : 64 : 10 (35Cl/37Cl)
    assert cl2[1] == 0 and cl2[3] == 0                                 # no odd shifts: Cl has no M+1 isotope
    br2 = run("return MASSE.pattern('Br2', 5)")
    assert [round(x) for x in (br2[0], br2[2], br2[4])] == [100, 195, 95]
    c6 = run("return MASSE.pattern('C6H12O6', 3)")
    assert abs(c6[1] - 6.86) < 0.02 and abs(c6[2] - 1.43) < 0.02         # M+1 mostly 13C x6, M+2 mostly 18O x6
    assert run("return MASSE.pattern('Q9')") is None


def test_abundances_sum_to_100():
    sums = run("return ELEMENTS.map(e=>[e.s, e.iso.reduce((a,x)=>a+x[2],0)])")
    for s, tot in sums:
        assert abs(tot - 100) < 0.01, s
