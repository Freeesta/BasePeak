// Figure file for chapter pages: owned by DEV-CHEMI-02 (sim-chemi-picchi, sim-chemi-qualita). Synthetic data only.
"use strict";
(function () {
  const C = CHEMI, F = C.fn, S2 = 2.3548;

  // ---------------------------------------------------------------- pure functions (tested in node)
  const med = a => { const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const mad = a => { const m = med(a); return 1.4826 * med(a.map(v => Math.abs(v - m))); };
  /** Moving average of window w (odd); at the edges the window shrinks. */
  F.movavg = (y, w) => {
    const h = (w - 1) >> 1, n = y.length;
    return y.map((_, i) => { let s = 0, c = 0; for (let k = -h; k <= h; k++) if (i + k >= 0 && i + k < n) { s += y[i + k]; c++; } return s / c; });
  };
  /** Savitzky-Golay smoothing weights for window w (odd) and polynomial order p: first row of (A'A)^-1 A' for the local polynomial fit. */
  F.sgCoef = (w, p) => {
    const h = (w - 1) >> 1, n = p + 1, M = [];
    for (let i = 0; i < n; i++) { M.push([]); for (let j = 0; j < n; j++) { let s = 0; for (let x = -h; x <= h; x++) s += x ** (i + j); M[i].push(s); } M[i].push(i ? 0 : 1); }
    for (let i = 0; i < n; i++) {
      let q = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[q][i])) q = r;
      [M[i], M[q]] = [M[q], M[i]];
      for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; }
    }
    const u = M.map((r, i) => r[n] / r[i]);
    return Array.from({ length: w }, (_, k) => { const x = k - h; let s = 0; for (let j = 0; j < n; j++) s += u[j] * x ** j; return s; });
  };
  /** Savitzky-Golay smoothing (edges: mirror). */
  F.sg = (y, w, p) => {
    const c = F.sgCoef(w, Math.min(p, w - 1)), h = (w - 1) >> 1, n = y.length, at = j => y[j < 0 ? -j : j >= n ? 2 * (n - 1) - j : j];
    return y.map((_, i) => { let s = 0; for (let k = -h; k <= h; k++) s += c[k + h] * at(i + k); return s; });
  };
  /** Robust SD of the white noise from the second differences (a straight baseline and the flanks of the peaks cancel). */
  F.noiseEst = y => { const d = []; for (let i = 1; i < y.length - 1; i++) d.push(y[i + 1] - 2 * y[i] + y[i - 1]); return mad(d) / Math.sqrt(6); };
  /** SNIP baseline: clip every point to the mean of its neighbours at distance p, for p from m down to 1. */
  F.snip = (y, m) => {
    let a = y.slice();
    for (let p = m; p >= 1; p--) { const b = a.slice(); for (let i = p; i < a.length - p; i++) b[i] = Math.min(a[i], (a[i - p] + a[i + p]) / 2); a = b; }
    return a;
  };
  const ricker = s => { const h = Math.ceil(4 * s), k = []; for (let x = -h; x <= h; x++) { const u = x / s; k.push((1 - u * u) * Math.exp(-u * u / 2) / s); } return k; };
  const conv = (y, k) => { const h = (k.length - 1) >> 1, n = y.length; return y.map((_, i) => { let v = 0; for (let q = -h; q <= h; q++) { const j = i + q; if (j >= 0 && j < n) v += y[j] * k[q + h]; } return v; }); };
  const l2 = k => Math.sqrt(k.reduce((a, v) => a + v * v, 0));
  /** Mexican-hat (Ricker) wavelet coefficients, one row per scale (sigma in points); nz = SD of the coefficients for white noise of SD `noise`. */
  F.cwt = (y, sig, noise) => { const ks = sig.map(ricker); return { C: ks.map(k => conv(y, k)), nz: ks.map(k => noise * l2(k)) }; };
  /** Matched filter: convolution with the negative second derivative of a Gaussian (sigma in points), zero mean, unit L1 norm. */
  F.matchedKernel = s => {
    const h = Math.ceil(4 * s), k = [];
    for (let x = -h; x <= h; x++) k.push((1 / (s * s) - x * x / (s ** 4)) * Math.exp(-x * x / (2 * s * s)));
    const m = k.reduce((a, b) => a + b) / k.length, k2 = k.map(v => v - m), nn = k2.reduce((a, b) => a + Math.abs(b), 0);
    return k2.map(v => v / nn);
  };
  F.matched = (y, s, noise) => { const k = F.matchedKernel(s); return { f: conv(y, k), nf: noise * l2(k) }; };
  const maxima = (a, thr) => { const o = []; for (let i = 1; i < a.length - 1; i++) if (a[i] > a[i - 1] && a[i] >= a[i + 1] && a[i] >= thr) o.push(i); return o; };
  /** Ridge lines: chains of maxima of the coefficient rows, linked scale after scale (position within one sigma). Needs >= minLen scales and S/N >= snth. */
  F.ridges = (Cm, nz, sig, snth, minLen) => {
    const M = Cm.map((r, j) => maxima(r, snth * nz[j] * 0.5)), used = Cm.map(() => ({})), out = [];
    M[0].forEach(p0 => {
      const pos = [p0]; let p = p0;
      for (let j = 1; j < Cm.length; j++) {
        const tol = Math.max(1.5, sig[j]); let best = -1;
        M[j].forEach(q => { if (!used[j][q] && Math.abs(q - p) <= tol && (best < 0 || Math.abs(q - p) < Math.abs(best - p))) best = q; });
        if (best < 0) break;
        used[j][best] = 1; pos.push(best); p = best;
      }
      let bj = 0, bs = -1; pos.forEach((q, j) => { const sc = Cm[j][q] / nz[j]; if (sc > bs) { bs = sc; bj = j; } });
      out.push({ pos, len: pos.length, best: bj, score: bs, at: pos[bj] });
    });
    return out.filter(r => r.len >= minLen && r.score >= snth);
  };
  /** Distances (in x units) from the apex to the left and right crossing of frac * height; NaN when the trace does not come back down. */
  F.widthAt = (t, yc, ia, frac) => {
    const lv = yc[ia] * frac, cut = d => {
      let i = ia;
      while (i + d >= 0 && i + d < yc.length && yc[i + d] > lv) i += d;
      const j = i + d; if (j < 0 || j >= yc.length) return NaN;
      return Math.abs(t[ia] - (t[i] + (t[j] - t[i]) * (yc[i] - lv) / (yc[i] - yc[j])));
    };
    const a = cut(-1), b = cut(1);
    return { a, b, w: a + b };
  };
  const walk = (yw, ia, thr) => {
    const H = yw[ia]; let l = ia, r = ia;
    while (l > 0 && yw[l - 1] <= yw[l] && yw[l - 1] > thr * H) l--;
    while (r < yw.length - 1 && yw[r + 1] <= yw[r] && yw[r + 1] > thr * H) r++;
    return [l, r];
  };
  /** Peak detection. o = {algo: "loc"|"mf"|"cwt", sm: {kind: "none"|"ma"|"sg", w}, snth, minW, w0, w1}; widths are FWHM in the unit of t. */
  F.detect = (t, y, o) => {
    const dt = t[1] - t[0], n = y.length, k = o.sm.kind;
    const ys = k === "ma" ? F.movavg(y, o.sm.w) : k === "sg" ? F.sg(y, o.sm.w, 2) : y.slice();
    const base = F.snip(F.movavg(y, 5), Math.max(3, Math.round(o.w1 / dt))), noise = F.noiseEst(y), yc = ys.map((v, i) => v - base[i]);
    const yw = k === "none" ? F.movavg(yc, 3) : yc, raw = y.map((v, i) => v - base[i]);
    const s0 = Math.max(0.7, o.w0 / S2 / dt), s1 = Math.max(s0, o.w1 / S2 / dt), J = s1 > s0 * 1.05 ? 8 : 3;
    const sig = Array.from({ length: J }, (_, j) => s0 * (s1 / s0) ** (j / (J - 1)));
    const W = F.cwt(ys, sig, noise), Cm = W.C, rd = F.ridges(Cm, W.nz, sig, o.snth, Math.min(3, J));
    let idx = [];
    if (o.algo === "loc") idx = maxima(yc, o.snth * noise);
    else if (o.algo === "mf") { const m = F.matched(ys, (s0 + s1) / 2, noise); idx = maxima(m.f, o.snth * m.nf); }
    else idx = rd.map(r => r.at);
    const cands = [];
    idx.forEach(i0 => {
      let ia = i0; for (let q = Math.max(0, i0 - 2); q <= Math.min(n - 1, i0 + 2); q++) if (yc[q] > yc[ia]) ia = q;
      if (yc[ia] <= 0 || cands.some(c => Math.abs(c.i - ia) <= 2)) return;
      const [l, r] = walk(yw, ia, 0.03), wd = F.widthAt(t, yw, ia, 0.5), h = yc[ia];
      let area = 0; for (let q = l; q < r; q++) area += (raw[q] + raw[q + 1]) / 2 * dt;
      const w10 = F.widthAt(t, yw, ia, 0.1), sn = noise > 0 ? h / noise : Infinity, fw = isFinite(wd.w) ? wd.w : (r - l) * dt;
      const ok = fw >= o.minW && (o.algo !== "loc" || sn >= o.snth);
      cands.push({ i: ia, rt: t[ia], h, area, fwhm: fw, sn, as: w10.a > 0 ? w10.b / w10.a : NaN, l, r, ok, why: ok ? "" : fw < o.minW ? "troppo stretto" : "S/N basso" });
    });
    cands.sort((a, b) => a.i - b.i);
    return { cands, ys, base, noise, sig, Cm, rd };
  };
  /** Chromatogram of figure 25.1: five peaks (tailing, pair at resolution rs, small), one spike, drifting baseline. */
  F.picchiData = p => {
    const s = 4, dd = 4 * p.rs * s;
    const pk = [{ rt: 45, h: 1000, s }, { rt: 90, h: 1500, s: 3.5, tau: 8 }, { rt: 150 - dd / 2, h: 1200, s }, { rt: 150 + dd / 2, h: 900, s }, { rt: 225, h: 100, s }];
    const d = C.chrom({ t0: 0, t1: 300, dt: 1, peaks: pk, noise: p.noise, baseline: [30, 0.15], seed: p.seed });
    d.y[265] += 12 * p.noise;
    const truth = pk.map(q => {
      const f = C.chrom({ t0: 0, t1: 300, dt: 0.05, peaks: [q], noise: 0, baseline: 0, seed: 1 });
      let ia = 0; f.y.forEach((v, i) => { if (v > f.y[ia]) ia = i; });
      return { rt: f.t[ia], h: f.y[ia], area: f.y.reduce((a, v) => a + v, 0) * 0.05 };
    });
    return { t: d.t, y: d.y, truth, spike: 265 };
  };
  /** Match the accepted peaks with the true ones (nearest unmatched true apex within tol): verdicts and the missed ones. */
  F.compare = (truth, found, tol) => {
    const left = truth.map((_, i) => i), v = found.map(f => {
      let b = -1; left.forEach(i => { if (Math.abs(truth[i].rt - f.rt) <= tol && (b < 0 || Math.abs(truth[i].rt - f.rt) < Math.abs(truth[b].rt - f.rt))) b = i; });
      if (b >= 0) left.splice(left.indexOf(b), 1);
      return b;
    });
    return { match: v, missed: left, falsePos: v.filter(b => b < 0).length };
  };

  /** Figure 25.2: one EMG peak sampled every dt seconds on a sloping baseline; metrics as a program would compute them. p = {tau, dt, noise, slope, seed}. */
  F.qualData = p => {
    const s = 1.5, r = C.rng(p.seed), ph = r() * p.dt, f = x => 1000 * (p.tau > 0 ? C.emg(x, 20, s, p.tau) : C.gauss(x, 20, s));
    const t = [], y = [];
    for (let x = 10 + ph; x <= 50; x += p.dt) { t.push(x); y.push(f(x) + 30 + p.slope * (x - 10) + p.noise * C.normal(r)); }
    let area = 0; for (let x = 10; x <= 50; x += 0.01) area += f(x) * 0.01;
    return { t, y, f, area };
  };
  F.qualMetrics = (d, hw) => {
    const n = d.y.length, m = Math.max(2, Math.round(n * 0.1)), seg = (a, b) => d.y.slice(a, b), avg = a => a.reduce((x, v) => x + v, 0) / a.length;
    const x0 = avg(d.t.slice(0, m)), x1 = avg(d.t.slice(n - m)), y0 = avg(seg(0, m)), y1 = avg(seg(n - m, n));
    const bl = d.t.map(x => y0 + (y1 - y0) * (x - x0) / (x1 - x0)), yc = d.y.map((v, i) => v - bl[i]);
    let ia = 0; yc.forEach((v, i) => { if (v > yc[ia]) ia = i; });
    const H = yc[ia], w5 = F.widthAt(d.t, yc, ia, 0.5), w10 = F.widthAt(d.t, yc, ia, 0.1), w05 = F.widthAt(d.t, yc, ia, 0.05);
    const sd = Math.sqrt(avg(seg(0, m).map((v, i) => (v - bl[i]) ** 2)) - avg(seg(0, m).map((v, i) => v - bl[i])) ** 2);
    const nz = seg(0, m).map((v, i) => v - bl[i]), ptp = Math.max(...nz) - Math.min(...nz);
    const dt = d.t[1] - d.t[0], sg = w5.w / S2, g = x => H * Math.exp(-((x - d.t[ia]) ** 2) / (2 * sg * sg));
    const lo = d.t[ia] - 3 * w5.w, hi = d.t[ia] + 3 * w5.w, ix = d.t.map((x, i) => i).filter(i => d.t[i] >= lo && d.t[i] <= hi), mu = avg(ix.map(i => yc[i]));
    const ssr = ix.reduce((a, i) => a + (yc[i] - g(d.t[i])) ** 2, 0), sst = ix.reduce((a, i) => a + (yc[i] - mu) ** 2, 0);
    let area = 0; for (let i = 0; i < n - 1; i++) area += (yc[i] + yc[i + 1]) / 2 * dt;
    return { bl, yc, ia, H, fwhm: w5.w, as: w10.a > 0 ? w10.b / w10.a : NaN, tf: w05.a > 0 ? w05.w / (2 * w05.a) : NaN, r2: sst > 0 ? 1 - ssr / sst : NaN,
      sn1: sd > 0 ? H / sd : Infinity, sn2: ptp > 0 ? H / (ptp / 2) : Infinity, area, err: (area - d.area) / d.area, above: yc.filter(v => v >= H / 2).length };
  };

  // ---------------------------------------------------------------- drawing helpers
  const cv = () => { const s = getComputedStyle(document.documentElement), g = n => s.getPropertyValue(n).trim(); return { ink: g("--ink"), mu: g("--muted"), ln: g("--line"), c1: g("--c1"), c2: g("--c2"), c3: g("--c3"), c4: g("--c4") }; };
  const frame = (c, o) => {
    const { ctx, W, H } = c, k = cv(), m = Object.assign({ l: 58, r: 12, t: 10, b: 34 }, o.m || {});
    const X = v => m.l + (v - o.x0) / (o.x1 - o.x0) * (W - m.l - m.r), Y = v => H - m.b - (v - o.y0) / (o.y1 - o.y0) * (H - m.t - m.b);
    ctx.clearRect(0, 0, W, H); ctx.font = "12px system-ui,sans-serif"; ctx.lineWidth = 1; ctx.setLineDash([]);
    c.cv.setAttribute("aria-label", "Grafico: " + (c.cv.dataset.title || "") + ". Asse orizzontale: " + o.xl + ". Asse verticale: " + o.yl + ". I numeri sono nella tabella sotto la figura.");
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    TP.nice(o.x0, o.x1, Math.max(3, Math.floor((W - m.l - m.r) / 80))).forEach(v => {
      ctx.strokeStyle = k.ln; ctx.beginPath(); ctx.moveTo(X(v), m.t); ctx.lineTo(X(v), H - m.b); ctx.stroke(); ctx.fillStyle = k.mu; ctx.fillText(+v.toFixed(6), X(v), H - m.b + 4);
    });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    if (!o.noy) TP.nice(Math.max(0, o.y0), o.y1, Math.max(3, Math.floor((H - m.t - m.b) / 40))).forEach(v => {
      ctx.strokeStyle = k.ln; ctx.beginPath(); ctx.moveTo(m.l, Y(v)); ctx.lineTo(W - m.r, Y(v)); ctx.stroke(); ctx.fillStyle = k.mu; ctx.fillText(+v.toFixed(6), m.l - 5, Y(v));
    });
    ctx.strokeStyle = k.mu; ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, H - m.b); ctx.lineTo(W - m.r, H - m.b); ctx.stroke();
    ctx.fillStyle = k.ink; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(o.xl, m.l + (W - m.l - m.r) / 2, H - 1);
    ctx.save(); ctx.translate(12, m.t + (H - m.t - m.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore();
    return { ctx, X, Y, m, W, H, k, clip() { ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, W - m.l - m.r, H - m.t - m.b); ctx.clip(); } };
  };
  const path = (a, xs, ys, col, w, dash) => { a.ctx.beginPath(); xs.forEach((x, i) => i ? a.ctx.lineTo(a.X(x), a.Y(ys[i])) : a.ctx.moveTo(a.X(x), a.Y(ys[i]))); a.ctx.strokeStyle = col; a.ctx.lineWidth = w; a.ctx.setLineDash(dash || []); a.ctx.stroke(); a.ctx.setLineDash([]); };
  const mark = (ctx, shape, x, y, r, col) => {
    ctx.beginPath();
    if (shape === "v") { ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y - r); ctx.lineTo(x, y + r); ctx.closePath(); }
    else if (shape === "x") { ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); }
    else ctx.arc(x, y, r, 0, 7);
    ctx.strokeStyle = col; ctx.lineWidth = 1.8; if (shape === "c") { ctx.fillStyle = col; ctx.fill(); } ctx.stroke();
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
  const it = (x, d) => (isFinite(x) ? C.fmtIt(x, d) : "–");

  // ---------------------------------------------------------------- figure 25.1: finding peaks in a noisy chromatogram
  C.register("sim-chemi-picchi", el => {
    let seed = 5;
    const v = TP.controls(el, [
      { id: "algo", label: "Algoritmo", value: "loc", num: false, options: [["loc", "massimi locali"], ["mf", "filtro adattato"], ["cwt", "CWT (centWave)"]] },
      { id: "sm", label: "Lisciatura", value: "none", num: false, options: [["none", "nessuna"], ["ma", "media mobile"], ["sg", "Savitzky-Golay (ordine 2)"]] },
      { id: "w", label: "Finestra di lisciatura (1 punto = 1 s)", min: 3, max: 21, step: 2, value: 7, unit: "punti" },
      { id: "w0", label: "Larghezza minima attesa (FWHM)", min: 3, max: 20, step: 1, value: 6, unit: "s" },
      { id: "w1", label: "Larghezza massima attesa (FWHM)", min: 6, max: 40, step: 1, value: 20, unit: "s" },
      { id: "snth", label: "Soglia di S/N", min: 2, max: 20, step: 1, value: 6 },
      { id: "minW", label: "Larghezza minima accettata", min: 0, max: 10, step: 1, value: 5, unit: "s" },
      { id: "rs", label: "Risoluzione Rs della coppia", min: 0.6, max: 1.5, step: 0.1, value: 1, fmt: x => it(x, 1) },
      { id: "view", label: "Vista", value: "cro", num: false, options: [["cro", "cromatogramma"], ["sca", "scalogramma (CWT)"]] },
    ], () => draw());
    button(el, "Nuovi dati", () => { seed = seed % 83 + 5; draw(); });
    const c = TP.canvas(el, 320); c.onresize = () => draw();
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    const say = debounced(t => { out.textContent = t; });
    function draw() {
      const d = F.picchiData({ seed, rs: v.rs, noise: 20 }), o = { algo: v.algo, sm: { kind: v.sm, w: v.w }, snth: v.snth, minW: v.minW, w0: v.w0, w1: Math.max(v.w1, v.w0) };
      const r = F.detect(d.t, d.y, o), good = r.cands.filter(q => q.ok), bad = r.cands.filter(q => !q.ok), cmp = F.compare(d.truth, good, 6);
      const ymax = Math.max(...d.y) * 1.12, a = frame(c, { x0: 0, x1: 300, y0: -0.14 * ymax, y1: ymax, xl: "tempo (s)", yl: "segnale", m: { l: 52 } });
      a.clip();
      if (v.view === "sca") {
        const nr = r.Cm.length, mx = Math.max(...r.Cm.map((row, j) => Math.max(...row) / (r.sig[j] > 0 ? 1 : 1))), cw = (a.X(300) - a.X(0)) / d.t.length, rh = (a.Y(0) - a.Y(ymax)) / nr;
        r.Cm.forEach((row, j) => row.forEach((q, i) => { a.ctx.globalAlpha = Math.max(0, Math.min(1, q / mx)); a.ctx.fillStyle = a.k.ink; a.ctx.fillRect(a.X(d.t[i]) - cw / 2, a.Y(0) - (j + 1) * rh, cw + 0.6, rh + 0.6); }));
        a.ctx.globalAlpha = 1;
        r.rd.forEach((g, q) => { a.ctx.beginPath(); g.pos.forEach((p, j) => j ? a.ctx.lineTo(a.X(d.t[p]), a.Y(0) - (j + 0.5) * rh) : a.ctx.moveTo(a.X(d.t[p]), a.Y(0) - 0.5 * rh)); a.ctx.strokeStyle = a.k.c2; a.ctx.lineWidth = 2.4; a.ctx.setLineDash(q % 2 ? [6, 3] : []); a.ctx.stroke(); a.ctx.setLineDash([]); });
      } else {
        path(a, d.t, r.base, a.k.mu, 1.4, [2, 3]);
        path(a, d.t, d.y, a.k.mu, 1, []);
        if (v.sm !== "none") path(a, d.t, r.ys, a.k.ink, 2, [6, 3]); else path(a, d.t, d.y, a.k.ink, 1.6, []);
        good.forEach((q, j) => {
          const yb = -(0.04 + 0.05 * (j % 2)) * ymax, x0 = a.X(d.t[q.l]), x1 = a.X(d.t[q.r]);
          a.ctx.strokeStyle = a.k.c1; a.ctx.lineWidth = 2; a.ctx.beginPath(); a.ctx.moveTo(x0, a.Y(yb) - 4); a.ctx.lineTo(x0, a.Y(yb) + 4); a.ctx.moveTo(x0, a.Y(yb)); a.ctx.lineTo(x1, a.Y(yb)); a.ctx.moveTo(x1, a.Y(yb) - 4); a.ctx.lineTo(x1, a.Y(yb) + 4); a.ctx.stroke();
        });
        d.truth.forEach(q => mark(a.ctx, "v", a.X(q.rt), a.Y(ymax * 0.98), 4, a.k.c3));
        mark(a.ctx, "x", a.X(d.spike), a.Y(ymax * 0.98), 4, a.k.c2);
      }
      a.ctx.restore();
      a.ctx.font = "bold 13px system-ui,sans-serif"; a.ctx.fillStyle = a.k.ink; a.ctx.textAlign = "center"; a.ctx.textBaseline = "bottom";
      if (v.view === "cro") good.forEach((q, j) => a.ctx.fillText("P" + (j + 1), a.X(q.rt), a.Y(Math.max(q.h + r.base[q.i], 0)) - 6));
      legend(c, v.view === "cro" ? "Simboli: ▼ picco vero, × spike (non è un picco), ⊢⊣ limiti trovati, linea punteggiata = linea di base." : "Scalogramma: più scuro = coefficiente più alto, scale piccole in basso; le linee sono le creste.");
      const rows = good.map((q, j) => ["P" + (j + 1), it(q.rt, 0), it(q.h, 0), it(q.area, 0), it(q.fwhm, 1), it(q.sn, 1), it(q.as, 2), cmp.match[j] >= 0 ? "✓ vero" : "✗ falso"]);
      cmp.missed.forEach(i => rows.push(["–", it(d.truth[i].rt, 0), it(d.truth[i].h, 0), it(d.truth[i].area, 0), "–", "–", "–", "mancato"]));
      const why = bad.length ? ` ${bad.length === 1 ? "Scartato 1 candidato" : "Scartati " + bad.length + " candidati"} (${bad.map(q => q.why + " a " + Math.round(q.rt) + " s").slice(0, 3).join("; ")}).` : "";
      say(`Trovati ${good.length} picchi: ${good.length - cmp.falsePos} veri, ${cmp.falsePos} falsi; mancati ${cmp.missed.length} su ${d.truth.length}.${why} ` +
        (v.view === "sca" ? `Scalogramma: ${r.rd.length} creste che attraversano almeno 3 scale su ${r.sig.length}. ` : "") + `Rumore stimato ${it(r.noise, 1)}. Dati sintetici, seme ${seed}.`);
      C.table(el, ["picco", "tempo (s)", "altezza", "area", "FWHM (s)", "S/N", "As", "esito"], rows, "Picchi trovati e confronto con quelli veri (dati sintetici; area e altezza in unità arbitrarie).");
    }
    draw();
  });

  // ---------------------------------------------------------------- figure 25.2: how good is this peak?
  C.register("sim-chemi-qualita", el => {
    let seed = 3;
    const v = TP.controls(el, [
      { id: "tau", label: "Coda del picco (τ)", min: 0, max: 8, step: 0.5, value: 2, fmt: x => it(x, 1), unit: "s" },
      { id: "dt", label: "Tempo di scansione", min: 0.05, max: 1, step: 0.05, value: 0.25, fmt: x => it(x, 2), unit: "s" },
      { id: "noise", label: "Rumore (SD)", min: 0, max: 60, step: 2, value: 10 },
      { id: "slope", label: "Pendenza della linea di base", min: -5, max: 5, step: 0.5, value: 1, fmt: x => it(x, 1), unit: "/s" },
    ], () => draw());
    button(el, "Nuovi dati", () => { seed = seed % 61 + 3; draw(); });
    const c = TP.canvas(el, 280); c.onresize = () => draw();
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    const say = debounced(t => { out.textContent = t; });
    function draw() {
      const d = F.qualData({ tau: v.tau, dt: v.dt, noise: v.noise, slope: v.slope, seed }), m = F.qualMetrics(d), ymax = Math.max(...d.y) * 1.1;
      const a = frame(c, { x0: 10, x1: 50, y0: Math.min(0, ...d.y) * 1.1, y1: ymax, xl: "tempo (s)", yl: "segnale", m: { l: 52 } });
      a.clip();
      const fx = [], fy = []; for (let x = 10; x <= 50; x += 0.1) { fx.push(x); fy.push(d.f(x) + 30 + v.slope * (x - 10)); }
      path(a, fx, fy, a.k.mu, 1.4, [6, 4]); path(a, d.t, m.bl, a.k.mu, 1.2, [2, 3]); path(a, d.t, d.y, a.k.ink, 1.4, []);
      d.t.forEach((x, i) => mark(a.ctx, "c", a.X(x), a.Y(d.y[i]), d.t.length > 300 ? 1.2 : 3, a.k.c1));
      a.ctx.restore();
      legend(c, "Simboli: ● punti misurati, tratteggio = curva vera, linea punteggiata = linea di base stimata.");
      const bad = m.above < 6 ? " Troppo pochi punti: larghezza e area sono poco affidabili." : "";
      say(`Punti sopra metà altezza: ${m.above}. FWHM ${it(m.fwhm, 2)} s, As(10 %) ${it(m.as, 2)}, Tf(5 %) ${it(m.tf, 2)}, R² gaussiano ${it(m.r2, 3)}. ` +
        `S/N ${it(m.sn1, 1)} (altezza / SD) oppure ${it(m.sn2, 1)} (altezza / metà dell'ampiezza picco-picco). Errore sull'area ${it(m.err * 100, 1)} %.${bad} Dati sintetici, seme ${seed}.`);
      C.table(el, ["grandezza", "valore"], [["punti sopra metà altezza", m.above], ["FWHM (s)", it(m.fwhm, 2)], ["As a 10 %", it(m.as, 2)], ["Tf a 5 %", it(m.tf, 2)], ["R² gaussiano", it(m.r2, 3)],
        ["S/N (altezza / SD)", it(m.sn1, 1)], ["S/N (altezza / metà picco-picco)", it(m.sn2, 1)], ["area misurata", it(m.area, 0)], ["area vera", it(d.area, 0)], ["errore sull'area (%)", it(m.err * 100, 1)]],
        "Grandezze calcolate sul picco campionato (dati sintetici).");
    }
    draw();
  });
})();
