"use strict";
/* sf-moltiplicatore: electron multiplier with discrete dynodes. One ion releases delta electrons at the first dynode,
   each of those releases delta more at the next, so after n dynodes the gain is G = delta^n (delta = secondary yield).
   Everything is computed from that formula: the electrons per stage are delta^k, shown as a bar on a log10 axis (1 to 10^12).
   Controls: dynodes n (4-20), yield delta (1.5-4). Classic script, loaded by STORIA_UI.lazy; replaces the static <img>. */
(() => {
  const host = document.getElementById("sf-moltiplicatore");
  if (!host || host.dataset.live || typeof STORIA_UI === "undefined") return;
  host.dataset.live = "1";
  const U = STORIA_UI, S = (tag, a, p) => U.svg(tag, a, p);
  const st = { n: 12, d: 3 };
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const num = (v, k) => (window.TP && TP.fmt ? TP.fmt(v, k) : v.toFixed(k).replace(".", ","));
  const sup = e => String(e).split("").map(c => SUP[+c]).join("");
  const big = g => { const e = Math.floor(Math.log10(g)); return e < 3 ? num(g, g < 10 ? 1 : 0) : num(g / Math.pow(10, e), 1) + "×10" + sup(e); };
  const cnt = k => Math.pow(st.d, k);
  const A = "var(--c1,#1f4e7e)", B = "var(--c2,#9a3412)";

  const fig = host.querySelector("figure"), img = host.querySelector("img");
  const box = document.createElement("div");
  const svg = S("svg", { viewBox: "0 0 720 360", role: "img", "aria-label": "Moltiplicatore a dinodi animato: gli elettroni raddoppiano o più a ogni dinodo, le barre mostrano il loro numero su scala logaritmica", style: "width:100%;height:auto" });
  box.appendChild(svg);
  const g = S("g", {}, svg);
  const txt = (s, x, y, anchor, size) => { const e = S("text", { x, y, "text-anchor": anchor || "start", fill: "currentColor", "font-size": size || 13, "font-family": "system-ui,sans-serif" }, g); e.textContent = s; return e; };

  // s = how many stages are reached (0 = ion arriving, n = anode); f = ion position while arriving
  function frame(s, f) {
    g.textContent = "";
    const n = st.n, X0 = 70, dx = 580 / n, xk = k => X0 + dx * (k - 0.5), yk = k => (k % 2 ? 140 : 70);
    txt("ione", 14, 108);
    S("circle", { cx: 40 + (xk(1) - 60) * f, cy: 108 - 38 * f, r: 7, fill: A, stroke: "currentColor", "stroke-width": 1.4 }, g);
    for (let k = 1; k <= n; k++) {
      const x = xk(k), y = yk(k), reached = k <= s;
      S("path", { d: `M${x - 9} ${y + (k % 2 ? 6 : -6)}L${x + 9} ${y + (k % 2 ? -6 : 6)}`, stroke: "currentColor", "stroke-width": reached ? 4 : 2, fill: "none", "stroke-opacity": reached ? 1 : 0.4 }, g);
      if (k > 1 && reached) S("path", { d: `M${xk(k - 1)} ${yk(k - 1)}L${x} ${y}`, stroke: B, "stroke-width": Math.min(8, 1 + 0.5 * Math.log10(cnt(k - 1))), "stroke-dasharray": "7 4", fill: "none" }, g);
      if (reached && (k <= 3 || k === n)) txt("×" + big(cnt(k)).replace(",0", ""), x, y + ((k % 2 === 1) !== (k === n) ? 26 : -14), "middle", 12);
    }
    if (s >= n) {
      S("rect", { x: 664, y: 56, width: 16, height: 30, fill: "currentColor", "fill-opacity": ".1", stroke: "currentColor", "stroke-width": 1.4 }, g);
      txt("anodo", 672, 48, "middle", 12);
      txt("segnale: " + big(cnt(n)) + " elettroni", 706, 186, "end");
    }
    // log10 bars, one per stage, axis 1 to 10^12
    const BY = 330, BH = 120, bw = 580 / (n + 1);
    S("path", { d: `M60 ${BY}H650M60 ${BY}V${BY - BH}`, stroke: "currentColor", "stroke-width": 1.4, fill: "none" }, g);
    [0, 3, 6, 9, 12].forEach(e => { const y = BY - BH * e / 12; S("path", { d: `M56 ${y}H60`, stroke: "currentColor", fill: "none" }, g); txt(e ? "10" + sup(e) : "1", 52, y + 4, "end", 12); });
    txt("elettroni per stadio (scala logaritmica)", 60, 206, "start", 12);
    txt("stadio: 0 = ione, poi dinodo 1…" + n, 650, 352, "end", 12);
    for (let k = 0; k <= Math.min(n, Math.floor(s)); k++) {
      const h = Math.max(2, BH * Math.log10(cnt(k)) / 12), x = 64 + k * bw;
      S("rect", { x, y: BY - h, width: Math.max(3, bw - 4), height: h, fill: k ? B : A, "fill-opacity": ".35", stroke: k ? B : A, "stroke-width": 1.6, "stroke-dasharray": k ? "5 3" : "none" }, g);
    }
  }

  let cur = 0;
  const steps = [
    { get label() { return "uno ione colpisce il primo dinodo e ne stacca " + num(st.d, 1) + " elettroni in media."; }, draw: t => frame(0, t) },
    { get label() { return "ogni elettrone, accelerato verso il dinodo seguente, ne stacca altri " + num(st.d, 1) + ": a ogni stadio il numero si moltiplica per δ."; }, draw: t => frame(1 + t * (st.n - 1), 1) },
    { get label() { return "l'anodo raccoglie tutto: dopo " + st.n + " dinodi il guadagno è δⁿ = " + big(cnt(st.n)) + "."; }, draw: () => frame(st.n, 1) }
  ];
  const wrapped = steps.map((s, i) => ({ get label() { return s.label; }, draw: t => { cur = i; s.draw(t); } }));

  function slider(name, key, min, max, step, fmt) {
    const l = document.createElement("label"), r = document.createElement("input"), o = document.createElement("output");
    r.type = "range"; r.min = min; r.max = max; r.step = step; r.value = st[key];
    l.style.cssText = "display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px;margin:4px 14px 4px 0";
    l.appendChild(document.createTextNode(name + " ")); l.appendChild(r); l.appendChild(o);
    const upd = () => { st[key] = +r.value; o.textContent = fmt(st[key]); };
    r.addEventListener("input", () => { upd(); pl.go(cur); });
    upd(); return l;
  }

  const ctl = document.createElement("div");
  ctl.className = "storia-comandi";
  box.appendChild(ctl);
  ctl.appendChild(slider("Dinodi n", "n", 4, 20, 1, v => String(v)));
  ctl.appendChild(slider("Resa δ", "d", 1.5, 4, 0.1, v => num(v, 1)));
  fig.insertBefore(box, img);
  img.remove();
  const pl = U.player(box, { steps: wrapped });
})();
