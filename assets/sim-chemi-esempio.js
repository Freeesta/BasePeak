// BasePeak - part VII, chapter 32: figure sim-chemi-esempio (stepper over one synthetic example). owned by DEV-CHEMI-06.
// Every computation is a small pure function in CHEMI.fn (tested in node, tests/test_chemi_esempio.py); the DOM part only shows it.
// All data are synthetic and seeded. Masses come from MASSE (assets/masse.js, loaded by the chapter before this file).
"use strict";
(function (G) {
  const F = CHEMI.fn, PROTON = 1.00727646688;
  const ion = f => MASSE.exact(f) + PROTON;                    // [M+H]+ of a neutral formula
  const cat = f => MASSE.exact(f) - MASSE.ELECTRON;            // fragment cation of a formula
  const med = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

  /** The example: three compounds to find plus one contaminant that is also in the blank. Heights are for S1, S2, S3, blank. */
  F.EX = {
    samples: ["C1", "C2", "C3", "Bianco"],
    ppmTol: 5, rtTol: 0.1, snMin: 10, ddaMin: 2e5, rtStd: 8.19,
    compounds: [
      { id: "A", nome: "Composto A (farmaco, con standard)", f: "C15H12N2O", rt: 8.2, h: [9e5, 8.6e5, 9.4e5, 2e3], err: 1.1,
        frag: [["C14H12N", 100], ["C14H10N", 28], ["C13H10N", 14], ["C13H9", 9]], lib: [100, 31, 12, 8], std: true },
      { id: "B", nome: "Composto B (pesticida sintetico, senza standard)", f: "C12H14ClN3O", rt: 7.15, h: [3.1e5, 3.4e5, 2.9e5, 1e3], err: -0.8,
        frag: [["C10H10ClN2", 100], ["C8H7ClN", 40], ["C6H4Cl", 18], ["C7H6N", 10]], lib: [100, 36, 21, 8], std: false },
      { id: "C", nome: "Composto C (incognito)", f: "C13H18N4O3", rt: 5.4, h: [1.2e5, 1.1e5, 1.3e5, 1e3], err: 1.6, frag: [], lib: null, std: false },
      { id: "D", nome: "Contaminante (presente anche nel bianco)", f: "C16H22N2O4", rt: 10.5, h: [2.2e5, 2.4e5, 2.1e5, 2.3e5], err: 0.4, frag: [], lib: null, std: false },
    ],
    // synthetic reference library: B and A, plus a synthetic isomer of A with other fragments
    library: [
      { nome: "Libreria sintetica: A", f: "C15H12N2O", frag: ["C14H12N", "C14H10N", "C13H10N", "C13H9"], I: [100, 31, 12, 8] },
      { nome: "Libreria sintetica: isomero di A", f: "C15H12N2O", frag: ["C15H10NO", "C14H10N", "C13H8N", "C12H8N"], I: [100, 22, 35, 18] },
      { nome: "Libreria sintetica: B", f: "C12H14ClN3O", frag: ["C10H10ClN2", "C8H7ClN", "C6H4Cl", "C7H6N"], I: [100, 36, 21, 8] },
    ],
  };
  CHEMI.preset("esempio", F.EX);

  /** m/z -> centroids [{mz, y}] : local maxima above thr, parabola through the apex and its two neighbours. */
  F.centroids = (mz, y, thr) => {
    const out = [];
    for (let i = 1; i < y.length - 1; i++) {
      if (y[i] < thr || y[i] < y[i - 1] || y[i] <= y[i + 1]) continue;
      const a = y[i - 1], b = y[i], c = y[i + 1], d = a - 2 * b + c;
      const dx = d === 0 ? 0 : 0.5 * (a - c) / d;
      out.push({ mz: mz[i] + dx * (mz[i + 1] - mz[i]), y: b - 0.25 * (a - c) * dx });
    }
    return out;
  };
  /** Profile of the [M+H]+ ion and its first isotope: opt {mz, pat1 (relative M+1), R, seed}. */
  F.profileOf = o => CHEMI.profile({ peaks: [{ mz: o.mz, h: 1e6 }, { mz: o.mz + 1.00335, h: 1e6 * o.pat1 }], R: o.R, pointsPerFwhm: 6, noise: 2e3, seed: o.seed });

  /** Chromatogram of an extracted ion for compound index k in sample s (0..3). Deterministic. */
  F.xic = (k, s) => {
    const c = F.EX.compounds[k], r = CHEMI.rng(100 * (k + 1) + s);
    return CHEMI.chrom({ t0: 4, t1: 12, dt: 0.02, noise: 3e3, baseline: 4e3, seed: 10 * (k + 1) + s,
      peaks: [{ rt: c.rt + (r() - 0.5) * 0.06, h: c.h[s], s: 0.04, tau: 0.02 }] });
  };
  /** First-difference noise estimate (robust: median of |dy|). */
  F.noise = y => { const d = []; for (let i = 1; i < y.length; i++) d.push(Math.abs(y[i] - y[i - 1])); return med(d) / 0.6745 / Math.SQRT2; };
  /** Peak picking: 5-point moving average, maxima with S/N >= snMin, edges where the smoothed trace falls below 5 % of the apex or turns up. */
  F.pick = (t, y, snMin) => {
    const n = y.length, ys = y.map((_, i) => { let s = 0, m = 0; for (let j = Math.max(0, i - 2); j <= Math.min(n - 1, i + 2); j++) { s += y[j]; m++; } return s / m; });
    const base = med(ys), sg = F.noise(y), out = [];
    for (let i = 2; i < n - 2; i++) {
      if (!(ys[i] > ys[i - 1] && ys[i] >= ys[i + 1]) || (ys[i] - base) / sg < snMin) continue;
      const h = ys[i] - base;
      let a = i, b = i;
      while (a > 0 && ys[a - 1] < ys[a] && ys[a - 1] - base > 0.05 * h) a--;
      while (b < n - 1 && ys[b + 1] < ys[b] && ys[b + 1] - base > 0.05 * h) b++;
      let area = 0; const dt = t[1] - t[0];
      for (let j = a; j < b; j++) area += 0.5 * (y[j] + y[j + 1] - 2 * base) * dt;
      const half = h / 2; let l = i, rr = i;
      while (l > a && ys[l] - base > half) l--;
      while (rr < b && ys[rr] - base > half) rr++;
      out.push({ rt: t[i], h, area, t0: t[a], t1: t[b], sn: h / sg, fwhm: t[rr] - t[l] });
      i = b;
    }
    return out;
  };
  /** Features of all samples -> grouped table rows {id, mz, rt, areas[], cv, ratio, keep}. A group is formed by m/z within ppm and RT within rtTol. */
  F.features = () => {
    const E = F.EX, feats = [];
    E.compounds.forEach((c, k) => {
      const mz = ion(c.f) * (1 + c.err * 1e-6);
      E.samples.forEach((_, s) => { const x = F.xic(k, s), p = F.pick(x.t, x.y, E.snMin)[0]; feats.push({ mz, s, rt: p ? p.rt : null, area: p ? p.area : 0, h: p ? p.h : 0 }); });
    });
    feats.sort((a, b) => a.mz - b.mz);
    const groups = [];
    feats.forEach(f => {
      const g = groups.find(q => Math.abs(CHEMI.ppm(f.mz, q.mz)) <= E.ppmTol && f.rt !== null && Math.abs(f.rt - q.rt) <= E.rtTol);
      if (g) g.m.push(f); else if (f.rt !== null) groups.push({ mz: f.mz, rt: f.rt, m: [f] });
    });
    return groups.sort((a, b) => a.rt - b.rt).map((g, i) => {
      const areas = E.samples.map((_, s) => { const f = g.m.find(q => q.s === s); return f ? f.area : 0; }), rep = areas.slice(0, 3);
      const mean = rep.reduce((p, q) => p + q, 0) / 3, sd = Math.sqrt(rep.reduce((p, q) => p + (q - mean) * (q - mean), 0) / 2);
      const ratio = areas[3] > 0 ? mean / areas[3] : Infinity, hmax = Math.max(...g.m.filter(q => q.s < 3).map(q => q.h));
      return { id: "F" + (i + 1), mz: g.mz, rt: med(g.m.map(q => q.rt)), areas, cv: sd / mean * 100, ratio, hmax, keep: ratio >= 3 && sd / mean < 0.3 };
    });
  };
  /** Cosine of two centroid lists [[mz, I]] with sqrt weights; each peak is matched once, to the closest peak within tol (Da). Returns {cos, pairs}. */
  F.cosine = (a, b, tol) => {
    const used = new Set(), pairs = [];
    a.slice().sort((x, y) => y[1] - x[1]).forEach(p => {
      let best = -1, bd = tol + 1e-12;
      b.forEach((q, j) => { const d = Math.abs(q[0] - p[0]); if (!used.has(j) && d <= bd) { bd = d; best = j; } });
      if (best >= 0) { used.add(best); pairs.push([p, b[best]]); }
    });
    const na = Math.sqrt(a.reduce((s, p) => s + p[1], 0)), nb = Math.sqrt(b.reduce((s, p) => s + p[1], 0));
    const dot = pairs.reduce((s, [p, q]) => s + Math.sqrt(p[1] * q[1]), 0);
    return { cos: na && nb ? dot / (na * nb) : 0, pairs };
  };
  /** Query MS2 of compound k (list [[mz, I]]) with a small seeded error on each fragment (ppm) and intensity (10 %). Empty if no MS2 was acquired. */
  F.query = k => {
    const c = F.EX.compounds[k], r = CHEMI.rng(500 + k), feat = F.features().find(f => Math.abs(CHEMI.ppm(f.mz, ion(c.f))) <= 5);
    if (!c.frag.length || !feat || feat.hmax < F.EX.ddaMin) return [];
    return c.frag.map(([f, I]) => [cat(f) * (1 + 2e-6 * CHEMI.normal(r)), I * (1 + 0.1 * CHEMI.normal(r))]);
  };
  F.libSpectrum = e => e.frag.map((f, i) => [cat(f), e.I[i]]);
  /** Library search: precursor within tol ppm, then cosine. Returns hits sorted by score. */
  F.search = (k, ppmTol, tolDa) => {
    const c = F.EX.compounds[k], q = F.query(k), pre = ion(c.f) * (1 + c.err * 1e-6);
    return F.EX.library.filter(e => Math.abs(CHEMI.ppm(pre, ion(e.f))) <= ppmTol)
      .map(e => ({ nome: e.nome, cos: q.length ? F.cosine(q, F.libSpectrum(e), tolDa).cos : 0, n: q.length ? F.cosine(q, F.libSpectrum(e), tolDa).pairs.length : 0 }))
      .sort((a, b) => b.cos - a.cos);
  };
  /** All CcHhNnOoClx formulas (x <= 2) of [M+H]+ within ppm of mz (even electrons, DBE >= 0): {f, ppm, d1, d2} ranked by isotope error. iso = [M+1, M+2] relative to M = 100. */
  F.formulae = (mz, ppm, iso) => {
    const out = [];
    for (let c = 4; c <= 24; c++) for (let n = 0; n <= 6; n++) for (let o = 0; o <= 8; o++) for (let x = 0; x <= 2; x++) {
      const h0 = Math.round((mz - PROTON - 12 * c - 14.003074 * n - 15.994915 * o - 34.968853 * x) / 1.007825);
      for (let h = Math.max(0, h0 - 1); h <= h0 + 1; h++) {
        if ((2 * c + 2 + n - h - x) < 0 || (2 * c + 2 + n - h - x) % 2) continue;
        const f = "C" + c + (h ? "H" + (h > 1 ? h : "") : "") + (x ? "Cl" + (x > 1 ? x : "") : "") + (n ? "N" + (n > 1 ? n : "") : "") + (o ? "O" + (o > 1 ? o : "") : ""), e = CHEMI.ppm(mz, ion(f));
        if (Math.abs(e) > ppm) continue;
        const p = MASSE.pattern(f, 3);
        out.push({ f, ppm: e, d1: iso ? p[1] - iso[0] : 0, d2: iso ? p[2] - iso[1] : 0 });
      }
    }
    return out.sort((a, b) => Math.hypot(a.d1, a.d2) - Math.hypot(b.d1, b.d2));
  };
  /** Level from evidence {mass, formula, ms2, lib, std}: the Schymanski et al. (2014) scale reduced to the cases of this example. */
  F.livelloEx = e => (e.mass && e.std && e.ms2 ? "1" : e.mass && e.lib && e.ms2 ? "2a" : e.mass && e.formula && e.ms2 ? "3" : e.mass && e.formula ? "4" : e.mass ? "5" : "-");
  /** Evidence collected along the whole chain for compound k. */
  F.evidence = k => {
    const c = F.EX.compounds[k], hits = F.search(k, 5, 0.01), q = F.query(k), top = hits[0];
    const feat = F.features().find(f => Math.abs(CHEMI.ppm(f.mz, ion(c.f))) <= 5);
    const iso = MASSE.pattern(c.f, 3), fl = feat ? F.formulae(feat.mz, 3, [iso[1], iso[2]]) : [];
    return { mass: !!feat && feat.keep, formula: !!feat && feat.keep && fl.length > 0 && MASSE.exact(fl[0].f) === MASSE.exact(c.f), nf: fl.length, ms2: q.length > 0, lib: !!top && top.cos >= 0.7 && top.n >= 3, cos: top ? top.cos : 0,
      std: !!c.std && !!feat && Math.abs(feat.rt - F.EX.rtStd) <= 0.1 && q.length > 0, feat };
  };

  // ---- figure (browser only)
  if (!G.document) return;
  const col = n => G.getComputedStyle(G.document.documentElement).getPropertyValue("--c" + n).trim() || ["", "#2b5c8a", "#c2410c", "#047857"][n];
  const it = (x, d) => CHEMI.fmtIt(x, d), ex = x => x.toExponential(1).replace("e+", "·10^").replace(".", ",");
  const mk = (el, tag, cls) => { const e = G.document.createElement(tag); if (cls) e.className = cls; el.appendChild(e); return e; };
  const STEPS = [["1", "Centroidi"], ["2", "Tracce"], ["3", "Picchi"], ["4", "Tabella"], ["5", "MS2"], ["6", "Livello"]];
  const NAMES = { "1": "Struttura confermata da standard (livello 1)", "2a": "Struttura probabile per spettro di libreria (livello 2a)", "3": "Candidati provvisori (livello 3)", "4": "Formula molecolare univoca (livello 4)", "5": "Massa esatta di interesse (livello 5)" };

  CHEMI.register("sim-chemi-esempio", el => {
    const st = { step: 1, k: 0 };
    const E = F.EX;
    const v = TP.controls(el, [{ id: "k", label: "Composto da seguire", value: "0", num: false, options: E.compounds.slice(0, 3).map((c, i) => [String(i), c.nome]) }], x => { st.k = +x.k; draw(); });
    const sel = el.querySelector("select");
    TP.buttons(el, STEPS, "1", k => { st.step = +k; draw(); });
    const c = TP.canvas(el, 280); c.onresize = () => draw();
    const tab = mk(el, "div", "chemi-tab"), out = mk(el, "div", "readout"), note = mk(el, "p", "note nota");
    out.setAttribute("aria-live", "polite");
    note.textContent = "Dati sintetici, seme fisso. I sei passi usano sempre gli stessi dati: l'uscita di ciascuno è l'ingresso del successivo.";
    let tm = 0;
    const say = s => { clearTimeout(tm); tm = setTimeout(() => { out.textContent = s; }, 150); };
    const table = (head, rows, cap) => {
      tab.innerHTML = "";
      const t = mk(tab, "table"), ca = mk(t, "caption"), tr = mk(t, "tr");
      ca.textContent = cap; head.forEach(h => { const th = mk(tr, "th"); th.scope = "col"; th.textContent = h; });
      rows.forEach(r => { const q = mk(t, "tr"); r.forEach(x => { mk(q, "td").textContent = x; }); });
    };
    const rm = () => { const d = el.querySelector("details.chemi-numeri"); if (d) d.remove(); };
    function draw() {
      const k = st.k, cp = E.compounds[k], M = ion(cp.f), s = st.step;
      sel.disabled = s === 4 || s === 6;
      c.cv.style.display = s === 4 || s === 6 ? "none" : "";
      if (s === 4 || s === 6) rm();
      if (s === 1) {
        const p = MASSE.pattern(cp.f, 2), pr = F.profileOf({ mz: M * (1 + cp.err * 1e-6), pat1: p[1] / 100, R: 30000, seed: 3 }), cs = F.centroids(pr.mz, pr.y, 2e4);
        const ax = TP.axes(c, { x0: pr.mz[0], x1: pr.mz[pr.mz.length - 1], y0: 0, y1: 1.15e6, xl: "m/z (dati sintetici)", yl: "intensità", xfmt: x => it(x, 1), yfmt: x => ex(x), m: { l: 64 } });
        ax.clip(); TP.line(ax, pr.mz, pr.y, col(1), 1.6); TP.sticks(ax, cs.map(q => q.mz), cs.map(q => q.y), col(2), 2.5); ax.ctx.restore();
        cs.forEach((q, i) => TP.label(ax, q.mz, q.y, it(q.mz, 4), col(2), "left", "bottom", -4 - 14 * i));
        const rows = cs.map((q, i) => [i ? "M+1" : "M", it(i ? M + 1.00335 : M, 4), it(q.mz, 4), it(CHEMI.ppm(q.mz, i ? M + 1.00335 : M), 1), ex(q.y)]);
        table(["Picco", "m/z teorico", "m/z centroide", "Errore (ppm)", "Intensità"], rows, `Centroidi di ${cp.id} ([M+H]+ ${cp.f})`);
        CHEMI.table(el, ["m/z", "Intensità"], pr.mz.filter((_, i) => i % 20 === 0).map((x, i) => [it(x, 4), ex(pr.y[i * 20])]), "Profilo (un punto ogni venti)");
        say(`Il profilo di ${pr.mz.length} punti diventa ${cs.length} centroidi: m/z ${it(cs[0].mz, 4)}, a ${it(CHEMI.ppm(cs[0].mz, M), 1)} ppm dal valore calcolato con masse.js.`);
      } else if (s === 2 || s === 3) {
        const x = F.xic(k, 0), pk = F.pick(x.t, x.y, E.snMin)[0], hi = Math.max(...x.y) * 1.15, base = med(x.y);
        const ax = TP.axes(c, { x0: 4, x1: 12, y0: 0, y1: hi, xl: "tempo di ritenzione (min), dati sintetici", yl: "intensità", xfmt: q => it(q, 0), yfmt: q => ex(q), m: { l: 64 } });
        ax.clip(); TP.line(ax, x.t, x.y, col(1), 1.6);
        if (s === 3) { const { ctx } = ax; ctx.save(); ctx.fillStyle = col(2); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.moveTo(ax.X(pk.t0), ax.Y(base));
          x.t.forEach((q, i) => { if (q >= pk.t0 && q <= pk.t1) ctx.lineTo(ax.X(q), ax.Y(x.y[i])); }); ctx.lineTo(ax.X(pk.t1), ax.Y(base)); ctx.fill(); ctx.restore(); }
        TP.line(ax, [4, 12], [base + E.snMin * F.noise(x.y), base + E.snMin * F.noise(x.y)], col(3), 1.5, [6, 4]);
        ax.ctx.restore();
        if (s === 3) { TP.line(ax, [pk.rt, pk.rt], [0, pk.h + base], col(2), 2, [2, 3]); TP.label(ax, pk.rt, pk.h + base, `${it(pk.rt, 2)} min`, col(2), "left", "bottom", -4); }
        const tw = it(M * E.ppmTol * 1e-6, 4);
        if (s === 2) table(["Voce", "Valore"], [["m/z estratto", it(M, 4)], ["Finestra", `± ${tw} (±${E.ppmTol} ppm)`], ["Soglia (linea tratteggiata)", `S/N ${E.snMin}`], ["Punti sopra soglia", String(x.y.filter(q => q > base + E.snMin * F.noise(x.y)).length)]], `Traccia di massa di ${cp.id} nel campione ${E.samples[0]}`);
        else table(["Voce", "Valore"], [["Tempo di ritenzione (min)", it(pk.rt, 2)], ["Altezza", ex(pk.h)], ["Area", ex(pk.area)], ["S/N", it(pk.sn, 0)], ["Larghezza a metà altezza (min)", it(pk.fwhm, 2)]], `Picco di ${cp.id} nel campione ${E.samples[0]}`);
        CHEMI.table(el, ["Tempo (min)", "Intensità"], x.t.filter((_, i) => i % 20 === 0).map((q, i) => [it(q, 2), ex(x.y[i * 20])]), "Traccia di massa (un punto ogni venti)");
        say(s === 2 ? `Si estrae la traccia a m/z ${it(M, 4)} ± ${E.ppmTol} ppm: una regione d'interesse è il tratto che resta sopra la soglia.` :
          `Il picco di ${cp.id} è a ${it(pk.rt, 2)} min, ha area ${ex(pk.area)} e S/N ${it(pk.sn, 0)}: la sua area entra nella tabella.`);
      } else if (s === 4) {
        const fs = F.features();
        table(["Feature", "m/z", "RT (min)"].concat(E.samples.map(q => "Area " + q), ["CV (%)", "Campione / bianco", "Tenuta"]),
          fs.map(f => [f.id, it(f.mz, 4), it(f.rt, 2)].concat(f.areas.map(ex), [it(f.cv, 0), isFinite(f.ratio) ? it(f.ratio, 0) : "∞", f.keep ? "✓ sì" : "✗ no"])), "Tabella delle feature dopo raggruppamento e filtro del bianco");
        say(`${fs.length} feature, ${fs.filter(f => f.keep).length} tenute: il contaminante ha un'area simile nel bianco (rapporto ${it(fs.find(f => !f.keep).ratio, 1)}) e viene scartato.`);
      } else if (s === 5) {
        const q = F.query(k), hits = F.search(k, 5, 0.01), lib = hits.length ? E.library.find(e => e.nome === hits[0].nome) : null;
        const ax = TP.axes(c, { x0: 50, x1: Math.ceil(M + 5), y0: -120, y1: 120, xl: "m/z (spettro sintetico; sopra: misurato, sotto: libreria)", yl: "intensità relativa", xfmt: x => it(x, 0), yfmt: x => String(Math.abs(Math.round(x))), m: { l: 52 } });
        if (q.length) { TP.sticks(ax, q.map(p => p[0]), q.map(p => p[1]), col(1), 3); }
        if (lib) { const ls = F.libSpectrum(lib); TP.sticks(ax, ls.map(p => p[0]), ls.map(p => -p[1]), col(2), 3); }
        TP.label(ax, M, 0, "precursore " + it(M, 4), col(3), "right", "bottom", -4);
        const cs = q.length && lib ? F.cosine(q, F.libSpectrum(lib), 0.01) : null;
        if (q.length) table(["Candidato in libreria", "Picchi in comune", "Coseno"], hits.length ? hits.map(h => [h.nome, String(h.n), it(h.cos, 3)]) : [["nessun candidato con il precursore entro 5 ppm", "0", "-"]], `Ricerca per ${cp.id}: precursore entro ${E.ppmTol} ppm, poi coseno`);
        else table(["Voce", "Valore"], [["Spettro MS2", `non acquisito: altezza ${ex(F.features().find(f => Math.abs(CHEMI.ppm(f.mz, M * (1 + cp.err * 1e-6))) <= 5).hmax)} sotto la soglia ${ex(E.ddaMin)}`]], `Spettro MS2 di ${cp.id}`);
        CHEMI.table(el, ["m/z", "Intensità relativa"], q.map(p => [it(p[0], 4), it(p[1], 0)]), "Spettro MS2 misurato (sintetico)");
        say(!q.length ? `Per ${cp.id} non c'è spettro MS2: senza di esso non si può chiedere la libreria.` : hits.length && cs ? `Il miglior candidato è «${hits[0].nome}» con coseno ${it(hits[0].cos, 3)} su ${cs.pairs.length} picchi in comune` + (hits.length > 1 ? `; l'isomero ha lo stesso precursore ma coseno ${it(hits[1].cos, 2)}.` : ".")
           : `Nessun candidato in libreria ha un precursore compatibile con ${cp.id}.`);
      } else {
        const rows = E.compounds.slice(0, 3).map((cc, i) => {
          const e = F.evidence(i), L = F.livelloEx(e), y = b => b ? "✓" : "✗";
          return [cc.id, y(e.mass), y(e.formula), y(e.ms2), y(e.lib) + (e.ms2 ? " (" + it(e.cos, 2) + ")" : ""), y(e.std), L, NAMES[L]];
        });
        table(["Composto", "Massa", "Formula", "MS2", "Libreria", "Standard", "Livello", "Significato"], rows, "Prove raccolte e livello assegnato (scala di Schymanski et al., 2014)");
        say(`Livelli: ${rows.map(r => r[0] + " " + r[6]).join(", ")}. Il livello dipende dalle prove, non dal punteggio più alto.`);
      }
    }
    draw();
  });
})(typeof window !== "undefined" ? window : globalThis);
