/* QqQ lab - Teoria: shared layout (header, chapter list, on-page TOC, prev/next) and tiny plotting helpers.
   Classic script, no modules, no network: the pages work from file:// and from the local server. */
"use strict";
// [file, number shown in the menu, title, part]. The order is the study path: each chapter uses only what comes before it.
// The "Pratica" pages (pratica/*.html) are the exercises and games; they use the same layout.
// The menu has three parts, in this order: Teoria (chapters 1-18 and the introduction), Pratica, Reference (part "Reference": glossary, formulary, timings), see groupOf().
// Files are written relative to the site root (the folder above assets/); SITE.up is the way from the current page back to that root.
const SITE = (() => {
  const src = document.currentScript && document.currentScript.src;
  const assets = src ? src.replace(/[^/]*$/, "") : new URL("assets/", location.href).href;     // this script lives in assets/
  const root = assets.replace(/[^/]+\/$/, "");
  const url = location.href.replace(/[?#].*$/, "");
  let here = url.startsWith(root) ? decodeURIComponent(url.slice(root.length)) : decodeURIComponent(url.split("/").pop());
  if (!here || here.endsWith("/")) here += "index.html";
  return { assets, root, here, up: "../".repeat(Math.max(0, here.split("/").length - 1)) };
})();
(window.TEORIA = window.TEORIA || {}).sito = SITE;
const CHAPTERS = [
  ["index.html", "0", "Introduzione e mappa del percorso", "Guida"],
  ["capitoli/01-cromatografia.html", "1", "Fondamenti di cromatografia", "II. Separare"],
  ["capitoli/02-lc.html", "2", "Cromatografia liquida (HPLC)", "II. Separare"],
  ["capitoli/03-gc.html", "3", "Gascromatografia (GC)", "II. Separare"],
  ["capitoli/04-esi.html", "4", "Elettrospray (ESI) e sorgenti a pressione atmosferica", "III. Ionizzare"],
  ["capitoli/05-ei-ci.html", "5", "Ionizzazione elettronica (EI) e chimica (CI)", "III. Ionizzare"],
  ["capitoli/06-vuoto.html", "6", "Dalla sorgente al vuoto", "III. Ionizzare"],
  ["capitoli/07-quadrupolo.html", "7", "Il quadrupolo: teoria", "IV. Analizzare gli ioni"],
  ["capitoli/08-qqq.html", "8", "Il triplo quadrupolo e la CID", "IV. Analizzare gli ioni"],
  ["capitoli/09-risoluzione.html", "9", "Risoluzione e alta risoluzione: TOF, Orbitrap", "IV. Analizzare gli ioni"],
  ["capitoli/10-dati.html", "10", "I dati: file, scansioni e modi di acquisizione", "V. Leggere gli spettri"],
  ["capitoli/11-formula.html", "11", "Dalla massa alla formula", "V. Leggere gli spettri"],
  ["capitoli/12-frammentazione-esi.html", "12", "Frammentazione in CID (ioni a elettroni pari)", "V. Leggere gli spettri"],
  ["capitoli/13-ei-metodo.html", "13", "Risolvere uno spettro EI: il metodo", "V. Leggere gli spettri"],
  ["capitoli/14-ei-famiglie.html", "14", "Le famiglie di composti in EI", "V. Leggere gli spettri"],
  ["capitoli/15-origine.html", "15", "Da dove viene questo ione?", "V. Leggere gli spettri"],
  ["capitoli/16-strategia.html", "16", "Strategia per trovare i TP", "VI. Dal dato al risultato"],
  ["capitoli/17-hr-dda.html", "17", "Alta risoluzione e DDA nel programma", "VI. Dal dato al risultato"],
  ["capitoli/18-disegno.html", "18", "Disegno sperimentale e strutture", "VI. Dal dato al risultato"],
  ["pratica/index.html", "P", "Esercizi e autoverifica", "Pratica"],
  ["pratica/ei.html", "P1", "Dallo spettro alla struttura", "Pratica"],
  ["pratica/orale.html", "P2", "Domande di ripasso", "Pratica"],
  ["pratica/perdite.html", "P3", "Che cosa ha perso?", "Pratica"],
  ["pratica/isotopi.html", "P4", "Indovina gli elementi", "Pratica"],
  ["pratica/formula.html", "P5", "Formula esatta", "Pratica"],
  ["pratica/strumento.html", "P6", "Carte dello strumento", "Pratica"],
  ["pratica/quadrupolo.html", "P7", "Pilota il quadrupolo", "Pratica"],
  ["pratica/tp.html", "P8", "Δm ed ESI± dei prodotti di trasformazione", "Pratica"],
  ["capitoli/19-glossario.html", "19", "Glossario e bibliografia", "Reference"],
  ["capitoli/20-formulario.html", "20", "Formulario", "Reference"],
  ["capitoli/21-tempi.html", "21", "Tempi degli analizzatori: dwell time, sweep e duty cycle", "Reference"],
  ["capitoli/22-segnale.html", "22", "Segnale, profilo e centroide", "VII. Chemioinformatica"],
  ["capitoli/23-formati.html", "23", "File e formati aperti", "VII. Chemioinformatica"],
  ["capitoli/24-tracce.html", "24", "Tracce di massa e ROI", "VII. Chemioinformatica"],
  ["capitoli/25-picchi.html", "25", "Trovare i picchi", "VII. Chemioinformatica"],
  ["capitoli/26-gruppi.html", "26", "Isotopi, addotti, frammenti", "VII. Chemioinformatica"],
  ["capitoli/27-tabella.html", "27", "La tabella delle feature", "VII. Chemioinformatica"],
  ["capitoli/28-somiglianza.html", "28", "Somiglianza spettrale", "VII. Chemioinformatica"],
  ["capitoli/29-librerie.html", "29", "Librerie e falsi positivi", "VII. Chemioinformatica"],
  ["capitoli/30-candidati.html", "30", "Formule e candidati in silico", "VII. Chemioinformatica"],
  ["capitoli/31-confidenza.html", "31", "Livelli di confidenza", "VII. Chemioinformatica"],
  ["capitoli/32-esempio.html", "32", "Esempio completo", "VII. Chemioinformatica"],
  ["capitoli/33-storia-mappa.html", "33", "La storia in una pagina", "VII. Storia", true],
  ["capitoli/34-storia-origini.html", "34", "Le origini: raggi catodici, raggi canale, raggi positivi", "VII. Storia", true],
  ["capitoli/35-storia-aston-dempster.html", "35", "Aston e Dempster: isotopi e numeri interi", "VII. Storia", true],
  ["capitoli/36-storia-settori.html", "36", "Settori magnetici e doppia focalizzazione", "VII. Storia", true],
  ["capitoli/37-storia-tof.html", "37", "Il tempo di volo", "VII. Storia", true],
  ["capitoli/38-storia-rf.html", "38", "Campi a radiofrequenza: quadrupolo e trappola ionica", "VII. Storia", true],
  ["capitoli/39-storia-ft.html", "39", "Ioni che girano: ICR, FT-ICR, Orbitrap", "VII. Storia", true],
  ["capitoli/40-storia-sorgenti.html", "40", "Le sorgenti: dall'impatto elettronico alla ionizzazione morbida", "VII. Storia", true],
  ["capitoli/41-storia-accoppiamenti.html", "41", "Accoppiamenti, MS/MS e ibridi", "VII. Storia", true],
  ["capitoli/42-storia-rivelatori-dati.html", "42", "Rivelatori, dati, applicazioni", "VII. Storia", true],
];
const APP = typeof APP_NAME === "string" ? APP_NAME : "mzLab";        // appname.js is loaded first by every page
CHAPTERS.forEach(c => { c[2] = c[2].split("{APP}").join(APP); });
// «Teoria estesa»: part of the administrator mode (5 clicks on the logo, sblocco.js); a chapter with a 5th field `true` is listed only then
// One administrator switch for the whole site: localStorage «mzlab.admin» = «1» (5 clicks on the logo); the older flags «qqq.admin» and «teoria.esteso» still count.
window.QADMIN = window.QADMIN || (() => {
  const get = k => { try { return localStorage.getItem(k) === "1"; } catch (_) { return false; } };
  return {
    on: () => get("mzlab.admin") || get("qqq.admin") || get("mzlab.teoria.esteso") || get("qqq.teoria.esteso"),
    set() { try { localStorage.setItem("mzlab.admin", "1"); } catch (_) { /* not stored: nothing unlocks */ } },
    clear() { try { for (const k of ["mzlab.admin", "qqq.admin", "mzlab.teoria.esteso", "qqq.teoria.esteso"]) localStorage.removeItem(k); } catch (_) { /* nothing to clear */ } },
  };
})();
const ESTESO = QADMIN.on();
(window.TEORIA = window.TEORIA || {}).esteso = () => ESTESO;
// the text of the Teoria is Italian only, but the bar shared with the program (tabs, full screen) speaks the language chosen there
window.TEORIA.lang = (() => { try { return localStorage.getItem("mzlab.lang") === "en" ? "en" : "it"; } catch (_) { return "it"; } })();
if (ESTESO) document.documentElement.classList.add("esteso"); else for (let i = CHAPTERS.length; i--;) if (CHAPTERS[i][4]) CHAPTERS.splice(i, 1);
// the chapters were written before the name changed: the old name in the text of the page is shown as the current one
function renameApp(root = document.body) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName) || !n.nodeValue.includes("QqQ lab") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT }), l = [];
  while (w.nextNode()) l.push(w.currentNode);
  l.forEach(n => { n.nodeValue = n.nodeValue.split("QqQ lab").join(APP); });
  root.querySelectorAll("[title*='QqQ lab'],[alt*='QqQ lab']").forEach(e => ["title", "alt"].forEach(a => { const v = e.getAttribute(a); if (v && v.includes("QqQ lab")) e.setAttribute(a, v.split("QqQ lab").join(APP)); }));
}
addEventListener("load", () => renameApp());

const TP = (() => {
  const $ = (q, el = document) => el.querySelector(q);
  const here = SITE.here;
  const idx = Math.max(0, CHAPTERS.findIndex(c => c[0] === here));
  // theory/#5, theory/#cap-5, theory/#A, theory/#07-quadrupolo: the index page forwards to that chapter (one address per chapter without rewriting URLs)
  if (here === "index.html") {
    const k = location.hash.slice(1).toLowerCase().replace(/^cap-?/, "");
    const hit = k && CHAPTERS.find(c => c[0] !== "index.html" && (c[1].toLowerCase() === k || c[0].replace(/^.*\//, "").replace(".html", "") === k));
    if (hit) location.replace(hit[0]);
  }
  const embedded = window.self !== window.top;
  // smartphone: same rule as ../telefono.js (which the program loads before everything; the Teoria pages do not load it)
  const PHONE = typeof QQQ_PHONE === "boolean" ? QQQ_PHONE : (() => {
    let f = null; try { f = sessionStorage.getItem("qqq.telefono"); } catch (_) { /* automatic */ } // kept from the old name: renaming it would lose the users' data
    if (f !== null) return f === "1";
    const coarse = !!(window.matchMedia && matchMedia("(pointer:coarse)").matches);
    return /iPhone|iPod|Android.+Mobile|Windows Phone|Mobile.+Firefox|Opera Mini/i.test(navigator.userAgent || "") || (coarse && Math.min(screen.width, screen.height) < 500);
  })();
  // on a phone the exercises are not offered (they need a large screen): the page says so and sends back to the Teoria.
  // The oral questions are only text: they stay.
  const NOEX = PHONE && /^pratica\/./.test(here) && here !== "pratica/index.html" && here !== "pratica/orale.html";

  function slug(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  }

  // ---------------------------------------------------------------- navigation: parts, 3-level index, anchors, breadcrumb
  const GROUP_HOME = { Teoria: "index.html", Pratica: "pratica/index.html", Reference: "capitoli/19-glossario.html" };
  const groupOf = c => /^pratica\//.test(c[0]) ? "Pratica" : c[3] === "Reference" ? "Reference" : "Teoria";
  const esc = t => t.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const numbered = c => /^(?:[1-9][0-9]*|P[0-9]+)$/.test(c[1]);
  const chTitle = c => (numbered(c) ? c[1] + ". " : "") + c[2];
  /** Text of a heading without the anchor link added to it. */
  function htext(h) { const a = h.querySelector(":scope > .ha"); return (a ? h.textContent.slice(0, h.textContent.length - a.textContent.length) : h.textContent).trim(); }
  /** Headings without an id get one from their text (same text, same id; a repeated text gets -2, -3...). Existing ids are never changed. */
  function ensureIds(hs) {
    const used = new Set([...document.querySelectorAll("[id]")].map(e => e.id));
    hs.forEach(h => {
      if (h.id) return;
      const base = slug(htext(h)) || "sezione"; let id = base, n = 2;
      while (used.has(id)) id = base + "-" + n++;
      h.id = id; used.add(id);
    });
  }
  /** The link that appears on hover and on keyboard focus at the end of a heading. */
  function addAnchor(h) {
    if (!h.id || h.querySelector(":scope > .ha")) return;
    const a = document.createElement("a"); a.className = "ha"; a.href = "#" + h.id; a.setAttribute("aria-label", "Link a questa sezione"); a.textContent = "#";
    h.appendChild(a);
  }
  // ---- collapsible index: every part (Guida, II..VII, Pratica, Reference) and the sections of the current chapter open and close with a real button
  // (aria-expanded + aria-controls). The parts the reader opened or closed are kept in sessionStorage; the part and the sections of the current chapter are always open on arrival.
  const NAVKEY = "qqq.teoria.nav";
  const navStore = {
    get() { try { const o = JSON.parse(sessionStorage.getItem(NAVKEY)); return o && typeof o === "object" ? o : {}; } catch (_) { return {}; } },
    set(o) { try { sessionStorage.setItem(NAVKEY, JSON.stringify(o)); } catch (_) { /* no storage: the state lasts for this page only */ } },
  };
  const CHEV = '<svg class="chev" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 2.5 9.5 7 5 11.5"/></svg>';
  /** Opens or closes the region a toggle button controls (and says so with aria-expanded). */
  function setOpen(btn, open) {
    const box = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open)); if (box) box.hidden = !open;
  }
  /** «Apri tutto» / «Chiudi tutto»: the label says what a press does. */
  function syncAll(side) {
    const all = side.querySelector("#navall"); if (!all) return;
    const some = [...side.querySelectorAll("button[aria-controls][aria-expanded]")].some(b => b.id !== "menu" && b.getAttribute("aria-expanded") === "false");
    all.textContent = some ? "Apri tutto" : "Chiudi tutto"; all.dataset.act = some ? "open" : "close";
  }
  function wireToggles(side) {
    const st = navStore.get(); st.p = st.p || {};
    side.addEventListener("click", e => {
      const b = e.target.closest("button.ptog, button.ctog"); if (b) {
        const open = b.getAttribute("aria-expanded") !== "true"; setOpen(b, open);
        if (b.classList.contains("ptog")) st.p[b.dataset.k] = open ? 1 : 0;   // the sections of the current chapter are always open on arrival: nothing to keep
        navStore.set(st); syncAll(side); return;
      }
      if (e.target.closest("#navall")) {
        const open = side.querySelector("#navall").dataset.act === "open";
        side.querySelectorAll("button.ptog, button.ctog").forEach(x => { setOpen(x, open); if (x.classList.contains("ptog")) st.p[x.dataset.k] = open ? 1 : 0; });
        navStore.set(st); syncAll(side);
      }
    });
  }
  /** The top of the index: the logo (the way to the home page) and the name of the site. */
  const brandHtml = () => `<div class="brand"><a id="logo" href="${SITE.up}index.html"><img src="${SITE.assets}icone/icon.svg" alt="" width="28" height="28"><span>BasePeak</span></a></div>`;
  /** The menu: the parts (Guida, II...VII, Pratica, Reference), every chapter with its title; the current one also lists the h2 and h3 of the page. Returns the page sections [{h, a}] for the scroll-spy. */
  function buildSide(side) {
    const sections = [...document.querySelectorAll("main h2, main h3")].filter(h => h.id && htext(h) && !h.closest(".box,figure,.sim,details,.phex,#phnote"));
    const items = [];
    const tree = [];
    sections.forEach(h => { const it = { h, kids: [] }; items.push(it); if (h.tagName === "H3" && tree.length) tree[tree.length - 1].kids.push(it); else tree.push(it); });
    const node = it => { const li = document.createElement("li"), a = document.createElement("a"); a.className = "sl"; a.href = "#" + it.h.id; a.textContent = htext(it.h); it.a = a; li.appendChild(a);
      if (it.kids.length) { const ol = document.createElement("ol"); it.kids.forEach(k => ol.appendChild(node(k))); li.appendChild(ol); } return li; };
    // parts in menu order: those of the Teoria (one per value of the 4th field), then Pratica, then Reference
    const parts = [];
    ["Teoria", "Pratica", "Reference"].forEach(g => CHAPTERS.forEach((c, i) => {
      if (groupOf(c) !== g) return;
      const label = g === "Teoria" ? c[3] || "Teoria" : g, last = parts[parts.length - 1];
      if (last && last.g === g && last.label === label) last.ix.push(i); else parts.push({ g, label, ix: [i] });
    }));
    const st = navStore.get(), sp = st.p || {};
    let html = `<div class="navtools"><button type="button" id="navall" class="navall" data-act="open">Apri tutto</button></div><div class="navparts" role="group" aria-label="Capitoli">`;
    parts.forEach((pt, n) => {
      const key = String(n), here0 = pt.ix.includes(idx), open = here0 || sp[key] === 1;   // a part with the current chapter is open whatever was kept
      const lis = pt.ix.map(i => {
        const c = CHAPTERS[i], on = i === idx, cur = on && tree.length;
        const link = `<a href="${SITE.up + c[0]}" class="${on ? "on" : ""}"${on ? ' aria-current="page"' : ""}><b>${esc(c[1])}</b><span>${esc(c[2])}</span></a>`;
        if (!cur) return `<li${on ? ' class="cur-ch"' : ""}>${link}</li>`;
        return `<li class="cur-ch"><div class="chrow">${link}<button type="button" class="ctog" aria-expanded="true" aria-controls="toc-cur" aria-label="Sezioni del capitolo">${CHEV}</button></div><ol class="toc" id="toc-cur"></ol></li>`;
      }).join("");
      html += `<section class="grp"><h4 id="h-part-${key}"><button type="button" class="ptog" data-k="${key}" aria-expanded="${open}" aria-controls="part-${key}">${CHEV}<span>${esc(pt.label)}</span></button></h4><ol id="part-${key}" aria-labelledby="h-part-${key}"${open ? "" : " hidden"}>${lis}</ol></section>`;
    });
    side.innerHTML = brandHtml() + html + "</div>";
    const toc = side.querySelector("ol.toc"); if (toc) tree.forEach(it => toc.appendChild(node(it)));
    wireToggles(side); syncAll(side);
    return items;
  }
  /** Scroll-spy: the last section whose heading is above 30% of the window is the current one (aria-current="location"). IntersectionObserver only wakes the check up. */
  function spy(side, items) {
    let cur = null;
    const update = () => {
      let pick = null;
      for (const it of items) { if (it.h.getBoundingClientRect().top <= innerHeight * 0.3) pick = it; else break; }
      const a = pick && pick.a; if (a === cur) return;
      if (cur) { cur.removeAttribute("aria-current"); cur.classList.remove("cur"); }
      cur = a; if (!a) return;
      a.setAttribute("aria-current", "location"); a.classList.add("cur");
      if (!a.offsetParent) return;   // inside a closed chapter: nothing to show
      const sr = side.getBoundingClientRect(), ar = a.getBoundingClientRect(), hd = side.querySelector(".brand"), pin = hd && getComputedStyle(hd).position === "sticky" ? hd.offsetHeight : 0;   // keep it in view inside the menu only (the page never moves)
      if (sr.height && (ar.top < sr.top + pin + 8 || ar.bottom > sr.bottom - 8)) side.scrollTop += ar.top - sr.top - sr.height / 3;
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(update, { rootMargin: "0px 0px -70% 0px" });
      items.forEach(it => io.observe(it.h));
    }
    addEventListener("scroll", () => { cancelAnimationFrame(spy.t); spy.t = requestAnimationFrame(update); }, { passive: true });
    addEventListener("load", update); addEventListener("hashchange", () => setTimeout(update, 60));
    update();
  }
  /** Breadcrumb (BasePeak > part > chapter) and the compact previous / next pair at the top of the page. */
  function crumbs(i) {
    const c = CHAPTERS[i], g = groupOf(c), p = CHAPTERS[i - 1], n = CHAPTERS[i + 1];
    const nav = document.createElement("div"); nav.className = "navtop";
    const pr = (x, rel, txt) => x ? `<a rel="${rel}" href="${SITE.up + x[0]}" aria-label="${txt === "prev" ? "Precedente" : "Successivo"}: ${esc(chTitle(x))}" title="${esc(chTitle(x))}">${rel === "prev" ? "&larr; Precedente" : "Successivo &rarr;"}</a>` : "";
    nav.innerHTML = `<nav class="crumbs" aria-label="Percorso"><ol><li><a href="${SITE.up}index.html">BasePeak</a></li><li><a href="${SITE.up + GROUP_HOME[g]}">${g}</a></li><li><span aria-current="page">${esc(chTitle(c))}</span></li></ol></nav>` +
      `<nav class="pnt" aria-label="Capitolo precedente e successivo">${pr(p, "prev", "prev")}${pr(n, "next", "next")}</nav>`;
    $("main").prepend(nav);
  }

  function layout() {
    // wide tables scroll horizontally on phones instead of widening the page
    document.querySelectorAll("main table").forEach(t => { const w = document.createElement("div"); w.className = "tw"; t.parentNode.insertBefore(w, t); w.appendChild(t); });
    const top = document.createElement("header"); top.id = "top";
    // embedded in another page (iframe): no second header there (only the index button on narrow screens)
    if (embedded) document.body.classList.add("emb");
    // standalone header: only the tools of the page (comandi.js fills the bar). The logo and the name of the site stand at the top of the side index (brand()).
    top.innerHTML = `<button id="menu" type="button" aria-label="Indice" aria-expanded="false" aria-controls="side">&#9776;</button>` + (embedded ? "" : `<span class="sp"></span>`);
    document.body.prepend(top); document.body.classList.add("hdr");   // the blank box that stood in for the header (teoria.css) is gone
    const side = $("#side"); side.setAttribute("aria-label", "Indice dei capitoli e della pagina");
    // «Salta al contenuto»: first thing reached with Tab, visible only on focus
    const mn = $("main"); mn.id = mn.id || "contenuto"; mn.tabIndex = -1;
    const sk = document.createElement("a"); sk.className = "skip"; sk.href = "#" + mn.id; sk.textContent = "Salta al contenuto";
    sk.onclick = e => { e.preventDefault(); mn.focus(); mn.scrollIntoView(); };
    document.body.prepend(sk);
    // headings: stable ids (existing ones are kept), anchors, then the index of the menu
    const heads = [...document.querySelectorAll("main h2, main h3, main h4")];
    ensureIds(heads); heads.forEach(addAnchor);
    const spyItems = buildSide(side);
    if (spyItems.length) spy(side, spyItems);
    crumbs(idx);
    $("#menu").onclick = () => $("#menu").setAttribute("aria-expanded", String(side.classList.toggle("open")));
    side.addEventListener("click", e => { if (e.target.closest("a")) { side.classList.remove("open"); $("#menu").setAttribute("aria-expanded", "false"); } });   // narrow screens: the index is a full-screen panel
    if (PHONE) phone(top);
    // prev / next
    const pn = document.createElement("div"); pn.className = "pn";
    const p = CHAPTERS[idx - 1], n = CHAPTERS[idx + 1];
    pn.innerHTML = (p ? `<a rel="prev" href="${SITE.up + p[0]}"><small>&larr; Precedente</small>${p[1]}. ${p[2]}</a>` : "<span></span>") +
                   (n ? `<a rel="next" href="${SITE.up + n[0]}" style="text-align:right"><small>Successivo &rarr;</small>${n[1]}. ${n[2]}</a>` : "<span></span>");
    $("main").appendChild(pn);
    // the index keeps its scroll from one chapter to the next (the active entry is brought into view if it would be hidden)
    const restoreSide = () => {
      try { const y = sessionStorage.getItem("qqq.teoria.side"); if (y !== null) side.scrollTop = +y || 0; } catch (_) { /* no storage: top */ }
      const cur = side.querySelector("li a.on"), sr = side.getBoundingClientRect();
      if (cur && sr.height) { const cr = cur.getBoundingClientRect(); if (cr.top < sr.top) side.scrollTop -= sr.top - cr.top; else if (cr.bottom > sr.bottom) side.scrollTop += cr.bottom - sr.bottom; }
    };
    restoreSide();
    // comandi.js adds the commands block on top of the index a moment later: scrollTop is clamped to the height at that time, so it is applied again once the block is there
    const sideWatch = new MutationObserver(() => { if (side.querySelector("#sidecmd")) { sideWatch.disconnect(); restoreSide(); } });
    sideWatch.observe(side, { childList: true }); setTimeout(() => sideWatch.disconnect(), 5000);
    addEventListener("pagehide", () => { try { sessionStorage.setItem("qqq.teoria.side", String(side.scrollTop)); } catch (_) { /* not kept */ } });
    // the neighbouring chapters are fetched ahead (small pages), unless the connection is saving data, slow or cellular (and never on a phone)
    const net = navigator.connection || {};
    if (!embedded && !PHONE && location.protocol !== "file:" && !net.saveData && net.type !== "cellular" && (!net.effectiveType || net.effectiveType === "4g") && window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
      const urls = [p, n].filter(Boolean).map(c => SITE.up + c[0]);
      if (urls.length) { const sr2 = document.createElement("script"); sr2.type = "speculationrules"; sr2.textContent = JSON.stringify({ prefetch: [{ source: "list", urls, eagerness: "immediate" }] }); document.head.appendChild(sr2); }
    }
    document.title = `${/^[0-9]+$/.test(CHAPTERS[idx][1]) && CHAPTERS[idx][1] !== "0" ? CHAPTERS[idx][1] + ". " : ""}${CHAPTERS[idx][2]} · ${/^pratica/.test(here) ? "Pratica" : "Teoria"} ${APP}`;
    fixLevels();
    // figures without a name take the caption that already stands just above them (no new text)
    document.querySelectorAll("main svg:not([aria-label]):not([aria-labelledby]):not([aria-hidden])").forEach((s, i) => {
      const c = s.previousElementSibling; if (!c || !c.textContent.trim() || c.tagName === "svg") return;
      c.id = c.id || "fig-cap-" + i; s.setAttribute("role", "img"); s.setAttribute("aria-labelledby", c.id);
    });
    renameApp();
    liveFeedback();
  }

  // the answers of the games (.fb) appear after a click: a screen reader announces them (polite) without moving the focus
  // a figure title (h4) right under an h2 would skip a level: its announced level is the one that keeps the order (also for cards added later by the games)
  function fixLevels() {
    let prev = 1; document.querySelectorAll("main h1,main h2,main h3,main h4").forEach(h => { let l = +h.tagName[1]; if (l > prev + 1) { l = prev + 1; h.setAttribute("aria-level", String(l)); } else h.removeAttribute("aria-level"); prev = l; });
  }
  function liveFeedback() {
    const mark = n => { if (n.nodeType === 1) [n, ...n.querySelectorAll(".fb,.readout")].forEach(e => { if (e.classList && (e.classList.contains("fb") || e.classList.contains("readout")) && !e.hasAttribute("aria-live")) e.setAttribute("aria-live", "polite"); }); };
    mark(document.body);
    let t = 0;
    new MutationObserver(ms => { ms.forEach(m => m.addedNodes.forEach(mark)); cancelAnimationFrame(t); t = requestAnimationFrame(() => { fixLevels(); const hs = [...document.querySelectorAll("main h2, main h3, main h4")].filter(h => !h.querySelector(":scope > .ha")); ensureIds(hs); hs.forEach(addAnchor); }); }).observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------- smartphone
  const PHONE_NOTE = `<b>Il sito non è ottimizzato per gli smartphone.</b> Dal telefono si legge tutta la Teoria; l'analisi dei dati, il disegno delle molecole e gli esercizi della Pratica si usano da un computer o da un tablet.`;
  function phone(top) {
    document.documentElement.classList.add("phone");
    if (!embedded) {
      // header: logo, Teoria, info; it goes away scrolling down and comes back scrolling up (more room for the text, above all in landscape)
      top.insertAdjacentHTML("beforeend", `<button id="info" type="button" aria-label="Informazioni" title="Informazioni">i</button>`);
      const note = document.createElement("div"); note.id = "phnote"; note.className = "box warn"; note.hidden = true;
      note.innerHTML = `<p>${PHONE_NOTE}</p><p><a href="${SITE.up}index.html">Indice della Teoria</a> · <a href="${SITE.up}capitoli/20-formulario.html">Formulario</a> · <a href="${SITE.up}pratica/orale.html">Domande di ripasso</a></p>`;
      $("main").prepend(note);
      $("#info").onclick = () => { note.hidden = !note.hidden; if (!note.hidden) scrollTo({ top: 0, behavior: "smooth" }); };
      let y0 = scrollY;
      addEventListener("scroll", () => { const y = scrollY; top.classList.toggle("away", y > y0 && y > 80 && !$("#side").classList.contains("open")); y0 = y; }, { passive: true });
    }
    if (NOEX) {
      document.body.classList.add("noex");
      $("h1").insertAdjacentHTML("afterend", `<div class="box warn phex"><b>Gli esercizi si fanno da computer o da tablet</b><p>Questo gioco ha bisogno di uno schermo più grande (grafici da cliccare, editor delle strutture). Dal telefono potete ripassare con la Teoria, il formulario e le domande di ripasso.</p><p><a href="${SITE.up}index.html">Indice della Teoria</a> · <a href="${SITE.up}capitoli/20-formulario.html">Formulario</a> · <a href="${SITE.up}pratica/orale.html">Domande di ripasso</a></p></div>`);
    } else if (here === "pratica/index.html") {
      $("h1").insertAdjacentHTML("afterend", `<div class="box warn phex"><b>Dal telefono</b><p>I giochi si fanno da computer o da tablet; dal telefono funzionano le <a href="${SITE.up}pratica/orale.html">domande di ripasso</a>.</p></div>`);
    }
  }

  // ---------------------------------------------------------------- controls
  /** Build sliders/selects. spec: [{id,label,min,max,step,value,fmt,unit,options:[[v,label]]}] -> returns getter object */
  function controls(el, spec, onchange) {
    const box = document.createElement("div"); box.className = "ctl"; el.appendChild(box);
    const val = {};
    spec.forEach(s => {
      const lab = document.createElement("label");
      if (s.options) {
        lab.innerHTML = `<span>${s.label}</span><select>${s.options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select>`;
        const sel = lab.querySelector("select"); sel.value = String(s.value);
        val[s.id] = s.num === false ? sel.value : +sel.value;
        sel.oninput = () => { val[s.id] = s.num === false ? sel.value : +sel.value; onchange(val, s.id); };
      } else if (s.text) {
        lab.innerHTML = `<span>${s.label}</span><input type="text" value="${s.value}" spellcheck="false">`;
        const inp = lab.querySelector("input"); val[s.id] = s.value;
        inp.oninput = () => { val[s.id] = inp.value; onchange(val, s.id); };
      } else {
        const f = s.fmt || (v => v);
        lab.innerHTML = `<span>${s.label}<output aria-live="polite"></output></span><input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.value}">`;
        const r = lab.querySelector("input"), o = lab.querySelector("output");
        const upd = () => { val[s.id] = +r.value; o.textContent = f(+r.value) + (s.unit ? " " + s.unit : ""); };
        upd(); r.oninput = () => { upd(); onchange(val, s.id); };
        val["_set_" + s.id] = v => { r.value = v; upd(); };
      }
      box.appendChild(lab);
    });
    return val;
  }

  function buttons(el, items, cur, onclick) {
    const b = document.createElement("div"); b.className = "btns"; b.setAttribute("role", "group"); el.appendChild(b);
    items.forEach(([k, lab]) => {
      const x = document.createElement("button"); x.textContent = lab; x.dataset.k = k;
      x.type = "button"; x.setAttribute("aria-pressed", String(k === cur));
      if (k === cur) x.classList.add("on");
      x.onclick = () => { b.querySelectorAll("button").forEach(y => { y.classList.toggle("on", y === x); y.setAttribute("aria-pressed", String(y === x)); }); onclick(k); };
      b.appendChild(x);
    });
    return b;
  }

  // ---------------------------------------------------------------- canvas plotting
  /** A canvas sized for the device pixel ratio. Returns {cv, ctx, W, H, resize()} */
  function canvas(el, h = 260) {
    const cv = document.createElement("canvas"); el.appendChild(cv);
    // the drawing is an image for a screen reader: it says WHAT it shows (the simulation and its axes), never the result
    const box = el.closest(".sim,.game,.gm,section,main"), hd = box && box.querySelector("h4,h3,h2");
    cv.setAttribute("role", "img"); cv.dataset.title = hd ? hd.textContent.trim() : "";
    cv.setAttribute("aria-label", "Grafico" + (cv.dataset.title ? ": " + cv.dataset.title : ""));
    const o = { cv, ctx: cv.getContext("2d"), W: 0, H: h, onresize: null };
    o.resize = () => {
      const w = Math.max(280, cv.clientWidth || el.clientWidth || 600), d = Math.min(4, (window.devicePixelRatio || 1) * ((window.visualViewport && visualViewport.scale) || 1));
      cv.style.height = h + "px"; cv.width = Math.round(w * d); cv.height = Math.round(h * d);
      o.ctx.setTransform(d, 0, 0, d, 0, 0); o.W = w; o.H = h;
    };
    o.resize();
    let t = null;
    const again = ms => { clearTimeout(t); t = setTimeout(() => { o.resize(); o.onresize && o.onresize(); }, ms); };
    window.addEventListener("resize", () => again(120));
    if (window.visualViewport) visualViewport.addEventListener("resize", () => again(150));
    return o;
  }

  function nice(lo, hi, n = 5) {
    const span = hi - lo || 1, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const st = [1, 2, 2.5, 5, 10].map(k => k * mag).find(k => span / k <= n) || 10 * mag;
    const out = []; for (let v = Math.ceil(lo / st) * st; v <= hi + st * 1e-9; v += st) out.push(+v.toFixed(10));
    return out;
  }

  /** Axes frame. opt: {x0,x1,y0,y1,xl,yl,m:{l,r,t,b},logy,grid,xfmt,yfmt}. Returns mapping functions. */
  function axes(c, opt) {
    const { ctx, W, H } = c, m = Object.assign({ l: 56, r: 14, t: 12, b: 38 }, opt.m || {});
    const X = v => m.l + (v - opt.x0) / (opt.x1 - opt.x0) * (W - m.l - m.r);
    const ly = v => opt.logy ? Math.log10(Math.max(v, 1e-12)) : v;
    const Y = v => H - m.b - (ly(v) - ly(opt.y0)) / (ly(opt.y1) - ly(opt.y0)) * (H - m.t - m.b);
    ctx.clearRect(0, 0, W, H);
    if (c.cv) { const t = c.cv.dataset.title; c.cv.setAttribute("aria-label", "Grafico" + (t ? ": " + t : "") + (opt.xl ? ". Asse orizzontale: " + opt.xl : "") + (opt.yl ? ". Asse verticale: " + opt.yl : "") + (opt.logy ? " (scala logaritmica)" : "")); }
    ctx.font = "12px system-ui,sans-serif"; ctx.lineWidth = 1;
    ctx.strokeStyle = "#e9e7e1"; ctx.fillStyle = "#6b675c";
    const xf = opt.xfmt || (v => +v.toFixed(6)), yf = opt.yfmt || (v => +v.toFixed(6));
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    (opt.xticks || nice(opt.x0, opt.x1, Math.max(3, Math.floor((W - m.l - m.r) / 80)))).forEach(v => {
      const x = X(v); if (x < m.l - 1 || x > W - m.r + 1) return;
      if (opt.grid !== false) { ctx.beginPath(); ctx.moveTo(x, m.t); ctx.lineTo(x, H - m.b); ctx.stroke(); }
      ctx.fillText(xf(v), x, H - m.b + 5);
    });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const yt = opt.logy ? (() => { const a = [], e0 = Math.ceil(Math.log10(opt.y0)), e1 = Math.floor(Math.log10(opt.y1)), st = Math.max(1, Math.ceil((e1 - e0) / 7)); for (let e = e0; e <= e1; e += st) a.push(Math.pow(10, e)); return a; })()
                        : (opt.yticks || nice(opt.y0, opt.y1, Math.max(3, Math.floor((H - m.t - m.b) / 45))));
    yt.forEach(v => {
      const y = Y(v); if (y < m.t - 1 || y > H - m.b + 1) return;
      if (opt.grid !== false) { ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(W - m.r, y); ctx.stroke(); }
      ctx.fillText(opt.logy ? "10" + sup(Math.log10(v)) : yf(v), m.l - 6, y);
    });
    ctx.strokeStyle = "#9b978c"; ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, H - m.b); ctx.lineTo(W - m.r, H - m.b); ctx.stroke();
    ctx.fillStyle = "#24231f"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    if (opt.xl) ctx.fillText(opt.xl, m.l + (W - m.l - m.r) / 2, H - 2);
    if (opt.yl) { ctx.save(); ctx.translate(13, m.t + (H - m.t - m.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = "middle"; ctx.fillText(opt.yl, 0, 0); ctx.restore(); }
    return { X, Y, m, W, H, ctx, clip() { ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, W - m.l - m.r, H - m.t - m.b); ctx.clip(); } };
  }
  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function sup(n) { return String(Math.round(n)).split("").map(ch => SUP[ch] || ch).join(""); }

  function line(ax, xs, ys, color, w = 2, dash) {
    const { ctx, X, Y } = ax; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); let pen = false;
    for (let i = 0; i < xs.length; i++) { const y = ys[i]; if (!isFinite(y)) { pen = false; continue; } const px = X(xs[i]), py = Y(y); pen ? ctx.lineTo(px, py) : ctx.moveTo(px, py); pen = true; }
    ctx.stroke(); ctx.restore();
  }
  function sticks(ax, xs, ys, color, w = 2) {
    const { ctx, X, Y } = ax; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath();
    xs.forEach((x, i) => { ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(ys[i])); }); ctx.stroke(); ctx.restore();
  }
  function label(ax, x, y, txt, color = "#24231f", align = "center", base = "bottom", dy = -3) {
    const { ctx, X, Y } = ax; ctx.save(); ctx.fillStyle = color; ctx.font = "12px system-ui,sans-serif"; ctx.textAlign = align; ctx.textBaseline = base;
    ctx.fillText(txt, X(x), Y(y) + dy); ctx.restore();
  }
  function legend(ax, items, x0) {
    const { ctx, m, W } = ax; ctx.save(); ctx.font = "12px system-ui,sans-serif"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    let x = x0 ?? (m.l + 10), y = m.t + 10;
    items.forEach(([txt, col, dash]) => {
      const w = ctx.measureText(txt).width + 34;
      if (x + w > W - m.r) { x = x0 ?? (m.l + 10); y += 17; }
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#24231f"; ctx.fillText(txt, x + 25, y); x += w;
    });
    ctx.restore();
  }
  /** Dash patterns for the 2nd, 3rd... series of a chart: the series differ by more than the colour (WCAG 1.4.1) */
  const DASH = [null, [7, 4], [2, 3], [8, 3, 2, 3]];
  const fmt = (v, d = 2) => (+v).toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });
  const sci = (v, d = 2) => { if (v === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(v))); const mnt = v / Math.pow(10, e); return fmt(mnt, d) + "·10" + sup(e); };


  // ---------------------------------------------------------------- glossary hints
  // Every glossary term (glossario-dati.js, generated from 19-glossario.html by tools/genera_glossario.py) found in the text gets a dotted
  // underline; the mouse over it (or focus / tap) shows the short definition and a link to its chapter.
  function glossary() {
    if (here === "capitoli/19-glossario.html") return;
    const s = document.createElement("script"); s.src = SITE.assets + "glossario-dati.js"; s.onload = () => { try { markTerms(GLOSSARIO); } catch (_) { /* hints are optional */ } };
    document.head.appendChild(s);
  }

  function markTerms(G) {
    const cs = new Map(), ci = new Map();
    G.forEach((e, i) => e.k.forEach(k => {
      const strict = k.length <= 3 || (k.match(/[A-ZÀ-Ý]/g) || []).length >= 2;
      (strict ? cs : ci).set(strict ? k : k.toLowerCase(), i);
    }));
    const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const all = [...cs.keys(), ...ci.keys()].sort((a, b) => b.length - a.length);
    const re = new RegExp("(?<![\\p{L}\\p{N}_])(" + all.map(esc).join("|") + ")(?![\\p{L}\\p{N}_])", "giu");
    const skip = "a,button,select,input,textarea,script,style,canvas,svg,code,kbd,h1,h2,h3,h4,h5,.kicker,.ctl,.pn,#side,#top,.tag,.g,sub,sup";
    const nodes = [], tw = document.createTreeWalker($("main"), NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) if (n.nodeValue.trim() && !n.parentElement.closest(skip)) nodes.push(n);
    nodes.forEach(n => {
      const txt = n.nodeValue; let last = 0, hit = false; const frag = document.createDocumentFragment();
      for (const m of txt.matchAll(re)) {
        const i = cs.has(m[1]) ? cs.get(m[1]) : ci.get(m[1].toLowerCase());
        if (i === undefined) continue;
        frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const sp = document.createElement("span"); sp.className = "g"; sp.tabIndex = 0; sp.dataset.g = i; sp.textContent = m[1];
        frag.appendChild(sp); last = m.index + m[1].length; hit = true;
      }
      if (hit) { frag.appendChild(document.createTextNode(txt.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
    const tip = document.createElement("div"); tip.id = "gtip"; tip.setAttribute("role", "tooltip"); tip.hidden = true; document.body.appendChild(tip);
    let timer = 0, cur = null;
    const hide = () => { tip.hidden = true; cur = null; };
    const show = el => {
      clearTimeout(timer); if (cur === el) return; cur = el;
      const e = G[+el.dataset.g];
      tip.innerHTML = `<b>${e.t}</b><p>${e.d}</p>` + (e.h ? `<a href="${SITE.up + e.h}">${e.n} &rarr;</a>` : "");
      tip.hidden = false;
      const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      const x = Math.max(8, Math.min(r.left, innerWidth - w - 8)), below = r.bottom + 6 + h < innerHeight || r.top - 6 - h < 0;
      tip.style.left = x + "px"; tip.style.top = (below ? r.bottom + 6 : r.top - 6 - h) + "px";
    };
    const later = () => { clearTimeout(timer); timer = setTimeout(hide, 220); };
    document.addEventListener("mouseover", ev => { const el = ev.target.closest(".g"); if (el) show(el); else if (ev.target.closest("#gtip")) clearTimeout(timer); });
    document.addEventListener("mouseout", ev => { if (ev.target.closest(".g, #gtip")) later(); });
    document.addEventListener("focusin", ev => { const el = ev.target.closest(".g"); if (el) show(el); });
    document.addEventListener("focusout", ev => { if (ev.target.closest(".g")) later(); });
    document.addEventListener("click", ev => { const el = ev.target.closest(".g"); if (el) { cur === el && !tip.hidden ? hide() : show(el); } else if (!ev.target.closest("#gtip")) hide(); });
    document.addEventListener("keydown", ev => { if (ev.key === "Escape") hide(); });
    addEventListener("scroll", hide, { passive: true });
  }

  // The page scripts are added in this order (async=false keeps it): the bar of commands first, then the settings button that goes into it
  function load(src) { const s = document.createElement("script"); s.src = SITE.assets + src; s.async = false; document.head.appendChild(s); }
  // comandi.js: TCMD, the commands of the header; impostazioni.js: «Lettura facilitata» (tema.js has already put the choices on <html>);
  // lettura.js: menu sheet, reading position, figure viewer; cerca.js: search dialog (Ctrl/⌘K, TEORIA.cerca(), index read on first use);
  // sblocco.js: 5 clicks on the logo unlock the extended Teoria; strumenti/pannello.js: TEORIA.strumenti.* (each tool is read when opened)
  // editor.js: in-page chapter editor (Alt+E or Modifica button) with auto-save, syntax checks, git commit and push
  // esporta.js: export modal (PDF, Word, Markdown, HTML) for single chapters and complete course
  // the panel styles (settings button and sheet): a <link>, because an @import in teoria.css would be resolved against the page by some tools (axe)
  const cssPanel = document.createElement("link"); cssPanel.rel = "stylesheet"; cssPanel.href = SITE.assets + "impostazioni-comp.css"; document.head.appendChild(cssPanel);
  document.addEventListener("DOMContentLoaded", () => { layout(); glossary(); ["comandi.js", "impostazioni-comp.js", "impostazioni.js", "lettura.js", "cerca.js", "sblocco.js", "strumenti/pannello.js", "editor.js", "esporta.js"].forEach(load); });
  return { reduced: () => document.documentElement.hasAttribute("data-a11y-reduce"), $, controls, buttons, canvas, axes, line, sticks, label, legend, nice, DASH, fmt, sci, sup };
})();
