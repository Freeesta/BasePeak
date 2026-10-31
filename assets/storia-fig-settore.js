"use strict";
/* Figure "sf-settore": a magnetic sector refocuses a diverging ion beam (history chapters).
   Loaded lazily by STORIA_UI.lazy. Classic script, no modules (works from file://).
   Geometry 180 deg (Dempster): ion energy qU, radius r = sqrt(2 m U / q) / B, an ion that enters at angle a from the
   normal lands at 2 r cos(a): to first order all rays meet at 2 r, whatever a.
   Geometry 60 deg (Nier): source, vertex and detector are collinear and the orbit centre is the vertex (Barber's rule),
   rays are traced numerically (line, arc, line). A host lists its geometries in data-geom (default "180").
   Block "sf-doppia": first-order matrix optics (x, angle, energy deviation) of an electric and a magnetic sector. */
(() => {
  const U = STORIA_UI, W = 720, H = 500, SY = 250, NRAY = 25, SLIT = 6, BMIN = 0.8, BMAX = 1.5, RAD = Math.PI / 180;
  const PAIRS = [
    { id: "ne", label: "Neon 20 e 22", m: [20, 22], ab: [0.9, 0.1], sym: ["²⁰Ne", "²²Ne"] },
    { id: "cl", label: "Cloro 35 e 37", m: [35, 37], ab: [0.76, 0.24], sym: ["³⁵Cl", "³⁷Cl"] },
  ];
  // SX: source slit x; D: source-detector distance; R: orbit radius of m = 20 at B = 1; f: Bcentre = f R sqrt(m/20) / D; A: half-angle of the beam
  const GEOM = {
    "180": { label: "180° (Dempster, 1918)", SX: 150, D: 300, R: 150, f: 2, A: 12 * RAD, aria: "Settore magnetico a 180 gradi: tre raggi divergenti si rifocalizzano sulla fenditura del rivelatore" },
    "60": { label: "60° (Nier, 1940)", SX: 160, D: 400, R: 100, f: 4, A: 8 * RAD, aria: "Settore magnetico a 60 gradi: tre raggi divergenti da una fenditura si rifocalizzano sulla fenditura del rivelatore" },
  };
  const S3 = Math.sqrt(3) / 2, E1 = [-0.5, S3], E2 = [0.5, S3];                  // edges of the 60 deg wedge (unit vectors from the vertex)
  const radius = (g, m, B) => g.R * Math.sqrt(m / 20) / B;
  const Bcentre = (g, m) => g.f * g.R * Math.sqrt(m / 20) / g.D;                 // B that puts the axial ray on the detector
  const angles = g => Array.from({ length: NRAY }, (_, i) => g.A * (2 * i / (NRAY - 1) - 1));
  // 180 deg: an ion that enters at angle a from the normal lands at 2 r cos(a)
  const land180 = (g, m, B, a) => 2 * radius(g, m, B) * Math.cos(a);
  // 60 deg: straight line from the source to the entry edge, arc of radius r (centre on the right of the ion), straight line to the axis.
  // Returns the polyline [[x, y]...] (vertex at the origin, y up) or null when the ion misses the sector.
  function trace60(g, m, B, a) {
    const r = radius(g, m, B), S = [-g.D / 2, 0], th = Math.PI / 6 + a, d = [Math.cos(th), Math.sin(th)];
    const det = -d[0] * E1[1] + E1[0] * d[1], bx = -S[0], by = -S[1];
    const t = (-bx * E1[1] + E1[0] * by) / det, s = (d[0] * by - d[1] * bx) / det;
    if (!(t > 0 && s > 0)) return null;
    const P = [S[0] + t * d[0], S[1] + t * d[1]], C = [P[0] + r * Math.sin(th), P[1] - r * Math.cos(th)];
    const at = ph => { const q = th - ph, x = C[0] - r * Math.sin(q), y = C[1] + r * Math.cos(q); return [x, y, x * E2[1] - y * E2[0]]; };
    let lo = -1, hi = 0;
    for (let i = 1; i <= 90; i++) { const a0 = Math.PI * 1.2 * (i - 1) / 90, a1 = Math.PI * 1.2 * i / 90; if (at(a0)[2] < 0 && at(a1)[2] >= 0) { lo = a0; hi = a1; break; } }
    if (lo < 0) return null;
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (at(mid)[2] < 0) lo = mid; else hi = mid; }
    const e = at(lo), te = th - lo, sn = Math.sin(te);
    if (sn > -1e-6 || e[0] * E2[0] + e[1] * E2[1] <= 0) return null;
    const pts = [S, P];
    for (let i = 1; i <= 40; i++) { const q = at(lo * i / 40); pts.push([q[0], q[1]]); }
    pts.push([e[0] - e[1] / sn * Math.cos(te), 0]);
    return pts;
  }
  const landing = (g, id, m, B, a) => {
    if (id === "180") return g.SX + land180(g, m, B, a);
    const q = trace60(g, m, B, a);
    return q ? g.SX + g.D / 2 + q[q.length - 1][0] : -1e9;
  };
  const el = (tag, attrs, parent) => U.svg(tag, attrs, parent);
  const label = (txt, parent) => { const l = document.createElement("label"); l.textContent = txt; parent.appendChild(l); return l; };
  const txt = (parent, x, y, s, anchor, size) => { const t = el("text", { x, y, fill: "currentColor", "font-size": size || 16, "text-anchor": anchor || "start" }, parent); t.textContent = s; return t; };

  function settore(host) {
    const img = host.querySelector("img");
    if (!img || host.dataset.live) return;
    host.dataset.live = "1";
    const ids = (host.dataset.geom || "180").split(",").filter(k => GEOM[k]);
    const st = { id: ids[0], pair: PAIRS[0], p: 1, scan: 1, spec: null };
    const gg = () => GEOM[st.id];
    st.B = Bcentre(gg(), 20);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": gg().aria, style: "width:100%;height:auto;color:var(--ink,#24231f)" });
    const stage = el("g", {}, svg), rays = el("g", { fill: "none" }, svg), dots = el("g", {}, svg);
    const key = el("text", { x: 650, y: 40, "text-anchor": "end", fill: "currentColor", "font-size": 16 }, svg);
    // spectrum panel
    const PX = 60, PW = 600, PY = 440, PH = 90;
    el("path", { d: `M${PX} ${PY}H${PX + PW}M${PX} ${PY}V${PY - PH}`, stroke: "currentColor", "stroke-width": 1.4, fill: "none" }, svg);
    txt(svg, PX + PW, PY + 44, "campo B (unità relative) →", "end");
    txt(svg, PX + 4, PY - PH - 8, "corrente allo strumento");
    const trace = el("path", { fill: "none", stroke: "currentColor", "stroke-width": 2 }, svg);
    const cursor = el("path", { stroke: "currentColor", "stroke-width": 1.4, "stroke-dasharray": "4 3" }, svg);
    const tags = el("g", {}, svg);
    const bx = B => PX + (B - BMIN) / (BMAX - BMIN) * PW;

    const build = () => {                                                       // magnet, slits and labels of the current geometry
      const g = gg();
      stage.textContent = "";
      svg.setAttribute("aria-label", g.aria);
      const inside = [];
      if (st.id === "180") {
        el("rect", { x: 60, y: 20, width: 600, height: 240, fill: "currentColor", "fill-opacity": ".07", stroke: "currentColor", "stroke-width": 1.4 }, stage);
        for (let x = 90; x < 660; x += 60) for (let y = 50; y < 260; y += 50) inside.push([x, y]);
      } else {
        const vx = g.SX + g.D / 2, L = 160, pt = e => `${(vx + L * e[0]).toFixed(1)} ${(SY - L * e[1]).toFixed(1)}`;
        el("path", { d: `M${vx} ${SY}L${pt(E1)}A${L} ${L} 0 0 1 ${pt(E2)}Z`, fill: "currentColor", "fill-opacity": ".07", stroke: "currentColor", "stroke-width": 1.4 }, stage);
        for (let x = vx - 90; x <= vx + 90; x += 36) for (let y = SY - 30; y > SY - 150; y -= 36) {
          const dx = (x - vx) / (SY - y);
          if (Math.abs(dx) < 0.5 && Math.hypot(x - vx, SY - y) < 140) inside.push([x, y]);
        }
      }
      inside.forEach(([x, y]) => { el("circle", { cx: x, cy: y, r: 3, fill: "none", stroke: "currentColor", "stroke-width": 1 }, stage); el("circle", { cx: x, cy: y, r: 1, fill: "currentColor" }, stage); });
      txt(stage, st.id === "180" ? 70 : 40, st.id === "180" ? 40 : 40, "magnete: B uscente dal foglio");
      el("path", { d: `M${g.SX - 50} ${SY}H${g.SX - 6}M${g.SX + 6} ${SY}H${g.SX + g.D - 6}M${g.SX + g.D + 6} ${SY}H${g.SX + g.D + 50}`, stroke: "currentColor", "stroke-width": 3 }, stage);
      txt(stage, g.SX, SY + 24, "fenditura S", "middle");
      txt(stage, g.SX + g.D, SY + 24, "rivelatore", "middle");
      if (st.id === "60") txt(stage, g.SX + g.D / 2, SY + 24, "vertice", "middle");
    };
    const spectrum = () => {
      if (st.spec && st.spec.k === st.id + st.pair.id) return st.spec.v;
      const g = gg(), an = angles(g), pts = [], tgt = g.SX + g.D;
      for (let i = 0; i <= 200; i++) {
        const B = BMIN + (BMAX - BMIN) * i / 200;
        const y = st.pair.m.reduce((s, m, k) => s + st.pair.ab[k] * an.filter(a => Math.abs(landing(g, st.id, m, B, a) - tgt) <= SLIT).length / NRAY, 0);
        pts.push([bx(B), PY - y * PH, B]);
      }
      st.spec = { k: st.id + st.pair.id, v: pts };
      return pts;
    };
    const ray = (m, B, a, p) => {                                               // SVG path d of one ion, drawn up to the fraction p of its length
      const g = gg();
      if (st.id === "180") {
        const r = radius(g, m, B), cx = g.SX + r * Math.cos(a), cy = SY + r * Math.sin(a), tot = Math.PI - 2 * a, up = Math.max(0.0001, p * tot);
        let d = "";
        for (let i = 0; i <= 60; i++) { const u = up * i / 60, x = cx - r * Math.cos(a + u), y = cy - r * Math.sin(a + u); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
        return d;
      }
      const q = trace60(g, m, B, a);
      if (!q) return "";
      const vx = g.SX + g.D / 2, len = [0];
      for (let i = 1; i < q.length; i++) len.push(len[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]));
      const lim = Math.max(1, p * len[len.length - 1]);
      let d = "";
      for (let i = 0; i < q.length && len[i] <= lim; i++) d += (i ? "L" : "M") + (vx + q[i][0]).toFixed(1) + " " + (SY - q[i][1]).toFixed(1);
      return d;
    };
    const draw = () => {
      const g = gg(), { m, sym } = st.pair, B = st.B;
      key.textContent = sym[0] + " linea piena · " + sym[1] + " tratteggio";
      rays.textContent = ""; dots.textContent = "";
      const pick = [-g.A, 0, g.A];
      m.forEach((mm, k) => {
        const dash = k ? "8 5" : "none", col = k ? "var(--accent2,#9a3412)" : "var(--accent,#1f4e7e)";
        pick.forEach(a => el("path", { d: ray(mm, B, a, st.p), stroke: col, "stroke-width": a === 0 ? 2.4 : 1.4, "stroke-dasharray": dash }, rays));
      });
      const pts = spectrum(), keep = pts.filter(q => q[2] <= BMIN + (BMAX - BMIN) * st.scan + 1e-9);
      trace.setAttribute("d", keep.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(""));
      cursor.setAttribute("d", `M${bx(B).toFixed(1)} ${PY}V${PY - PH - 4}`);
      tags.textContent = "";
      m.forEach((mm, k) => txt(tags, bx(Bcentre(g, mm)), PY + 20, sym[k], "middle"));
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
      r.type = "radio"; r.name = host.id + "-coppia"; r.checked = !i;
      r.addEventListener("change", () => { st.pair = pr; st.B = Bcentre(gg(), pr.m[0]); slider.value = st.B; st.p = 1; st.scan = 1; sync(); draw(); });
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
    geo.className = "note";
    const setGeo = () => { geo.textContent = "Geometria: " + gg().label + "."; };
    if (ids.length > 1) {
      const gf = document.createElement("fieldset");
      gf.style.cssText = "border:0;padding:0;margin:0";
      const gl = document.createElement("legend"); gl.textContent = "Geometria"; gl.className = "sr-only"; gl.style.cssText = "position:absolute;left:-9999px";
      gf.appendChild(gl);
      ids.forEach((k, i) => {
        const l = document.createElement("label"), r = document.createElement("input");
        r.type = "radio"; r.name = host.id + "-geom"; r.checked = !i;
        r.addEventListener("change", () => { st.id = k; st.B = Bcentre(gg(), st.pair.m[0]); slider.value = st.B; st.p = 1; st.scan = 1; sync(); setGeo(); build(); draw(); });
        l.append(r, " " + GEOM[k].label + "  ");
        gf.appendChild(l);
      });
      ui.insertBefore(gf, ui.firstChild);
    }
    const wrap = document.createElement("div");
    img.replaceWith(svg);
    host.appendChild(ui);
    host.appendChild(geo);
    host.appendChild(wrap);
    const home = () => { st.B = Bcentre(gg(), st.pair.m[0]); st.scan = 0; slider.value = st.B; sync(); };   // steps 1-3: B puts the first mass on the detector
    const sixty = () => st.id === "60";
    const steps = [
      { get label() { return "gli ioni partono dalla fenditura con la stessa energia"; }, draw: t => { home(); st.p = 0.12 + 0.18 * t; draw(); } },
      { get label() { return "il campo magnetico li piega su archi di raggio proporzionale a √m"; }, draw: t => { home(); st.p = 0.3 + 0.4 * t; draw(); } },
      { get label() { return sixty() ? "dopo 60° i raggi divergenti si ritrovano quasi nello stesso punto" : "dopo mezzo giro i raggi divergenti si ritrovano quasi nello stesso punto"; }, draw: t => { home(); st.p = 0.7 + 0.3 * t; draw(); } },
      { get label() { return "variando B, ogni massa a turno cade sul rivelatore e dà un picco di corrente"; }, draw: t => { st.p = 1; st.scan = t; st.B = BMIN + (BMAX - BMIN) * t; draw(); slider.value = st.B; sync(); } },
    ];
    setGeo(); build();
    U.player(wrap, { steps });
    st.p = 1; st.scan = 1; st.B = Bcentre(gg(), st.pair.m[0]); slider.value = st.B; sync(); draw();   // paused on the complete picture
  }

  // ---- double focusing: first-order optics of sectors (state = x, angle, relative energy deviation) ----
  const SQ2 = Math.SQRT2;
  const MASS = { mh: [1, Math.sqrt(1.4)], nj: [1] };                             // orbit radius factors (sqrt of mass ratio)
  const L = (t, o) => Object.assign({ t }, o);
  const mel = (e, u) => {                                                        // matrix of an element up to the fraction u of its length
    if (e.t === "d") return [[1, e.L * u, 0], [0, 1, 0], [0, 0, 1]];
    if (e.t === "g") return [[1, 0, 0], [e.q, 1, 0], [0, 0, 1]];                // thin edge lens
    const k = e.t === "e" ? SQ2 : 1, r = e.r, c = Math.cos(k * e.phi * u), s = Math.sin(k * e.phi * u);
    return e.t === "e" ? [[c, r / k * s, r / 2 * (1 - c)], [-k / r * s, c, s / k], [0, 0, 1]] : [[c, r * s, r * (1 - c) / 2], [-s / r, c, s / 2], [0, 0, 1]];
  };
  const app = (M, v) => M.map(row => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
  const mul = (A, B) => A.map(row => [0, 1, 2].map(j => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
  const total = els => els.reduce((M, e) => mul(mel(e, 1), M), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  // r > 0 bends to the right; the electric sector can be replaced by a straight drift of the same length
  function elements(geo, esa, f) {
    const e = esa ? L("e", { phi: geo === "mh" ? Math.PI / (4 * SQ2) : Math.PI / 2, r: 1 }) : L("d", { L: geo === "mh" ? Math.PI / (4 * SQ2) : Math.PI / 2 });
    const els = geo === "mh"
      ? [L("d", { L: 1 / SQ2 }), e, L("d", { L: 1.6 }), L("g", { q: 2 / (1.25 * f) }), L("b", { phi: Math.PI / 2, r: -1.25 * f })]
      : [L("d", { L: 0.2 }), e, L("d", { L: 2.38326367 }), L("b", { phi: Math.PI / 3, r: 1.2 })];
    const M = total(els);
    els.push(L("d", { L: -M[0][1] / M[1][1] }));                                  // image distance: angular focus
    return els;
  }
  function layout(els) {                                                         // central path: samples {X, Y, th, k, u, len}
    let X = 0, Y = 0, th = 0, len = 0;
    const s = [], ends = [];
    els.forEach((e, k) => {
      if (e.t === "g") { ends.push(len); return; }
      const n = e.t === "d" ? 1 : 28, arc = e.t === "d" ? e.L : e.phi * Math.abs(e.r), x0 = X, y0 = Y, t0 = th, rr = e.r;
      for (let i = k === 0 ? 0 : 1; i <= n; i++) {
        const u = i / n;
        if (e.t === "d") { X = x0 + e.L * u * Math.cos(t0); Y = y0 + e.L * u * Math.sin(t0); th = t0; }
        else { const sg = rr > 0 ? 1 : -1, q = t0 - sg * e.phi * u; th = q; X = x0 + rr * (Math.sin(t0) - Math.sin(q)); Y = y0 + rr * (Math.cos(q) - Math.cos(t0)); }
        s.push({ X, Y, th, k, u, len: len + arc * u });
      }
      len += arc; ends.push(len);
    });
    return { s, ends, total: len };
  }
  function doppia(host) {
    const img = host.querySelector("img");
    if (!img || host.dataset.live) return;
    host.dataset.live = "1";
    const st = { geo: host.dataset.geo === "mh" ? "mh" : "nj", esa: true, dE: 0.04, p: 1 }, A = 0.03, WS = 0.004;
    const aria = { nj: "Doppia focalizzazione di Nier e Johnson: settore elettrico di 90 gradi e magnete di 60 gradi portano i raggi in un punto", mh: "Doppia focalizzazione di Mattauch e Herzog: settore elettrico di 31,8 gradi e magnete di 90 gradi portano le masse su un piano" };
    const svg = el("svg", { viewBox: "0 0 720 430", role: "img", style: "width:100%;height:auto;color:var(--ink,#24231f)" }, null);
    const gS = el("g", {}, svg), gR = el("g", { fill: "none" }, svg);
    const fmt = x => x.toFixed(1).replace(".", ",");
    const spot = (els, d) => { const M = total(els); return { ratio: 1 + Math.abs(M[0][2]) * d / (Math.abs(M[0][0]) * WS) }; };
    const draw = () => {
      const geo = st.geo, fs = MASS[geo];
      svg.setAttribute("aria-label", aria[geo]);
      gS.textContent = ""; gR.textContent = "";
      const sets = fs.map(f => { const els = elements(geo, st.esa, f); return { f, els, lay: layout(els) }; });
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      sets.forEach(q => q.lay.s.forEach(c => { x0 = Math.min(x0, c.X); x1 = Math.max(x1, c.X); y0 = Math.min(y0, c.Y); y1 = Math.max(y1, c.Y); }));
      const sc = Math.min(600 / (x1 - x0 || 1), 300 / (y1 - y0 || 1)), ox = 60 - x0 * sc + (600 - (x1 - x0) * sc) / 2, oy = 30 + y1 * sc + (300 - (y1 - y0) * sc) / 2;
      const T = (X, Y) => [(ox + X * sc).toFixed(1), (oy - Y * sc).toFixed(1)];
      const off = (c, x) => T(c.X - x * Math.sin(c.th), c.Y + x * Math.cos(c.th));
      const q0 = sets[0], band = (q, k, hw, fill) => {
        const a = q.lay.s.filter(c => c.k === k).map(c => off(c, hw)), b = q.lay.s.filter(c => c.k === k).map(c => off(c, -hw)).reverse();
        if (fill) el("path", { d: "M" + a.concat(b).map(p => p.join(" ")).join("L") + "Z", fill: "currentColor", "fill-opacity": ".08", stroke: "currentColor", "stroke-width": 1.2 }, gS);
        else [a, b].forEach(l => el("path", { d: "M" + l.map(p => p.join(" ")).join("L"), stroke: "currentColor", "stroke-width": 3, fill: "none" }, gS));
      };
      sets.forEach(q => q.els.forEach((e, k) => { if (e.t === "b") band(q, k, 0.5, true); }));
      if (st.esa) band(q0, 1, 0.1, false);
      const first = q0.lay.s[0], p0 = T(first.X, first.Y), ek = q0.els.findIndex(e => e.t === "b");
      el("rect", { x: +p0[0] - 30, y: +p0[1] - 14, width: 30, height: 28, fill: "currentColor", "fill-opacity": ".1", stroke: "currentColor", "stroke-width": 1.4 }, gS);
      txt(gS, +p0[0] - 30, +p0[1] + 36, "sorgente", "start", 20);
      const mid = (q, k) => q.lay.s.filter(c => c.k === k)[14];
      const lab = (q, k, s, dx, dy) => { const c = mid(q, k), p = T(c.X, c.Y); txt(gS, +p[0] + dx, +p[1] + dy, s, "start", 20); };
      if (st.esa) lab(q0, 1, "settore elettrostatico", 16, -10);
      lab(sets[sets.length - 1], ek, "magnete (B entrante)", -60, 74);
      const ends = sets.map(q => { const c = q.lay.s[q.lay.s.length - 1], x = [c.X, c.Y]; return T(x[0], x[1]); });
      if (geo === "mh") { el("path", { d: `M${ends[0].join(" ")}L${ends[1].join(" ")}`, stroke: "currentColor", "stroke-width": 1.4, "stroke-dasharray": "3 4" }, gS); txt(gS, +ends[1][0] - 8, +ends[1][1] - 12, "piano focale", "end", 20); }
      else txt(gS, +ends[0][0] + 12, +ends[0][1] + 6, "fuoco a punto", "start", 20);
      ends.forEach(e => el("circle", { cx: e[0], cy: e[1], r: 5, fill: "none", stroke: "currentColor", "stroke-width": 1.6 }, gS));
      const bundle = [[0, 0, 0], [0, A, 0], [0, -A, 0], [0, 0, st.dE], [0, 0, -st.dE]];
      sets.forEach((q, qi) => {
        const col = qi ? "var(--accent2,#9a3412)" : "var(--accent,#1f4e7e)", lim = q.lay.total * st.p;
        bundle.forEach((v0, bi) => {
          const vs = [v0];
          q.els.forEach(e => vs.push(app(mel(e, 1), vs[vs.length - 1])));
          let d = "", n = 0;
          q.lay.s.forEach(c => { if (c.len > lim + 1e-9) return; const st1 = app(mel(q.els[c.k], c.u), vs[c.k]), p = off(c, st1[0]); d += (n++ ? "L" : "M") + p.join(" "); });
          el("path", { d, stroke: col, "stroke-width": bi ? 1.3 : 2.4, "stroke-dasharray": qi ? "8 5" : "none" }, gR);
        });
      });
      const w = spot(sets[0].els, st.dE).ratio, wo = spot(elements(geo, !st.esa, fs[0]), st.dE).ratio;
      out.textContent = `Larghezza della macchia, in volte la fenditura: con settore elettrostatico ${fmt(st.esa ? w : wo)}×, senza ${fmt(st.esa ? wo : w)}×.`;
      hint.textContent = geo === "mh" ? "Massa leggera linea piena, massa pesante tratteggio. Scarti rispetto al raggio centrale in scala." : "Un solo valore di massa a fuoco. Scarti rispetto al raggio centrale in scala.";
    };
    const ui = document.createElement("div");
    ui.className = "storia-comandi";
    const sel = document.createElement("select"), ls = label("Geometria ", ui);
    [["nj", "Nier-Johnson (punto)"], ["mh", "Mattauch-Herzog (piano focale)"]].forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; sel.appendChild(o); });
    sel.value = st.geo;
    sel.addEventListener("change", () => { st.geo = sel.value; st.p = 1; draw(); });
    ls.appendChild(sel);
    const lc = document.createElement("label"), cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = true;
    cb.addEventListener("change", () => { st.esa = cb.checked; st.p = 1; draw(); });
    lc.append(cb, " con settore elettrostatico");
    ui.appendChild(lc);
    const le = label("Dispersione di energia ", ui), sl = document.createElement("input"), ov = document.createElement("output");
    sl.type = "range"; sl.min = 0; sl.max = 0.08; sl.step = 0.005; sl.value = st.dE;
    sl.setAttribute("aria-label", "Dispersione relativa di energia degli ioni");
    const sync = () => { ov.textContent = " " + (st.dE * 100).toFixed(1).replace(".", ",") + "%"; };
    sl.addEventListener("input", () => { st.dE = +sl.value; st.p = 1; sync(); draw(); });
    le.append(sl, ov);
    const out = document.createElement("p"), hint = document.createElement("p"), wrap = document.createElement("div");
    out.className = "note"; out.setAttribute("aria-live", "polite");
    hint.className = "note";
    img.replaceWith(svg);
    host.append(ui, out, hint, wrap);
    const frac = k => { const lay = layout(elements(st.geo, st.esa, 1)); return lay.ends[k] / lay.total; };
    const bi = () => elements(st.geo, st.esa, 1).findIndex(e => e.t === "b");
    const seg = (a, b, t) => a + (b - a) * t;
    U.player(wrap, { steps: [
      { get label() { return "gli ioni lasciano la fenditura con direzioni ed energie un po' diverse"; }, draw: t => { st.p = seg(0.01, frac(0), t); draw(); } },
      { get label() { return st.esa ? "il settore elettrostatico piega gli ioni in base all'energia: più energia, curva più larga" : "senza settore elettrostatico gli ioni proseguono dritti, con le loro energie diverse"; }, draw: t => { st.p = seg(frac(0), frac(1), t); draw(); } },
      { get label() { return "il magnete li piega in base alla quantità di moto e, con il settore elettrostatico, compensa la dispersione di energia"; }, draw: t => { st.p = seg(frac(1), frac(bi()), t); draw(); } },
      { get label() { return "all'uscita i raggi formano la macchia dell'immagine: " + out.textContent.replace(/^Larghezza della macchia, in volte la fenditura: /, ""); }, draw: t => { st.p = seg(frac(bi()), 1, t); draw(); } },
    ] });
    st.p = 1; sync(); draw();                                                     // paused on the complete picture
  }

  const BLOCKS = { "sf-settore": settore, "sf-doppia": doppia };
  Object.keys(BLOCKS).forEach(id => { const h = document.getElementById(id); if (h) BLOCKS[id](h); });
})();
