"use strict";
/* Figure sf-tof: arrival times of two ion species in a linear, two-field (Wiley-McLaren) or reflectron TOF.
   Everything is computed from the formulas below, in arbitrary units (charge 1, accelerating voltage U = 1000, drift L = 500):
   - one constant-field region of length s, field E: acceleration a = E/m, exit speed v = sqrt(v0^2 + 2 a s), time (v - v0)/a;
   - linear: one region, ions born up to +-0.4 from the centre (start position spread) with axial speed v0 (energy spread);
   - two fields: a weak extraction field then a strong one; the share of U on the first field is searched numerically so that
     the arrival time does not depend on the start position (space focus), as in Wiley and McLaren;
   - reflectron: mirror of deceleration a_r = 2 v^2 / L chosen so that the total time does not depend on v to first order
     (time in the mirror 2 v / a_r). The turn-around time of the initial speed v0 is not corrected. */
(() => {
  const host = document.getElementById("sf-tof");
  if (!host || typeof STORIA_UI === "undefined" || host.querySelector(".storia-live")) return;
  const U = 1000, L = 500, D = 10, S0 = 4, N = 300, NB = 48, M = [1000, 1010];
  const rng = a => () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const R = rng(7), gauss = () => Math.max(-2, Math.min(2, Math.sqrt(-2 * Math.log(1 - R())) * Math.cos(6.2832 * R())));
  const ions = M.map(() => Array.from({ length: N }, () => ({ dx: (R() - 0.5) * 0.6, g: gauss() })));
  const reg = (v0, a, s) => { const v = Math.sqrt(v0 * v0 + 2 * a * s); return [v, (v - v0) / a]; };
  const time = (mode, m, p, K, f) => {
    const v0 = Math.sqrt(0.05 * K / m) * p.g;   // slider K: initial axial energy spread, 0.025 K in the same units as U
    if (mode === 1) {                       // two fields: first of length S0 with the share f of U, then D with the rest
      const s1 = S0 + p.dx, a1 = f * U / S0 / m, a2 = (1 - f) * U / D / m;
      const [u, t1] = reg(v0, a1, s1), [v, t2] = reg(u, a2, D);
      return t1 + t2 + L / v;
    }
    const [v, t1] = reg(v0, U / D / m, D + p.dx);
    if (mode === 0) return t1 + L / v;
    const vn2 = 2 * U / m;                  // nominal speed squared; mirror time 2 v / a_r = v L / vn2
    return t1 + L / v + v * L / vn2;
  };
  const spread = (m, mode, f) => { const t = ions[0].map(p => time(mode, m, { dx: p.dx, g: 0 }, 0, f)); return Math.max(...t) - Math.min(...t); };
  let fBest = 0.5;
  { let best = 1e9; for (let f = 0.05; f < 0.96; f += 0.01) { const s = spread(M[0], 1, f); if (s < best) { best = s; fBest = f; } } }
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };
  const calc = (mode, K) => M.map((m, k) => ions[k].map(p => time(mode, m, p, K, fBest)));
  const NAMES = ["Lineare", "Due campi (Wiley-McLaren)", "Reflectron"];
  let mode = 0, K = 6, T = calc(mode, K);

  host.classList.add("storia-live");
  const box = document.createElement("div");
  host.appendChild(box);
  const h = document.createElement("h5");
  h.textContent = "Guarda come funziona";
  box.appendChild(h);
  const form = document.createElement("div");
  form.className = "ctl";
  const fs = document.createElement("fieldset");
  const lg = document.createElement("legend");
  lg.textContent = "Configurazione";
  fs.appendChild(lg);
  NAMES.forEach((n, i) => {
    const l = document.createElement("label"), r = document.createElement("input");
    l.style.cssText = "display:inline-flex;align-items:center;gap:6px;margin:2px 14px 2px 0";
    r.type = "radio"; r.name = "sf-tof-modo"; r.checked = i === 0;
    r.addEventListener("change", () => { mode = i; update(); });
    l.appendChild(r); l.appendChild(document.createTextNode(" " + n + " "));
    fs.appendChild(l);
  });
  form.appendChild(fs);
  const sl = document.createElement("label"), rg = document.createElement("input"), out = document.createElement("output");
  sl.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0";
  rg.type = "range"; rg.min = 0; rg.max = 20; rg.step = 1; rg.value = K;
  rg.addEventListener("input", () => { K = +rg.value; update(); });
  sl.appendChild(document.createTextNode("Dispersione di energia iniziale: ")); sl.appendChild(rg); sl.appendChild(document.createTextNode(" ")); sl.appendChild(out);
  form.appendChild(sl);
  box.appendChild(form);

  const W = 640, H = 300, X0 = 40, X1 = 620;
  const svg = STORIA_UI.svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Istogramma dei tempi di arrivo di due specie di ioni nello spettrometro scelto", style: "width:100%;height:auto" }, box);
  const A = ["var(--c1)", "var(--c2)"];
  const sty = "font:13px system-ui,sans-serif;fill:currentColor";
  const track = STORIA_UI.svg("g", {}, svg), bars = STORIA_UI.svg("g", {}, svg), lab = STORIA_UI.svg("g", {}, svg);
  const info = document.createElement("p");
  info.className = "note";
  info.setAttribute("aria-live", "polite");
  const txt = (g, x, y, s, anchor) => { const e = STORIA_UI.svg("text", { x, y, style: sty, "text-anchor": anchor || "start" }, g); e.textContent = s; return e; };
  let lo = 0, hi = 1;
  const range = () => { const all = T.flat(), c = (Math.min(...T[0]) + Math.max(...T[1])) / 2; lo = c - 8; hi = c + 8; return all; };
  const drawAt = (tau, grow) => {
    track.textContent = ""; bars.textContent = ""; lab.textContent = "";
    // flight lane: position = fraction of the path covered, at constant mean speed (schematic)
    STORIA_UI.svg("rect", { x: X0, y: 20, width: X1 - X0, height: 26, rx: 5, style: "fill:none;stroke:currentColor;stroke-width:1.4" }, track);
    txt(track, X0, 14, "sorgente"); txt(track, X1, 14, "rivelatore", "end");
    T.forEach((ts, k) => ts.forEach((t, i) => {
      if (i % 6) return;
      const x = X0 + (X1 - X0) * Math.min(1, tau / t), y = 26 + (i % 12) * 1.2 + k * 8;
      if (k) STORIA_UI.svg("rect", { x: x - 3, y: y - 3, width: 6, height: 6, style: `fill:${A[k]}` }, track);
      else STORIA_UI.svg("circle", { cx: x, cy: y, r: 3.4, style: `fill:${A[k]}` }, track);
    }));
    // histogram of arrival times (only ions already arrived)
    const base = H - 50, top = 80, bw = (X1 - X0) / NB;
    const cnt = T.map(ts => { const c = new Array(NB).fill(0); ts.forEach(t => { const b = Math.floor((t - lo) / (hi - lo) * NB); if (t <= tau && b >= 0 && b < NB) c[b]++; }); return c; });
    const mx = Math.max(12, ...cnt.flat());
    cnt.forEach((c, k) => c.forEach((n, b) => {
      if (!n) return;
      const hh = (base - top) * n / mx * grow;
      STORIA_UI.svg("rect", { x: X0 + b * bw + k * bw / 2, y: base - hh, width: bw / 2, height: hh, style: `fill:${A[k]};fill-opacity:${k ? 0.35 : 0.8};stroke:${A[k]};stroke-width:1.2;stroke-dasharray:${k ? "3 2" : "none"}` }, bars);
    }));
    STORIA_UI.svg("line", { x1: X0, x2: X1, y1: base, y2: base, style: "stroke:currentColor;stroke-width:1.4" }, lab);
    txt(lab, (X0 + X1) / 2, H - 28, "tempo di arrivo (unità arbitrarie)", "middle");
    txt(lab, X0, H - 12, "‹ prima", "start"); txt(lab, X1, H - 12, "dopo ›", "end");
    txt(lab, X0, 70, "◯ m/z 1000 (leggero)    ▢ m/z 1010 (pesante)");
  };
  const summary = () => {
    const w = T.map(ts => 2.355 * sd(ts)), sep = mean(T[1]) - mean(T[0]);
    const res = mean(T[0]) / (2 * w[0]);
    const ok = sep > Math.max(w[0], w[1]);
    return `${NAMES[mode]}: i due picchi sono ${ok ? "separati" : "sovrapposti"}; larghezza a metà altezza ${w[0].toFixed(2).replace(".", ",")} contro una distanza fra i picchi di ${sep.toFixed(2).replace(".", ",")}; potere risolutivo circa ${Math.round(res)}.`;
  };
  let tMax = 0;
  const steps = [
    { label: "gli ioni partono da punti diversi e ricevono la stessa energia: i leggeri vanno più veloci", draw: t => drawAt(tMax * 0.5 * t, 0) },
    { label: "volo senza campo: arrivano prima gli ioni leggeri", draw: t => drawAt(tMax * (0.5 + 0.5 * t), 0) },
    { label: "il rivelatore conta gli arrivi: l'istogramma è lo spettro", draw: t => drawAt(tMax * 2, t) }
  ];
  const pl = STORIA_UI.player(box, { steps, fps: 30 });
  box.appendChild(info);
  function update() {
    T = calc(mode, K); range(); tMax = Math.max(...T.flat()) * 1.001;
    out.textContent = String(K);
    pl.go(2);
    STORIA_UI.live(info, summary());
  }
  update();
  pl.go(0);
})();
