"""Measures how much explaining prose each published chapter has (plan docs/piani/profondita.md). Read-only, no dependencies.

    python3 docs/piani/profondita-misura.py                         # every published row of CHAPTERS, sorted by prose words per heading
    python3 docs/piani/profondita-misura.py capitoli/18-disegno.html  # only these files (the acceptance check of a DEV prompt)

Columns: prose = words of <p> text outside boxes, <details>, lists, figures, tables, interactive figures, headings and references
(the lead paragraph counts as prose); menu = h2/h3 the sidebar shows (teoria.js buildSide: not inside .box, figure, .sim, details);
w/menu = prose / menu; box, list, fig = words in boxes+details, in lists (not references), in figures+tables+interactive figures;
prose% = prose / (prose + box + list + fig). Draft rows (5th field true) and the redirect stubs of the old numbering are ignored.
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORD = re.compile(r"[A-Za-zÀ-ÿ0-9]+(?:['’][A-Za-zÀ-ÿ]+)?")
VOID = {"br", "img", "meta", "link", "input", "hr", "source", "wbr", "col", "path", "rect", "circle", "line", "use", "stop"}


class Count(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack, self.c, self.menu = [], dict(prose=0, box=0, list=0, fig=0, refs=0, head=0), 0
        self.n = dict(fig=0, box=0, list=0, refs=0, head=0, lead=0)

    def handle_starttag(self, t, a):
        if t in VOID:
            return
        cl = (dict(a).get("class") or "").split()
        fl = []
        if t in ("script", "style", "svg", "table", "figure", "pre", "code", "h4", "nav", "canvas") or (t == "div" and ("sim" in cl or "eispec" in cl)):
            fl.append("fig")
        if (t == "div" and "box" in cl) or t == "details":
            fl.append("box")
        if t in ("ul", "ol", "dl"):
            fl.append("refs" if "refs" in cl else "list")
        if t in ("h1", "h2", "h3", "summary") or (t == "div" and "kicker" in cl):
            fl.append("head")
        if t in ("h2", "h3") and not (self.n["fig"] or self.n["box"]):
            self.menu += 1
        for f in fl:
            self.n[f] += 1
        self.stack.append((t, fl))

    def handle_endtag(self, t):
        if t in VOID:
            return
        while self.stack:
            tt, fl = self.stack.pop()
            for f in fl:
                self.n[f] -= 1
            if tt == t:
                break

    def handle_data(self, d):
        k = len(WORD.findall(d))
        if not k:
            return
        for f in ("fig", "head", "refs", "box", "list"):
            if self.n[f]:
                self.c[f] += k
                return
        self.c["prose"] += k


def rows():
    js = (ROOT / "assets" / "teoria.js").read_text(encoding="utf-8")
    return [(f, n, part) for f, n, title, part, draft in
            re.findall(r'^\s*\["([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"(, true)?\],', js, re.M) if not draft]


def measure(path):
    t = (ROOT / path).read_text(encoding="utf-8")
    m = re.search(r"<main>(.*)</main>", t, re.S)
    p = Count()
    p.feed(m.group(1) if m else t)
    c = p.c
    other = c["box"] + c["list"] + c["fig"]
    return dict(prose=c["prose"], menu=p.menu, wpm=c["prose"] / max(1, p.menu), box=c["box"], list=c["list"], fig=c["fig"],
                share=100 * c["prose"] / max(1, c["prose"] + other))


def main():
    want = sys.argv[1:]
    table = [(f, n, part, measure(f)) for f, n, part in rows() if not want or f in want]
    table += [(f, "?", "?", measure(f)) for f in want if f not in {r[0] for r in table}]
    table.sort(key=lambda r: r[3]["wpm"])
    print(f"{'file':34} {'n':>3} {'prose':>6} {'menu':>5} {'w/menu':>7} {'box':>5} {'list':>5} {'fig':>5} {'prose%':>6}")
    for f, n, part, m in table:
        print(f"{f:34} {n:>3} {m['prose']:>6} {m['menu']:>5} {m['wpm']:>7.0f} {m['box']:>5} {m['list']:>5} {m['fig']:>5} {m['share']:>6.0f}")
    if not want:
        print(f"menu rows {len(table)}; sidebar sections (h2/h3) {sum(r[3]['menu'] for r in table)}; prose words {sum(r[3]['prose'] for r in table)}")


if __name__ == "__main__":
    main()
