"use strict";
/* Interactive timeline of the history of mass spectrometry (classic script, works from file://).
   Needs STORIA (storia-dati.js) and STORIA_UI (storia.js); without them the static <ol> in the page stays.
   Host: <div data-storia="linea" [data-filtro="sorgente"]> with a child .storia-statico (the static fallback, hidden when this runs).
   data-filtro (compact mode): one family group preselected (analizzatori|sorgente|accoppiamento|rivelatore|applicazione, or a family id)
   and no decade slider. Several hosts per page are fine. */
(() => {
  if (typeof STORIA === "undefined" || typeof STORIA_UI === "undefined") return;
  const E = (tag, attrs, parent, text) => {
    const e = document.createElement(tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const GR = [
    { id: "analizzatori", nome: "Analizzatori", fam: ["origini", "settore", "tof", "rf", "ft"], forma: "cerchio" },
    { id: "sorgente", nome: "Sorgenti", fam: ["sorgente"], forma: "quadrato" },
    { id: "accoppiamento", nome: "Accoppiamenti", fam: ["accoppiamento"], forma: "triangolo" },
    { id: "rivelatore", nome: "Rivelatori e dati", fam: ["rivelatore", "dati"], forma: "rombo" },
    { id: "applicazione", nome: "Applicazioni", fam: ["applicazione"], forma: "croce" }
  ];
  const SHAPE = { cerchio: "●", quadrato: "■", triangolo: "▲", rombo: "◆", croce: "✚" };
  const NUM = { origini: 34, "aston-dempster": 35, settori: 36, tof: 37, rf: 38, ft: 39, sorgenti: 40, accoppiamenti: 41, "rivelatori-dati": 42 };
  const SHORT = { origini: "Le origini", "aston-dempster": "Aston e Dempster", settori: "Settori magnetici", tof: "Il tempo di volo", rf: "Campi a radiofrequenza", ft: "ICR, FT-ICR, Orbitrap", sorgenti: "Le sorgenti", accoppiamenti: "Accoppiamenti e ibridi", "rivelatori-dati": "Rivelatori e dati" };
  const grOf = t => GR.find(g => g.fam.includes(t.famiglia));
  const href = t => {
    const s = t.capitolo.replace("storia-", "");
    return s === "mappa" ? "#i-premi-nobel" : NUM[s] + "-" + t.capitolo + ".html";
  };
  const CSS = ".storia-linea .sl-card{list-style:none;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:6px;padding:8px 12px;margin:8px 0;background:var(--bg,transparent)}" +
    ".storia-linea ol{padding:0;margin:8px 0}.storia-linea .sl-anno{font-size:22px;font-weight:700;margin-right:8px}.storia-linea .sl-card:focus-visible{outline:3px solid var(--accent);outline-offset:2px}" +
    ".storia-linea .sl-nobel{border:2px solid var(--ink);border-radius:4px;padding:0 6px;margin-left:8px;font-size:13px;font-weight:700}" +
    ".storia-linea .sl-forma{margin-right:6px}.storia-linea .sl-ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}.storia-linea .sl-ctl label{font-size:14px}" +
    ".storia-linea select,.storia-linea input[type=range]{font:inherit;font-size:14px}.storia-linea .sl-sum{font-size:15px;margin:6px 0}.storia-linea svg{width:100%;height:auto;display:block}" +
    ".storia-linea .sl-link a{color:var(--accent);text-decoration:underline}";
  if (!document.getElementById("storia-linea-css")) E("style", { id: "storia-linea-css" }, document.head, CSS);

  const init = host => {
    const stat = host.querySelector(".storia-statico");
    if (stat) stat.style.display = "none";
    const filtro = host.getAttribute("data-filtro") || "";
    const compact = !!filtro;
    const T = STORIA.tappe, anni = T.map(t => t.anno), min = Math.min(...anni), max = Math.max(...anni);
    const on = new Set(), root = E("div", { class: "storia-linea" }, host);
    if (filtro) GR.forEach(g => { if (g.id === filtro || g.fam.includes(filtro)) on.add(g.id); });
    let fine = Math.floor(max / 10) * 10, solo = false, persona = "", cur = 0, vis = [];
    const chips = E("div", { class: "storia-comandi", role: "group", "aria-label": "Filtra per famiglia" }, root);
    const bt = {};
    GR.forEach(g => {
      const b = E("button", { type: "button", class: "storia-chip", "aria-pressed": on.has(g.id) ? "true" : "false" }, chips, SHAPE[g.forma] + " " + g.nome);
      b.addEventListener("click", () => { on.has(g.id) ? on.delete(g.id) : on.add(g.id); b.setAttribute("aria-pressed", on.has(g.id)); draw(); });
      bt[g.id] = b;
    });
    const ctl = E("div", { class: "sl-ctl" }, root);
    const lp = E("label", {}, ctl, "Persona ");
    const sel = E("select", {}, lp);
    E("option", { value: "" }, sel, "Tutte");
    [...new Set(T.flatMap(t => t.persone))].sort().forEach(p => E("option", { value: p }, sel, p));
    sel.addEventListener("change", () => { persona = sel.value; draw(); });
    const ln = E("label", {}, ctl);
    const cb = E("input", { type: "checkbox" }, ln);
    ln.append(" Solo premi Nobel");
    cb.addEventListener("change", () => { solo = cb.checked; draw(); });
    const sld = E("input", { type: "range", min: Math.floor(min / 10) * 10, max: fine, step: 10, value: fine, "aria-label": "Mostra le tappe fino al decennio" }, null);
    const ls = E("label", {}, null, "Fino al decennio ");
    const sv = E("span", {}, ls);
    ls.append(sld);
    if (!compact) ctl.appendChild(ls);
    sld.addEventListener("input", () => { fine = +sld.value; draw(); });
    const scale = E("div", {}, root);
    const sum = E("p", { class: "sl-sum", "aria-live": "polite" }, root);
    const list = E("ol", { "aria-label": "Tappe" }, root);
    const mq = window.matchMedia ? matchMedia("(max-width: 599px)") : { matches: false };

    const drawScale = () => {
      scale.textContent = "";
      scale.hidden = mq.matches;
      if (mq.matches) return;
      const a = Math.floor(min / 10) * 10, b = Math.ceil((max + 1) / 10) * 10, W = 720, X = y => 20 + (y - a) / (b - a) * (W - 40);
      const s = STORIA_UI.svg("svg", { viewBox: "0 0 720 70", role: "img", "aria-label": "Scala dei decenni con un segno per ogni tappa mostrata; l'elenco sotto ha lo stesso contenuto" }, scale);
      STORIA_UI.svg("path", { d: "M20 40H700", stroke: "currentColor", "stroke-width": 1.5 }, s);
      for (let y = a; y <= b; y += 10) {
        STORIA_UI.svg("path", { d: `M${X(y)} 36V44`, stroke: "currentColor" }, s);
        if ((y - a) % 20 === 0) STORIA_UI.svg("text", { x: X(y), y: 62, "text-anchor": "middle", "font-size": 12, fill: "currentColor" }, s).textContent = y;
      }
      const used = {};
      vis.forEach(t => {
        const x = X(t.anno), k = Math.round(t.anno), n = used[k] = (used[k] || 0) + 1, y = 36 - (n - 1) * 11, g = grOf(t).forma;
        const m = STORIA_UI.svg("g", { fill: "currentColor", stroke: "currentColor" }, s);
        if (g === "cerchio") STORIA_UI.svg("circle", { cx: x, cy: y, r: 4 }, m);
        else if (g === "quadrato") STORIA_UI.svg("rect", { x: x - 4, y: y - 4, width: 8, height: 8 }, m);
        else if (g === "triangolo") STORIA_UI.svg("path", { d: `M${x} ${y - 5}L${x + 5} ${y + 4}H${x - 5}z` }, m);
        else if (g === "rombo") STORIA_UI.svg("path", { d: `M${x} ${y - 5}L${x + 5} ${y}L${x} ${y + 5}L${x - 5} ${y}z` }, m);
        else STORIA_UI.svg("path", { d: `M${x - 4} ${y}H${x + 4}M${x} ${y - 4}V${y + 4}`, "stroke-width": 2.5 }, m);
      });
    };
    function draw() {
      vis = T.filter(t => (!on.size || on.has(grOf(t).id)) && (!solo || t.nobel) && (!persona || t.persone.includes(persona)) && t.anno < fine + 10);
      sv.textContent = fine + "s ";
      list.textContent = "";
      vis.forEach((t, i) => {
        const li = E("li", { class: "sl-card", tabindex: i === 0 ? "0" : "-1" }, list);
        const h = E("div", {}, li);
        E("span", { class: "sl-anno" }, h, t.anno);
        E("span", { class: "sl-forma", "aria-hidden": "true" }, h, SHAPE[grOf(t).forma]);
        E("b", {}, h, t.titolo);
        if (t.nobel) E("span", { class: "sl-nobel" }, h, "Nobel");
        E("div", {}, li, t.persone.join(", "));
        E("div", {}, li, t.perche + ".");
        const p = E("div", { class: "sl-link" }, li), a = E("a", { href: href(t) }, p, t.capitolo === "storia-mappa" ? "Tabella dei premi Nobel" : "Leggi il capitolo: " + SHORT[t.capitolo.replace("storia-", "")]);
        li.addEventListener("keydown", e => {
          const k = e.key, n = vis.length, d = k === "ArrowDown" || k === "ArrowRight" ? 1 : k === "ArrowUp" || k === "ArrowLeft" ? -1 : 0;
          if (d || k === "Home" || k === "End") {
            e.preventDefault();
            cur = k === "Home" ? 0 : k === "End" ? n - 1 : Math.min(n - 1, Math.max(0, i + d));
            [...list.children].forEach((c, j) => c.setAttribute("tabindex", j === cur ? "0" : "-1"));
            list.children[cur].focus();
          } else if (k === "Enter" && e.target === li) a.click();
        });
      });
      const nome = [...on].map(id => GR.find(g => g.id === id).nome);
      if (solo) nome.push("solo Nobel");
      if (persona) nome.push(persona);
      STORIA_UI.live(sum, vis.length ? `${vis.length} tappe dal ${vis[0].anno} al ${vis[vis.length - 1].anno}, filtro: ${nome.join(", ") || "nessuno"}` : "Nessuna tappa con questi filtri");
      drawScale();
    }
    if (mq.addEventListener) mq.addEventListener("change", drawScale);
    draw();
  };
  document.querySelectorAll('[data-storia="linea"]').forEach(init);
})();
