"""details.poe summary must keep a contrast of at least 7:1 in dark mode (axe color-contrast failed with the light-theme teal)."""
import re
from pathlib import Path

CSS = (Path(__file__).resolve().parent.parent / "assets" / "teoria.css").read_text(encoding="utf-8")


def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def test_poe_summary_dark_contrast():
    bg = re.search(r":root\[data-theme=dark\] details\.poe\{background:(#[0-9a-f]{6})", CSS).group(1)
    fg = re.search(r":root\[data-theme=dark\] details\.poe summary\{color:(#[0-9a-f]{6})\}", CSS).group(1)
    a, b = sorted((lum(bg), lum(fg)))
    assert (b + 0.05) / (a + 0.05) >= 7


def ratio(a, b):
    lo, hi = sorted((lum(a), lum(b)))
    return (hi + 0.05) / (lo + 0.05)


def test_btns_toggle_dark_contrast():
    """.btns button (normal) and .btns button.on (pressed; hover/focus only change the border) must keep >= 7:1 in dark mode."""
    dark = re.search(r":root\[data-theme=dark\]\{[^}]*?\}", CSS).group(0)
    var = lambda n: re.search(r"--" + n + r":(#[0-9a-f]{6})", dark).group(1)
    assert ratio(var("ink"), var("panel")) >= 7  # normal state: color:var(--ink) on background:var(--panel)
    m = re.search(r":root\[data-theme=dark\] \.btns button\.on\{background:(#[0-9a-f]{6});[^}]*?color:(#[0-9a-f]{6})\}", CSS)
    assert m, "missing dark rule for .btns button.on"
    assert ratio(m.group(1), m.group(2)) >= 7
