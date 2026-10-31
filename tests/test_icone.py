"""Site icon: every page of the Teoria links the icon files, the files exist with the right sizes, the manifest points to them."""
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEORIA = ROOT / "mzlab" / "web" / "teoria"
ICONE = TEORIA / "icone"
PAGES = sorted(TEORIA.glob("*.html"))


def png_size(p):
    d = p.read_bytes()
    assert d[:8] == b"\x89PNG\r\n\x1a\n", p
    return struct.unpack(">II", d[16:24])


def hrefs(html):
    return {m.group(1) + "|" + m.group(2) for m in re.finditer(r'<link rel="([a-z-]+)"[^>]*? href="([^"]+)"', html)}


def test_there_are_pages():
    assert len(PAGES) > 30


def test_every_page_links_the_icons():
    need = {"icon|favicon.ico", "icon|icone/icon.svg", "apple-touch-icon|icone/apple-touch-icon.png", "manifest|site.webmanifest"}
    for p in PAGES:
        html = p.read_text(encoding="utf-8")
        head = html.split("</head>")[0]
        assert need <= hrefs(head), p.name
        assert 'name="theme-color"' in head, p.name
        assert "favicon-32" not in html and "http" not in "".join(re.findall(r'<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>', head)), p.name


def test_new_chapter_template_links_the_icons():
    sys.path.insert(0, str(ROOT / "tools"))
    import nuovo_capitolo
    assert {"icon|favicon.ico", "icon|icone/icon.svg", "apple-touch-icon|icone/apple-touch-icon.png", "manifest|site.webmanifest"} <= hrefs(nuovo_capitolo.TEMPLATE)


def test_png_sizes():
    assert png_size(ICONE / "icon-192.png") == (192, 192)
    assert png_size(ICONE / "icon-512.png") == (512, 512)
    assert png_size(ICONE / "apple-touch-icon.png") == (180, 180)


def test_ico_has_16_32_48():
    d = (TEORIA / "favicon.ico").read_bytes()
    res, kind, n = struct.unpack("<HHH", d[:6])
    assert (res, kind) == (0, 1)
    sizes = []
    for i in range(n):
        w, h, _, _, _, _, ln, off = struct.unpack("<BBBBHHII", d[6 + 16 * i:22 + 16 * i])
        assert png_size_bytes(d[off:off + ln]) == (w, h)
        sizes.append(w)
    assert sizes == [16, 32, 48]


def png_size_bytes(b):
    assert b[:8] == b"\x89PNG\r\n\x1a\n"
    return struct.unpack(">II", b[16:24])


def test_svg_is_tiny_and_self_contained():
    s = (ICONE / "icon.svg").read_text(encoding="utf-8")
    assert len(s.encode()) < 1500 and "http" not in s.replace("http://www.w3.org/2000/svg", "") and "<script" not in s and "<image" not in s


def test_manifest():
    m = json.loads((TEORIA / "site.webmanifest").read_text(encoding="utf-8"))
    assert m["name"] == "BasePeak" and m["lang"] == "it" and m["theme_color"] and m["background_color"]
    for ic in m["icons"]:
        assert (TEORIA / ic["src"]).is_file() and not ic["src"].startswith(("http", "/")), ic
    assert {"192x192", "512x512"} <= {ic["sizes"] for ic in m["icons"]}
