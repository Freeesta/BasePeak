"""Fast check of the pages edited by hand (Italian messages: they say what to fix). Same rules as the editor of the browser (assets/editor-controlli.js).

    python3 tools/controlla_modifica.py                 # every page of the site against tools/modifica_base.json
    python3 tools/controlla_modifica.py --path FILE     # one page
    python3 tools/controlla_modifica.py --base          # rewrite the base with the errors of the EXISTING pages

Per page: tag not closed, id used twice, heading jump (h2 -> h4), image without alt, text «in costruzione» or «Scrivi qui…» (the title «Capitolo in costruzione» of the skeleton
boxes is allowed), link to a file or anchor that does not exist. Whole site: the glossary data and the search index are fresh against the pages.
Errors already present are listed in tools/modifica_base.json (they may only go away, never grow). Exit 1 if there is a new error."""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = Path(__file__).resolve().parent / "modifica_base.json"
sys.path.insert(0, str(Path(__file__).resolve().parent))

VUOTI = {"meta", "link", "img", "br", "hr", "input", "source", "col", "area", "base", "wbr"}
GREZZI = {"script", "style"}
RE = re.compile(r"""<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|</([A-Za-z][\w:-]*)\s*>|<([A-Za-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>""")
ATTR = re.compile(r"""([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?""")


def attributi(s):
    a = {}
    for m in ATTR.finditer(s):
        k = m[1].lower()
        if k not in a:
            a[k] = next((g for g in (m[2], m[3], m[4]) if g is not None), "")
    return a


def tokenizza(src):
    """(kind, tag, attrs, start, end, void) for every tag; the text of script and style is skipped (same as the JS)."""
    out, pos = [], 0
    while True:
        m = RE.search(src, pos)
        if not m:
            return out
        pos = m.end()
        if m[1]:
            out.append(("chiude", m[1].lower(), {}, m.start(), m.end(), False))
        elif m[2]:
            tag = m[2].lower()
            vuoto = tag in VUOTI or bool(re.search(r"/\s*$", m[3]))
            out.append(("apre", tag, attributi(m[3]), m.start(), m.end(), vuoto))
            if tag in GREZZI and not vuoto:
                j = src.lower().find("</" + tag, pos)
                if j > 0:
                    pos = j


def controlla(src, documento=True):
    """[(line, kind, message)] of a page (documento) or of a piece of main."""
    E, pila, ids = [], [], {}
    prev = 0 if documento else 1

    def add(i, tipo, msg):
        E.append((src.count("\n", 0, i) + 1, tipo, msg))

    for k, tag, a, s, e, vuoto in tokenizza(src):
        if k == "apre":
            if a.get("id"):
                if ids.get(a["id"]) == 1:
                    add(s, "id", f"L'id «{a['id']}» è usato più volte. Cambia l'id di uno dei due elementi.")
                ids[a["id"]] = 2 if a["id"] in ids else 1
            if re.fullmatch(r"h[1-6]", tag):
                lv = int(tag[1])
                if lv > prev + 1:
                    add(s, "titolo", f"Salto di titolo: dopo un titolo h{prev} c'è un h{lv}. Usa h{prev + 1}.")
                prev = lv
            if tag == "img" and "alt" not in a:
                add(s, "alt", f"L'immagine {a.get('src', '')} non ha la descrizione. Aggiungi alt=\"descrizione dell'immagine\".")
            if not vuoto:
                pila.append((tag, s))
        else:
            j = len(pila) - 1
            while j >= 0 and pila[j][0] != tag:
                j -= 1
            if j < 0:
                add(s, "struttura", f"Trovato </{tag}> senza il <{tag}> che lo apre. Toglilo, oppure aggiungi <{tag}> prima.")
            else:
                for q in range(len(pila) - 1, j, -1):
                    add(pila[q][1], "struttura", f"Il tag <{pila[q][0]}> non è chiuso. Aggiungi </{pila[q][0]}> dove finisce.")
                del pila[j:]
    for tag, s in pila:
        add(s, "struttura", f"Il tag <{tag}> non è chiuso. Aggiungi </{tag}> dove finisce.")
    testo = re.sub(r"<[^>]+>", " ", re.sub(r"<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?</\1>", " ", src, flags=re.I))
    if re.search("in costruzione", testo.replace("Capitolo in costruzione", " "), re.I):
        add(0, "testo", "Il testo contiene «in costruzione». Scrivi il testo vero oppure togli la frase.")
    if "Scrivi qui" in testo:
        add(max(0, src.find("Scrivi qui")), "testo", "È rimasto il testo di prova «Scrivi qui…». Sostituiscilo con il tuo testo oppure togli il riquadro.")
    return sorted(E, key=lambda x: x[0])


def collegamenti(path, src):
    """Links to a file or an anchor that does not exist (only the ones the page itself writes)."""
    E, ids_cache = [], {}
    page_ids = {t[2]["id"] for t in tokenizza(src) if t[0] == "apre" and t[2].get("id")}
    for k, tag, a, s, e, vuoto in tokenizza(src):
        if k != "apre":
            continue
        ref = a.get("href") if tag in ("a", "link") else a.get("src") if tag in ("img", "script", "source") else None
        if not ref or re.match(r"(?:[a-z][a-z0-9+.-]*:|//)", ref, re.I):
            continue
        f, _, frag = ref.partition("#")
        f = f.split("?")[0]
        if not f:
            if frag and frag not in page_ids and tag == "a":
                E.append((src.count("\n", 0, s) + 1, "link", f"Il collegamento #{frag} non porta da nessuna parte: nella pagina non c'è un elemento con id «{frag}»."))
            continue
        target = path.parent / f
        if not target.exists():
            E.append((src.count("\n", 0, s) + 1, "link", f"Il collegamento a «{f}» non funziona: il file non esiste. Controlla il nome."))
        elif frag and target.suffix == ".html":
            if target not in ids_cache:
                ids_cache[target] = {t[2]["id"] for t in tokenizza(target.read_text(encoding="utf-8", errors="replace")) if t[0] == "apre" and t[2].get("id")}
            if frag not in ids_cache[target]:
                E.append((src.count("\n", 0, s) + 1, "link", f"Il collegamento «{f}#{frag}» non funziona: in quella pagina non c'è la sezione «{frag}»."))
    return E


def pagine():
    return [ROOT / "index.html", *sorted((ROOT / "capitoli").glob("*.html")), *sorted((ROOT / "pratica").glob("*.html"))]


def errori_pagina(p):
    src = p.read_text(encoding="utf-8")
    if re.search(r'http-equiv="refresh"', src, re.I):
        return []                                  # old chapter name: redirect only
    return [m for _, _, m in controlla(src) + collegamenti(p, src)]


def errori_globali():
    """Generated files that must follow the pages: the glossary data and the search index."""
    import genera_glossario
    import genera_indice_teoria as G
    E = []
    if (ROOT / "assets" / "glossario-dati.js").read_text(encoding="utf-8") != genera_glossario.render():
        E.append("Il glossario è cambiato ma «assets/glossario-dati.js» non è aggiornato: i termini sottolineati nel testo non seguono il glossario. Chiedi al COO di lanciare «python3 tools/genera_glossario.py».")
    if G.OUT.read_text(encoding="utf-8") != G.render(G.build()):
        E.append("I titoli o le pagine sono cambiati ma l'indice di ricerca «assets/indice-ricerca.js» non è aggiornato. Chiedi al COO di lanciare «python3 tools/genera_indice_teoria.py».")
    return E


def chiave(p):
    try:
        return Path(p).resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return Path(p).name


def run(paths, base, globali=True):
    """{file: [new messages]} given the base {file: [messages]}."""
    tutti = {chiave(p): errori_pagina(p) for p in paths}
    if globali:
        tutti["(sito)"] = errori_globali()
    nuovi = {}
    for nome, errs in tutti.items():
        noti = Counter(base.get(nome, []))
        for m in errs:
            if noti[m] > 0:
                noti[m] -= 1
            else:
                nuovi.setdefault(nome, []).append(m)
    return nuovi, tutti


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--path", help="one page (default: the whole site)")
    ap.add_argument("--base", action="store_true", help="rewrite tools/modifica_base.json with the current errors")
    ap.add_argument("--base-file", default=str(BASE))
    ap.add_argument("--senza-base", action="store_true")
    a = ap.parse_args(argv)
    paths = [Path(a.path).resolve()] if a.path else pagine()
    bf = Path(a.base_file)
    if a.base:
        _, tutti = run(paths, {}, globali=False)
        data = {n: sorted(e) for n, e in tutti.items() if e}
        bf.write_text(json.dumps(data, indent=1, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
        print(f"base scritta: {sum(map(len, data.values()))} errori in {len(data)} pagine")
        return 0
    base = {} if a.senza_base or not bf.exists() else json.loads(bf.read_text(encoding="utf-8"))
    nuovi, tutti = run(paths, base, globali=not a.path)
    for n, errs in nuovi.items():
        for m in errs:
            print(f"{n}: {m}")
    print(f"controlla_modifica: {len(tutti)} pagine, {sum(map(len, nuovi.values()))} errori nuovi")
    return 1 if nuovi else 0


if __name__ == "__main__":
    sys.exit(main())
