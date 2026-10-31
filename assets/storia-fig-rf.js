"use strict";
/* sf-rf: a quadrupole mass filter and a 3D Paul trap, both from the Mathieu equation u'' + (a - 2q cos 2t) u = 0
   (t = Omega*time/2, u in units of the field radius). Own small RK4; trajectories are computed live, not stored.
   Classic script, needs STORIA_UI (assets/storia.js). Host: #sf-rf, its <img> is the static fallback. */
(() => {
  const host = document.getElementById("sf-rf");
  if (!host || typeof STORIA_UI === "undefined") return;
  const U = STORIA_UI, H = 0.02;
  /* RK4 for u'' = -(a - 2q cos 2t) u; stops when |u| > lim; returns the samples u_k = u(k*H) */
  const traj = (a, q, u0, n, lim) => {
    const f = (t, u) => -(a - 2 * q * Math.cos(2 * t)) * u;
    let u = u0, v = 0, t = 0;
    const o = [u];
    for (let i = 0; i < n; i++) {
      const k1 = f(t, u), k2 = f(t + H / 2, u + H / 2 * v), k3 = f(t + H / 2, u + H / 2 * (v + H / 2 * k1)), k4 = f(t + H, u + H * (v + H / 2 * k2));
      u += H * v + H * H / 6 * (k1 + k2 + k3);
      v += H / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
      t += H;
      o.push(u);
      if (Math.abs(u) > lim) break;
    }
    return o;
  };
  /* three masses: q is proportional to 1/m. Filter: a = 0,32 q; trap: a = 0 */
  const NAMES = ["intermedia", "leggera", "pesante"], DASH = ["", "8 5", "2 5"], COL = ["--c1", "--c2", "--c3"];
  const QF = [0.69, 0.8625, 0.552], QT = [0.7, 1.05, 0.45];
  let mode = "f", V = 1, filt = [], trap = [], cur = 0;
  const NF = 3000, NT = 2000;
  const build = () => {
    filt = QF.map(q0 => {
      const q = q0 * V, x = traj(0.32 * q, q, 0.1, NF, 1), y = traj(-0.32 * q, -q, 0.1, NF, 1);
      const hit = Math.min(x.length, y.length) <= NF;
      return { p: x.length <= y.length ? x : y, hit };
    });
    trap = QT.map(q0 => {
      const q = q0 * V, ions = [];
      for (let k = 0; k < 16; k++) {
        const r0 = 0.3 * Math.cos(k * 2.4 + 1), z0 = 0.3 * Math.sin(k * 1.7 + 0.5);
        ions.push({ r: traj(0, q / 2, r0, NT, 2), z: traj(0, q, z0, NT, 1) });
      }
      return ions;
    });
  };

  host.querySelectorAll("img").forEach(i => i.parentNode.removeChild(i));
  const fig = host.querySelector("figure") || host;
  const W = 720, Hh = 340, CY = 170;
  const svg = U.svg("svg", { viewBox: `0 0 ${W} ${Hh}`, role: "img", "aria-label": "Quadrupolo e trappola di Paul: traiettorie di tre masse calcolate con l'equazione di Mathieu" }, null);
  svg.style.cssText = "display:block;width:100%;height:auto;color:var(--ink)";
  fig.insertBefore(svg, fig.firstChild);
  const txt = (s, x, y, anchor, parent) => {
    const e = U.svg("text", { x, y, "text-anchor": anchor || "start", style: "font:16px system-ui,sans-serif;fill:currentColor" }, parent || svg);
    e.textContent = s;
    return e;
  };
  const line = (d, i, w) => U.svg("path", { d, fill: "none", style: `stroke:var(${COL[i]});stroke-width:${w || 2.4};stroke-dasharray:${DASH[i]}` }, svg);
  const cross = (x, y, i) => U.svg("path", { d: `M${x - 6} ${y - 6}l12 12m0 -12l-12 12`, fill: "none", style: `stroke:var(${COL[i]});stroke-width:2.6` }, svg);
  const bar = (x, y, w, h) => U.svg("rect", { x, y, width: w, height: h, rx: 4, style: "fill:currentColor;fill-opacity:.15;stroke:currentColor;stroke-width:1.5" }, svg);

  const drawFilter = (k, t) => {
    svg.textContent = "";
    bar(40, CY - 122, 660, 14);
    bar(40, CY + 108, 660, 14);
    txt("barra: + (U − V cos Ωt)", 44, CY - 128);
    txt("barra: − (U − V cos Ωt)", 44, CY + 140);
    U.svg("path", { d: `M40 ${CY}H700`, style: "stroke:currentColor;stroke-width:1;stroke-dasharray:3 4" }, svg);
    txt("asse del quadrupolo →", 696, CY - 6, "end");
    for (let i = 0; i <= k; i++) {
      const m = filt[i], f = i < k ? 1 : t, n = Math.max(1, Math.floor((m.p.length - 1) * f));
      let d = "";
      for (let j = 0; j <= n; j += 6) d += (j ? "L" : "M") + (40 + j * 0.22).toFixed(1) + " " + (CY - m.p[j] * 100).toFixed(1);
      line(d, i);
      const ex = 40 + n * 0.22, ey = CY - m.p[n] * 100;
      if (m.hit && n >= m.p.length - 1) { cross(ex, ey, i); txt("tocca una barra", ex + 10, ey + (ey < CY ? 16 : -8)); }
      const lx = 44, ly = CY + (i === 0 ? -60 : i === 1 ? 70 : -85);
      if (n > 40 && i === k) txt(`massa ${NAMES[i]}: ${m.hit ? "instabile" : "stabile"}`, lx, ly);
    }
  };
  const drawTrap = (k, t) => {
    svg.textContent = "";
    const S = 110, CX = 360, tau = Math.floor(t * (NT - 1)), set = trap[k];
    U.svg("path", { d: `M${CX - 190} ${CY - 70}Q${CX - 130} ${CY} ${CX - 190} ${CY + 70}M${CX + 190} ${CY - 70}Q${CX + 130} ${CY} ${CX + 190} ${CY + 70}`, fill: "none", style: "stroke:currentColor;stroke-width:5" }, svg);
    U.svg("path", { d: `M${CX - 70} ${CY - 150}Q${CX} ${CY - 100} ${CX + 70} ${CY - 150}M${CX - 70} ${CY + 150}Q${CX} ${CY + 100} ${CX + 70} ${CY + 150}`, fill: "none", style: "stroke:currentColor;stroke-width:5" }, svg);
    txt("elettrodo ad anello", CX - 330, CY + 4);
    txt("calotta", CX + 80, CY - 140);
    txt("calotta", CX + 80, CY + 150);
    let lost = 0;
    set.forEach(ion => {
      if (ion.z.length - 1 < tau || ion.r.length - 1 < tau) { lost++; return; }
      const x = CX + ion.r[tau] * S, y = CY - ion.z[tau] * S;
      const sh = k === 0 ? U.svg("circle", { cx: x, cy: y, r: 5 }, svg) : k === 1 ? U.svg("path", { d: `M${x} ${y - 6}l6 11h-12z` }, svg) : U.svg("rect", { x: x - 5, y: y - 5, width: 10, height: 10 }, svg);
      sh.setAttribute("style", `fill:var(${COL[k]});stroke:currentColor;stroke-width:1`);
    });
    txt(`massa ${NAMES[k]}: ${set.length - lost} su ${set.length} intrappolati`, 44, 24);
  };
  const steps = [0, 1, 2].map(k => ({
    get label() {
      const w = NAMES[k];
      if (mode === "f") return `massa ${w}, ${filt[k].hit ? "instabile: la traiettoria cresce fino a toccare una barra" : "stabile: la traiettoria resta vicino all'asse"}`;
      const lost = trap[k].filter(o => o.z.length <= NT || o.r.length <= NT).length;
      return `massa ${w}, ${lost ? `${lost} ioni su 16 espulsi dalle calotte` : "tutti i 16 ioni restano intrappolati"}`;
    },
    draw: t => { cur = k; (mode === "f" ? drawFilter : drawTrap)(k, t); }
  }));
  const ctl = document.createElement("div");
  ctl.className = "storia-comandi";
  ctl.setAttribute("role", "group");
  ctl.setAttribute("aria-label", "Impostazioni della figura");
  const rb = (v, l) => {
    const lb = document.createElement("label"), r = document.createElement("input");
    r.type = "radio"; r.name = "sf-rf-mode"; r.value = v; r.checked = v === mode;
    r.addEventListener("change", () => { mode = v; pl.go(0); });
    lb.appendChild(r); lb.appendChild(document.createTextNode(" " + l)); ctl.appendChild(lb);
  };
  rb("f", "Filtro di massa");
  rb("t", "Trappola 3D");
  const sl = document.createElement("label"), rg = document.createElement("input"), out = document.createElement("output");
  rg.type = "range"; rg.min = 85; rg.max = 115; rg.step = 1; rg.value = 100;
  out.textContent = "100%";
  rg.addEventListener("input", () => { V = rg.value / 100; out.textContent = rg.value + "%"; build(); pl.go(cur); });
  sl.appendChild(document.createTextNode("Ampiezza RF V "));
  sl.appendChild(rg); sl.appendChild(document.createTextNode(" ")); sl.appendChild(out);
  ctl.appendChild(sl);
  const box = document.createElement("div");
  box.appendChild(ctl);
  fig.insertBefore(box, svg.nextSibling);
  build();
  const pl = U.player(box, { steps, fps: 30 });
})();
