"""Builds the raster site icons from the hand-written vector source.

    python3 tools/genera_icone.py          # rewrite the outputs
    python3 tools/genera_icone.py --check  # exit 1 if the committed files differ from a fresh build

Source: mzlab/web/teoria/icone/icon.svg (a rounded square plus plain rects: a stylised mass spectrum whose tallest stick is the base peak).
Outputs (committed, so nothing is built at runtime): icone/icon-192.png, icone/icon-512.png, icone/apple-touch-icon.png (180, opaque),
and favicon.ico (16/32/48, PNG-compressed entries) at the site root.
Needs Pillow (only used here to anti-alias; not a runtime or CI dependency of the site). Only <rect> elements with x/y/width/height/rx/fill are read."""
import io
import re
import struct
import sys
from pathlib import Path

from PIL import Image, ImageDraw

SITE = Path(__file__).resolve().parent.parent / "mzlab" / "web" / "teoria"
SVG = SITE / "icone" / "icon.svg"
SS = 16  # supersampling factor


def parse_svg(text):
    """Return (viewbox_size, [rect dicts]) in document order; fill is inherited from an enclosing <g fill=...>."""
    vb = float(re.search(r'viewBox="0 0 ([\d.]+) [\d.]+"', text).group(1))
    rects, group_fill = [], None
    for m in re.finditer(r"<g\b[^>]*>|</g>|<rect\b[^>]*/>", text):
        tag = m.group(0)
        if tag.startswith("<g"):
            group_fill = re.search(r'fill="([^"]+)"', tag).group(1)
        elif tag == "</g>":
            group_fill = None
        else:
            a = dict(re.findall(r'([\w-]+)="([^"]*)"', tag))
            rects.append({"x": float(a.get("x", 0)), "y": float(a.get("y", 0)), "w": float(a["width"]), "h": float(a["height"]),
                          "rx": float(a.get("rx", 0)), "fill": a.get("fill", group_fill)})
    return vb, rects


def render(size, opaque=False, text=None):
    vb, rects = parse_svg(text or SVG.read_text(encoding="utf-8"))
    big, k = size * SS, size * SS / vb
    im = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, r in enumerate(rects):
        box = [r["x"] * k, r["y"] * k, (r["x"] + r["w"]) * k - 1, (r["y"] + r["h"]) * k - 1]
        full = r["w"] == vb and r["h"] == vb
        d.rounded_rectangle(box, radius=0 if (opaque and full) else r["rx"] * k, fill=r["fill"])
    return im.resize((size, size), Image.LANCZOS)


def png_bytes(im):
    b = io.BytesIO()
    im.save(b, "PNG", optimize=True)
    return b.getvalue()


def ico_bytes(sizes=(16, 32, 48)):
    blobs = [png_bytes(render(s)) for s in sizes]
    out = struct.pack("<HHH", 0, 1, len(sizes))
    off = 6 + 16 * len(sizes)
    for s, b in zip(sizes, blobs):
        out += struct.pack("<BBBBHHII", s, s, 0, 0, 1, 32, len(b), off)
        off += len(b)
    return out + b"".join(blobs)


def outputs():
    return {
        SITE / "icone" / "icon-192.png": png_bytes(render(192)),
        SITE / "icone" / "icon-512.png": png_bytes(render(512)),
        SITE / "icone" / "apple-touch-icon.png": png_bytes(render(180, opaque=True)),
        SITE / "favicon.ico": ico_bytes(),
    }


def main(argv):
    out = outputs()
    if "--check" in argv:
        bad = [str(p.relative_to(SITE)) for p, b in out.items() if not p.exists() or p.read_bytes() != b]
        print("stale: " + ", ".join(bad) if bad else "icons up to date")
        return 1 if bad else 0
    for p, b in out.items():
        p.write_bytes(b)
        print(f"wrote {p.relative_to(SITE.parent.parent.parent)} ({len(b)} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
