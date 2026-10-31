"use strict";
/* Figure "sf-settore": a magnetic sector refocuses a diverging ion beam (history chapters).
   Loaded lazily by STORIA_UI.lazy. Classic script, no modules (works from file://).
   Geometry 180 deg (Dempster): ion energy qU, radius r = sqrt(2 m U / q) / B, an ion that enters at angle a from the
   normal lands at 2 r cos(a): to first order all rays meet at 2 r, whatever a.
   To add the 60 deg geometry (DEV-06): push {id, label, ...} into GEOM and branch in path()/landing(); to add the
   second block "sf-doppia": add a function to BLOCKS keyed by the host id. */
(() => {
  const U = STORIA_UI, NS = "http://www.w3.org/2000/svg";
  const W = 720, H = 500, SX = 150, SY = 250, D = 300, R0 = 150;        // slit S, detector slit at SX + D, radius of m = 20 at B = 1
  const AMAX = 12 * Math.PI / 180, NRAY = 25, SLIT = 6, BMIN = 0.8, BMAX = 1.5;
  const PAIRS = [
    { id: "ne", label: "Neon 20 e 22", m: [20, 22], ab: [0.9, 0.1], sym: ["²⁰Ne", "²²Ne"] },
    { id: "cl", label: "Cloro 35 e 37", m: [35, 37], ab: [0.76, 0.24], sym: ["³⁵Cl", "³⁷Cl"] },
  ];
  const GEOM = [{ id: "180", label: "180° (Dempster, 1918)" }];                    // 60 deg joins here
  const radius = (m, B) => R0 * Math.sqrt(m / 20) / B;
  const landing = (m, B, a) => SX + 2 * radius(m, B) * Math.cos(a);              // 180 deg: x where the ray comes back to the axis
  const angles = Array.from({ length: NRAY }, (_, i) => AMAX * (2 * i / (NRAY - 1) - 1));
  const current = (m, B) => angles.filter(a => Math.abs(landing(m, B, a) - (SX + D)) <= SLIT).length / NRAY;
  const Bcentre = m => 2 * R0 * Math.sqrt(m / 20) / D;                           // B that puts the axial ray on the detector

  const el = (tag, attrs, parent) => U.svg(tag, attrs, parent);
  const label = (txt, parent) => { const l = document.createElement("label"); l.textContent = txt; parent.appendChild(l); return l; };

  function settore(host) {
    const img = host.querySelector("img");
    if (!img || host.dataset.live) return;
    host.dataset.live = "1";
    const st = { pair: PAIRS[0], B: Bcentre(20), p: 1, scan: 1 };
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Settore magnetico a 180 gradi: tre raggi divergenti si rifocalizzano sulla fenditura del rivelatore", style: "width:100%;height:auto;color:var(--ink,#24231f)" });
    const defs = el("defs", {}, svg);
    el("rect", { x: 60, y: 20, width: 600, height: 240 }, el("clipPath", { id: "sf-clip" }, defs));
    el("rect", { x: 60, y: 20, width: 600, height: 240, fill: "currentColor", "fill-opacity": ".07", stroke: "currentColor", "stroke-width": 1.4 }, svg);
    for (let x = 90; x < 660; x += 60) for (let y = 50; y < 260; y += 50) { el("circle", { cx: x, cy: y, r: 3, fill: "none", stroke: "currentColor", "stroke-width": 1 }, svg); el("circle", { cx: x, cy: y, r: 1, fill: "currentColor" }, svg); }
    el("text", { x: 70, y: 40, fill: "currentColor", "font-size": 16 }, svg).textContent = "magnete: B uscente dal foglio";
    const key = el("text", { x: 650, y: 40, "text-anchor": "end", fill: "currentColor", "font-size": 16 }, svg);
    el("path", { d: `M${SX - 50} ${SY}H${SX - 6}M${SX + 6} ${SY}H${SX + D - 6}M${SX + D + 6} ${SY}H${SX + D + 50}`, stroke: "currentColor", "stroke-width": 3 }, svg);
    el("text", { x: SX, y: SY + 24, "text-anchor": "middle", fill: "currentColor", "font-size": 16 }, svg).textContent = "fenditura S";
    el("text", { x: SX + D, y: SY + 24, "text-anchor": "middle", fill: "currentColor", "font-size": 16 }, svg).textContent = "rivelatore";
    const rays = el("g", { "clip-path": "url(#sf-clip)", fill: "none" }, svg);
    const dots = el("g", {}, svg);
    // spectrum panel
    const PX = 60, PW = 600, PY = 440, PH = 90;
    el("path", { d: `M${PX} ${PY}H${PX + PW}M${PX} ${PY}V${PY - PH}`, stroke: "currentColor", "stroke-width": 1.4, fill: "none" }, svg);
    el("text", { x: PX + PW, y: PY + 44, "text-anchor": "end", fill: "currentColor", "font-size": 16 }, svg).textContent = "campo B (unità relative) →";
    el("text", { x: PX + 4, y: PY - PH - 8, fill: "currentColor", "font-size": 16 }, svg).textContent = "corrente allo strumento";
    const trace = el("path", { fill: "none", stroke: "currentColor", "stroke-width": 2 }, svg);
    const cursor = el("path", { stroke: "currentColor", "stroke-width": 1.4, "stroke-dasharray": "4 3" }, svg);
    const tags = el("g", {}, svg);
    const bx = B => PX + (B - BMIN) / (BMAX - BMIN) * PW;

    const spectrum = () => {
      const pts = [];
      for (let i = 0; i <= 200; i++) {
        const B = BMIN + (BMAX - BMIN) * i / 200;
        const y = st.pair.m.reduce((s, m, k) => s + st.pair.ab[k] * current(m, B), 0);
        pts.push([bx(B), PY - y * PH * 1.0, B]);
      }
      return pts;
    };
    const draw = () => {
      const { m, sym } = st.pair, B = st.B;
      key.textContent = sym[0] + " linea piena · " + sym[1] + " tratteggio";
      rays.textContent = ""; dots.textContent = "";
      const pick = [angles[0], 0, angles[NRAY - 1]];
      m.forEach((mm, k) => {
        const r = radius(mm, B);
        const dash = k ? "8 5" : "none", col = k ? "var(--accent2,#9a3412)" : "var(--accent,#1f4e7e)";
        pick.forEach(a => {
          // ion leaves S with angle a from the vertical, circle centre at distance r on the right; param u = turn angle (0 .. pi - 2a)
          const cx = SX + r * Math.cos(a), cy = SY + r * Math.sin(a), tot = Math.PI - 2 * a;
          const n = 60, up = Math.max(0.0001, st.p * tot);
          let d = "";
          for (let i = 0; i <= n; i++) {
            const u = up * i / n, x = cx - r * Math.cos(a + u), y = cy - r * Math.sin(a + u) * 1;
            d += (i ? "L" : "M") + x.toFixed(1) + " " + (y).toFixed(1);
          }
          el("path", { d, stroke: col, "stroke-width": a === 0 ? 2.4 : 1.4, "stroke-dasharray": dash }, rays);
        });
      });
      const pts = spectrum(), keep = pts.filter(q => q[2] <= BMIN + (BMAX - BMIN) * st.scan + 1e-9);
      trace.setAttribute("d", keep.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(""));
      cursor.setAttribute("d", `M${bx(B).toFixed(1)} ${PY}V${PY - PH - 4}`);
      tags.textContent = "";
      m.forEach((mm, k) => el("text", { x: bx(Bcentre(mm)), y: PY + 20, "text-anchor": "middle", fill: "currentColor", "font-size": 16 }, tags).textContent = sym[k]);
    };

    // controls
    const ui = document.createElement("div");
    ui.className = "storia-comandi";
    const fs = document.createElement("fieldset");
    fs.style.cssText = "border:0;padding:0;margin:0";
    const lg = document.createElement("legend"); lg.textContent = "Ioni"; lg.className = "sr-only"; lg.style.cssText = "position:absolute;left:-9999px";
    fs.appendChild(lg);
    PAIRS.forEach((pr, i) => {
      const l = document.createElement("label"), r = document.createElement("input");
      r.type = "radio"; r.name = "sf-coppia"; r.checked = !i;
      r.addEventListener("change", () => { st.pair = pr; st.B = Bcentre(pr.m[0]); slider.value = st.B; st.p = 1; st.scan = 1; sync(); draw(); });
      l.append(r, " " + pr.label + "  ");
      fs.appendChild(l);
    });
    ui.appendChild(fs);
    const lb = label("Campo B ", ui), slider = document.createElement("input");
    slider.type = "range"; slider.min = BMIN; slider.max = BMAX; slider.step = 0.005; slider.value = st.B;
    const out = document.createElement("output");
    slider.setAttribute("aria-label", "Campo magnetico B, unità relative");
    slider.addEventListener("input", () => { st.B = +slider.value; st.p = 1; sync(); draw(); });
    lb.append(slider, out);
    const sync = () => { out.textContent = " " + st.B.toFixed(3).replace(".", ","); };
    const geo = document.createElement("p");
    geo.className = "note"; geo.textContent = "Geometria: " + GEOM[0].label + ".";
    const wrap = document.createElement("div");
    img.replaceWith(svg);
    host.appendChild(ui);
    host.appendChild(geo);
    host.appendChild(wrap);
    const home = () => { st.B = Bcentre(st.pair.m[0]); st.scan = 0; slider.value = st.B; sync(); };   // steps 1-3: B puts the first mass on the detector
    const steps = [
      { label: "gli ioni partono dalla fenditura con la stessa energia", draw: t => { home(); st.p = 0.12 + 0.18 * t; draw(); } },
      { label: "il campo magnetico li piega su semicirconferenze di raggio proporzionale a √m", draw: t => { home(); st.p = 0.3 + 0.4 * t; draw(); } },
      { label: "dopo mezzo giro i raggi divergenti si ritrovano quasi nello stesso punto", draw: t => { home(); st.p = 0.7 + 0.3 * t; draw(); } },
      { label: "variando B, ogni massa a turno cade sul rivelatore e dà un picco di corrente", draw: t => { st.p = 1; st.scan = t; st.B = BMIN + (BMAX - BMIN) * t; draw(); slider.value = st.B; sync(); } },
    ];
    U.player(wrap, { steps });
    sync();
  }

  const BLOCKS = { "sf-settore": settore };
  Object.keys(BLOCKS).forEach(id => { const h = document.getElementById(id); if (h) BLOCKS[id](h); });
})();
