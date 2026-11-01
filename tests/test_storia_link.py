"""Links from the published chapters to the hidden Storia drafts (33-42) must stay invisible to readers.

Outside the Storia chapters themselves, every link to a `NN-storia-*` page is either inside a `solo-esteso` element carrying `hidden`
(shown only in administrator mode) or inside a glossary definition (teoria.js drops it for readers while the chapter is a draft).
"""
import re
from pathlib import Path

CAP = Path(__file__).resolve().parents[1] / "capitoli"
LINK = re.compile(r'<a href="(?:3[3-9]|4[0-2])-storia-[^"]*"')


def published_html():
    return [p for p in sorted(CAP.glob("*.html")) if "-storia-" not in p.name]


def test_storia_links_in_visible_chapters_are_gated():
    n = 0
    for p in published_html():
        t = p.read_text(encoding="utf-8")
        if p.name == "19-glossario.html":
            continue
        gated = [m.span() for m in re.finditer(r'<(\w+)[^>]*class="[^"]*solo-esteso[^"]*"[^>]*\bhidden\b[^>]*>.*?</\1>', t, re.S)]
        for m in LINK.finditer(t):
            n += 1
            assert any(a <= m.start() < b for a, b in gated), (p.name, m.group(0))
    assert n >= 9, n


def test_storia_links_in_glossary_sit_inside_definitions():
    g = (CAP / "19-glossario.html").read_text(encoding="utf-8")
    defs = re.findall(r"<dt[^>]*>.*?</dt><dd>(.*?)</dd>", g, re.S)
    assert sum(len(LINK.findall(d)) for d in defs) == len(LINK.findall(g)) >= 15
    for h in set(re.findall(r'<a href="((?:3[3-9]|4[0-2])-storia-[^"]*)"', g)):
        assert (CAP / h).is_file(), h


def test_every_href_in_storia_chapters_exists():
    for p in sorted(CAP.glob("*-storia-*.html")):
        for h in re.findall(r'<a href="([^"#:]+\.html)(?:#([^"]*))?"', p.read_text(encoding="utf-8")):
            assert (CAP / h[0]).is_file(), (p.name, h)
