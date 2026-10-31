"use strict";
/* Family tree of the mass analyzers (classic script, works from file://).
   Needs STORIA.famiglie / STORIA.archi (storia-dati.js) and STORIA_UI (storia.js); without them the static image and list stay.
   Host: <div data-storia="albero"> with a child <figure> (static <img>) and a child .storia-statico (nested list, the fallback).
   Wide screens: buttons placed on a year axis over an SVG of edges. Phones (< 600 px): the same data as a nested list of buttons.
   Selecting a node highlights its ancestors and descendants (bold border + solid edges, the rest dashed and faded) and writes
   "Viene da / Porta a" in a live region. Arrows: Left = parent, Right = first child, Up/Down = siblings. */
(() => {
  if (typeof STORIA === "undefined" || typeof STORIA_UI === "undefined") return;
  const E = (tag, attrs, parent, text) => {
    const e = document.createElement(tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const NUM = { origini: 34, "aston-dempster": 35, settori: 36, tof: 37, rf: 38, ft: 39, sorgenti: 40, accoppiamenti: 41, "rivelatori-dati": 42 };
  const SHORT = { origini: "Le origini", "aston-dempster": "Aston e Dempster", settori: "Settori magnetici", tof: "Il tempo di volo", rf: "Campi a radiofrequenza", ft: "ICR, FT-ICR, Orbitrap", sorgenti: "Le sorgenti", accoppiamenti: "Accoppiamenti e ibridi", "rivelatori-dati": "Rivelatori e dati" };
  const ROW = { parabola: 0, spettrografo: 1, settore180: 2, mattauch: 3, settore60: 4, nierjohnson: 5, ciclotrone: 6, omegatron: 6, fticr: 6,
    kingdon: 7, orbitrap: 7, tof: 8, reflectron: 8, quadrupolo: 9, trappola: 10, trappolams: 10, qqq: 11, qtof: 11, qorbitrap: 11 };
  const CSS = ".storia-albero{position:relative}.storia-albero .sa-area{position:relative;width:100%;aspect-ratio:720/480}.storia-albero svg{position:absolute;inset:0;width:100%;height:100%}" +
    ".storia-albero .sa-n{position:absolute;transform:translate(-50%,-50%);font:inherit;font-size:12px;line-height:1.15;max-width:14%;text-align:center;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:5px;padding:2px 4px;cursor:pointer}" +
    ".storia-albero .sa-n[aria-pressed=true]{border:3px solid var(--accent);font-weight:700}.storia-albero .sa-n.sa-rel{border:2px solid var(--accent)}.storia-albero .sa-n:focus-visible,.storia-albero .sa-l button:focus-visible{outline:3px solid var(--accent);outline-offset:2px}" +
    ".storia-albero .sa-dim{opacity:.5}.storia-albero ul{list-style:none;padding-left:16px}.storia-albero .sa-l button{font:inherit;font-size:15px;background:none;border:0;border-bottom:1px dotted var(--ink);color:var(--ink);cursor:pointer;padding:2px 0;text-align:left}" +
    ".storia-albero .sa-l button[aria-pressed=true]{font-weight:700;border-bottom:3px solid var(--accent)}.storia-albero .sa-l button[aria-pressed=true]::after{content:\" ◀\"}.storia-albero .sa-info{font-size:15px;margin:6px 0}";
  if (!document.getElementById("storia-albero-css")) E("style", { id: "storia-albero-css" }, document.head, CSS);

  const init = host => {
    const N = {}, up = {}, down = {};
    STORIA.famiglie.forEach(f => { N[f.id] = f; up[f.id] = []; down[f.id] = []; });
    STORIA.archi.forEach(([a, b, why]) => { up[b].push([a, why]); down[a].push([b, why]); });
    const nome = i => N[i].nome + (N[i].anno ? " (" + N[i].anno + ")" : "");
    const xa = f => (f.anno || (N.quadrupolo.anno + 7));
    const root = E("div", { class: "storia-albero" }, null), area = E("div", { class: "sa-area" }, root);
    const svg = STORIA_UI.svg("svg", { viewBox: "0 0 720 480", "aria-hidden": "true", focusable: "false" }, area);
    const X = y => 60 + (y - 1905) / (2015 - 1905) * 600, Y = r => 24 + r * 36, edges = {}, btn = {}, lst = {};
    // axis ticks
    for (let y = 1920; y <= 2000; y += 20) {
      STORIA_UI.svg("path", { d: `M${X(y)} 0V480`, stroke: "currentColor", "stroke-opacity": .15 }, svg);
      STORIA_UI.svg("text", { x: X(y), y: 474, "text-anchor": "middle", "font-size": 11, fill: "currentColor", "fill-opacity": .6 }, svg).textContent = y;
    }
    STORIA.archi.forEach(([a, b]) => {
      edges[a + ">" + b] = STORIA_UI.svg("path", { d: `M${X(xa(N[a]))} ${Y(ROW[a])}L${X(xa(N[b]))} ${Y(ROW[b])}`, stroke: "currentColor", "stroke-width": 1.4, fill: "none" }, svg);
    });
    const bar = E("div", { class: "storia-comandi" }, root);
    const reset = E("button", { type: "button" }, bar, "Mostra tutto");
    const info = E("p", { class: "sa-info", "aria-live": "polite" }, root, "Seleziona un nodo per vedere da dove viene e dove porta.");
    const go = E("p", { class: "sa-info" }, root);
    const set = (start, nb) => { const s = new Set(), st = [start]; while (st.length) { const i = st.pop(); (nb[i] || []).forEach(([j]) => { if (!s.has(j)) { s.add(j); st.push(j); } }); } return s; };
    let sel = null;
    const show = id => {
      sel = id;
      const anc = id ? set(id, up) : new Set(), des = id ? set(id, down) : new Set();
      const rel = i => !id || i === id || anc.has(i) || des.has(i);
      Object.keys(N).forEach(i => {
        [btn[i], lst[i]].forEach(b => { b.setAttribute("aria-pressed", i === id); b.classList.toggle("sa-rel", !!id && i !== id && rel(i)); });
        btn[i].classList.toggle("sa-dim", !rel(i));
      });
      STORIA.archi.forEach(([a, b]) => {
        const r = !id || ((a === id || anc.has(a)) && (b === id || anc.has(b))) || ((a === id || des.has(a)) && des.has(b));
        edges[a + ">" + b].setAttribute("stroke-dasharray", r ? "" : "4 4");
        edges[a + ">" + b].setAttribute("stroke-width", id && r ? 3 : 1.4);
        edges[a + ">" + b].setAttribute("opacity", r ? 1 : .35);
      });
      go.textContent = "";
      if (!id) return STORIA_UI.live(info, "Seleziona un nodo per vedere da dove viene e dove porta.");
      const v = up[id].map(([a, w]) => nome(a) + " (" + w + ")").join("; ") || "nessun predecessore nell'albero";
      const p = down[id].map(([b]) => nome(b)).join("; ") || "nessun discendente nell'albero";
      STORIA_UI.live(info, `${nome(id)}. Viene da: ${v}. Porta a: ${p}.`);
      const s = N[id].capitolo.replace("storia-", "");
      E("a", { href: NUM[s] + "-" + N[id].capitolo + ".html" }, go, "Leggi il capitolo: " + SHORT[s]);
    };
    const key = (e, id) => {
      const k = e.key, f = up[id][0] ? up[id][0][0] : null;
      const sib = f ? down[f].map(x => x[0]) : STORIA.famiglie.filter(x => !up[x.id].length).map(x => x.id), at = sib.indexOf(id);
      const to = k === "ArrowLeft" ? f : k === "ArrowRight" ? (down[id][0] || [])[0] : k === "ArrowUp" ? sib[at - 1] : k === "ArrowDown" ? sib[at + 1] : null;
      if (to) { e.preventDefault(); show(to); (btn[to].offsetParent ? btn[to] : lst[to]).focus(); }
    };
    STORIA.famiglie.forEach(f => {
      const b = E("button", { type: "button", class: "sa-n", "aria-pressed": "false", style: `left:${X(xa(f)) / 7.2}%;top:${Y(ROW[f.id]) / 4.8}%` }, area, f.nome + (f.anno ? " " + f.anno : ""));
      b.addEventListener("click", () => show(sel === f.id ? null : f.id));
      b.addEventListener("keydown", e => key(e, f.id));
      btn[f.id] = b;
    });
    const tree = E("div", { class: "sa-l" }, root), seen = new Set();
    const li = (id, ul) => {
      const l = E("li", {}, ul), b = E("button", { type: "button", "aria-pressed": "false" }, l, nome(id));
      b.addEventListener("click", () => show(sel === id ? null : id));
      b.addEventListener("keydown", e => key(e, id));
      if (!lst[id]) lst[id] = b;
      if (up[id].length > 1) l.append(" (unione di " + up[id].map(x => N[x[0]].nome).join(" e ") + ")");
      if (seen.has(id)) return;
      seen.add(id);
      if (down[id].length) { const u = E("ul", {}, l); down[id].forEach(([c]) => li(c, u)); }
    };
    const top = E("ul", {}, tree);
    STORIA.famiglie.filter(f => !up[f.id].length).forEach(f => li(f.id, top));
    const mq = window.matchMedia ? matchMedia("(max-width: 599px)") : { matches: false };
    const layout = () => { area.hidden = mq.matches; tree.hidden = !mq.matches; };
    if (mq.addEventListener) mq.addEventListener("change", layout);
    layout();
    reset.addEventListener("click", () => show(null));
    const fig = host.querySelector("figure"), img = host.querySelector("img"), st = host.querySelector(".storia-statico");
    if (img) img.style.display = "none";
    if (st) st.style.display = "none";
    if (fig) host.insertBefore(root, fig); else host.appendChild(root);
    show(null);
  };
  document.querySelectorAll('[data-storia="albero"]').forEach(init);
})();
