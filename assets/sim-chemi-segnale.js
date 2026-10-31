// Figure file for chapter pages: owned by DEV-CHEMI-01 (sim-chemi-centroide, sim-chemi-taratura).
// Chapter 22. Pure functions live in CHEMI.fn (tested in node by tests/test_chemi_segnale.py); the DOM part runs only in a browser.
"use strict";
(function (G, T) {
  const CHEMI = G.CHEMI, F = CHEMI.fn, TP = T;

  // ------------------------------------------------------------------ pure functions
  /** Index of the highest point. */
  F.apex = y => { let k = 0; for (let i = 1; i < y.length; i++) if (y[i] > y[k]) k = i; return k; };
  /** FWHM in Da from m/z and resolving power. */
  F.fwhm = (mz, R) => mz / R;
  /** mDa to ppm at a given m/z (1 mDa at m/z 100 = 10 ppm). */
  F.mdaToPpm = (mda, mz) => mda / mz * 1e3;
  /** Statistical lower bound of the centroid sd (Da) for N ions in a Gaussian peak: FWHM / (2.3548 sqrt N). */
  F.sigmaCentroid = (fwhm, n) => fwhm / (2.3548 * Math.sqrt(n));
  /** Didactic dead-time model: mean ions per bin and push k_true -> detected k_obs = 1 - exp(-k_true). */
  F.tdcObserved = k => 1 - Math.exp(-k);
  /** Vertex of the parabola through three points, as a fraction of the step from the middle point. */
  F.vertex = (a, b, c) => { const d = 2 * (a - 2 * b + c); return d === 0 ? 0 : (a - c) / d; };
  /** Local maximum: m/z of the highest point. */
  F.cMax = (mz, y) => mz[F.apex(y)];
  /** Three-point parabola on the apex. Needs uniform spacing and an interior apex. */
  F.cPar = (mz, y) => {
    const i = F.apex(y); if (i < 1 || i > y.length - 2) return mz[i];
    return mz[i] + F.vertex(y[i - 1], y[i], y[i + 1]) * (mz[i + 1] - mz[i - 1]) / 2;
  };
  /** Same on the logarithms: exact for a noise-free Gaussian. Falls back to the parabola if a point is not positive. */
  F.cGau = (mz, y) => {
    const i = F.apex(y); if (i < 1 || i > y.length - 2) return mz[i];
    if (y[i - 1] <= 0 || y[i + 1] <= 0) return F.cPar(mz, y);
    return mz[i] + F.vertex(Math.log(y[i - 1]), Math.log(y[i]), Math.log(y[i + 1])) * (mz[i + 1] - mz[i - 1]) / 2;
  };
  /** Centroid of area: contiguous points around the apex with y >= f * apex. Returns {mz, sum}. */
  F.cArea = (mz, y, f) => {
    const i = F.apex(y), lim = f * y[i]; let a = i, b = i;
    while (a > 0 && y[a - 1] >= lim) a--;
    while (b < y.length - 1 && y[b + 1] >= lim) b++;
    let s = 0, w = 0;
    for (let j = a; j <= b; j++) { s += y[j]; w += mz[j] * y[j]; }
    return { mz: w / s, sum: s, n: b - a + 1 };
  };
  F.centroid = (alg, mz, y, f) => alg === "max" ? F.cMax(mz, y) : alg === "par" ? F.cPar(mz, y) : alg === "gau" ? F.cGau(mz, y) : F.cArea(mz, y, f).mz;
  /** One noisy profile peak. opt {mz, R, ppf, offset, h, snr, ions, seed}: Gaussian noise of sd h/snr, or Poisson counts of `ions` ions when ions > 0. */
  F.peak = opt => {
    const h = opt.h || 1000, g = CHEMI.profile({ peaks: [{ mz: opt.mz, h }], R: opt.R, pointsPerFwhm: opt.ppf, noise: 0, offset: opt.offset || 0, seed: opt.seed });
    const r = CHEMI.rng((opt.seed || 1) * 7919 + 13), s = g.fwhm / 2.3548, y = [];
    for (let i = 0; i < g.mz.length; i++) {
      if (opt.ions > 0) y.push(CHEMI.poisson(r, opt.ions * g.step / (s * Math.sqrt(2 * Math.PI)) * CHEMI.gauss(g.mz[i], opt.mz, s)));
      else y.push(g.y[i] + h / opt.snr * CHEMI.normal(r));
    }
    return { mz: g.mz, y, fwhm: g.fwhm, step: g.step };
  };
  /** Mean and sd of the centroid error (ppm) over n seeded draws. */
  F.repeat = (opt, alg, f, n) => {
    const e = [];
    for (let k = 1; k <= n; k++) { const p = F.peak(Object.assign({}, opt, { seed: k })); e.push(CHEMI.ppm(F.centroid(alg, p.mz, p.y, f), opt.mz)); }
    const m = e.reduce((a, b) => a + b, 0) / n;
    return { mean: m, sd: Math.sqrt(e.reduce((a, b) => a + (b - m) * (b - m), 0) / (n - 1)) };
  };
  /** Synthetic run: opt {drift ppm/h, step ppm at 30 min (0 = none), lock bool, sd ppm, mzs [], mzLock, seed}. Errors in ppm at t = 0, 5, ..., 60 min. */
  F.run = opt => {
    const r = CHEMI.rng(opt.seed || 1), t = [], before = [], after = [], lockSd = opt.sd / 2;
    for (let j = 0; j <= 12; j++) {
      const tm = 5 * j, b = [], a = [], d = opt.drift * tm / 60 + (tm >= 30 ? opt.step : 0), lk = d + lockSd * CHEMI.normal(r);
      opt.mzs.forEach(m => {
        const e = d * (1 + 0.5 * (m - opt.mzLock) / opt.mzLock) + opt.sd * CHEMI.normal(r);
        b.push(e); a.push(opt.lock ? e - lk : e);
      });
      t.push(tm); before.push(b); after.push(a);
    }
    const mabs = x => x.reduce((s, row) => s + row.reduce((u, v) => u + Math.abs(v), 0), 0) / (x.length * x[0].length);
    return { t, before, after, mabsBefore: mabs(before), mabsAfter: mabs(after) };
  };

  if (!G.document || !TP) return;

  // ------------------------------------------------------------------ DOM helpers
  const INK = "#24231f";   // light-theme ink: tema.js swaps it in the dark theme; series colours come from the --cN tokens of the page
  const col = n => G.getComputedStyle(G.document.documentElement).getPropertyValue("--c" + n).trim() || ["", "#2b5c8a", "#c2410c", "#047857"][n];
  const it = (x, d) => CHEMI.fmtIt(x, d), sg = (x, d) => (x >= 0 ? "+" : "−") + it(Math.abs(x), d);
  const deb = fn => { let t = 0; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), 150); }; };
  const mk = (el, tag, cls) => { const e = G.document.createElement(tag); if (cls) e.className = cls; el.appendChild(e); return e; };
  const text = (ax, x, y, s, col, al) => { const c = ax.ctx; c.save(); c.fillStyle = col || INK; c.font = "12px system-ui,sans-serif"; c.textAlign = al || "left"; c.textBaseline = "middle"; c.fillText(s, x, y); c.restore(); };
  const ALG = [["max", "Massimo locale"], ["par", "Parabola su tre punti"], ["gau", "Gaussiana su tre punti"], ["area", "Baricentro dell'area"]];

  // ------------------------------------------------------------------ figure 22.1
  CHEMI.register("sim-chemi-centroide", el => {
    const MZ = 300.1234;
    const v = TP.controls(el, [
      { id: "R", label: "Potere risolutivo R", min: 4, max: 5.38, step: 0.02, value: 4.7, fmt: x => String(Math.round(10 ** x / 1000) * 1000).replace(/\B(?=(\d{3})+$)/g, " ") },
      { id: "p", label: "Punti per FWHM", min: 2, max: 20, step: 1, value: 5 },
      { id: "snr", label: "Rumore: S/N del vertice", min: 5, max: 1000, step: 5, value: 100 },
      { id: "n", label: "Ioni contati (solo modo conteggio)", min: 100, max: 20000, step: 100, value: 2000, fmt: x => String(x) },
      { id: "o", label: "Posizione del picco rispetto al punto più vicino", min: 0, max: 0.5, step: 0.05, value: 0.3, fmt: x => it(x, 2), unit: "passo" },
      { id: "f", label: "Soglia f del baricentro", min: 0.2, max: 0.9, step: 0.1, value: 0.5, fmt: x => it(x, 1) },
      { id: "m", label: "Modo del rumore", value: "g", num: false, options: [["g", "Rumore gaussiano"], ["p", "Conteggio di ioni (Poisson)"]] },
      { id: "a", label: "Algoritmo del centroide", value: "par", num: false, options: ALG },
    ], () => draw());
    const b = mk(el, "div", "btns"), btn = mk(b, "button"); btn.type = "button"; btn.textContent = "Ripeti 200 volte";
    const nb = mk(b, "button"); nb.type = "button"; nb.textContent = "Nuovi dati";
    const c = TP.canvas(el, 280); c.onresize = () => draw();
    const out = mk(el, "div", "readout"), seedOut = mk(el, "p", "note nota");
    let seed = 7, stats = null;
    const opt = () => ({ mz: MZ, R: Math.round(10 ** v.R / 1000) * 1000, ppf: v.p, offset: v.o, snr: v.snr, ions: v.m === "p" ? v.n : 0 });
    const say = deb((p, found, err, o) => {
      let s = `Errore su questo picco ${sg(err, 2)} ppm con ${o.ppf} punti per FWHM.`;
      if (stats) s += ` Su 200 ripetizioni (${ALG.find(x => x[0] === v.a)[1]}): errore medio ${sg(stats.mean, 2)} ppm, dispersione ${it(stats.sd, 2)} ppm.`;
      else s += " Premi «Ripeti 200 volte» per media e dispersione.";
      if (o.ions > 0) s += ` Limite statistico della dispersione: circa ${it(F.sigmaCentroid(p.fwhm, o.ions) / MZ * 1e6, 2)} ppm.`;
      out.textContent = s;
    });
    function draw() {
      const o = opt(), p = F.peak(Object.assign({ seed }, o)), found = F.centroid(v.a, p.mz, p.y, v.f), err = CHEMI.ppm(found, MZ);
      const ymax = Math.max(...p.y) * 1.25, w = 3 * p.fwhm;
      const ax = TP.axes(c, { x0: MZ - w, x1: MZ + w, y0: 0, y1: ymax, xl: "m/z (dati sintetici)", yl: "intensità", xfmt: x => it(x, 3), yfmt: x => String(Math.round(x)), m: { l: 60 } });
      ax.clip();
      TP.line(ax, p.mz, p.y, col(1), 1.8);
      p.mz.forEach((x, i) => { const { ctx, X, Y } = ax; ctx.fillStyle = col(1); ctx.fillRect(X(x) - 3, Y(p.y[i]) - 3, 6, 6); });
      [[MZ, col(3), null, "vero"], [found, col(2), [6, 4], "trovato"]].forEach(([x, cl, dash, name], k) => {
        const { ctx, X, m } = ax; ctx.save(); ctx.strokeStyle = cl; ctx.lineWidth = 2; if (dash) ctx.setLineDash(dash);
        ctx.beginPath(); ctx.moveTo(X(x), m.t); ctx.lineTo(X(x), ax.H - m.b); ctx.stroke(); ctx.restore();
        text(ax, X(x) + (k ? 5 : -5), m.t + 10 + 15 * k, name + " " + it(x, 4), cl, k ? "left" : "right");
      });
      ax.ctx.restore();
      stats = stats && stats.key === JSON.stringify([o, v.a, v.f]) ? stats : null;
      say(p, found, err, o);
      const rows = ALG.map(([k, name]) => { const cc = F.centroid(k, p.mz, p.y, v.f); return [name, it(cc, 4), sg(CHEMI.ppm(cc, MZ), 2)]; });
      CHEMI.table(el, ["Algoritmo", "m/z trovato", "Errore (ppm)"], rows, `Un picco sintetico, seme ${seed}, m/z vero ${it(MZ, 4)}.`);
      seedOut.textContent = `Dati sintetici, seme ${seed}. FWHM ${it(p.fwhm * 1000, 1)} mDa, passo ${it(p.step * 1000, 2)} mDa.`;
    }
    btn.onclick = () => {
      const o = opt(), rows = ALG.map(([k, name]) => { const s = F.repeat(o, k, v.f, 200); if (k === v.a) stats = Object.assign(s, { key: JSON.stringify([o, v.a, v.f]) }); return [name, sg(s.mean, 2), it(s.sd, 2)]; });
      CHEMI.table(el, ["Algoritmo", "Errore medio (ppm)", "Dispersione (ppm)"], rows, `200 ripetizioni con rumore diverso, ${o.ppf} punti per FWHM, R ${o.R}.`);
      out.textContent = `Ripetute 200 volte: ${ALG.map((a, i) => `${a[1].toLowerCase()} ${rows[i][1]} ± ${rows[i][2]} ppm`).join("; ")}.`;
      el.querySelector("details.chemi-numeri").open = true;
    };
    nb.onclick = () => { seed = seed * 31 % 9973 + 7; stats = null; draw(); };
    draw();
  });

  // ------------------------------------------------------------------ figure 22.2
  CHEMI.register("sim-chemi-taratura", el => {
    const RANGE = { a: [120, 180, 240, 300, 360, 420, 480, 540], b: [150, 250, 400, 550, 700, 850, 1000, 1100] };
    const v = TP.controls(el, [
      { id: "d", label: "Deriva", min: 0, max: 5, step: 0.5, value: 3, fmt: x => it(x, 1), unit: "ppm/ora" },
      { id: "sd", label: "Errore casuale (SD)", min: 0.5, max: 3, step: 0.1, value: 1.2, fmt: x => it(x, 1), unit: "ppm" },
      { id: "s", label: "Salto di temperatura a 30 min", value: "0", num: false, options: [["0", "Nessuno"], ["2", "+2 ppm"]] },
      { id: "l", label: "Massa di riferimento", value: "1", num: false, options: [["1", "Attiva (ricalibrazione a un punto)"], ["0", "Spenta"]] },
      { id: "r", label: "Intervallo di m/z dei composti", value: "a", num: false, options: [["a", "m/z 120–540"], ["b", "m/z 150–1100"]] },
    ], () => draw());
    const c = TP.canvas(el, 280); c.onresize = () => draw();
    const out = mk(el, "div", "readout"), note = mk(el, "p", "note nota");
    note.textContent = "Dati sintetici, seme 5: 8 composti misurati ogni 5 minuti. La massa di riferimento (m/z 300) ha un errore casuale metà degli altri perché è intensa.";
    const say = deb(t => { out.textContent = t; });
    function draw() {
      const R = F.run({ drift: v.d, step: +v.s, lock: v.l === "1", sd: v.sd, mzs: RANGE[v.r], mzLock: 300, seed: 5 });
      const ax = TP.axes(c, { x0: 0, x1: 60, y0: -6, y1: 10, xl: "tempo (min)", yl: "errore di massa (ppm)" });
      ax.clip();
      const { ctx, X, Y } = ax, mean = rows => rows.map(r => r.reduce((a, b) => a + b, 0) / r.length);
      ctx.save(); ctx.strokeStyle = "#9b978c"; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(60), Y(0)); ctx.stroke(); ctx.restore();
      R.t.forEach((t, j) => R.before[j].forEach((e, i) => {
        ctx.strokeStyle = col(2); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(X(t), Y(e), 3.2, 0, 7); ctx.stroke();
        if (v.l === "1") { const q = R.after[j][i]; ctx.strokeStyle = col(1); ctx.strokeRect(X(t) - 3, Y(q) - 3, 6, 6); }
      }));
      TP.line(ax, R.t, mean(R.before), col(2), 2.4);
      if (v.l === "1") TP.line(ax, R.t, mean(R.after), col(1), 2.4, TP.DASH[1]);
      ctx.restore();
      TP.legend(ax, [["prima (cerchi, linea piena)", col(2)]].concat(v.l === "1" ? [["dopo la massa di riferimento (quadrati, tratteggio)", col(1), TP.DASH[1]]] : []));
      say(`Errore assoluto medio prima ${it(R.mabsBefore, 2)} ppm` + (v.l === "1" ? `, dopo la ricalibrazione ${it(R.mabsAfter, 2)} ppm: la deriva sparisce, la dispersione casuale resta.` : ". Con la massa di riferimento spenta la deriva si somma all'errore casuale."));
      const rows = R.t.map((t, j) => [t, sg(mean(R.before)[j], 2), v.l === "1" ? sg(mean(R.after)[j], 2) : "—"]);
      CHEMI.table(el, ["Minuto", "Media prima (ppm)", "Media dopo (ppm)"], rows, "Errore medio sugli 8 composti a ogni tempo.");
    }
    draw();
  });
})(typeof window !== "undefined" ? window : globalThis, typeof TP !== "undefined" ? TP : null);   // TP is a global const of teoria.js, not a window property
