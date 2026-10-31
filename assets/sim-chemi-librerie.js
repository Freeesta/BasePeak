/* BasePeak - part VII, chapter 29. Figure file owned by DEV-CHEMI-04: sim-chemi-libreria (library search, target-decoy FDR) and sim-chemi-rete (molecular network).
   All data are synthetic. libreria simulates the SCORES of a search, not the spectra: the best score of a query against N wrong library entries is the largest of N draws of
   a null distribution F(s) = 1 - (1 - s)^K, generated through order statistics (so a library of 2000 costs the same as one of 100). Pure functions in CHEMI.fn (tested in node). */
"use strict";
(function () {
  const F = CHEMI.fn, NQ = 500, SEEDS = [7, 19, 31, 43, 55, 67], f2 = x => CHEMI.fmtIt(x, 2), pc1 = x => CHEMI.fmtIt(100 * x, 1) + " %";
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const debounce = fn => { let t; return () => { clearTimeout(t); t = setTimeout(fn, 150); }; };

  /** The k largest of N draws of the null score F(s) = 1 - (1 - s)^K, from uniform numbers U (U[0] for the maximum): descending order statistics. */
  F.nullTop = (U, N, k, K) => {
    const out = []; let x = 1;
    for (let i = 0; i < k; i++) { x *= Math.pow(U[i], 1 / (N - i)); out.push(1 - Math.pow(1 - x, 1 / K)); }
    return out;
  };
  /** Fixed random draws of the simulation (same seed, same draws): per query 5 order-statistic uniforms for targets, one for decoys, and the others. */
  F.draws = seed => {
    const r = CHEMI.rng(seed), d = [];
    for (let q = 0; q < NQ; q++) d.push({ U: [r(), r(), r(), r(), r()], V: r(), z: Math.abs(CHEMI.normal(r)), a: r(), a2: r(), pres: r(), ri: r() });
    return d;
  };
  /** Concatenated target + decoy search: the best hit of every query is the largest of the true compound (if in the library), the best wrong target, the best decoy (and, for an unknown, a partly similar analogue).
      par: {N, frac (0-1), ri (bool: library cut to the RI window), mix (bool: decoys as hard as wrong targets; otherwise random decoys, easier to tell apart)}. Returns [{bt (score), dec (best hit is a decoy), good (it is the true compound)}]. */
  F.search = (draws, par) => {
    const Ne = par.ri ? Math.max(1, Math.round(par.N * 0.08)) : par.N;
    return draws.map(d => {
      const st = Math.max(0.25, 1 - 0.12 * d.z), has = d.pres < par.frac && (!par.ri || d.ri < 0.97);
      const nt = Math.max(F.nullTop(d.U, Ne, 1, 6)[0], has || d.a2 >= 0.5 ? 0 : 0.3 + 0.35 * d.a), nd = F.nullTop([d.V], Ne, 1, par.mix ? 6 : 9)[0], tg = has ? Math.max(st, nt) : nt;
      return { bt: Math.max(tg, nd), dec: nd > tg, good: has && st >= nt && st > nd };
    });
  };
  /** Target-decoy at threshold t: {T (target best hits >= t), D (decoy best hits >= t), est = D / T, tru = wrong targets / T}. */
  F.fdrAt = (res, t) => {
    let T = 0, D = 0, W = 0;
    res.forEach(r => { if (r.bt >= t) { if (r.dec) D++; else { T++; if (!r.good) W++; } } });
    return { T, D, est: T ? Math.min(1, D / T) : 0, tru: T ? W / T : 0 };
  };
  /** q-value of every target best hit (decoys get 1): q(s) = min over the thresholds t <= s of the estimated FDR(t). */
  F.qvalues = res => {
    const ts = res.filter(r => !r.dec).map(r => r.bt).sort((a, b) => a - b), q = {};
    let m = 1; ts.forEach(t => { m = Math.min(m, F.fdrAt(res, t).est); q[t] = m; });
    return res.map(r => (r.dec ? 1 : q[r.bt]));
  };
  /** Top-5 hit list of query i: [{score, rev, dri, ok}] (ok = true compound; known only in the simulation). */
  F.hitList = (draws, i, par) => {
    const d = draws[i], Ne = par.ri ? Math.max(1, Math.round(par.N * 0.08)) : par.N, r = CHEMI.rng(1000 + i), L = F.nullTop(d.U, Ne, 5, 6).map(s => ({ score: s, ok: false }));
    if (d.pres < par.frac && (!par.ri || d.ri < 0.97)) L.push({ score: Math.max(0.25, 1 - 0.12 * d.z), ok: true });
    L.sort((a, b) => b.score - a.score);
    return L.slice(0, 5).map(h => ({ score: h.score, ok: h.ok, rev: Math.min(1, h.score + (1 - h.score) * 0.35 * r()), dri: Math.round(h.ok ? 8 * CHEMI.normal(r) : (par.ri ? 70 : 240) * (r() - 0.5)) }));
  };

  // ---------------------------------------------------------------- molecular network
  const FAM = [
    { prec: 301.14, pk: [[91.05, 20], [119.05, 35], [133.06, 25], [147.08, 60], [175.07, 100], [203.08, 45], [255.1, 30]], v: [[0, 999], [14.0157, 170], [15.9949, 150], [28.0313, 130], [29.9742, 170]] },
    { prec: 227.12, pk: [[77.04, 25], [105.03, 100], [121.06, 40], [149.06, 55], [167.07, 30], [199.09, 20]], v: [[0, 999], [14.0157, 140], [28.0313, 110], [30.0106, 160]] },
    { prec: 413.21, pk: [[85.03, 30], [113.06, 45], [171.1, 100], [229.12, 35], [285.15, 50], [367.19, 25]], v: [[0, 999], [15.9949, 200], [31.9898, 160]] },
  ];
  const SING = [{ prec: 253.11, pk: [[69.03, 40], [97.06, 100], [141.05, 35], [225.1, 20]] }, { prec: 355.18, pk: [[58.07, 30], [130.07, 100], [188.09, 45], [268.12, 25], [310.17, 20]] }];
  /** 14 synthetic spectra [{id, fam, prec, pk}]: 3 families of analogues (peaks above `from` carry the modification) and 2 singletons. The 9th spectrum also holds three fragments of family 1 (a weak bridge). */
  F.netSpectra = () => {
    const out = [], r4 = x => Math.round(x * 1e4) / 1e4, r = CHEMI.rng(5);
    FAM.forEach((f, fi) => f.v.forEach(([m, from], k) => out.push({ fam: fi, prec: r4(f.prec + m), pk: f.pk.filter(() => !k || r() > 0.2).map(p => [r4(p[0] + (p[0] >= from ? m : 0) + (r() - 0.5) * 0.006), Math.max(2, Math.round(p[1] * (1 + (k ? 1.2 * (r() - 0.5) : 0))))]) })));
    out[8].pk.push([91.05, 60], [119.05, 80], [133.06, 50], [147.08, 100], [175.07, 120]);
    SING.forEach(s => out.push({ fam: 3, prec: s.prec, pk: s.pk.map(p => [p[0], p[1]]) }));
    return out.map((s, i) => Object.assign(s, { id: "N" + (i + 1) }));
  };
  /** Square-root intensities without the precursor, and the modified/plain cosine of two such spectra with the greedy one-to-one pairing of chapter 28 (tolerance 0.02 Da). Returns {s, n}. */
  const rp = s => s.pk.filter(p => p[0] < s.prec - 1.5).map(p => [p[0], Math.sqrt(p[1])]);
  F.netCos = (a, b, shift) => {
    const A = rp(a), B = rp(b), c = [], ui = {}, uj = {}, nr = x => Math.sqrt(x.reduce((s, p) => s + p[1] * p[1], 0));
    A.forEach((x, i) => B.forEach((y, j) => {
      const d = x[0] - y[0];
      if (Math.abs(d) <= 0.02) c.push([x[1] * y[1], Math.abs(d), i, j]);
      if (shift && Math.abs(d - shift) <= 0.02) c.push([x[1] * y[1], Math.abs(d - shift), i, j]);
    }));
    c.sort((u, v) => v[0] - u[0] || u[1] - v[1] || u[2] - v[2] || u[3] - v[3]);
    let num = 0, n = 0; c.forEach(k => { if (!ui[k[2]] && !uj[k[3]]) { ui[k[2]] = uj[k[3]] = 1; num += k[0]; n++; } });
    return { s: nr(A) && nr(B) ? num / (nr(A) * nr(B)) : 0, n };
  };
  /** Edges {a, b, s, n, cross}: score >= thr, matched peaks >= minN, and the edge is among the topK best of BOTH nodes. mod = modified cosine. */
  F.netEdges = (sp, o) => {
    const e = [];
    for (let a = 0; a < sp.length; a++) for (let b = a + 1; b < sp.length; b++) {
      const r = F.netCos(sp[a], sp[b], o.mod ? sp[a].prec - sp[b].prec : 0);
      if (r.s >= o.thr && r.n >= o.minN) e.push({ a, b, s: r.s, n: r.n, cross: sp[a].fam !== sp[b].fam });
    }
    const rank = {}; sp.forEach((_, i) => { rank[i] = e.filter(x => x.a === i || x.b === i).sort((x, y) => y.s - x.s).slice(0, o.topK); });
    return e.filter(x => rank[x.a].includes(x) && rank[x.b].includes(x));
  };
  /** Connected components (arrays of node indices) of the graph with n nodes and the given edges. */
  F.netComps = (n, edges) => {
    const p = [...Array(n).keys()], f = i => (p[i] === i ? i : (p[i] = f(p[i])));
    edges.forEach(e => { p[f(e.a)] = f(e.b); });
    const g = {}; p.forEach((_, i) => (g[f(i)] = g[f(i)] || []).push(i));
    return Object.values(g);
  };
  if (typeof document === "undefined") return;

  // ---------------------------------------------------------------- DOM
  CHEMI.register("sim-chemi-libreria", el => {
    let si = 0, draws = F.draws(SEEDS[0]), res;
    const c = TP.controls(el, [
      { id: "t", label: "Soglia del punteggio", min: 0.3, max: 0.99, step: 0.01, value: 0.72, fmt: v => f2(v) },
      { id: "N", label: "Voci della libreria", min: 100, max: 2000, step: 100, value: 1000, fmt: v => v },
      { id: "fr", label: "Interrogazioni con il composto vero in libreria", min: 0, max: 100, step: 5, value: 60, fmt: v => v + " %" },
      { id: "mix", label: "Tipo di esche", options: [["0", "casuali"], ["1", "mescolate (più realistiche)"]], value: "1" },
      { id: "ri", label: "Filtro sull'indice di ritenzione (EI)", options: [["0", "no"], ["1", "sì (±35 unità)"]], value: "0" },
      { id: "q", label: "Interrogazione da guardare", options: [...Array(12).keys()].map(i => [i, "n. " + (i + 1)]), value: 0 },
    ], () => draw());
    const bx = document.createElement("div"); bx.className = "btns"; el.appendChild(bx);
    const nb = document.createElement("button"); nb.type = "button"; nb.textContent = "Nuovi dati"; bx.appendChild(nb);
    nb.onclick = () => { si = (si + 1) % SEEDS.length; draws = F.draws(SEEDS[si]); draw(); };
    const h = TP.canvas(el, 250), g = TP.canvas(el, 220), tb = document.createElement("div"), out = document.createElement("div"); out.className = "readout"; el.append(tb, out);
    h.onresize = g.onresize = draw;
    const par = () => ({ N: c.N, frac: c.fr / 100, ri: c.ri === 1, mix: c.mix === 1 });
    let last = "";
    const say = debounce(() => { out.textContent = last; });
    function hatch(ctx, x, y, w, hh, col) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, hh); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = 1.2;
      for (let k = -hh; k < w; k += 5) { ctx.beginPath(); ctx.moveTo(x + k, y + hh); ctx.lineTo(x + k + hh, y); ctx.stroke(); }
      ctx.restore(); ctx.strokeRect(x, y, w, hh);
    }
    function draw() {
      const p = par(), ink = tok("--ink"), c1 = tok("--c1"), c2 = tok("--c2"); res = F.search(draws, p);
      const B = 20, ht = Array(B).fill(0), hd = Array(B).fill(0);
      res.forEach(r => { (r.dec ? hd : ht)[Math.min(B - 1, Math.floor(r.bt * B))]++; });
      const top = Math.max(10, ...ht, ...hd), ax = TP.axes(h, { x0: 0, x1: 1, y0: 0, y1: top, xl: "punteggio del miglior risultato", yl: "interrogazioni" });
      const { ctx, X, Y } = ax, bw = (X(1) - X(0)) / B;
      for (let i = 0; i < B; i++) {
        const x = X(i / B);
        ctx.fillStyle = c1; ctx.fillRect(x + 1, Y(ht[i]), bw / 2 - 1, Y(0) - Y(ht[i]));
        ctx.strokeStyle = c2; hatch(ctx, x + bw / 2, Y(hd[i]), bw / 2 - 1, Y(0) - Y(hd[i]), c2);
      }
      ctx.save(); ctx.strokeStyle = ink; ctx.setLineDash([2, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(c.t), Y(0)); ctx.lineTo(X(c.t), Y(top)); ctx.stroke(); ctx.restore();
      TP.label(ax, c.t, top, "soglia", ink, "left", "top", 2);
      TP.legend(ax, [["bersagli (pieno)", c1, null], ["esche (tratteggio)", c2, [3, 3]]], 70);
      const xs = [], es = [], ts = [];
      for (let t = 0.3; t <= 0.9901; t += 0.01) { const a = F.fdrAt(res, t); xs.push(t); es.push(a.est); ts.push(a.tru); }
      const bx2 = TP.axes(g, { x0: 0.3, x1: 1, y0: 0, y1: 1, xl: "soglia del punteggio", yl: "FDR", yfmt: v => Math.round(v * 100) + " %" });
      TP.line(bx2, xs, ts, c1, 2.6); TP.line(bx2, xs, es, c2, 2.6, [7, 4]);
      bx2.ctx.save(); bx2.ctx.strokeStyle = ink; bx2.ctx.setLineDash([2, 3]); bx2.ctx.beginPath(); bx2.ctx.moveTo(bx2.X(c.t), bx2.Y(0)); bx2.ctx.lineTo(bx2.X(c.t), bx2.Y(1)); bx2.ctx.stroke(); bx2.ctx.restore();
      TP.legend(bx2, [["FDR vera (nota solo nella simulazione)", c1, null], ["FDR stimata con le esche", c2, [7, 4]]], 70);
      const a = F.fdrAt(res, c.t);
      last = `Soglia ${f2(c.t)}: ${a.T} risultati, FDR stimata ${pc1(a.est)}, vera ${pc1(a.tru)} (seme ${SEEDS[si]}, dati sintetici).`;
      const hl = F.hitList(draws, +c.q, p);
      tb.style.overflowX = "auto"; tb.innerHTML = `<table><caption>Risultati dell'interrogazione n. ${+c.q + 1} (scarto RI: differenza dell'indice di ritenzione)</caption><tr><th>Posto</th><th>Diretto</th><th>Inverso</th><th>Scarto RI</th><th>Composto</th></tr>` +
        hl.map((x, i) => `<tr><td>${i + 1}</td><td>${f2(x.score)}</td><td>${f2(x.rev)}</td><td>${x.dri}</td><td>${x.ok ? "vero ✓" : "sbagliato ✗"}</td></tr>`).join("") + "</table>";
      CHEMI.table(el, ["soglia", "risultati", "esche", "FDR stimata", "FDR vera"], [0.5, 0.6, 0.7, 0.8, 0.9].map(t => { const z = F.fdrAt(res, t); return [f2(t), z.T, z.D, pc1(z.est), pc1(z.tru)]; }), "Risultati ed errori a cinque soglie (dati sintetici)");
      say();
    }
    draw();
  });

  CHEMI.register("sim-chemi-rete", el => {
    const sp = F.netSpectra(), pos = [[.16, .28], [.3, .18], [.34, .42], [.12, .52], [.22, .66], [.62, .18], [.8, .12], [.84, .36], [.7, .42], [.5, .78], [.64, .88], [.4, .9], [.06, .9], [.93, .8]];
    const c = TP.controls(el, [
      { id: "thr", label: "Soglia del coseno", min: 0.3, max: 0.95, step: 0.01, value: 0.5, fmt: v => f2(v) },
      { id: "minN", label: "Picchi accoppiati minimi", min: 2, max: 8, step: 1, value: 4 },
      { id: "topK", label: "Legami al massimo per nodo (K)", min: 1, max: 8, step: 1, value: 4 },
      { id: "mod", label: "Punteggio", options: [["1", "coseno modificato"], ["0", "coseno semplice"]], value: "1" },
    ], () => draw());
    const cv = TP.canvas(el, 330), lst = document.createElement("p"), out = document.createElement("div"); out.className = "readout"; el.append(lst, out); cv.onresize = draw;
    const say = debounce(() => { out.textContent = last; }); let last = "";
    const shape = (ctx, k, x, y, r) => {
      ctx.beginPath();
      if (k === 0) ctx.arc(x, y, r, 0, 7);
      else if (k === 1) ctx.rect(x - r, y - r, 2 * r, 2 * r);
      else if (k === 2) { ctx.moveTo(x, y - r - 1); ctx.lineTo(x + r + 2, y + r); ctx.lineTo(x - r - 2, y + r); ctx.closePath(); }
      else { ctx.moveTo(x, y - r - 2); ctx.lineTo(x + r + 2, y); ctx.lineTo(x, y + r + 2); ctx.lineTo(x - r - 2, y); ctx.closePath(); }
    };
    function draw() {
      const E = F.netEdges(sp, { thr: c.thr, minN: c.minN, topK: c.topK, mod: c.mod === 1 }), comps = F.netComps(sp.length, E), ink = tok("--ink"), cols = [tok("--c1"), tok("--c2"), tok("--c3"), tok("--c4")];
      cv.resize(); const { ctx, W, H } = cv; ctx.clearRect(0, 0, W, H); ctx.font = "13px system-ui,sans-serif";
      const P = i => [pos[i][0] * (W - 40) + 20, pos[i][1] * (H - 30) + 15];
      E.forEach(e => { const a = P(e.a), b = P(e.b); ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 1 + 3 * e.s * e.s; ctx.setLineDash(e.cross ? [6, 4] : []); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); });
      sp.forEach((s, i) => {
        const [x, y] = P(i); ctx.fillStyle = cols[s.fam]; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; shape(ctx, s.fam, x, y, 9); ctx.fill(); ctx.stroke();
        ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = tok("--panel"); ctx.strokeText(s.id, x + 13, y - 9); ctx.fillStyle = ink; ctx.fillText(s.id, x + 13, y - 9);
      });
      const fam = comps.filter(k => k.length > 1), iso = comps.filter(k => k.length === 1), cross = E.filter(e => e.cross).length;
      last = `${fam.length} ${fam.length === 1 ? "famiglia" : "famiglie"}, ${iso.length} ${iso.length === 1 ? "isolato" : "isolati"}, ${cross} ${cross === 1 ? "legame" : "legami"} fra famiglie diverse (${E.length} legami in tutto, dati sintetici).`;
      lst.innerHTML = fam.map((k, i) => `<b>Famiglia ${i + 1}</b>: ${k.map(j => sp[j].id).join(", ")}`).join(" · ") + (iso.length ? ` · <b>Isolati</b>: ${iso.map(k => sp[k[0]].id).join(", ")}` : "") +
        `<br><span class="note">Forme: cerchio, quadrato, triangolo = le tre famiglie vere di analoghi; rombo = spettri senza parenti. Linea tratteggiata = legame fra famiglie vere diverse.</span>`;
      CHEMI.table(el, ["nodo A", "nodo B", "punteggio", "picchi accoppiati", "tipo di legame"], E.length ? E.map(e => [sp[e.a].id, sp[e.b].id, f2(e.s), e.n, e.cross ? "fra famiglie diverse ✗" : "nella stessa famiglia ✓"]) : [["-", "-", "-", "-", "nessun legame"]], "Legami della rete (dati sintetici)");
      say();
    }
    draw();
  });
})();
