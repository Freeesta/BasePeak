// Figure file for chapter pages: owned by DEV-CHEMI-03 (sim-chemi-allinea, sim-chemi-corrispondenza).
// Figure 27.1: retention-time alignment (anchor features + LOWESS, or DTW on the profiles). Figure 27.2: peak-density correspondence and gap filling.
// All data are synthetic and seeded; the pure functions live in CHEMI.fn (tested in node).
"use strict";
(function () {
  const C = CHEMI, F = C.fn, SEEDS = [7, 12, 23, 41, 58, 64, 77, 91];
  const med = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };
  F.median = med;

  /** LOWESS (Cleveland 1979): local linear fit, tricube weights on the nearest span*n points, `iters` robustness (bisquare) passes. Returns f(t). */
  F.lowess = (xs, ys, span, iters) => {
    const n = xs.length, q = Math.max(3, Math.min(n, Math.ceil(span * n))), rob = xs.map(() => 1);
    const at = (t, w0) => {
      const d = xs.map(x => Math.abs(x - t)), h = Math.max(d.slice().sort((a, b) => a - b)[q - 1], 1e-9);
      let s0 = 0, s1 = 0, s2 = 0, t0 = 0, t1 = 0;
      for (let i = 0; i < n; i++) {
        const u = d[i] / h, w = (u < 1 ? (1 - u * u * u) ** 3 : 0) * w0[i];
        s0 += w; s1 += w * xs[i]; s2 += w * xs[i] * xs[i]; t0 += w * ys[i]; t1 += w * xs[i] * ys[i];
      }
      const den = s0 * s2 - s1 * s1;
      return Math.abs(den) < 1e-12 * (s0 * s2 + 1) ? (s0 ? t0 / s0 : 0) : (t0 * s2 - s1 * t1 + t * (s0 * t1 - s1 * t0)) / den;
    };
    for (let k = 0; k < iters; k++) {
      const e = xs.map((x, i) => ys[i] - at(x, rob)), s = med(e.map(Math.abs)) || 1e-9;
      e.forEach((v, i) => { const u = v / (6 * s); rob[i] = u < 1 ? (1 - u * u) ** 2 : 0; });
    }
    return t => at(t, rob);
  };

  /** Dynamic time warping on a cost matrix c[i][j] (Sakoe and Chiba 1978). band = max |i-j| (null = free). Returns {D, path, total}. */
  F.dtw = (c, band) => {
    const n = c.length, m = c[0].length, D = c.map(r => r.map(() => Infinity));
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      if (band != null && Math.abs(i - j) > band) continue;
      const best = i === 0 && j === 0 ? 0 : Math.min(i > 0 ? D[i - 1][j] : Infinity, j > 0 ? D[i][j - 1] : Infinity, i > 0 && j > 0 ? D[i - 1][j - 1] : Infinity);
      D[i][j] = c[i][j] + best;
    }
    const path = [[n - 1, m - 1]];
    for (let i = n - 1, j = m - 1; i > 0 || j > 0;) {
      const o = [[i - 1, j - 1], [i - 1, j], [i, j - 1]].filter(p => p[0] >= 0 && p[1] >= 0);
      const b = o.reduce((a, p) => (D[p[0]][p[1]] < D[a[0]][a[1]] ? p : a));
      i = b[0]; j = b[1]; path.unshift([i, j]);
    }
    return { D, path, total: D[n - 1][m - 1] };
  };

  // ---------------------------------------------------------------- Figure 27.1 model
  const TMAX = 20, SIG = 0.04;
  const drift = (shape, t) => (shape === "lin" ? 4 + 1.3 * t : shape === "cur" ? 28 * Math.sin(Math.PI * t / TMAX) : 20 / (1 + Math.exp(-(t - 10) / 0.4)));   // seconds
  F.alignModel = (seed, o) => {
    const r = C.rng(seed), n = o.anchors, A = [], B = [], dev = [], bad = [];
    for (let i = 0; i < n; i++) A.push(1 + (TMAX - 2) * (i + 0.2 + 0.6 * r()) / n);
    A.forEach((a, i) => { B.push(a + (drift(o.shape, a) + 0.4 * C.normal(r)) / 60); dev.push((B[i] - a) * 60); bad.push(false); });
    for (let k = 0; k < o.outliers && k < n; k++) { const i = Math.floor(r() * n); dev[i] = (r() < 0.5 ? -1 : 1) * (15 + 30 * r()); B[i] = A[i] + dev[i] / 60; bad[i] = true; }
    const hs = A.map(() => 20 + 80 * r()), N = 400, tt = [], ya = [], yb = [];
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) * TMAX / N; tt.push(t); let a = 0, b = 0;
      A.forEach((x, k) => { a += hs[k] * C.gauss(t, x, SIG); b += hs[k] * C.gauss(t, x + drift(o.shape, x) / 60, SIG); });
      ya.push(a); yb.push(b);
    }
    return { A, B, dev, bad, tt, ya, yb };
  };
  /** true A-time for a B-time (the drift curve inverted numerically) */
  F.trueA = (shape, tb) => { let a = tb; for (let k = 0; k < 40; k++) a = tb - drift(shape, a) / 60; return a; };
  F.alignRun = (mod, o) => {
    const N = mod.tt.length, fit = [], corr = [];
    if (o.method === "dtw") {
      const S = 2, nn = Math.floor(N / S), pool = y => { let z = []; for (let i = 0; i < nn; i++) z.push(Math.sqrt(Math.max(y[i * S], y[i * S + 1]))); for (let k = 0; k < 3; k++) z = z.map((v, i) => 0.25 * z[Math.max(0, i - 1)] + 0.5 * v + 0.25 * z[Math.min(nn - 1, i + 1)]); return z; };
      const ca = pool(mod.ya), cb = pool(mod.yb);
      const cm = ca.map(a => cb.map(b => Math.abs(a - b))), res = F.dtw(cm, 20), mapped = cb.map(() => []);
      res.path.forEach(p => mapped[p[1]].push(p[0]));
      for (let j = 0; j < nn; j++) { const tb = (j * S + 1) * TMAX / N; fit.push(tb - (mapped[j].reduce((a, b) => a + b, 0) / mapped[j].length * S + 1) * TMAX / N); }
      const xb = cb.map((_, j) => (j * S + 1) * TMAX / N);
      return { f: t => { const k = Math.max(0, Math.min(nn - 2, Math.floor(t * N / TMAX / S - 0.5))); const u = (t - xb[k]) / (xb[k + 1] - xb[k]); return (fit[k] * (1 - u) + fit[k + 1] * u) * 60; } };
    }
    return { f: F.lowess(mod.B, mod.dev, o.span, 3) };
  };
  F.alignError = (mod, run, shape) => {
    const g = [], before = [], after = [];
    for (let k = 0; k < 120; k++) g.push(1.5 + 17 * k / 119);
    g.forEach(tb => { const ta = F.trueA(shape, tb); before.push(Math.abs(tb - ta) * 60); after.push(Math.abs(tb - run.f(tb) / 60 - ta) * 60); });
    return { before: med(before), after: med(after), g };
  };

  C.register("sim-chemi-allinea", el => {
    const css = getComputedStyle(document.documentElement), col = n => css.getPropertyValue("--c" + n).trim(), ink = css.getPropertyValue("--ink").trim() || "#24231f";
    let si = 0, timer = 0;
    const later = () => { clearTimeout(timer); timer = setTimeout(draw, 150); };
    const v = TP.controls(el, [
      { id: "shape", label: "Forma della deriva", options: [["lin", "lineare"], ["cur", "curva"], ["step", "gradino"]], value: "cur", num: false },
      { id: "method", label: "Metodo", options: [["lowess", "LOWESS su picchi di riferimento"], ["dtw", "DTW sul profilo"]], value: "lowess", num: false },
      { id: "anchors", label: "Picchi di riferimento", min: 5, max: 40, step: 1, value: 20 },
      { id: "span", label: "Ampiezza LOWESS (frazione dei punti)", min: 0.2, max: 1, step: 0.05, value: 0.5, fmt: x => TP.fmt(x, 2) },
      { id: "outliers", label: "Accoppiamenti sbagliati", min: 0, max: 5, step: 1, value: 0 },
    ], later);
    const nb = document.createElement("div"); nb.className = "btns"; const bt = document.createElement("button"); bt.type = "button"; bt.textContent = "Nuovi dati";
    bt.onclick = () => { si = (si + 1) % SEEDS.length; later(); }; nb.appendChild(bt); el.appendChild(nb);
    const c1 = TP.canvas(el, 230), c2 = TP.canvas(el, 230); c1.onresize = c2.onresize = draw;
    c2.cv.setAttribute("aria-label", "Grafico: scarto di tempo fra le due corse in funzione del tempo di ritenzione");
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    function draw() {
      const o = { shape: v.shape, anchors: v.anchors, outliers: v.outliers, method: v.method, span: v.span }, mod = F.alignModel(SEEDS[si], o), run = F.alignRun(mod, o), err = F.alignError(mod, run, v.shape);
      const corr = mod.tt.map(t => t - run.f(t) / 60);
      const a1 = TP.axes(c1, { x0: 0, x1: TMAX, y0: 0, y1: 110, xl: "tempo di ritenzione (min)", yl: "BPC (u. arb.)", yfmt: () => "" });
      a1.clip();
      TP.line(a1, mod.tt, mod.ya, col(1), 1.6);
      TP.line(a1, mod.tt, mod.yb, col(2), 1.6, TP.DASH[1]);
      TP.line(a1, corr, mod.yb, col(3), 1.6, TP.DASH[3]);
      a1.ctx.restore();
      TP.legend(a1, [["corsa A (riferimento)", col(1)], ["corsa B prima", col(2), TP.DASH[1]], ["corsa B dopo", col(3), TP.DASH[3]]]);
      const ymax = 45, a2 = TP.axes(c2, { x0: 0, x1: TMAX, y0: -ymax, y1: ymax, xl: "tempo di ritenzione della corsa B (min)", yl: "scarto B − A (s)" });
      a2.clip();
      const gt = err.g.map(t => (t - F.trueA(v.shape, t)) * 60);
      TP.line(a2, err.g, gt, "#9b978c", 1.4, [2, 3]);
      TP.line(a2, err.g, err.g.map(t => run.f(t)), col(3), 2.2, v.method === "dtw" ? TP.DASH[3] : null);
      if (v.method === "lowess") mod.B.forEach((b, i) => {
        const x = a2.X(b), y = a2.Y(mod.dev[i]), ctx = a2.ctx; ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.6;
        ctx.beginPath();
        if (mod.bad[i]) { ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x - 4, y + 4); ctx.lineTo(x + 4, y - 4); ctx.stroke(); } else { ctx.arc(x, y, 3, 0, 7); ctx.stroke(); }
      });
      a2.ctx.restore();
      TP.legend(a2, [["deriva vera", "#9b978c", [2, 3]], ["curva stimata", col(3), v.method === "dtw" ? TP.DASH[3] : null]].concat(v.method === "lowess" ? [["○ riferimento · × errato", ink]] : []));
      C.table(el, ["Tempo B (min)", "Scarto vero (s)", "Scarto stimato (s)", "Errore residuo (s)"], [0, 20, 40, 60, 80, 100, 119].map(k => { const t = err.g[k]; return [TP.fmt(t, 1), TP.fmt(gt[k], 1), TP.fmt(run.f(t), 1), TP.fmt(Math.abs(t - run.f(t) / 60 - F.trueA(v.shape, t)) * 60, 1)]; }), "Scarto di tempo fra le corse, vero e stimato (dati sintetici)");
      out.textContent = `Scarto residuo mediano ${TP.fmt(err.after, 1)} s (era ${TP.fmt(err.before, 1)} s). ` + (v.method === "dtw" ? "Il DTW lavora sul profilo: picchi di riferimento e ampiezza non contano. " : `${v.anchors} picchi di riferimento, ampiezza ${TP.fmt(v.span, 2)}. `) + `Dati sintetici, seme ${SEEDS[si]}.`;
    }
    draw();
  });

  // ---------------------------------------------------------------- Figure 27.2: peak-density correspondence
  const NS = 6;
  /** Six samples x twelve compounds. p = {mz, rt (s), nd: probability of detection, pres: probability of being present}. */
  const CP = [[151.0400, 120, 1, 1], [212.1000, 200, 1, 1], [255.1000, 260, 0.9, 1], [255.1050, 262, 0.9, 1], [301.1410, 340, 0.95, 1], [301.1500, 372, 0.95, 1], [345.2000, 430, 0.8, 1], [389.2300, 480, 0.55, 0.9], [412.1800, 520, 0.9, 1], [467.3000, 590, 0.4, 0.8], [503.2600, 640, 0.9, 1], [560.3100, 700, 0.85, 1]];
  F.makePeaks = (seed, o) => {
    const r = C.rng(seed), peaks = [], present = [];
    CP.forEach((c, k) => {
      present[k] = [];
      for (let s = 0; s < NS; s++) {
        const here = r() < c[3] && s < NS, off = o.drift * C.normal(r), h = 1e4 * (0.5 + r()) * (k % 3 + 1), ok = r() < c[2];
        present[k][s] = { here, h };
        if (here && ok) peaks.push({ s, mz: c[0] * (1 + 1.5e-6 * C.normal(r)), rt: c[1] + off + 1.5 * C.normal(r), h, cpd: k });
      }
    });
    return { peaks, present };
  };
  /** Peak density (xcms style): slices of binSize in m/z; Gaussian kernel density of RT (sd bw); groups split at the minima. Returns the groups and the slices. */
  F.peakDensity = (peaks, o) => {
    const sorted = peaks.slice().sort((a, b) => a.mz - b.mz), groups = [], slices = [];
    for (let i = 0; i < sorted.length;) {
      let j = i; while (j < sorted.length && sorted[j].mz - sorted[i].mz <= o.bin) j++;
      const sl = sorted.slice(i, j), lo = Math.min(...sl.map(p => p.rt)) - 3 * o.bw, hi = Math.max(...sl.map(p => p.rt)) + 3 * o.bw, n = 300, xs = [], ys = [];
      for (let k = 0; k <= n; k++) { const x = lo + (hi - lo) * k / n; xs.push(x); ys.push(sl.reduce((a, p) => a + Math.exp(-0.5 * ((x - p.rt) / o.bw) ** 2), 0)); }
      const mx = [], cuts = [];
      for (let k = 1; k < n; k++) if (ys[k] > ys[k - 1] && ys[k] >= ys[k + 1]) mx.push(k);
      for (let m = 1; m < mx.length; m++) { let b = mx[m - 1]; for (let k = b; k <= mx[m]; k++) if (ys[k] < ys[b] || b === mx[m - 1]) b = ys[k] < ys[b] ? k : b; cuts.push(xs[b]); }
      const gs = [];
      sl.forEach(p => { const gi = cuts.filter(x => p.rt > x).length; (gs[gi] = gs[gi] || []).push(p); });
      const made = gs.filter(Boolean);
      made.forEach(g => groups.push(g));
      slices.push({ mz: sl[0].mz, xs, ys, cuts, peaks: sl, groups: made.length });
      i = j;
    }
    const keep = groups.filter(g => new Set(g.map(p => p.s)).size >= o.minFraction * (o.ns || NS) - 1e-9 && new Set(g.map(p => p.s)).size >= 1);
    return { features: keep, slices, dropped: groups.length - keep.length };
  };
  /** Rows of the feature table. A cell without a detection is "filled" (flagged) with the raw signal found in the box, or left empty. */
  F.featureTable = (feats, present, fill, ns) => feats.map(g => {
    const by = {}; g.forEach(p => { if (!by[p.s] || p.h > by[p.s].h) by[p.s] = p; });
    const ps = Object.values(by), k = g[0].cpd, cells = [];
    for (let s = 0; s < (ns || NS); s++) {
      if (by[s]) cells.push({ v: Math.round(by[s].h), filled: false });
      else if (fill) { const t = present[k][s]; cells.push({ v: Math.round(t.here ? t.h * 0.5 : 300), filled: true }); } else cells.push({ v: null, filled: false });
    }
    return { mz: med(ps.map(p => p.mz)), rt: med(ps.map(p => p.rt)), n: ps.length, cells, cp: [...new Set(g.map(p => p.cpd))] };
  }).sort((a, b) => a.mz - b.mz || a.rt - b.rt);
  F.score = (feats, nCpd) => {
    const per = {}; let merges = 0;
    feats.forEach(g => { const set = new Set(g.map(p => p.cpd)); if (set.size > 1) merges++; set.forEach(k => { per[k] = (per[k] || 0) + 1; }); });
    return { splits: Object.values(per).reduce((a, b) => a + b - 1, 0), merges, lost: nCpd - Object.keys(per).length };
  };

  C.register("sim-chemi-corrispondenza", el => {
    const css = getComputedStyle(document.documentElement), col = n => css.getPropertyValue("--c" + n).trim(), ink = css.getPropertyValue("--ink").trim() || "#24231f";
    let si = 0, fill = true, sel = 0, timer = 0;
    const later = () => { clearTimeout(timer); timer = setTimeout(draw, 150); };
    const v = TP.controls(el, [
      { id: "bw", label: "Larghezza del nucleo bw", min: 1, max: 60, step: 1, value: 8, unit: "s" },
      { id: "mf", label: "Frazione minima di campioni", min: 0.1, max: 1, step: 0.05, value: 0.5, fmt: x => TP.fmt(x, 2) },
      { id: "bin", label: "Fetta di m/z", min: 0.001, max: 0.25, step: 0.001, value: 0.01, fmt: x => TP.fmt(x, 3), unit: "u" },
      { id: "drift", label: "Deriva rimasta dopo l'allineamento", min: 0, max: 20, step: 1, value: 3, unit: "s" },
      { id: "sl", label: "Fetta mostrata nel grafico", options: [[0, "—"]], value: 0 },
    ], (val, id) => { if (id === "sl") sel = val.sl; later(); });
    const lab = document.createElement("label"), cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = true;
    cb.onchange = () => { fill = cb.checked; later(); }; lab.style.cssText = "display:flex;gap:6px;margin:6px 0"; lab.append(cb, "Riempi i buchi (gap filling)"); el.appendChild(lab);
    const nb = document.createElement("div"); nb.className = "btns"; const bt = document.createElement("button"); bt.type = "button"; bt.textContent = "Nuovi dati";
    bt.onclick = () => { si = (si + 1) % SEEDS.length; later(); }; nb.appendChild(bt); el.appendChild(nb);
    const selEl = el.querySelector("select");
    const c = TP.canvas(el, 240); c.onresize = draw;
    const tab = document.createElement("div"); tab.style.overflowX = "auto"; el.appendChild(tab);
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    function draw() {
      const d = F.makePeaks(SEEDS[si], { drift: v.drift }), res = F.peakDensity(d.peaks, { bw: v.bw, minFraction: v.mf, bin: v.bin }), sc = F.score(res.features, CP.length);
      const multi = res.slices.filter(s => s.peaks.length > 1);
      selEl.innerHTML = multi.map((s, i) => `<option value="${i}">m/z ${TP.fmt(s.mz, 3)} (${s.peaks.length} picchi)</option>`).join("") || `<option value="0">—</option>`;
      sel = Math.min(sel, Math.max(0, multi.length - 1)); selEl.value = String(sel);
      const sl = multi[sel];
      if (sl) {
        const ymax = Math.max(...sl.ys) * 1.25 + 0.5, ax = TP.axes(c, { x0: sl.xs[0], x1: sl.xs[sl.xs.length - 1], y0: 0, y1: ymax, xl: "tempo di ritenzione (s)", yl: "densità dei picchi", xfmt: x => Math.round(x) });
        TP.line(ax, sl.xs, sl.ys, col(1), 2.2);
        sl.cuts.forEach(x => TP.line(ax, [x, x], [0, ymax], col(2), 1.4, [5, 4]));
        sl.peaks.forEach(p => { const x = ax.X(p.rt), y = ax.Y(0.15 + 0.3 * p.s), ctx = ax.ctx; ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.stroke(); ctx.font = "11px system-ui,sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("S" + (p.s + 1), x + 6, y); });
        TP.legend(ax, [["densità", col(1)], ["limite fra gruppi", col(2), [5, 4]], ["○ picco del campione S1…S6", ink]]);
      } else { TP.axes(c, { x0: 0, x1: 1, y0: 0, y1: 1 }); }
      const fe = F.featureTable(res.features, d.present, fill);
      const rows = fe.map((f, i) => {
        const cells = f.cells.map(x => (x.v == null ? "<td>—</td>" : x.filled ? `<td><i>${x.v} (riempito)</i></td>` : `<td>${x.v}</td>`));
        const kind = f.cp.length > 1 ? "✗ fuso (2 composti)" : fe.filter(o => o.cp[0] === f.cp[0]).length > 1 ? "✗ diviso (stesso composto in più righe)" : "✓ ok";
        return `<tr><td>M${i + 1}</td><td>${TP.fmt(f.mz, 4)}</td><td>${Math.round(f.rt)}</td><td>${f.n}</td>${cells.join("")}<td>${kind}</td></tr>`;
      });
      tab.innerHTML = `<table><caption>Tabella delle feature: altezze dei picchi (dati sintetici)</caption><tr><th scope=col>Id</th><th scope=col>m/z</th><th scope=col>RT (s)</th><th scope=col>Picchi</th>${[1, 2, 3, 4, 5, 6].map(s => `<th scope=col>S${s}</th>`).join("")}<th scope=col>Controllo</th></tr>${rows.join("")}</table>`;
      C.table(el, ["Fetta m/z", "Picchi", "Gruppi"], res.slices.map(s => [TP.fmt(s.mz, 4), s.peaks.length, s.groups]), "Fette di m/z e gruppi trovati");
      out.textContent = `${fe.length} feature per ${CP.length} composti veri: ${sc.splits} ${sc.splits === 1 ? "divisione" : "divisioni"}, ${sc.merges} ${sc.merges === 1 ? "fusione" : "fusioni"}, ${sc.lost} ${sc.lost === 1 ? "composto perso" : "composti persi"} per la frazione minima. Le celle (riempito) non sono rivelazioni. Dati sintetici, seme ${SEEDS[si]}.`;
    }
    draw();
  });
})();
