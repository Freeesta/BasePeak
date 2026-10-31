/* BasePeak - Teoria: HTML checks of the page editor (editor.js). Same rules as tools/controlla_modifica.py (a test compares the two on every page).
   No DOM, no network: it works from file:// and under Node. Messages are in Italian and say what to fix. */
"use strict";
(function (root) {
  const VUOTI = new Set(["meta", "link", "img", "br", "hr", "input", "source", "col", "area", "base", "wbr"]);
  const GREZZI = new Set(["script", "style"]);
  const RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/([A-Za-z][\w:-]*)\s*>|<([A-Za-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
  const ATTR = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

  function attributi(s) {
    const a = {}; ATTR.lastIndex = 0;
    for (let m; (m = ATTR.exec(s));) if (!(m[1] in a)) a[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
    return a;
  }

  /** Flat list of tokens: {k: "apre" | "chiude" | "altro", tag, a, s, e, vuoto}. The text of script and style is skipped. */
  function tokenizza(src) {
    const out = []; RE.lastIndex = 0;
    for (let m; (m = RE.exec(src));) {
      if (m[1]) out.push({ k: "chiude", tag: m[1].toLowerCase(), s: m.index, e: RE.lastIndex });
      else if (m[2]) {
        const tag = m[2].toLowerCase(), t = { k: "apre", tag, a: attributi(m[3]), s: m.index, e: RE.lastIndex, vuoto: VUOTI.has(tag) || /\/\s*$/.test(m[3]) };
        out.push(t);
        if (GREZZI.has(tag) && !t.vuoto) { const j = src.toLowerCase().indexOf("</" + tag, RE.lastIndex); if (j > 0) RE.lastIndex = j; }
      } else out.push({ k: "altro", s: m.index, e: RE.lastIndex });
    }
    return out;
  }

  const riga = (src, i) => src.slice(0, i).split("\n").length;

  /** The errors of a piece of HTML: [{msg, riga, tipo}]. `documento`: a whole page (headings start from h1), otherwise a piece of main (they start from h2). */
  function controlla(src, documento) {
    const E = [], pila = [], ids = new Map(), add = (i, tipo, msg) => E.push({ msg, tipo, riga: riga(src, i) });
    let prev = documento ? 0 : 1;
    for (const t of tokenizza(src)) {
      if (t.k === "apre") {
        if (t.a.id) { if (ids.get(t.a.id) === 1) add(t.s, "id", `L'id «${t.a.id}» è usato più volte. Cambia l'id di uno dei due elementi.`); ids.set(t.a.id, ids.has(t.a.id) ? 2 : 1); }
        if (/^h[1-6]$/.test(t.tag)) { const l = +t.tag[1]; if (l > prev + 1) add(t.s, "titolo", `Salto di titolo: dopo un titolo h${prev} c'è un h${l}. Usa h${prev + 1}.`); prev = l; }
        if (t.tag === "img" && !("alt" in t.a)) add(t.s, "alt", `L'immagine ${t.a.src || ""} non ha la descrizione. Aggiungi alt="descrizione dell'immagine".`);
        if (!t.vuoto) pila.push(t);
      } else if (t.k === "chiude") {
        let j = pila.length - 1; while (j >= 0 && pila[j].tag !== t.tag) j--;
        if (j < 0) add(t.s, "struttura", `Trovato </${t.tag}> senza il <${t.tag}> che lo apre. Toglilo, oppure aggiungi <${t.tag}> prima.`);
        else { for (let q = pila.length - 1; q > j; q--) add(pila[q].s, "struttura", `Il tag <${pila[q].tag}> non è chiuso. Aggiungi </${pila[q].tag}> dove finisce.`); pila.length = j; }
      }
    }
    pila.forEach(t => add(t.s, "struttura", `Il tag <${t.tag}> non è chiuso. Aggiungi </${t.tag}> dove finisce.`));
    const testo = src.replace(/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ");
    // the title «Capitolo in costruzione» of the skeleton boxes of the chapters being written is allowed; any other «in costruzione» is not
    if (/in costruzione/i.test(testo.split("Capitolo in costruzione").join(" "))) add(Math.max(0, src.replace(/Capitolo in costruzione/g, "XXXXXXXXXXXXXXXXXXXXXXX").search(/in costruzione/i)), "testo", "Il testo contiene «in costruzione». Scrivi il testo vero oppure togli la frase.");
    if (/Scrivi qui/.test(testo)) add(Math.max(0, src.search(/Scrivi qui/)), "testo", "È rimasto il testo di prova «Scrivi qui…». Sostituiscilo con il tuo testo oppure togli il riquadro.");
    return E.sort((a, b) => a.riga - b.riga);
  }

  /** The content of <main> of a source page cut into its top-level parts: {ini, fine, seg: [{t: "el" | "testo", s, e, tag}]} (null if the page has no clean <main>). */
  function segmenta(src) {
    if (controlla(src, true).some(x => x.tipo === "struttura")) return null;
    const pila = [], seg = []; let ini = -1, fine = -1, base = -1, figlio = null;
    for (const t of tokenizza(src)) {
      if (t.k === "apre") {
        if (ini < 0) { if (t.tag === "main" && !t.vuoto) { ini = t.e; pila.push(t); base = pila.length; } else if (!t.vuoto) pila.push(t); continue; }
        if (pila.length === base && !figlio) { if (t.vuoto) seg.push({ t: "el", s: t.s, e: t.e, tag: t.tag }); else figlio = t; }
        if (!t.vuoto) pila.push(t);
      } else if (t.k === "chiude") {
        const j = pila.map(p => p.tag).lastIndexOf(t.tag); if (j < 0) continue;
        if (ini >= 0 && j === base - 1) { fine = t.s; break; }
        if (figlio && pila[j] === figlio) { seg.push({ t: "el", s: figlio.s, e: t.e, tag: figlio.tag }); figlio = null; }
        pila.length = j;
      }
    }
    if (ini < 0 || fine < 0) return null;
    const tutti = []; let p = ini;
    seg.forEach(x => { if (x.s > p) tutti.push({ t: "testo", s: p, e: x.s }); tutti.push(x); p = x.e; });
    if (fine > p) tutti.push({ t: "testo", s: p, e: fine });
    return { ini, fine, seg: tutti };
  }

  root.TEORIA_CONTROLLI = { tokenizza, controlla, segmenta };
  if (typeof module !== "undefined" && module.exports) module.exports = root.TEORIA_CONTROLLI;
})(typeof window !== "undefined" ? window : globalThis);
