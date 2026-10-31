/* BasePeak - Teoria: page editor of the administrator mode (five clicks on the logo, sblocco.js). Alt+E or the button «Modifica questa pagina».
   The text is edited where it stands (contenteditable); «Salva e proponi la modifica» downloads the whole page, copies it and opens the GitHub web editor of that
   file: GitHub makes the branch and the pull request, the CI checks it, the COO merges. No server, no token, no network except that GitHub tab: it works from file:// too.
   The page is rebuilt from its SOURCE (read from the site, or chosen once from disk on file://): every block you did not touch is copied as it was, so the pull request shows only your change.
   HTML checks: editor-controlli.js (same rules as tools/controlla_modifica.py). Styles: editor.css (read only when the editor opens). */
"use strict";

(function () {
  const REPO = "Freeesta/BasePeak", BRANCH = "main", SERVER_URL = "http://127.0.0.1:8765";
  const SITE = (window.TEORIA && window.TEORIA.sito) || { here: location.pathname.split("/").pop() || "index.html", up: "", root: location.href, assets: "" };   // teoria.js has set it
  const GENERATI = ".navtop,.pn,.phex,#phnote";                                  // blocks of main written by teoria.js, not by the author
  const DIN = ".sim,[data-sim],.ctl,.btns,canvas,button,select,input,textarea,iframe,.eispec";   // blocks drawn by scripts: not editable, copied as they were
  const BOX = { key: ["Concetto chiave", "box key"], warn: ["Errore frequente", "box warn"], lab: ["In laboratorio", "box lab"], oral: ["Domande di ripasso", "box oral"] };
  const TESTO = "Scrivi qui il testo.";

  /** Path of a page inside the repository, from its address (live site, local server or file://): «capitoli/02-lc.html»; null if it is not a page of the site. */
  function percorso(href) {
    const u = String(href).replace(/[?#].*$/, ""), m = u.match(/\/(capitoli|pratica)\/([^/]+?)(\.html)?$/);
    if (m) return decodeURIComponent(m[1] + "/" + m[2]) + ".html";
    return /(^|\/)(index(\.html)?)?$/.test(u) ? "index.html" : null;
  }
  const urlGitHub = p => `https://github.com/${REPO}/edit/${BRANCH}/${p.split("/").map(encodeURIComponent).join("/")}`;
  const here = percorso(location.href) || SITE.here;
  if (!here.endsWith(".html")) return;

  const $ = (q, el = document) => el.querySelector(q);
  const main = () => $("main");
  let editing = false, mode = "visual", bar, pannello, codeWrap, ta, esito, msgEl, sorgente = null, fonte = null, orig = new Map(), nOrig = 0, tagOrig = [], ultimo = null, codiceBase = "", dalCodice = false, serverOk = false;

  function init() {
    if (!window.QADMIN || !QADMIN.on()) return;                                  // the editor belongs to the administrator mode: no button, no shortcut otherwise
    window.addEventListener("keydown", e => { if (e.altKey && (e.key === "e" || e.key === "E" || e.code === "KeyE")) { e.preventDefault(); toggle(); } });
    bottone();
  }

  function bottone() {
    const tbar = document.getElementById("tbar");
    if (!tbar) { window.addEventListener("load", bottone, { once: true }); return; }
    if (document.getElementById("tc-editor")) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "tb"; b.id = "tc-editor"; b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Modifica questa pagina"); b.title = "Modifica questa pagina (Alt+E)";
    b.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 3.5l3 3L6.5 16.5l-4 1 1-4L13.5 3.5z"/><path d="M11.5 5.5l3 3"/></svg><span class="l">Modifica questa pagina</span>`;
    b.onclick = toggle;
    const s = document.getElementById("a11y-btn") || document.getElementById("tc-impostazioni");
    if (s && s.parentNode === tbar) tbar.insertBefore(b, s); else tbar.appendChild(b);
  }

  const carica = (() => {
    let p = null;
    return () => p || (p = new Promise((ok, no) => {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = SITE.assets + "editor.css"; document.head.appendChild(l);
      const s = document.createElement("script"); s.src = SITE.assets + "editor-controlli.js"; s.onload = ok; s.onerror = () => no(new Error("editor-controlli.js")); document.head.appendChild(s);
    }));
  })();
  const C = () => window.TEORIA_CONTROLLI;

  async function toggle() { if (editing) esci(); else await entra(); }

  async function entra() {
    try { await carica(); } catch (_) { alert("Non riesco a caricare gli strumenti di modifica."); return; }
    editing = true; mode = "visual"; dalCodice = false;
    document.body.classList.add("ed-on");
    const eb = $("#tc-editor"); if (eb) { eb.classList.add("on"); eb.setAttribute("aria-pressed", "true"); }
    catturaOriginali(); creaBarra(); abilita();
    leggiFonte();
    dire("Modalità modifica attiva. Cambia il testo come lo vedi, poi premi «Salva e proponi la modifica».");
    sondaServer();
    main().focus({ preventScroll: true });
  }

  function esci(forza) {
    if (!forza && modificato() && !confirm("Vuoi uscire? Le modifiche non ancora salvate andranno perse.")) return;
    editing = false; document.body.classList.remove("ed-on");
    const eb = $("#tc-editor"); if (eb) { eb.classList.remove("on"); eb.setAttribute("aria-pressed", "false"); }
    if (bar) bar.remove(); if (pannello) pannello.remove(); if (codeWrap) codeWrap.remove(); bar = pannello = codeWrap = null;
    disabilita(); location.reload();                                             // the page returns as the readers see it (figures included)
  }

  window.addEventListener("beforeunload", e => { if (editing && modificato()) { e.preventDefault(); e.returnValue = ""; } });

  // ---------------------------------------------------------------- the blocks of the page
  function blocchiVivi() {
    const out = [];
    for (const el of main().children) {
      if (el.matches(GENERATI)) continue;
      if (el.classList.contains("tw")) { const t = $(":scope > table", el); if (t) out.push(t); continue; }
      out.push(el);
    }
    return out;
  }
  const dinamico = el => el.matches(DIN) || !!$(DIN, el);

  /** The element as the author wrote it: what teoria.js added (anchors, glossary underlines, table wrappers, levels, figure names) is taken away. */
  function pulisci(el, senzaId, senzaTbody) {
    const c = el.cloneNode(true);
    if (senzaTbody) c.querySelectorAll("tbody").forEach(b => { const t = b.parentNode; if (t.localName === "table" && t.querySelectorAll(":scope > tbody, :scope > thead, :scope > tfoot").length === 1) b.replaceWith(...b.childNodes); });   // the browser adds it, the author did not write it
    c.querySelectorAll(".ha").forEach(x => x.remove());
    c.querySelectorAll(".tw").forEach(tw => { const t = $(":scope > table", tw); if (t) tw.replaceWith(t); else tw.remove(); });
    c.querySelectorAll(".g").forEach(x => x.replaceWith(document.createTextNode(x.textContent)));
    c.querySelectorAll("svg[role=img][aria-labelledby]").forEach(svg => {
      const p = svg.previousElementSibling; if (p && /^fig-cap-\d+$/.test(p.id)) p.removeAttribute("id");
      svg.removeAttribute("role"); svg.removeAttribute("aria-labelledby");
    });
    [c, ...c.querySelectorAll("*")].forEach(x => { x.removeAttribute("contenteditable"); x.removeAttribute("spellcheck"); x.removeAttribute("aria-level"); });
    if (senzaId) c.removeAttribute("id");
    return c;
  }
  const firma = el => dinamico(el) ? "" : pulisci(el).outerHTML;

  function catturaOriginali() {
    orig = new Map(); tagOrig = [];
    blocchiVivi().forEach((el, k) => { orig.set(el, { k, sig: firma(el) }); tagOrig.push(el.localName); });
    nOrig = tagOrig.length;
  }

  function modificato() {
    if (!editing) return false;
    if (mode === "code") return ta.value !== codiceBase || dalCodice;
    if (dalCodice) return true;
    const v = blocchiVivi();
    return v.length !== nOrig || v.some((el, i) => { const o = orig.get(el); return !o || o.k !== i || (o.sig !== "" && firma(el) !== o.sig); });
  }

  function abilita() {
    const m = main(); m.setAttribute("contenteditable", "true"); m.setAttribute("spellcheck", "true");
    m.querySelectorAll("svg,script,style," + GENERATI).forEach(e => e.setAttribute("contenteditable", "false"));
    blocchiVivi().forEach(el => { if (dinamico(el)) el.setAttribute("contenteditable", "false"); });
    m.addEventListener("click", noLink); m.addEventListener("paste", incollaTesto);
    document.execCommand("defaultParagraphSeparator", false, "p");
  }
  function disabilita() {
    const m = main(); if (!m) return;
    m.removeEventListener("click", noLink); m.removeEventListener("paste", incollaTesto);
    m.removeAttribute("contenteditable"); m.removeAttribute("spellcheck"); m.querySelectorAll("[contenteditable]").forEach(e => e.removeAttribute("contenteditable"));
  }
  const noLink = e => { if (editing && mode === "visual" && e.target.closest("a")) e.preventDefault(); };
  const incollaTesto = e => { e.preventDefault(); const t = (e.clipboardData || window.clipboardData).getData("text/plain"); document.execCommand("insertText", false, t); };   // no styles from Word or the web
  document.addEventListener("selectionchange", () => { const s = getSelection(); if (editing && s.rangeCount && main() && main().contains(s.anchorNode)) ultimo = s.getRangeAt(0).cloneRange(); });

  // ---------------------------------------------------------------- the bar
  function creaBarra() {
    if (bar) bar.remove();
    bar = document.createElement("div"); bar.id = "ed-bar"; bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", "Strumenti di modifica");
    const b = (act, html, nome, extra = "") => `<button type="button" class="ed-b ${extra}" data-act="${act}" aria-label="${nome}" title="${nome}">${html}</button>`;
    bar.innerHTML = `<div class="ed-riga" id="ed-vis">
        <span class="ed-g" role="group" aria-label="Testo">${b("bold", "<b>G</b>", "Grassetto (Ctrl+B)")}${b("italic", "<i>C</i>", "Corsivo (Ctrl+I)")}${b("subscript", "X<sub>2</sub>", "Pedice, per esempio H2O")}${b("superscript", "X<sup>2</sup>", "Apice, per esempio 10^-5")}${b("link", "Link", "Collegamento: prima seleziona le parole")}${b("unlink", "Senza link", "Togli il collegamento")}</span>
        <span class="ed-g" role="group" aria-label="Paragrafi">${b("h2", "Titolo", "Titolo di sezione (h2)")}${b("h3", "Sottotitolo", "Sottotitolo (h3)")}${b("p", "Testo", "Paragrafo normale")}${b("insertUnorderedList", "Elenco", "Elenco puntato")}${b("insertOrderedList", "1. 2.", "Elenco numerato")}</span>
        <span class="ed-g" role="group" aria-label="Riquadri pronti">${Object.entries(BOX).map(([k, v]) => b("box-" + k, v[0], "Inserisci il riquadro «" + v[0] + "»")).join("")}${b("box-q", "Domanda", "Inserisci una domanda con la risposta nascosta")}</span>
        <span class="ed-g" role="group" aria-label="Annulla">${b("undo", "Annulla", "Annulla (Ctrl+Z)")}${b("redo", "Ripeti", "Ripeti (Ctrl+Maiusc+Z)")}</span>
      </div>
      <div class="ed-riga">
        <span class="ed-g" role="group" aria-label="Vista">${b("vista-visual", "Pagina", "Vedi la pagina", "ed-on")}${b("vista-code", "Codice", "Vedi e cambia il codice HTML")}</span>
        <button type="button" class="ed-b ed-pri" data-act="salva">Salva e proponi la modifica</button>
        <button type="button" class="ed-b ed-loc" data-act="locale" hidden>Salva su questo computer</button>
        <button type="button" class="ed-b" data-act="esci">Chiudi</button>
        <span id="ed-msg" role="status" aria-live="polite"></span>
      </div>`;
    msgEl = $("#ed-msg", bar);
    const top = document.getElementById("top"); if (top) top.after(bar); else document.body.prepend(bar);
    bar.addEventListener("mousedown", e => { if (e.target.closest("button")) e.preventDefault(); });   // the selection stays in the text
    bar.addEventListener("click", e => { const x = e.target.closest("[data-act]"); if (x) azione(x.dataset.act); });
    aggiornaVista();
  }
  const dire = t => { if (msgEl) msgEl.textContent = t; };

  function ripristina() {
    main().focus({ preventScroll: true });
    if (ultimo) { const s = getSelection(); s.removeAllRanges(); s.addRange(ultimo); }
  }
  function bloccoCorrente() {
    const s = getSelection(); let n = s.rangeCount ? s.anchorNode : null;
    while (n && n.parentNode !== main()) n = n.parentNode;
    return n && n.nodeType === 1 && !n.matches(GENERATI) ? n : [...main().children].filter(x => !x.matches(GENERATI)).pop();
  }

  function azione(a) {
    if (a === "salva") return salva();
    if (a === "esci") return esci();
    if (a === "locale") return salvaLocale();
    if (a.startsWith("vista-")) return a === "vista-code" ? mostraCodice() : tornaVisuale();
    if (mode !== "visual") return;
    ripristina();
    if (a === "link") {
      const s = getSelection(); if (s.isCollapsed) return dire("Prima seleziona le parole che vuoi trasformare in collegamento.");
      const u = prompt("Indirizzo del collegamento (https://… per un sito, oppure 06-quadrupolo.html per un capitolo):", "https://");
      if (u && u !== "https://") {
        document.execCommand("createLink", false, u);
        if (/^https?:/.test(u)) main().querySelectorAll(`a[href="${CSS.escape(u)}"]:not([target])`).forEach(x => { x.target = "_blank"; x.rel = "noopener"; });
      }
    } else if (a === "h2" || a === "h3" || a === "p") {
      const cur = bloccoCorrente(); document.execCommand("formatBlock", false, "<" + (cur && cur.localName === a ? "p" : a) + ">");
    } else if (a.startsWith("box-")) riquadro(a.slice(4));
    else document.execCommand(a, false, null);
    dire("");
  }

  function riquadro(tipo) {
    const dopo = bloccoCorrente(), html = tipo === "q" ? `<details class="q"><summary>Scrivi qui la domanda?</summary><p>Scrivi qui la risposta.</p></details>`
      : `<div class="${BOX[tipo][1]}"><b>${BOX[tipo][0]}</b><p>${TESTO}</p></div>`;
    dopo.insertAdjacentHTML("afterend", html);
    const nuovo = dopo.nextElementSibling, p = $("p,summary", nuovo);
    if (p) { const r = document.createRange(); r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    nuovo.scrollIntoView({ block: "center", behavior: "instant" });
  }

  // ---------------------------------------------------------------- the source and the new page
  /** The source text of this page: read from the site (it works on the live site and on the local server); from file:// the browser forbids it and the author chooses the file once. */
  function leggiFonte() {
    return fonte || (fonte = (async () => {
      try {
        const r = await fetch(location.href.replace(/[?#].*$/, ""), { cache: "no-store" });
        if (r.ok) { const t = await r.text(); if (C().segmenta(t)) sorgente = t; }
      } catch (_) { /* file:// or offline: the file is chosen by hand */ }
      return sorgente;
    })());
  }

  /** The content of <main> to write: untouched blocks are the source text, touched or new ones are serialised. */
  function contenuto() {
    const S = C().segmenta(sorgente), els = S.seg.filter(x => x.t === "el"), vivi = blocchiVivi();
    const mappa = !dalCodice && els.length === nOrig && els.every((x, k) => x.tag === tagOrig[k]);
    const it = vivi.map(el => { const o = mappa ? orig.get(el) : null; return { el, k: o ? o.k : -1, sporco: !o || (o.sig !== "" && firma(el) !== o.sig) }; });
    const ser = x => { const s = x.k >= 0 ? sorgente.slice(els[x.k].s, els[x.k].e) : ""; return pulisci(x.el, x.k >= 0 && /^h[1-6]$/.test(x.el.localName) && !/^<[^>]*\sid\s*=/.test(s), !/<tbody/i.test(s)).outerHTML; };
    const ks = it.filter(x => x.k >= 0).map(x => x.k);
    if (!mappa || ks.some((k, i) => i && k <= ks[i - 1])) return { S, testo: "\n" + it.map(x => (x.k >= 0 && !x.sporco ? sorgente.slice(els[x.k].s, els[x.k].e) : ser(x))).join("\n") + "\n" };
    const pos = new Map(it.map((x, i) => [x.k, i]));
    let out = "", li = 0, n = 0, salta = false;
    for (const sg of S.seg) {
      const txt = sorgente.slice(sg.s, sg.e);
      if (sg.t === "testo") { if (!(salta && !txt.trim())) out += txt; salta = false; continue; }
      const p = pos.get(n++);
      if (p === undefined) { salta = true; continue; }                           // the block was deleted
      salta = false;
      for (; li < p; li++) out += ser(it[li]) + "\n";                            // new blocks before this one
      out += it[p].sporco ? ser(it[p]) : txt; li = p + 1;
    }
    for (; li < it.length; li++) out += ser(it[li]) + "\n";
    return { S, testo: out };
  }

  const pagina = (S, testo) => sorgente.slice(0, S.ini) + testo + sorgente.slice(S.fine);

  /** New errors only: the ones the page already had are not the author's fault. */
  function nuoviErrori(nuovo, vecchio, doc) {
    const noti = new Map(); C().controlla(vecchio, doc).forEach(x => noti.set(x.msg, (noti.get(x.msg) || 0) + 1));
    return C().controlla(nuovo, doc).filter(x => { const n = noti.get(x.msg) || 0; if (n) noti.set(x.msg, n - 1); return !n; });
  }
  const elenco = E => E.map(x => `<li>Riga ${x.riga}: ${x.msg.replace(/[&<]/g, c => (c === "&" ? "&amp;" : "&lt;"))}</li>`).join("");

  // ---------------------------------------------------------------- code view
  function mostraCodice() {
    if (mode === "code") return;
    if (!sorgente) { const v = blocchiVivi().map(el => pulisci(el).outerHTML).join("\n"); apriCodice("\n" + v + "\n"); return; }
    apriCodice(contenuto().testo);
  }
  function apriCodice(txt) {
    mode = "code"; codiceBase = txt; aggiornaVista();
    main().style.display = "none";
    codeWrap = document.createElement("div"); codeWrap.id = "ed-code";
    codeWrap.innerHTML = `<label for="ed-ta">Codice HTML di questa pagina (solo la parte tra &lt;main&gt; e &lt;/main&gt;). Cambia il testo, lascia i tag.</label><textarea id="ed-ta" spellcheck="false" wrap="off"></textarea><div id="ed-esito" role="status" aria-live="polite"></div>`;
    main().after(codeWrap); ta = $("#ed-ta"); esito = $("#ed-esito"); ta.value = txt;
    let t = 0; ta.addEventListener("input", () => { clearTimeout(t); t = setTimeout(verifica, 200); });
    verifica(); ta.focus();
  }
  function verifica() {
    const E = nuoviErrori(ta.value, codiceBase, false);
    esito.innerHTML = E.length ? `<b>Da correggere (${E.length}):</b><ul>${elenco(E)}</ul>` : "<b>Il codice è in ordine:</b> i tag sono tutti chiusi.";
    esito.className = E.length ? "ko" : "ok";
    return E;
  }
  function tornaVisuale() {
    if (mode !== "code") return;
    if (ta.value !== codiceBase) {
      if (verifica().length) return dire("Correggi gli errori del codice prima di tornare alla pagina.");
      const t = document.createElement("template"); t.innerHTML = ta.value;
      blocchiVivi().forEach(el => (el.parentNode.classList && el.parentNode.classList.contains("tw") ? el.parentNode : el).remove());
      main().insertBefore(t.content, $(".pn", main()));
      orig = new Map(); dalCodice = true; abilita();
      dire("Il codice è stato applicato. Le figure interattive si vedono di nuovo dopo il salvataggio.");
    }
    codeWrap.remove(); codeWrap = null; main().style.display = ""; mode = "visual"; aggiornaVista(); main().focus({ preventScroll: true });
  }
  function aggiornaVista() {
    bar.querySelectorAll("[data-act^=vista-]").forEach(x => { const on = x.dataset.act === "vista-" + (mode === "code" ? "code" : "visual"); x.classList.toggle("ed-on", on); x.setAttribute("aria-pressed", String(on)); });
    bar.querySelectorAll("#ed-vis [data-act]").forEach(x => { x.disabled = mode === "code"; });
  }

  // ---------------------------------------------------------------- save
  async function salva() {
    if (!sorgente) await leggiFonte();
    if (!sorgente) return sceltaFile();
    let S, nuova;
    if (mode === "code") { const E = verifica(); if (E.length) return dire("Correggi gli errori del codice, poi salva."); S = C().segmenta(sorgente); nuova = pagina(S, ta.value); }
    else { const r = contenuto(); S = r.S; nuova = pagina(S, r.testo); }
    if (nuova === sorgente) return dire("Non hai cambiato niente: non c'è nulla da proporre.");
    const E = nuoviErrori(nuova, sorgente, true);
    if (E.length) { mostraErrori(E); return dire("La pagina ha degli errori: correggili prima di salvare."); }
    const nome = here.replace(/^.*\//, ""), url = urlGitHub(here);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([nuova], { type: "text/html;charset=utf-8" })); a.download = nome;
    document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 500);
    let copiato = false; try { await navigator.clipboard.writeText(nuova); copiato = true; } catch (_) { /* the file is downloaded anyway */ }
    const w = window.open(url, "_blank", "noopener");
    pannelloFinale(url, nuova, copiato, !!w);
  }
  function mostraErrori(E) {
    const p = apriPannello("Prima di salvare", `<p>Ci sono errori nel testo:</p><ul>${elenco(E)}</ul><div class="ed-az"><button type="button" class="ed-b" data-p="chiudi">Ho capito</button></div>`);
    return p;
  }
  function apriPannello(titolo, html) {
    if (pannello) pannello.remove();
    pannello = document.createElement("section"); pannello.id = "ed-pannello"; pannello.setAttribute("role", "region"); pannello.setAttribute("aria-labelledby", "ed-ph"); pannello.tabIndex = -1;
    pannello.innerHTML = `<h2 id="ed-ph">${titolo}</h2>${html}`;
    bar.after(pannello); pannello.focus();
    pannello.addEventListener("click", e => { const x = e.target.closest("[data-p]"); if (x && x.dataset.p === "chiudi") { pannello.remove(); pannello = null; } });
    pannello.addEventListener("keydown", e => { if (e.key === "Escape") { pannello.remove(); pannello = null; main().focus({ preventScroll: true }); } });
    return pannello;
  }
  function pannelloFinale(url, nuova, copiato, aperta) {
    const p = apriPannello("Ultimo passo: proponi la modifica su GitHub", `
      <p>Ho scaricato il file <b>${here.replace(/^.*\//, "")}</b>${copiato ? " e ne ho copiato il testo" : ""}. ${aperta ? "Si è aperta una scheda di GitHub." : "Il browser ha bloccato la nuova scheda: usa il pulsante qui sotto."} Ti serve un account GitHub.</p>
      <ol class="ed-passi">
        <li><b>Seleziona tutto</b> il testo nella pagina GitHub (Ctrl+A, su Mac Cmd+A).</li>
        <li><b>Incolla</b> (Ctrl+V, su Mac Cmd+V)${copiato ? "" : ": il testo non è stato copiato, apri il file scaricato, copialo e incollalo"}.</li>
        <li><b>Scrivi in alto</b> che cosa hai cambiato.</li>
        <li>Premi <b>«Commit changes…»</b>, scegli di creare un nuovo ramo e premi <b>«Propose changes»</b>, poi <b>«Create pull request»</b>.</li>
      </ol>
      <p>Poi aspetta: il controllo automatico guarda la pagina e il COO la pubblica.</p>
      <p>Se compare una X rossa e il messaggio parla di «indice di ricerca» o di «glossario»: è normale quando cambi un titolo o una parola del glossario. Scrivi a Claude: «rigenera gli indici della mia modifica (PR n)».</p>
      <div class="ed-az"><a class="ed-b" href="${url}" target="_blank" rel="noopener">Apri GitHub di nuovo</a><button type="button" class="ed-b" data-p="copia">Copia di nuovo il testo</button><button type="button" class="ed-b" data-p="chiudi">Chiudi</button></div>
      <p id="ed-pst" role="status"></p>`);
    p.addEventListener("click", async e => { if (e.target.closest("[data-p=copia]")) { let ok = false; try { await navigator.clipboard.writeText(nuova); ok = true; } catch (_) { /* no clipboard */ } $("#ed-pst", p).textContent = ok ? "Testo copiato." : "Non riesco a copiare: apri il file scaricato e copialo da lì."; } });
    dire("File scaricato. Segui i quattro passi qui sotto.");
  }
  function sceltaFile() {
    const p = apriPannello("Scegli il file di questa pagina", `
      <p>Da un file aperto dal disco il browser non può leggere il file originale. Scegli una volta il file di questa pagina: <b>${here}</b>, nella cartella BasePeak del tuo computer.</p>
      <p><label for="ed-file">File della pagina</label> <input type="file" id="ed-file" accept=".html,text/html"></p>
      <div class="ed-az"><button type="button" class="ed-b" data-p="chiudi">Chiudi</button></div><p id="ed-pst" role="status"></p>`);
    $("#ed-file", p).onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      const t = await f.text(), S = C().segmenta(t), st = $("#ed-pst", p);
      const els = S && S.seg.filter(x => x.t === "el");
      if (!S || els.length !== nOrig || els.some((x, k) => x.tag !== tagOrig[k])) { st.textContent = "Questo non sembra il file giusto: scegli " + here + "."; return; }
      sorgente = t; st.textContent = "File letto. Ora premi di nuovo «Salva e proponi la modifica».";
      dire("File letto. Ora premi di nuovo «Salva e proponi la modifica».");
    };
  }

  // ---------------------------------------------------------------- optional: the local server (tools/server_teoria.py), only to save on this computer
  function token() { return new URLSearchParams(location.search).get("token") || sessionStorage.getItem("mzlab_teoria_token") || ""; }
  async function sondaServer() {
    if (!token() || !/^https?:$/.test(location.protocol)) return;
    try {
      const c = new AbortController(); setTimeout(() => c.abort(), 800);
      const r = await fetch(SERVER_URL + "/stato", { signal: c.signal });
      if (r.ok && (await r.json()).ok && bar) { serverOk = true; $("[data-act=locale]", bar).hidden = false; }
    } catch (_) { /* no server: the normal way is the only one */ }
  }
  async function salvaLocale() {
    if (!sorgente) await leggiFonte();
    if (!sorgente) return dire("Prima apri la pagina dal sito o dal server.");
    const S = C().segmenta(sorgente), nuova = mode === "code" ? pagina(S, ta.value) : pagina(S, contenuto().testo);
    try {
      const r = await fetch(SERVER_URL + "/salva", { method: "POST", headers: { "Content-Type": "application/json", "X-Teoria-Token": token() }, body: JSON.stringify({ file: here, html: nuova, push: false }) });
      const d = await r.json().catch(() => ({}));
      dire(r.ok && d.ok ? "Salvato su questo computer (nel file della cartella BasePeak)." : "Non salvato: " + (d.error || "errore " + r.status));
    } catch (e) { dire("Il server locale non risponde."); }
  }

  /** The page as it would be saved now (a string), or null: for the tests and for «Salva». */
  async function anteprima() {
    if (!editing) return null;
    if (!sorgente) await leggiFonte();
    if (!sorgente) return null;
    return mode === "code" ? pagina(C().segmenta(sorgente), ta.value) : (r => pagina(r.S, r.testo))(contenuto());
  }

  window.TEORIA_EDITOR = { toggle, percorso, urlGitHub, salva, anteprima, attiva: bottone };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
