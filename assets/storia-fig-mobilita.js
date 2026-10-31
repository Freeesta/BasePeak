"use strict";
/* sf-mobilita: drift tube of ion mobility. Two ions with the same m/z but different collision cross sections.
   Drift velocity v = K*E, with K proportional to 1/(cross section * gas density); t = L/(K*E).
   Times are in arbitrary units: only the ratio between the two ions (= ratio of cross sections) is meaningful.
   Classic script, loaded by STORIA_UI.lazy; replaces the static <img> of #sf-mobilita with a live SVG. */
(() => {
  const host = document.getElementById("sf-mobilita");
  if (!host || host.dataset.live || typeof STORIA_UI === "undefined") return;
  host.dataset.live = "1";
  const U = STORIA_UI, S = (tag, a, p) => U.svg(tag, a, p);
  const OM = [1, 1.4];                     // relative cross sections: compact, extended
  const X0 = 135, X1 = 585, AX = 60;       // start, detector, time axis end (arbitrary units)
  const st = { p: 1, E: 1 };               // gas pressure and field, relative
  const T = i => 10 * OM[i] * st.p / st.E; // arrival time, arbitrary units
  const fmt = v => (window.TP && TP.fmt ? TP.fmt(v, 1) : String(v.toFixed(1)).replace(".", ","));

  const fig = host.querySelector("figure"), img = host.querySelector("img");
  const box = document.createElement("div");
  const svg = S("svg", { viewBox: "0 0 720 350", role: "img", "aria-label": "Tubo di deriva animato: due ioni con lo stesso m/z arrivano al rivelatore in tempi diversi", style: "width:100%;height:auto" });
  box.appendChild(svg);
  const gas = S("g", {}, svg), tube = S("g", {}, svg), ions = S("g", {}, svg), hist = S("g", {}, svg);
  S("rect", { x: 90, y: 90, width: 540, height: 100, rx: 6, fill: "currentColor", "fill-opacity": ".08", stroke: "currentColor", "stroke-width": 1.4 }, tube);
  S("rect", { x: 636, y: 120, width: 40, height: 40, fill: "currentColor", "fill-opacity": ".1", stroke: "currentColor", "stroke-width": 1.4 }, tube);
  const txt = (s, x, y, anchor, parent) => { const e = S("text", { x, y, "text-anchor": anchor || "start", fill: "currentColor", "font-size": 13, "font-family": "system-ui,sans-serif" }, parent || tube); e.textContent = s; return e; };
  txt("tubo di deriva pieno di gas", 360, 80, "middle");
  txt("rivelatore", 656, 180, "middle");
  txt("campo elettrico E →", 90, 56);

  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const gasPts = Array.from({ length: 80 }, () => [100 + rnd() * 520, 98 + rnd() * 84]);

  function drawGas() {
    gas.textContent = "";
    const n = Math.round(gasPts.length * st.p / 2);
    gasPts.slice(0, n).forEach(q => S("circle", { cx: q[0], cy: q[1], r: 2, fill: "none", stroke: "currentColor", "stroke-width": 1, "stroke-opacity": ".6" }, gas));
  }

  function ion(i, f) {   // f = fraction of the path covered
    const x = X0 + (X1 - X0) * Math.min(1, f);
    if (i === 0) {
      S("circle", { cx: x, cy: 118, r: 9, fill: "var(--c1,#1f4e7e)", stroke: "currentColor", "stroke-width": 1.4 }, ions);
      txt("compatto", x, 104, "middle", ions);
    } else {
      [-21, -7, 7, 21].forEach(d => S("circle", { cx: x + d, cy: 160, r: 7, fill: "var(--c2,#9a3412)", "fill-opacity": ".3", stroke: "var(--c2,#9a3412)", "stroke-width": 2, "stroke-dasharray": "3 2" }, ions));
      txt("esteso", x, 184, "middle", ions);
    }
  }

  function axis() {
    S("path", { d: "M" + X0 + " 330H" + X1, stroke: "currentColor", "stroke-width": 1.4, fill: "none" }, hist);
    for (let k = 0; k <= AX; k += 10) {
      const x = X0 + (X1 - X0) * k / AX;
      S("path", { d: "M" + x + " 330v5", stroke: "currentColor", fill: "none" }, hist);
      txt(String(k), x, 349, "middle", hist);
    }
    txt("tempo di arrivo (unità arbitrarie)", X1, 318, "end", hist);
  }

  function peak(i, k) {  // Gaussian arrival peak, height scaled by k in [0,1]
    const t0 = T(i), sg = 0.06 * t0 + 0.8, H = 70 * k;
    let d = "";
    for (let t = 0; t <= AX; t += 0.5) {
      const x = X0 + (X1 - X0) * t / AX, y = 330 - H * Math.exp(-0.5 * ((t - t0) / sg) ** 2);
      d += (t ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    S("path", { d, fill: "none", stroke: i ? "var(--c2,#9a3412)" : "var(--c1,#1f4e7e)", "stroke-width": 2.4, "stroke-dasharray": i ? "7 4" : "none" }, hist);
  }

  function tick(i) {
    const x = X0 + (X1 - X0) * T(i) / AX;
    S("path", { d: "M" + x + " 322V338", stroke: i ? "var(--c2,#9a3412)" : "var(--c1,#1f4e7e)", "stroke-width": 3, fill: "none" }, hist);
  }

  let cur = 0;
  const steps = [
    { label: "due ioni con lo stesso m/z partono insieme dall'imbocco del tubo; il gas è fermo.", draw: () => frame(0, false) },
    { label: "il campo E li spinge, il gas li frena: ogni ione corre a velocità costante v = K·E.", draw: t => frame(t * Math.max(T(0), T(1)), false) },
    { label: "lo ione compatto arriva prima: urta meno molecole di gas.", draw: t => frame(Math.max(T(0), T(1)), t) },
    { label: "", draw: t => frame(Math.max(T(0), T(1)), 1, t) },
  ];

  function frame(tau, ticks, peaks) {
    ions.textContent = ""; hist.textContent = ""; axis();
    ion(0, tau / T(0)); ion(1, tau / T(1));
    if (ticks) { tick(0); tick(1); }
    if (peaks) { peak(0, peaks); peak(1, peaks); }
  }

  // dynamic label of the last step (ratio is independent of p and E)
  steps[3].label = "i tempi diventano due picchi; il rapporto " + fmt(OM[1]) + " tra i tempi resta lo stesso, anche se cambiano pressione e campo.";

  function slider(name, key, min, max) {
    const l = document.createElement("label"), r = document.createElement("input"), o = document.createElement("output");
    r.type = "range"; r.min = min; r.max = max; r.step = 0.1; r.value = st[key];
    l.textContent = name + " "; l.appendChild(r); l.appendChild(o);
    const upd = () => { st[key] = +r.value; o.textContent = " " + fmt(st[key]) + "×"; };
    r.addEventListener("input", () => { upd(); drawGas(); pl.go(cur); });
    upd(); return l;
  }

  drawGas();
  const ctl = document.createElement("div");
  ctl.className = "storia-comandi";
  box.appendChild(ctl);
  ctl.appendChild(slider("Pressione del gas", "p", 0.5, 2));
  ctl.appendChild(slider("Campo E", "E", 0.5, 2));
  const wrapped = steps.map((s, i) => ({ label: s.label, draw: t => { cur = i; s.draw(t); } }));
  fig.insertBefore(box, img);
  img.remove();
  const pl = U.player(box, { steps: wrapped });
})();
