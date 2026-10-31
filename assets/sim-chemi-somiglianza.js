/* BasePeak - part VII, chapter 28. Figure file owned by DEV-CHEMI-04: sim-chemi-specchio (two spectra, four scores) and sim-chemi-purezza (isolation window).
   Spectra are synthetic. Every computation is a pure function in CHEMI.fn (tested in node, tests/test_chemi_spettri.py); the DOM code is only inside the init functions.
   A spectrum is [[mz, intensity], ...]. Pair-selection rule (also in the PR): all candidate pairs (direct: |dmz| <= tol; shifted: |dmz - Delta| <= tol, Delta = precursor_query - precursor_library,
   only for the modified cosine) are pooled, sorted by descending product of the two (transformed) intensities, ties by smaller |error| then by index; each peak is used once (greedy). */
"use strict";
(function () {
  const F = CHEMI.fn, sum = a => a.reduce((s, x) => s + x, 0), tolDa = (mz, t, ppm) => (ppm ? mz * t * 1e-6 : t);
  const clone = s => s.map(p => p.slice()), byMz = (a, b) => a[0] - b[0];

  /** Precursor removal (peaks above prec - margin), relative threshold, sorted by m/z. o: {prec, rem, margin, minRel}. */
  F.prep = (sp, o) => {
    const a = sp.filter(p => !(o.rem && p[0] > o.prec - (o.margin === undefined ? 1.5 : o.margin))), mx = Math.max(0, ...a.map(p => p[1]));
    return a.filter(p => p[1] >= (o.minRel || 0) * mx).sort(byMz);
  };
  /** Intensity i -> (mz^n)(i/max)^p: the weight used by the (weighted) cosine. */
  F.weigh = (sp, p, n) => { const mx = Math.max(1e-12, ...sp.map(x => x[1])); return sp.map(x => [x[0], Math.pow(x[0], n || 0) * Math.pow(x[1] / mx, p)]); };
  /** One-to-one greedy matching of A (query) and B (library). o: {tol, ppm, shift}. Returns [{i, j, sh (1 = shifted), err}] sorted by i. */
  F.match = (A, B, o) => {
    const c = [];
    A.forEach((a, i) => B.forEach((b, j) => {
      const t = tolDa(a[0], o.tol, o.ppm), d = a[0] - b[0];
      if (Math.abs(d) <= t) c.push({ i, j, sh: 0, err: Math.abs(d), w: a[1] * b[1] });
      if (o.shift && Math.abs(d - o.shift) <= t) c.push({ i, j, sh: 1, err: Math.abs(d - o.shift), w: a[1] * b[1] });
    }));
    c.sort((x, y) => y.w - x.w || x.err - y.err || x.i - y.i || x.j - y.j);
    const ui = {}, uj = {}, out = [];
    c.forEach(k => { if (!ui[k.i] && !uj[k.j]) { ui[k.i] = uj[k.j] = 1; out.push(k); } });
    return out.sort((x, y) => x.i - y.i);
  };
  /** Cosine over the matched pairs; unmatched peaks stay in the norms. */
  F.cosine = (A, B, pairs) => {
    const na = Math.sqrt(sum(A.map(x => x[1] * x[1]))), nb = Math.sqrt(sum(B.map(x => x[1] * x[1])));
    return na && nb ? sum(pairs.map(k => A[k.i][1] * B[k.j][1])) / (na * nb) : 0;
  };
  /** Reverse search: drop the query peaks that have no candidate in the library spectrum (direct or shifted when o.shift). */
  F.reverse = (A, B, o) => A.filter(a => B.some(b => Math.abs(a[0] - b[0]) <= tolDa(a[0], o.tol, o.ppm) || (o.shift && Math.abs(a[0] - b[0] - o.shift) <= tolDa(a[0], o.tol, o.ppm))));
  /** Shannon entropy (natural log) of a vector of intensities (normalised inside). */
  F.entropy = v => { const t = sum(v); return t > 0 ? -sum(v.map(x => (x > 0 ? (x / t) * Math.log(x / t) : 0))) : 0; };
  /** Li et al. reference code: normalise to sum 1; if S < 3 the intensities are raised to w = 0.25 + 0.25 S and renormalised. */
  F.entWeight = v => {
    const t = sum(v), p = v.map(x => x / t), S = F.entropy(p);
    if (S >= 3) return p;
    const q = p.map(x => Math.pow(x, 0.25 + 0.25 * S)), s = sum(q);
    return q.map(x => x / s);
  };
  /** Entropy similarity: 1 - (2 S_M - S_A - S_B) / ln 4, M = (A + B) / 2 after matching within the tolerance. o: {tol, ppm}. Also returns the number of matched peaks. */
  F.entSim = (A, B, o) => {
    if (!A.length || !B.length) return { s: 0, n: 0 };
    const a = F.entWeight(A.map(x => x[1])), b = F.entWeight(B.map(x => x[1]));
    const pr = F.match(A.map((x, i) => [x[0], a[i]]), B.map((x, i) => [x[0], b[i]]), { tol: o.tol, ppm: o.ppm });
    const ua = {}, ub = {}, m = [];
    pr.forEach(k => { ua[k.i] = ub[k.j] = 1; m.push((a[k.i] + b[k.j]) / 2); });
    a.forEach((x, i) => { if (!ua[i]) m.push(x / 2); });
    b.forEach((x, j) => { if (!ub[j]) m.push(x / 2); });
    const s = 1 - (2 * F.entropy(m) - F.entropy(a) - F.entropy(b)) / Math.log(4);
    return { s: Math.max(0, Math.min(1, s)), n: pr.length };
  };
  /** The four scores for a query q and a library spectrum l ({prec, pk}). o: {tol, ppm, p (intensity power), n (m/z power), rem, rev}. */
  F.scores = (q, l, o) => {
    const pq = { prec: q.prec, rem: o.rem, minRel: 0.01 }, pl = { prec: l.prec, rem: o.rem, minRel: 0.01 }, shift = q.prec - l.prec;
    let Q = F.prep(q.pk, pq); const L = F.prep(l.pk, pl);
    if (o.rev) Q = F.reverse(Q, L, { tol: o.tol, ppm: o.ppm, shift });
    const sc = (shift_, n) => { const A = F.weigh(Q, o.p, n), B = F.weigh(L, o.p, n), pr = F.match(A, B, { tol: o.tol, ppm: o.ppm, shift: shift_ }); return { v: F.cosine(A, B, pr), pr }; };
    const c = sc(0, 0), w = sc(0, o.n), m = sc(shift, 0), e = F.entSim(Q, L, o);
    return { cos: c.v, wcos: w.v, mcos: m.v, ent: e.s, nCos: c.pr.length, nMod: m.pr.length, pairs: m.pr, Q, L, shift };
  };
  const LIB = { prec: 237.1, pk: [[91.05, 5], [152.06, 9], [165.07, 6], [167.07, 12], [180.08, 22], [192.08, 35], [194.1, 100], [210.09, 8], [220.08, 18], [237.1, 15]] };
  const D = 14.0157, r4 = x => Math.round(x * 1e4) / 1e4;
  /** Preset pairs {q, l}: identico, rumore, analogo, energia, diverso. Same seed, same spectra. */
  F.presets = name => {
    const r = CHEMI.rng(7), l = { prec: LIB.prec, pk: clone(LIB.pk) }, j = () => (r() - 0.5) * 0.008;
    let q;
    if (name === "rumore") {
      q = { prec: LIB.prec, pk: LIB.pk.map(p => [r4(p[0] + j()), Math.max(1, Math.round(p[1] * (1 + 0.12 * CHEMI.normal(r))))]) };
      [[63.02, 4], [101.04, 3], [128.06, 5], [143.07, 3], [172.05, 4], [203.08, 3]].forEach(p => q.pk.push([r4(p[0] + j()), p[1]]));
    } else if (name === "analogo") {
      q = { prec: r4(LIB.prec + D), pk: LIB.pk.map(p => [r4(p[0] + (p[0] > 170 ? D : 0) + j()), p[1]]) };
    } else if (name === "energia") {
      const k = [60, 55, 45, 70, 55, 50, 30, 3, 2, 1];
      q = { prec: LIB.prec, pk: LIB.pk.map((p, i) => [r4(p[0] + j()), k[i]]) };
    } else if (name === "diverso") {
      q = { prec: 285.14, pk: [[77.04, 12], [105.03, 40], [123.04, 18], [152.06, 10], [167.09, 25], [194.11, 35], [211.12, 100], [240.13, 20], [285.14, 10]] };
    } else q = { prec: LIB.prec, pk: clone(LIB.pk) };
    return { q, l };
  };
  /** Chimeric MS2 for the isolation window. o: {w (width), d (distance of the co-eluting ion), r (its apex height / target apex), off (RT offset, min), t (time from the target apex, min), s (peak sigma, min)}. */
  const INT = [[77.04, 30], [105.03, 100], [128.06, 25], [167.07, 40], [211.12, 20]];
  F.chimera = o => {
    const g = (t, t0) => Math.exp(-0.5 * Math.pow((t - t0) / (o.s || 0.1), 2)), it = g(o.t, 0), ic = o.r * g(o.t, o.off), inside = Math.abs(o.d) <= o.w / 2 ? 1 : 0;
    const nl = sum(LIB.pk.map(p => p[1])), ni = sum(INT.map(p => p[1])), pk = LIB.pk.map(p => [p[0], it * p[1] / nl]);
    if (inside) INT.forEach(p => pk.push([p[0], ic * p[1] / ni]));
    const merged = {};
    pk.forEach(p => { merged[p[0]] = (merged[p[0]] || 0) + p[1]; });
    const sp = Object.keys(merged).map(k => [+k, merged[k]]).sort(byMz), L = F.prep(LIB.pk, { prec: LIB.prec, rem: true, minRel: 0.01 });
    const A = F.weigh(F.prep(sp, { prec: LIB.prec, rem: true, minRel: 0.01 }), 0.5, 0), B = F.weigh(L, 0.5, 0);
    const cos = F.cosine(A, B, F.match(A, B, { tol: 0.02 }));
    return { it, ic, inside, purity: it / (it + ic * inside || 1), cos, spec: sp };
  };

  // ------------------------------------------------------------------ DOM (browser only)
  const pc = x => Math.round(x * 100) + " %", f2 = x => CHEMI.fmtIt(x, 2);
  const css = () => getComputedStyle(document.documentElement), tok = n => css().getPropertyValue(n).trim();
  let styled = 0;
  const style = () => {
    if (styled++) return;
    const s = document.createElement("style");
    s.textContent = ".sbar{display:grid;grid-template-columns:minmax(120px,1fr) 2fr minmax(9em,1.2fr);gap:8px;align-items:center;margin:3px 0;font-size:14px}.sbar i{display:block;height:12px;background:var(--c1)}.sbar>div{border:1px solid var(--muted);height:14px}.sbar b{font-variant-numeric:tabular-nums}.btns button.pk[aria-pressed=true]{background:var(--sel);border:2px solid var(--accent);font-weight:700}";
    document.head.appendChild(s);
  };
  /** Preset buttons: the chosen one is marked by border and weight (not by the theme's white-on-accent), aria-pressed for screen readers. */
  const pick = (el, items, cur, cb) => {
    const b = document.createElement("div"); b.className = "btns"; b.setAttribute("role", "group"); el.appendChild(b);
    items.forEach(([k, lab]) => {
      const x = document.createElement("button"); x.type = "button"; x.className = "pk"; x.textContent = lab; x.setAttribute("aria-pressed", String(k === cur));
      x.onclick = () => { b.querySelectorAll("button").forEach(y => y.setAttribute("aria-pressed", String(y === x))); cb(k); }; b.appendChild(x);
    });
  };
  const debounce = fn => { let t; return () => { clearTimeout(t); t = setTimeout(fn, 150); }; };

  CHEMI.register("sim-chemi-specchio", el => {
    style();
    const pre = {}, st = { name: "analogo", add: 0 }, L = () => pre.l, bt = [["identico", "Identico"], ["rumore", "Rumore aggiunto"], ["analogo", "Analogo +CH₂"], ["energia", "Energia diversa"], ["diverso", "Composto diverso"]];
    const load = n => { Object.assign(pre, F.presets(n)); st.name = n; st.sel = 0; st.add = 0; };
    load("analogo");
    pick(el, bt, "analogo", k => { load(k); fill(); draw(); });
    let c;
    c = TP.controls(el, [
      { id: "tol", label: "Tolleranza", min: 0, max: 100, step: 1, value: 40, fmt: v => tolTxt(v) },
      { id: "u", label: "Unità della tolleranza", options: [["0", "Da"], ["1", "ppm"]], value: "0" },
      { id: "p", label: "Potenza dell'intensità", options: [["0", "0 (solo presenza)"], ["0.5", "0,5 (radice)"], ["1", "1 (lineare)"]], value: "0.5", num: false },
      { id: "n", label: "Potenza di m/z (coseno pesato)", min: 0, max: 3, step: 0.5, value: 1, fmt: v => CHEMI.fmtIt(v, 1) },
      { id: "rem", label: "Togli il precursore", options: [["1", "sì"], ["0", "no"]], value: "1" },
      { id: "rev", label: "Ricerca", options: [["0", "diretta"], ["1", "inversa"]], value: "0" },
      { id: "sel", label: "Picco da modificare (query)", options: [["0", "-"]], value: "0", num: false },
      { id: "int", label: "Intensità del picco", min: 0, max: 100, step: 1, value: 50, fmt: v => v + " %" },
    ], (v, id) => { if (id === "sel") syncInt(); if (id === "int" && pre.q.pk[+v.sel]) pre.q.pk[+v.sel][1] = v.int; draw(); });
    function tolTxt(v) { return c && c.u === 1 ? CHEMI.fmtIt(2 * Math.pow(100, v / 100), 0) + " ppm" : CHEMI.fmtIt(0.001 * Math.pow(500, v / 100), 3) + " Da"; }
    const bx = document.createElement("div"); bx.className = "btns"; el.appendChild(bx);
    [["del", "Elimina il picco"], ["noise", "Aggiungi un picco di rumore"], ["shift", "Sposta di +14,0157"]].forEach(([k, lab]) => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = lab; bx.appendChild(b);
      b.onclick = () => {
        const q = pre.q.pk, i = +c.sel;
        if (k === "del" && q.length > 1) q.splice(i, 1);
        else if (k === "noise") q.push([r4(60 + 150 * CHEMI.rng(11 + st.add++)()), 4]);
        else if (q[i]) q[i][0] = r4(q[i][0] + D);
        fill(); draw();
      };
    });
    const cv = TP.canvas(el, 300); cv.onresize = draw;
    const panel = document.createElement("div"), out = document.createElement("div"); out.className = "readout"; el.append(panel, out);
    const selEl = [...el.querySelectorAll(".ctl label")].find(l => /Picco da modificare/.test(l.textContent)).querySelector("select");
    function fill() {
      const q = pre.q.pk.slice().sort(byMz); pre.q.pk = q;
      selEl.innerHTML = q.map((p, i) => `<option value="${i}">${f2(p[0])}</option>`).join(""); selEl.value = "0"; c.sel = 0; syncInt();
    }
    function syncInt() { const p = pre.q.pk[+c.sel]; if (p) { c._set_int(p[1]); c.int = p[1]; } }
    const opt = () => { const ppm = c.u === 1; return { tol: ppm ? 2 * Math.pow(100, c.tol / 100) : 0.001 * Math.pow(500, c.tol / 100), ppm, p: +c.p, n: c.n, rem: c.rem === 1, rev: c.rev === 1 }; };
    const say = debounce(() => {
      const s = pre.s; out.textContent = `Coseno ${f2(s.cos)}, coseno pesato ${f2(s.wcos)}, coseno modificato ${f2(s.mcos)}, entropia ${f2(s.ent)}; picchi accoppiati (coseno modificato): ${s.nMod}. Spettri sintetici.`;
    });
    function draw() {
      const o = opt(), s = pre.s = F.scores(pre.q, pre.l, o), ink = tok("--ink"), c1 = tok("--c1"), c2 = tok("--c2");
      const all = pre.q.pk.concat(pre.l.pk), x0 = 50, x1 = Math.ceil((Math.max(...all.map(p => p[0])) + 10) / 10) * 10;
      const ax = TP.axes(cv, { x0, x1, y0: -122, y1: 150, xl: "m/z (query in alto, libreria in basso)", yl: "intensità relativa (%)", yfmt: v => Math.abs(v), yticks: [-100, -50, 0, 50, 100] });
      const { ctx, X, Y } = ax, mq = {}, ml = {};
      s.pairs.forEach(k => { mq[s.Q[k.i][0]] = k; ml[s.L[k.j][0]] = k; });
      ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = ink;
      s.pairs.forEach(k => {
        const a = s.Q[k.i], b = s.L[k.j], mq_ = Math.max(...pre.q.pk.map(p => p[1])), ml_ = Math.max(...pre.l.pk.map(p => p[1]));
        ctx.setLineDash(k.sh ? [2, 3] : []); ctx.beginPath(); ctx.moveTo(X(a[0]), Y(100 * a[1] / mq_)); ctx.lineTo(X(b[0]), Y(-100 * b[1] / ml_)); ctx.stroke();
      });
      ctx.restore();
      [[pre.q.pk, 1, c1, mq, s.Q], [pre.l.pk, -1, c2, ml, s.L]].forEach(([pk, sg, col, mm, kept]) => {
        const mx = Math.max(...pk.map(p => p[1]));
        pk.forEach(p => {
          const y = sg * 100 * p[1] / mx, hit = mm[p[0]], used = kept.some(k => k[0] === p[0]);
          ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = hit ? col : tok("--panel"); ctx.lineWidth = hit ? 3 : 1.4; if (!hit) ctx.setLineDash([4, 3]); if (!used) ctx.globalAlpha = 0.45;
          ctx.beginPath(); ctx.moveTo(X(p[0]), Y(0)); ctx.lineTo(X(p[0]), Y(y)); ctx.stroke(); ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(X(p[0]), Y(y), 4, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
          if (hit) TP.label(ax, p[0], y, "✓", ink, "center", sg > 0 ? "bottom" : "top", sg > 0 ? -8 : 8);
          else if (p[1] / mx > 0.15) TP.label(ax, p[0], y, f2(p[0]), ink, "center", sg > 0 ? "bottom" : "top", sg > 0 ? -7 : 7);
        });
      });
      TP.legend(ax, [["picco accoppiato ✓ (pieno)", ink, null], ["picco non accoppiato (vuoto)", ink, [4, 3]], ["accoppiato con lo spostamento Δ", ink, [2, 3]]]);
      const rows = [["Coseno", s.cos], ["Coseno pesato", s.wcos], ["Coseno modificato", s.mcos], ["Entropia spettrale", s.ent]];
      const word = v => (v >= 0.8 ? "molto simili" : v >= 0.5 ? "simili in parte" : "poco simili");
      panel.innerHTML = rows.map(([n, v]) => `<div class="sbar"><span>${n}</span><div><i style="width:${Math.round(v * 100)}%"></i></div><b>${f2(v)} · ${word(v)}</b></div>`).join("") +
        `<p class="note">Picchi accoppiati: ${s.nCos} (coseno), ${s.nMod} (coseno modificato). Δ = massa del precursore della query − massa della libreria = ${CHEMI.fmtIt(s.shift, 4)}. Spettri sintetici.</p>`;
      CHEMI.table(el, ["m/z query", "m/z libreria", "tipo", "intensità query", "intensità libreria"], s.pairs.length ? s.pairs.map(k => [f2(s.Q[k.i][0]), f2(s.L[k.j][0]), k.sh ? "spostato di Δ" : "diretto", Math.round(s.Q[k.i][1]), Math.round(s.L[k.j][1])]) : [["-", "-", "nessuna coppia", "-", "-"]], "Coppie di picchi accoppiate (regola greedy per prodotto decrescente)");
      say();
    }
    fill(); draw();
  });

  CHEMI.register("sim-chemi-purezza", el => {
    style();
    const c = TP.controls(el, [
      { id: "w", label: "Larghezza della finestra di isolamento", min: 0.4, max: 4, step: 0.1, value: 2, fmt: v => CHEMI.fmtIt(v, 1), unit: "m/z" },
      { id: "d", label: "Distanza dello ione co-eluente", min: 0.2, max: 3, step: 0.1, value: 0.8, fmt: v => CHEMI.fmtIt(v, 1), unit: "m/z" },
      { id: "r", label: "Intensità del co-eluente (rispetto al bersaglio)", min: 0, max: 400, step: 10, value: 100, fmt: v => v + " %" },
      { id: "off", label: "Scarto dei tempi di ritenzione", min: 0, max: 0.4, step: 0.02, value: 0.1, fmt: v => CHEMI.fmtIt(v, 2), unit: "min" },
      { id: "t", label: "Istante di acquisizione (0 = apice del bersaglio)", min: -0.3, max: 0.3, step: 0.02, value: 0, fmt: v => CHEMI.fmtIt(v, 2), unit: "min" },
    ], () => draw());
    const a = TP.canvas(el, 210), b = TP.canvas(el, 210), out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    a.onresize = b.onresize = draw;
    const say = debounce(() => { const k = pre; out.textContent = `Purezza del precursore ${pc(k.purity)}; coseno fra lo spettro misurato e quello puro: ${f2(k.cos)}. Il co-eluente è ${k.inside ? "dentro" : "fuori"} dalla finestra. Dati sintetici.`; });
    let pre;
    function draw() {
      const k = pre = F.chimera({ w: c.w, d: c.d, r: c.r / 100, off: c.off, t: c.t, s: 0.1 }), ink = tok("--ink"), c1 = tok("--c1"), c2 = tok("--c2"), cw = tok("--muted");
      const T = 237.1, ax = TP.axes(a, { x0: 233, x1: 241.5, y0: 0, y1: 4.5, xl: "m/z (MS1)", yl: "intensità ioni", yticks: [0, 1, 2, 3, 4], m: { l: 56, r: 14, t: 12, b: 38 } });
      const { ctx, X, Y } = ax;
      ctx.save(); ctx.fillStyle = cw; ctx.globalAlpha = 0.18; ctx.fillRect(X(T - c.w / 2), Y(4.5), X(T + c.w / 2) - X(T - c.w / 2), Y(0) - Y(4.5)); ctx.restore();
      ctx.save(); ctx.strokeStyle = ink; ctx.setLineDash([6, 3]); ctx.beginPath(); [T - c.w / 2, T + c.w / 2].forEach(x => { ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(4.5)); }); ctx.stroke(); ctx.restore();
      TP.label(ax, T, 4.5, `finestra ${f2(c.w)} m/z`, ink, "center", "top", 4);
      const ions = [[T, k.it, c1, null, "bersaglio"], [T + c.d, k.ic, c2, [4, 3], k.inside ? "co-eluente dentro ✗" : "co-eluente fuori ✓"]];
      ions.forEach(([x, h, col, dash, tx]) => {
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(Math.min(4.3, h * 3))); ctx.stroke(); ctx.restore();
        TP.label(ax, x, Math.min(4.3, h * 3), tx, ink, "center", "bottom", -3);
      });
      const bx = TP.axes(b, { x0: 50, x1: 250, y0: -105, y1: 105, xl: "m/z (misurato in alto, libreria pura in basso)", yl: "intensità (%)", yfmt: v => Math.abs(v), yticks: [-100, 0, 100] });
      const mx = Math.max(...k.spec.map(p => p[1])), lm = Math.max(...LIB.pk.map(p => p[1]));
      TP.sticks(bx, k.spec.map(p => p[0]), k.spec.map(p => 100 * p[1] / mx), c1, 3);
      TP.sticks(bx, LIB.pk.map(p => p[0]), LIB.pk.map(p => -100 * p[1] / lm), c2, 3);
      CHEMI.table(el, ["ione", "m/z", "corrente (unità relativa)", "nella finestra"], [["bersaglio", f2(T), f2(k.it), "sì"], ["co-eluente", f2(T + c.d), f2(k.ic), k.inside ? "sì" : "no"], ["purezza", "-", pc(k.purity), "-"], ["coseno con lo spettro puro", "-", f2(k.cos), "-"]], "Ioni nella finestra di isolamento (dati sintetici)");
      say();
    }
    draw();
  });
})();
