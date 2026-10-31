// Figure file for chapter pages: owned by DEV-CHEMI-02 (sim-chemi-xic, sim-chemi-roi). Synthetic data only.
"use strict";
(function () {
  const C = CHEMI, F = C.fn;

  // ---------------------------------------------------------------- pure functions (tested in node)
  /** Half-width of an extraction window in Da: m * tol * 1e-6. */
  F.halfWidth = (mz, ppm) => mz * ppm * 1e-6;
  /** Resolving power needed to separate two masses: R = m / delta m (m = their mean). */
  F.minR = (m1, m2) => ((m1 + m2) / 2) / Math.abs(m1 - m2);
  /** True when the two ions are farther apart than the half-width of the window around m1. */
  F.apart = (m1, m2, ppm) => Math.abs(m1 - m2) > F.halfWidth(m1, ppm);
  /** XIC of the window m +- tol: scans = [{mz:[], i:[]}], mode "sum" or "max". */
  F.xic = (scans, m, ppm, mode) => {
    const w = F.halfWidth(m, ppm);
    return scans.map(s => {
      let v = 0;
      for (let k = 0; k < s.mz.length; k++) if (Math.abs(s.mz[k] - m) <= w) v = mode === "max" ? Math.max(v, s.i[k]) : v + s.i[k];
      return v;
    });
  };

  /** ROI builder, simplified first stage of centWave. o = {ppm, gap, minScans, k, imin}. One scan = [[mz, I], ...]; the most intense centroid picks first, the closest open ROI within the tolerance. */
  F.roiNew = o => ({ o, rois: [], pos: 0 });
  F.roiStep = (st, cents) => {
    const o = st.o, s = st.pos++, open = st.rois.filter(r => !r.closed), usedC = {}, usedR = {};
    cents.map((c, ci) => ci).sort((a, b) => cents[b][1] - cents[a][1] || cents[a][0] - cents[b][0]).forEach(ci => {
      const c = cents[ci]; let best = -1, bd = Infinity;
      open.forEach((r, ri) => {
        const d = Math.abs(c[0] - r.mean);
        if (!usedR[ri] && d <= r.mean * o.ppm * 1e-6 && d < bd) { bd = d; best = ri; }
      });
      if (best < 0) return;
      usedC[ci] = usedR[best] = 1;
      const r = open[best];
      r.pts.push({ s, mz: c[0], i: c[1] }); r.sw += c[0] * c[1]; r.si += c[1]; r.mean = r.sw / r.si; r.last = s;
    });
    open.forEach((r, ri) => { if (!usedR[ri] && s - r.last > o.gap) r.closed = true; });
    cents.forEach((c, ci) => {
      if (usedC[ci]) return;
      st.rois.push({ id: st.rois.length + 1, pts: [{ s, mz: c[0], i: c[1] }], mean: c[0], sw: c[0] * c[1], si: c[1], last: s, closed: false });
    });
    return st;
  };
  F.roiRun = (scans, o, upto) => {
    const st = F.roiNew(o);
    for (let s = 0; s < Math.min(upto, scans.length); s++) F.roiStep(st, scans[s]);
    return st;
  };
  /** Keep a ROI if it has at least minScans points and at least k points with I >= imin; the reason is in Italian. */
  F.roiVerdict = (r, o) => {
    const n = r.pts.length, hi = r.pts.filter(p => p.i >= o.imin).length;
    if (n < o.minScans) return { keep: false, why: `${n} ${n === 1 ? "scansione" : "scansioni"} < ${o.minScans}` };
    if (hi < o.k) return { keep: false, why: `${hi} ${hi === 1 ? "scansione" : "scansioni"} con I ≥ ${o.imin}, ne servono ${o.k}` };
    return { keep: true, why: `${n} scansioni, ${hi} con I ≥ ${o.imin}` };
  };
  F.roiBuild = (scans, o) => F.roiRun(scans, o, scans.length).rois;
  /** Fixed-bin alternative (matchedFilter): bin index of an m/z and the XIC of each bin (max per scan). */
  F.binOf = (mz, size) => Math.floor(mz / size);
  F.binXic = (scans, size) => {
    const out = {};
    scans.forEach((s, j) => s.mz.forEach((m, k) => {
      const b = F.binOf(m, size), a = out[b] || (out[b] = new Array(scans.length).fill(0));
      a[j] = Math.max(a[j], s.i[k]);
    }));
    return out;
  };

  /** Draws that do not depend on the controls, so a slider moves the same points instead of reshuffling them. */
  const base = (seed, n, k) => {
    const r = C.rng(seed), o = { zt: [], zx: [], ut: [], noise: [] };
    for (let j = 0; j < n; j++) {
      o.zt.push(C.normal(r)); o.zx.push(C.normal(r)); o.ut.push(1 + 0.05 * C.normal(r));
      const a = [];
      for (let q = 0; q < k; q++) a.push([(r() * 2 - 1) * 80, 500 + 2500 * r()]);
      o.noise.push(a);
    }
    return o;
  };
  const M0 = 300.1234;
  /** Scans of the XIC figure: target at M0 plus an isobar isoPpm away. p = {seed, sd, idep, isoPpm, isoRel, R}. */
  F.xicScans = p => {
    const n = 40, b = base(p.seed, n, 2), H = 1e5, scans = [], truth = [];
    for (let j = 0; j < n; j++) {
      const rt = 4 + j * 0.05, it = H * b.ut[j] * C.gauss(rt, 5, 0.12), ix = H * p.isoRel / 100 * b.ut[j] * C.gauss(rt, 5.04, 0.12);
      const sdOf = i => p.sd * (p.idep ? Math.min(4, Math.sqrt(H / Math.max(i, 1))) : 1);
      const mt = M0 * (1 + sdOf(it) * b.zt[j] * 1e-6), mx = M0 * (1 + (p.isoPpm + sdOf(ix) * b.zx[j]) * 1e-6);
      const cs = [];
      if (it > 300 || ix > 300) {
        if (it > 300 && ix > 300 && Math.abs(M0 * p.isoPpm * 1e-6) < M0 / p.R) cs.push({ mz: (mt * it + mx * ix) / (it + ix), i: it + ix, t: it, x: ix, tag: "m" });
        else {
          if (it > 300) cs.push({ mz: mt, i: it, t: it, x: 0, tag: "t" });
          if (ix > 300) cs.push({ mz: mx, i: ix, t: 0, x: ix, tag: "x" });
        }
      }
      b.noise[j].forEach(q => cs.push({ mz: M0 * (1 + q[0] * 1e-6), i: q[1], t: 0, x: 0, tag: "n" }));
      scans.push({ rt, mz: cs.map(c => c.mz), i: cs.map(c => c.i), c: cs }); truth.push(it);
    }
    return { scans, truth };
  };
  /** Areas relative to the true area of the target: recovered target, isobar included, whole XIC. */
  F.xicAreas = (d, ppm) => {
    const w = F.halfWidth(M0, ppm), tot = d.truth.reduce((a, v) => a + v, 0);
    let t = 0, x = 0, all = 0;
    d.scans.forEach(s => s.c.forEach(c => { if (Math.abs(c.mz - M0) <= w) { t += c.t; x += c.x; all += c.i; } }));
    return { rec: t / tot, iso: x / tot, xic: all / tot, tot };
  };

  /** Scans of the ROI figure: 40 scans of a narrow m/z slice (299.97-300.03): one strong, one weak and noisy trace, a near-isobar pair, noise centroids. */
  const REF = 300, TR = [[-30, 2, 20, 5, 8000, 0], [35, 5, 22, 4.5, 260, 1], [5, 2, 24, 5, 3000, 0], [15, 2, 25, 4, 1500, 0]];
  F.roiScans = seed => {
    const r = C.rng(seed), scans = [];
    for (let s = 0; s < 40; s++) {
      const cs = [];
      TR.forEach(([ppm, sd, c0, w, h, weak]) => {
        let i = h * C.gauss(s, c0, w);
        const z = C.normal(r), u = r(), v = r();
        if (weak) i *= 0.4 + 1.2 * v;
        if (i >= 30 && (!weak || u < 0.8)) cs.push([REF * (1 + (ppm + sd * z) * 1e-6), i]);
      });
      if (r() < 0.5) cs.push([REF * (1 + (r() * 2 - 1) * 100e-6), 20 + 60 * r()]);
      scans.push(cs.sort((a, b) => a[0] - b[0]));
    }
    return scans;
  };

  // ---------------------------------------------------------------- drawing helpers (theme colours, text readable in dark mode)
  const cv = () => { const s = getComputedStyle(document.documentElement), g = n => s.getPropertyValue(n).trim(); return { ink: g("--ink"), mu: g("--muted"), ln: g("--line"), c1: g("--c1"), c2: g("--c2"), c3: g("--c3"), c4: g("--c4"), pn: g("--panel") }; };
  const frame = (c, o) => {
    const { ctx, W, H } = c, k = cv(), m = Object.assign({ l: 58, r: 12, t: 10, b: 34 }, o.m || {});
    const X = v => m.l + (v - o.x0) / (o.x1 - o.x0) * (W - m.l - m.r), Y = v => H - m.b - (v - o.y0) / (o.y1 - o.y0) * (H - m.t - m.b);
    ctx.clearRect(0, 0, W, H); ctx.font = "12px system-ui,sans-serif"; ctx.lineWidth = 1;
    const aria = "Grafico: " + (c.cv.dataset.title || "") + ". Asse orizzontale: " + o.xl + ". Asse verticale: " + o.yl + ". I numeri sono nella tabella sotto la figura.";
    c.cv.setAttribute("aria-label", aria);
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    TP.nice(o.x0, o.x1, Math.max(3, Math.floor((W - m.l - m.r) / 80))).forEach(v => {
      ctx.strokeStyle = k.ln; ctx.beginPath(); ctx.moveTo(X(v), m.t); ctx.lineTo(X(v), H - m.b); ctx.stroke();
      ctx.fillStyle = k.mu; ctx.fillText(o.xf ? o.xf(v) : +v.toFixed(6), X(v), H - m.b + 4);
    });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    TP.nice(o.y0, o.y1, Math.max(3, Math.floor((H - m.t - m.b) / 40))).forEach(v => {
      ctx.strokeStyle = k.ln; ctx.beginPath(); ctx.moveTo(m.l, Y(v)); ctx.lineTo(W - m.r, Y(v)); ctx.stroke();
      ctx.fillStyle = k.mu; ctx.fillText(o.yf ? o.yf(v) : +v.toFixed(6), m.l - 5, Y(v));
    });
    ctx.strokeStyle = k.mu; ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, H - m.b); ctx.lineTo(W - m.r, H - m.b); ctx.stroke();
    ctx.fillStyle = k.ink; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(o.xl, m.l + (W - m.l - m.r) / 2, H - 1);
    ctx.save(); ctx.translate(12, m.t + (H - m.t - m.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore();
    return { ctx, X, Y, m, W, H, k, clip() { ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, W - m.l - m.r, H - m.t - m.b); ctx.clip(); } };
  };
  const mark = (ctx, shape, x, y, r, fill, col) => {
    ctx.beginPath();
    if (shape === "c") ctx.arc(x, y, r, 0, 7);
    else if (shape === "t") { ctx.moveTo(x, y - r - 1); ctx.lineTo(x + r + 1, y + r); ctx.lineTo(x - r - 1, y + r); ctx.closePath(); }
    else if (shape === "d") { ctx.moveTo(x, y - r - 1); ctx.lineTo(x + r + 1, y); ctx.lineTo(x, y + r + 1); ctx.lineTo(x - r - 1, y); ctx.closePath(); }
    else { ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); }
    ctx.strokeStyle = col; ctx.lineWidth = 1.6; if (fill && shape !== "+") { ctx.fillStyle = col; ctx.fill(); } ctx.stroke();
  };
  const button = (el, txt, fn) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.onclick = fn;
    let box = el.querySelector(":scope > .btns.act"); if (!box) { box = document.createElement("div"); box.className = "btns act"; box.setAttribute("role", "group"); el.appendChild(box); }
    box.appendChild(b); return b;
  };
  const legend = (c, txt) => {
    let p = c.cv.nextElementSibling;
    if (!p || !p.classList.contains("leg")) { p = document.createElement("p"); p.className = "note leg"; c.cv.after(p); }
    p.textContent = txt;
  };
  const debounced = fn => { let t = 0; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), 150); }; };
  const it = (x, d) => C.fmtIt(x, d);

  // ---------------------------------------------------------------- figure 24.1: the window in ppm
  C.register("sim-chemi-xic", el => {
    let seed = 7;
    const v = TP.controls(el, [
      { id: "w", label: "Finestra di estrazione (±)", min: -0.3, max: 1.7, step: 0.01, value: 0.7, fmt: x => it(10 ** x, 1), unit: "ppm" },
      { id: "sd", label: "Dispersione dello strumento (SD)", min: 0.5, max: 10, step: 0.5, value: 2, fmt: x => it(x, 1), unit: "ppm" },
      { id: "idep", label: "Dispersione che cresce al calare dell'intensità", value: 0, options: [[0, "no"], [1, "sì"]] },
      { id: "d", label: "Distanza dell'isobaro", min: 1, max: 50, step: 1, value: 12, unit: "ppm" },
      { id: "rel", label: "Intensità dell'isobaro (% del bersaglio)", min: 10, max: 200, step: 5, value: 40, unit: "%" },
      { id: "R", label: "Potere risolutivo dello strumento", value: 120000, options: [[10000, "10 000"], [30000, "30 000"], [60000, "60 000"], [120000, "120 000"], [240000, "240 000"]] },
    ], () => draw());
    button(el, "Nuovi dati", () => { seed = seed % 97 + 7; draw(); });
    const c1 = TP.canvas(el, 250), c2 = TP.canvas(el, 170);
    c1.onresize = c2.onresize = () => draw();
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    const say = debounced(t => { out.textContent = t; });
    function draw() {
      const ppm = 10 ** v.w, d = F.xicScans({ seed, sd: v.sd, idep: v.idep, isoPpm: v.d, isoRel: v.rel, R: v.R }), A = F.xicAreas(d, ppm);
      const lim = Math.max(25, Math.ceil(Math.max(ppm * 1.3, v.d * 1.3, 4 * v.sd) / 5) * 5);
      let a = frame(c1, { x0: 4, x1: 6, y0: -lim, y1: lim, xl: "tempo di ritenzione (min)", yl: "scarto di m/z (ppm)", m: { l: 50 } });
      a.ctx.fillStyle = a.k.c1; a.ctx.globalAlpha = 0.14; a.ctx.fillRect(a.X(4), a.Y(ppm), a.X(6) - a.X(4), a.Y(-ppm) - a.Y(ppm)); a.ctx.globalAlpha = 1;
      a.ctx.save(); a.ctx.strokeStyle = a.k.c1; a.ctx.lineWidth = 1.6; a.ctx.setLineDash([6, 4]);
      [ppm, -ppm].forEach(y => { a.ctx.beginPath(); a.ctx.moveTo(a.X(4), a.Y(y)); a.ctx.lineTo(a.X(6), a.Y(y)); a.ctx.stroke(); }); a.ctx.restore();
      a.clip();
      d.scans.forEach(s => s.c.forEach(c => {
        const p = (c.mz - M0) / M0 * 1e6, inn = Math.abs(p) <= ppm;
        mark(a.ctx, { t: "c", x: "t", m: "d", n: "+" }[c.tag], a.X(s.rt), a.Y(p), 3.2, inn, c.tag === "x" ? a.k.c2 : c.tag === "n" ? a.k.mu : a.k.ink);
      }));
      a.ctx.restore();
      legend(c1, "Simboli: ○ ● bersaglio, △ ▲ isobaro, ◇ ◆ uniti (non risolti), + rumore; pieno = dentro la finestra.");
      const x = F.xic(d.scans, M0, ppm, "sum"), ym = Math.max(...x, ...d.truth);
      a = frame(c2, { x0: 4, x1: 6, y0: 0, y1: ym * 1.08, xl: "tempo di ritenzione (min)", yl: "intensità XIC", yf: q => it(q / 1000, 0) + " k", m: { l: 50 } });
      a.clip();
      const ts = d.scans.map(s => s.rt);
      const ln = (ys, col, dash, w) => { a.ctx.beginPath(); ys.forEach((q, j) => j ? a.ctx.lineTo(a.X(ts[j]), a.Y(q)) : a.ctx.moveTo(a.X(ts[j]), a.Y(q))); a.ctx.strokeStyle = col; a.ctx.lineWidth = w; a.ctx.setLineDash(dash); a.ctx.stroke(); a.ctx.setLineDash([]); };
      ln(d.truth, a.k.mu, [6, 4], 1.8); ln(x, a.k.ink, [], 2.4);
      a.ctx.restore();
      legend(c2, "Linea continua: XIC della finestra; tratteggio: segnale vero del bersaglio.");
      const inc = A.iso >= 0.01, unres = d.scans.some(s => s.c.some(c => c.tag === "m"));
      say(`Finestra ±${it(ppm, 1)} ppm = ±${it(F.halfWidth(M0, ppm) * 1000, 2)} mDa. Area recuperata ${Math.round(A.rec * 100)} %, isobaro incluso: ${inc ? "sì (+" + Math.round(A.iso * 100) + " %)" : "no"}. ` +
        `Area dell'XIC rispetto al vero: ${Math.round(A.xic * 100)} %. Per distinguere i due serve R ≥ ${(Math.round(F.minR(M0, M0 * (1 + v.d * 1e-6)) / 1000) * 1000).toLocaleString("it-IT")}; ${unres ? "lo strumento non li risolve: i centroidi sono uniti" : "lo strumento li risolve"}. Dati sintetici, seme ${seed}.`);
      C.table(el, ["tempo (min)", "XIC", "segnale vero"], d.scans.map((s, j) => [it(s.rt, 2), Math.round(x[j]), Math.round(d.truth[j])]),
        "Intensità dell'XIC e del segnale vero del bersaglio scansione per scansione (dati sintetici).");
    }
    draw();
  });

  // ---------------------------------------------------------------- figure 24.2: ROI building, scan by scan
  C.register("sim-chemi-roi", el => {
    let seed = 11, pos = 0, timer = 0;
    const NS = 40;
    const v = TP.controls(el, [
      { id: "ppm", label: "Tolleranza in m/z", min: 2, max: 40, step: 1, value: 10, unit: "ppm" },
      { id: "gap", label: "Vuoto massimo (scansioni)", min: 0, max: 3, step: 1, value: 1 },
      { id: "minScans", label: "Lunghezza minima (scansioni)", min: 2, max: 12, step: 1, value: 5 },
      { id: "k", label: "Prefiltro: scansioni sopra la soglia (k)", min: 1, max: 8, step: 1, value: 3 },
      { id: "imin", label: "Prefiltro: intensità minima (Imin)", min: 10, max: 500, step: 10, value: 100 },
    ], () => { stop(); draw(); });
    button(el, "Passo successivo", () => { stop(); if (pos < NS) pos++; draw(); });
    button(el, "Esegui tutto", () => {
      stop();
      if (TP.reduced()) { pos = NS; return draw(); }
      timer = setInterval(() => { if (pos >= NS) return stop(); pos++; draw(); }, 140);
    });
    button(el, "Ricomincia", () => { stop(); pos = 0; draw(); });
    button(el, "Nuovi dati", () => { stop(); seed = seed % 89 + 11; pos = 0; draw(); });
    const c = TP.canvas(el, 300); c.onresize = () => draw();
    const list = document.createElement("div"); list.className = "readout"; el.appendChild(list);
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    function stop() { clearInterval(timer); timer = 0; }
    const say = debounced((t, h) => { out.textContent = t; list.innerHTML = h; });
    function draw() {
      const scans = F.roiScans(seed), o = { ppm: v.ppm, gap: v.gap, minScans: v.minScans, k: v.k, imin: v.imin };
      const st = F.roiRun(scans, o, pos), fin = pos >= NS;
      const a = frame(c, { x0: 0.5, x1: NS + 0.5, y0: REF * (1 - 100e-6), y1: REF * (1 + 100e-6), xl: "numero di scansione", yl: "m/z", yf: q => it(q, 3), xf: q => Math.round(q), m: { l: 76 } });
      a.clip();
      scans.slice(0, pos).forEach((cs, s) => cs.forEach(q => { if (q[1] < 100) mark(a.ctx, "+", a.X(s + 1), a.Y(q[0]), 2.5, false, a.k.mu); }));
      const cols = [a.k.c1, a.k.c2, a.k.c3, a.k.c4], dashes = [[], [7, 4], [2, 3], [8, 3, 2, 3]], shown = st.rois.filter(r => r.pts.length >= 3);
      shown.forEach((r, j) => {
        const col = cols[j % 4];
        a.ctx.beginPath(); r.pts.forEach((p, q) => q ? a.ctx.lineTo(a.X(p.s + 1), a.Y(p.mz)) : a.ctx.moveTo(a.X(p.s + 1), a.Y(p.mz)));
        a.ctx.strokeStyle = col; a.ctx.lineWidth = 2; a.ctx.setLineDash(dashes[j % 4]); a.ctx.stroke(); a.ctx.setLineDash([]);
        r.pts.forEach(p => mark(a.ctx, "c", a.X(p.s + 1), a.Y(p.mz), 2.6, p.i >= o.imin, col));
      });
      a.ctx.restore();
      a.ctx.font = "bold 13px system-ui,sans-serif"; a.ctx.textAlign = "left"; a.ctx.textBaseline = "bottom";
      shown.forEach((r, j) => { const p = r.pts[0]; a.ctx.fillStyle = a.k.ink; a.ctx.fillText(String(j + 1), a.X(p.s + 1) - 14, a.Y(p.mz) - 3); });
      legend(c, "Simboli: ● intensità ≥ Imin, ○ sotto Imin, + centroide di rumore; i numeri indicano le tracce.");
      const rows = shown.map((r, j) => {
        const vd = F.roiVerdict(r, o);
        return [j + 1, it(r.mean, 4), r.pts.length, r.closed || fin ? (vd.keep ? "✓ tenuta" : "✗ scartata") : "aperta", r.closed || fin ? vd.why : "ancora in costruzione"];
      });
      const single = st.rois.length - shown.length;
      const html = rows.length ? "<ul>" + rows.map(r => `<li><b>Traccia ${r[0]}</b> (m/z ${r[1]}, ${r[2]} scansioni): ${r[3]}${r[3].startsWith("✗") ? ": " : " - "}${r[4]}</li>`).join("") + "</ul>" : "Nessuna traccia di almeno 3 scansioni, per ora. ";
      const kept = shown.filter(r => (r.closed || fin) && F.roiVerdict(r, o).keep).length;
      say(pos ? `Scansione ${pos} di ${NS}. Tracce aperte: ${st.rois.filter(r => !r.closed).length}; tracce di almeno 3 scansioni: ${shown.length}; tracce più corte: ${single}. ${fin ? "Fine: tenute " + kept + " tracce su " + shown.length + " (dati sintetici, seme " + seed + ")." : "Premi «Passo successivo»."}` :
        `Nessuna scansione elaborata. Premi «Passo successivo» o «Esegui tutto». Dati sintetici, seme ${seed}.`, html + (single ? `<p>Più ${single} tracce di 1 o 2 scansioni (rumore): tutte scartate, meno di ${v.minScans} scansioni.</p>` : ""));
      C.table(el, ["traccia", "m/z medio", "scansioni", "esito"], rows.map(r => [r[0], r[1], r[2], r[3] + (r[3].startsWith("✗") ? ": " : " - ") + r[4]]), "Tracce costruite fino alla scansione " + pos + " (dati sintetici).");
    }
    draw();
  });
})();
