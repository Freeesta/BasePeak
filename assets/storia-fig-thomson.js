"use strict";
/* sf-parabola: Thomson parabolas. Classic script, loaded by STORIA_UI.lazy from the chapter "Le origini".
   Deflections of an ion (charge q, mass m, kinetic energy E, speed v = sqrt(2E/m)) in parallel E and B fields, small-angle approximation:
   along B  b = kB*q/(m*v)   along E  e = kE*q/(m*v^2)   so  e = c*m*b^2  (c = kE/(kB^2*q)), a parabola for each m/z.
   Horizontal axis = deflection by B, vertical axis = deflection by E (same convention as parabola-thomson.svg).
   Ions with the same m/z but different speeds fall on the same parabola; energies are fixed pseudo-random numbers. */
(() => {
  const host = document.getElementById("sf-parabola");
  if (!host || host.dataset.live) return;
  host.dataset.live = "1";
  const S = STORIA_UI.svg, NS = "http://www.w3.org/2000/svg";
  const W = 560, H = 390, OY = 340, OX = 70, BMAX = 430, EMAX = 245;
  const SPECIES = {
    H: { m: 1, name: "H⁺", cls: "sa", dash: "2 5", shape: "tri" },
    N20: { m: 20, name: "Ne⁺ 20", cls: "sa", dash: "", shape: "dot" },
    N22: { m: 22, name: "Ne⁺ 22", cls: "sb", dash: "7 4", shape: "sq" },
  };
  const MODES = { H: ["H"], N: ["N20", "N22"], T: ["H", "N20", "N22"] };
  const LABEL = { H: "H⁺", N: "Ne⁺ (20 e 22)", T: "entrambi" };
  const E0 = 0.5, E1 = 1.5;
  let mode = "N", n = 80, step = 0, tt = 0, player;
  // 200 fixed ions: energy fraction u in [0,1); ion i belongs to species i mod (number of species)
  const ions = [];
  let seed = 12345;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let i = 0; i < 200; i++) ions.push({ u: rnd() });

  const fig = host.querySelector("figure"), img = fig && fig.querySelector("img");
  const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Piano della lastra: ogni specie di ione disegna una parabola, con deflessione per B in orizzontale e per E in verticale" });
  svg.style.cssText = "display:block;max-width:100%;height:auto;color:var(--ink);font:13px system-ui,sans-serif";
  const style = S("style", {}, svg);
  style.textContent = ".sa{fill:var(--accent);stroke:var(--accent)}.sb{fill:var(--accent2);stroke:var(--accent2)}.tx{fill:currentColor;font:22px system-ui,sans-serif}.ln{fill:none;stroke:currentColor;stroke-width:1.5}.pb{fill:none;stroke-width:2}";
  S("rect", { x: OX - 20, y: 14, width: W - OX - 4, height: OY - 4, fill: "none", stroke: "currentColor", "stroke-opacity": ".35", rx: 4 }, svg);
  S("path", { class: "ln", d: `M${OX} ${OY}H${OX + BMAX + 10}`, "marker-end": "url(#pt)" }, svg);
  S("path", { class: "ln", d: `M${OX} ${OY}V${OY - EMAX - 10}` }, svg);
  const defs = S("defs", {}, svg), mk = S("marker", { id: "pt", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs);
  S("path", { d: "M0 0L10 5L0 10z", fill: "currentColor" }, mk);
  S("path", { class: "ln", d: `M${OX} ${OY - EMAX - 10}l-4 8h8z`, fill: "currentColor" }, svg);
  const t1 = S("text", { class: "tx", x: OX + BMAX, y: OY + 36, "text-anchor": "end" }, svg); t1.textContent = "deviazione per B";
  const t2 = S("text", { class: "tx", x: OX + 12, y: 40 }, svg); t2.textContent = "deviazione per E";
  const t3 = S("text", { class: "tx", x: OX - 8, y: OY + 24, "text-anchor": "end" }, svg); t3.textContent = "0";
  const curves = S("g", {}, svg), pts = S("g", {}, svg), labs = S("g", {}, svg);

  const shape = (sp, x, y) => {
    const a = { class: sp.cls, "fill-opacity": ".55", "stroke-width": 1.4 };
    if (sp.shape === "dot") return S("circle", { ...a, cx: x, cy: y, r: 5 }, pts);
    if (sp.shape === "sq") return S("rect", { ...a, x: x - 4.6, y: y - 4.6, width: 9.2, height: 9.2 }, pts);
    return S("path", { ...a, d: `M${x} ${y - 6}l5.5 10.4h-11z` }, pts);
  };
  // geometry of the current mode: b = BMAX*sqrt(mmin*E0/(m*E)) (v = sqrt(2E/m)), e = c*m*b^2 with c fixed by the lowest energy
  const geo = () => {
    const mmin = Math.min(...MODES[mode].map(k => SPECIES[k].m));
    return { bOf: (m, E) => BMAX * Math.sqrt((mmin * E0) / (m * E)), c: EMAX / (BMAX * BMAX * mmin) };
  };
  const fmt = x => String(Math.round(x * 10) / 10).replace(".", ",");
  const draw = (s, t) => {
    step = s; tt = t;
    const g = geo(), keys = MODES[mode];
    while (pts.firstChild) pts.removeChild(pts.firstChild);
    while (curves.firstChild) curves.removeChild(curves.firstChild);
    while (labs.firstChild) labs.removeChild(labs.firstChild);
    const fb = s === 0 ? 0 : s === 1 ? 0 : s === 2 ? t : 1, fe = s === 0 ? 0 : s === 1 ? t : 1;
    const per = {};
    keys.forEach(k => { per[k] = 0; });
    for (let i = 0; i < n; i++) {
      const k = keys[i % keys.length], sp = SPECIES[k];
      const E = E0 + (E1 - E0) * ions[i].u, b = g.bOf(sp.m, E), e = g.c * sp.m * b * b;
      shape(sp, OX + fb * b, OY - fe * e);
      per[k]++;
    }
    if (s >= 3) {
      keys.forEach((k, j) => {
        const sp = SPECIES[k], bm = g.bOf(sp.m, E0), N = 60, d = [];
        for (let j = 0; j <= N; j++) { const b = bm * j / N; d.push((j ? "L" : "M") + (OX + b).toFixed(1) + " " + (OY - g.c * sp.m * b * b).toFixed(1)); }
        S("path", { class: "pb " + sp.cls, d: d.join(""), "stroke-dasharray": sp.dash, fill: "none", "stroke-opacity": s === 3 ? t : 1 }, curves);
        const tx = S("text", { class: "tx", x: OX + bm + 10, y: OY - g.c * sp.m * bm * bm + 6 + (k === "N22" ? 26 : 0) }, labs);
        tx.textContent = sp.name;
        tx.setAttribute("fill-opacity", s === 3 ? t : 1);
      });
    }
    info.textContent = keys.map(k => `${SPECIES[k].name}: ${per[k]} ioni`).join(" · ");
  };

  // controls
  const ctl = document.createElement("div");
  ctl.className = "ctl";
  ctl.style.cssText = "display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;margin:8px 0";
  const fs = document.createElement("fieldset");
  fs.style.cssText = "border:0;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 14px";
  const lg = document.createElement("legend");
  lg.textContent = "Ioni";
  lg.style.cssText = "float:left;margin-right:10px;padding:0;font-weight:700";
  fs.appendChild(lg);
  Object.keys(MODES).forEach(key => {
    const lb = document.createElement("label"), r = document.createElement("input");
    r.type = "radio"; r.name = "sf-parabola-ioni"; r.value = key; r.checked = key === mode;
    r.addEventListener("change", () => { mode = key; refresh(); });
    lb.appendChild(r); lb.appendChild(document.createTextNode(" " + LABEL[key]));
    fs.appendChild(lb);
  });
  const lbn = document.createElement("label"), rg = document.createElement("input"), out = document.createElement("span");
  rg.type = "range"; rg.min = 10; rg.max = 200; rg.step = 10; rg.value = n; rg.id = "sf-parabola-n";
  out.textContent = " " + n;
  lbn.appendChild(document.createTextNode("Numero di ioni "));
  lbn.appendChild(rg); lbn.appendChild(out);
  rg.addEventListener("input", () => { n = +rg.value; out.textContent = " " + n; refresh(); });
  ctl.appendChild(fs); ctl.appendChild(lbn);
  const info = document.createElement("p");
  info.className = "note";
  info.setAttribute("aria-live", "off");

  const refresh = () => { if (player) { player.stop(); player.go(step); } };

  const labels = [
    "senza campi tutti gli ioni cadono nello stesso punto, l'origine",
    "il campo elettrico E sposta ogni ione in verticale, tanto meno quanto più è veloce",
    "il campo magnetico B, parallelo a E, sposta gli ioni in orizzontale: ogni ione ha ora un punto proprio",
    "i punti di ioni con lo stesso m/z stanno su una stessa parabola, qualunque sia la velocità",
    "con il neon le parabole sono due, perché ci sono due masse: 20 e 22",
  ];
  const stepDefs = labels.map((label, i) => ({ label, draw: t => draw(i, t) }));
  if (img) img.remove();
  fig.insertBefore(svg, fig.firstChild);
  fig.insertBefore(ctl, svg);
  player = STORIA_UI.player(host, { steps: stepDefs, fps: 30 });
  host.appendChild(info);
  host.classList.add("storia-fig-live");
  const cap = fig.querySelector("figcaption");
  if (cap) fig.appendChild(cap);
})();
