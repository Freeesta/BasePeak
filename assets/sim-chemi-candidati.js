// BasePeak - part VII, chapter 30: figures sim-chemi-formula and sim-chemi-candidati. owned by DEV-CHEMI-05.
// Pure functions live in CHEMI.fn (tested in node, tests/test_chemi_livelli.py); the DOM code below only wires them to controls.
// All data are synthetic. Needs masse.js (global MASSE) at call time, loaded by the chapter before teoria.js.
"use strict";
(function () {
  const F = CHEMI.fn, ppmOf = (a, b) => (a - b) / b * 1e6;
  const PROTON = 1.00727646688;                           // proton mass (u): H atom minus one electron
  /** Ion types: neutral mass M = m/z - shift (positive modes) or m/z + proton (negative). */
  F.ION = { "[M+H]+": 1.00727646688, "[M+Na]+": 22.98922070, "[M-H]-": -1.00727646688 };
  F.ionMass = (formula, ion) => MASSE.exact(formula) + F.ION[ion];
  /** Element ranges of the didactic search (H is solved, not looped). Order = outer to inner loop. */
  F.RANGES = { Br: [0, 2], Cl: [0, 4], F: [0, 8], S: [0, 3], P: [0, 2], N: [0, 10], O: [0, 12] };
  F.rdb = f => (f.C || 0) - ((f.H || 0) + (f.F || 0) + (f.Cl || 0) + (f.Br || 0)) / 2 + ((f.N || 0) + (f.P || 0)) / 2 + 1;
  F.fstr = f => ["C", "H", "Br", "Cl", "F", "N", "O", "P", "S"].filter(e => f[e]).map(e => e + (f[e] > 1 ? f[e] : "")).join("");
  /** All CcHhNnOo(PpSsClxBrF) neutral formulas whose ion mass is within tol ppm of mz. maxIter bounds the work. */
  F.enumFormulas = (mz, ion, tol, use, maxIter) => {
    maxIter = maxIter || 600000;
    const sh = F.ION[ion], M = mz - sh, ex = MASSE.exact, mH = ex("H"), mC = 12, out = [];
    const els = Object.keys(F.RANGES).filter(e => use[e] || e === "N" || e === "O"), mass = {};
    els.forEach(e => { mass[e] = ex(e); });
    let it = 0, cut = false;
    const rec = (i, rest, cnt) => {
      if (cut) return;
      if (i === els.length) {
        // C window: 0 <= H <= 4C+4 keeps only a few carbon counts per combination
        const c0 = Math.max(1, Math.ceil((rest - 4 * mH) / (mC + 4 * mH))), c1 = Math.min(40, Math.floor(rest / mC));
        for (let c = c0; c <= c1; c++) {
          if (++it > maxIter) { cut = true; return; }
          const h = Math.round((rest - c * mC) / mH);
          if (h < 0 || h > 4 * c + 4) continue;
          const calc = c * mC + h * mH + (M - rest) + sh;     // ion mass of this formula
          const e = ppmOf(calc, mz);
          if (Math.abs(e) <= tol) { const f = Object.assign({ C: c, H: h }, cnt); out.push({ f, ppm: e }); }
        }
        return;
      }
      const el = els[i], r = F.RANGES[el];
      for (let n = r[0]; n <= r[1]; n++) {
        const left = rest - n * mass[el];
        if (left < mC - 0.01) break;
        const next = n ? Object.assign({}, cnt, { [el]: n }) : cnt;
        rec(i + 1, left, next);
      }
    };
    rec(0, M, {});
    out.iterations = it; out.truncated = cut;
    return out;
  };
  /** Didactic isotope score over M+1..M+3 (M = 100 is the reference): 1 - sum|r-t| / sum t. Real programs use other scores. */
  F.isoScore = (meas, theo) => {
    let d = 0, s = 0;
    for (let k = 1; k <= 3; k++) { const t = theo[k] || 0, r = meas[k] || 0; d += Math.abs(r - t); s += t; }
    return s ? Math.max(0, 1 - d / s) : (d ? 0 : 1);
  };
  /** Measured pattern (M..M+3) of a true formula: quality "good" (4 % noise), "sat" (detector saturated, M at 60 %) or "m2" (M+2 and M+3 lost below threshold). */
  F.measuredPattern = (formula, quality, seed) => {
    const t = MASSE.pattern(formula, 4), r = CHEMI.rng(seed);
    const p = t.map((v, k) => (k ? v * (1 + 0.04 * CHEMI.normal(r)) : 100));
    if (quality === "sat") for (let k = 1; k < 4; k++) p[k] /= 0.6;
    if (quality === "m2") { p[2] = 0; p[3] = 0; }
    return p;
  };
  /** Funnel: stage 0 mass only, 1 + RDB, 2 + H/C, 3 + isotope score. A switched-off rule lets everything through. */
  F.funnel = (o) => {
    const all = F.enumFormulas(o.mz, o.ion, o.tol, o.use, o.maxIter);
    const rules = o.rules, res = [];
    const rows = all.map(x => {
      const f = x.f, rdb = F.rdb(f);
      const okR = !rules.rdb || (rdb >= 0 && Math.abs(rdb - Math.round(rdb)) < 1e-9);
      const okH = !rules.hc || (f.H / f.C >= 0.2 && f.H / f.C <= 3.1);
      const sc = F.isoScore(o.meas, MASSE.pattern(f, 4));
      const okI = !rules.iso || sc >= o.minIso;
      return { f, name: F.fstr(f), ppm: x.ppm, rdb, score: sc, okR, okH, okI };
    });
    const n0 = rows.length, a = rows.filter(r => r.okR), b = a.filter(r => r.okH), c = b.filter(r => r.okI);
    c.sort((p, q) => q.score - p.score || Math.abs(p.ppm) - Math.abs(q.ppm) || (p.name < q.name ? -1 : 1));
    res.counts = [n0, a.length, b.length, c.length];
    res.list = c; res.iterations = all.iterations; res.truncated = all.truncated;
    return res;
  };
  /** Presets: generic compounds, ion type, measured m/z computed from the true formula plus a seeded error (|err| <= 3.5 ppm). */
  F.FORMULA_PRESETS = {
    atrazina: { formula: "C8H14ClN5", ion: "[M+H]+" }, caffeina: { formula: "C8H10N4O2", ion: "[M+H]+" },
    imidacloprid: { formula: "C9H10ClN5O2", ion: "[M+H]+" }, diclofenac: { formula: "C14H11Cl2NO2", ion: "[M+H]+" },
    sulfametossazolo: { formula: "C10H11N3O3S", ion: "[M+H]+" }, ibuprofene: { formula: "C13H18O2", ion: "[M-H]-" },
  };
  F.measuredMz = (formula, ion, seed) => {
    const r = CHEMI.rng(seed), e = Math.max(-3.5, Math.min(3.5, 1.5 * CHEMI.normal(r)));
    return { mz: F.ionMass(formula, ion) * (1 + e * 1e-6), err: e };
  };

  // ---------------------------------------------------------------- didactic isomers (figure 30.2)
  /** Three isomers of C8H8O2 with hand-written predicted fragment ions (cation formulas), no external database. */
  F.ISOMERS = [
    { id: "A", name: "benzoato di metile", frags: ["C7H5O", "C6H5", "C5H5"] },
    { id: "B", name: "acido fenilacetico", frags: ["C8H7O", "C7H7", "C5H5"] },
    { id: "C", name: "acido 4-metilbenzoico", frags: ["C8H7O", "C7H7", "C5H5"] },
  ];
  F.fragMz = f => MASSE.exact(f) - MASSE.ELECTRON;
  /** Synthetic MS/MS spectrum of the [M+H]+ 137.0597: [formula or null, relative intensity]; unexplained peaks carry a plain m/z. */
  F.SPECTRUM = [["C7H7", 100], ["C8H7O", 55], ["C5H5", 15], ["C7H5O", 10], [53.0386, 8]];
  F.peaks = seed => {
    const r = CHEMI.rng(seed);
    return F.SPECTRUM.map(([x, h]) => {
      const th = typeof x === "string" ? F.fragMz(x) : x;
      return { mz: th * (1 + 1.2 * CHEMI.normal(r) * 1e-6), th, h, f: typeof x === "string" ? x : null };
    });
  };
  /** Fraction of the intensity (each intensity raised to w) that a candidate's fragments explain within tol ppm; matched = indices. */
  F.explained = (peaks, cand, tol, w) => {
    const fr = cand.frags.map(F.fragMz), matched = [];
    let num = 0, den = 0;
    peaks.forEach((p, i) => {
      const v = Math.pow(p.h, w); den += v;
      if (fr.some(m => Math.abs(ppmOf(p.mz, m)) <= tol)) { num += v; matched.push(i); }
    });
    return { frac: den ? num / den : 0, matched };
  };

  // ---------------------------------------------------------------- DOM helpers (browser only)
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue("--" + n).trim() || "#24231f";
  const debounced = (out, fn) => { let t = null; return () => { clearTimeout(t); t = setTimeout(() => { out.innerHTML = fn(); }, 150); }; };
  const it = (x, d) => CHEMI.fmtIt(x, d);
  const sub = s => s.replace(/(\d+)/g, "<sub>$1</sub>");
  const checks = (el, legend, items, on) => {
    const fs = document.createElement("fieldset"); fs.className = "chemi-cb"; fs.style.cssText = "border:0;padding:0;margin:6px 0";
    fs.innerHTML = `<legend>${legend}</legend>`;
    const st = {};
    items.forEach(([k, lab, v]) => {
      st[k] = !!v;
      const l = document.createElement("label"); l.style.cssText = "display:inline-flex;gap:6px;align-items:center;min-height:28px;margin-right:14px";
      l.innerHTML = `<input type="checkbox"${v ? " checked" : ""}> ${lab}`;
      l.firstChild.onchange = e => { st[k] = e.target.checked; on(st, k); };
      fs.appendChild(l);
    });
    el.appendChild(fs);
    return st;
  };
  const button = (el, txt, fn) => { const b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.style.cssText = "min-height:28px;margin:4px 8px 4px 0"; b.onclick = fn; el.appendChild(b); return b; };

  // ---------------------------------------------------------------- figure 30.1
  CHEMI.register("sim-chemi-formula", el => {
    let seed = 7;
    const names = Object.keys(F.FORMULA_PRESETS);
    const v = TP.controls(el, [
      { id: "p", label: "Composto di esempio (dati sintetici)", num: false, value: "atrazina", options: names.map(n => [n, n[0].toUpperCase() + n.slice(1)]) },
      { id: "ion", label: "Tipo di ione", num: false, value: "[M+H]+", options: Object.keys(F.ION).map(k => [k, k]) },
      { id: "tol", label: "Tolleranza", min: 1, max: 20, step: 0.5, value: 5, unit: "ppm", fmt: x => it(x, 1) },
      { id: "q", label: "Qualità del pattern isotopico misurato", num: false, value: "good", options: [["good", "buona"], ["sat", "rivelatore saturo"], ["m2", "manca M+2"]] },
      { id: "min", label: "Punteggio isotopico minimo", min: 0.5, max: 0.99, step: 0.01, value: 0.9, fmt: x => it(x, 2) },
    ], (val, id) => {
      if (id === "p") { const s = el.querySelectorAll("select")[1]; s.value = F.FORMULA_PRESETS[val.p].ion; val.ion = s.value; }
      run();
    });
    const use = checks(el, "Elementi oltre a C H N O", ["P", "S", "Cl", "Br", "F"].map(e => [e, e, e === "S" || e === "Cl"]), () => run());
    const rules = checks(el, "Regole", [["rdb", "RDB ≥ 0 e intero", true], ["hc", "H/C tra 0,2 e 3,1", true], ["iso", "Punteggio isotopico ≥ minimo", true]], () => run());
    button(el, "Nuovi dati", () => { seed += 1; run(); });
    const c = TP.canvas(el, 170); c.onresize = () => run();
    const tb = document.createElement("div"); el.appendChild(tb);
    const out = document.createElement("div"); out.className = "readout"; out.setAttribute("aria-live", "polite"); el.appendChild(out);
    const say = debounced(out, () => say.txt);
    function run() {
      const P = F.FORMULA_PRESETS[v.p], ion = v.ion, true_ = P.formula;
      // the measured value follows the preset's own ion type unless the user changes it: a wrong ion type is the pitfall to see
      const mz = F.measuredMz(true_, P.ion, seed).mz, meas = F.measuredPattern(true_, v.q, seed);
      const t0 = performance.now();
      const res = F.funnel({ mz, ion, tol: v.tol, use, rules, meas, minIso: v.min });
      const ms = performance.now() - t0, truth = F.fstr(MASSE.parse(true_));
      const rank = res.list.findIndex(r => r.name === truth) + 1;
      draw(res.counts);
      tb.innerHTML = `<table><caption>Prime 10 formule (seme ${seed}, m/z misurato ${it(mz, 4)}, dati sintetici)</caption><tr><th scope="col">Formula</th><th scope="col">Errore (ppm)</th><th scope="col">RDB</th><th scope="col">Punteggio isotopico</th><th scope="col">Esito</th></tr>` +
        res.list.slice(0, 10).map(r => `<tr><td>${sub(r.name)}</td><td>${it(r.ppm, 1)}</td><td>${it(r.rdb, 1)}</td><td>${it(r.score, 2)}</td><td>${r.name === truth ? "✓ formula vera" : "–"}</td></tr>`).join("") + "</table>";
      CHEMI.table(el, ["Fase", "Formule rimaste"], [["Solo massa", res.counts[0]], ["+ RDB", res.counts[1]], ["+ H/C", res.counts[2]], ["+ isotopi", res.counts[3]]], "Imbuto delle formule");
      say.txt = `Da <b>${res.counts[0]}</b> a <b>${res.counts[3]}</b> candidati` + (res.truncated ? " (ricerca interrotta: troppi elementi attivi)" : "") + ". " +
        (rank ? `La formula vera ${sub(truth)} è <b>${rank}ª</b> in classifica.` : `<span class="bad">✗ La formula vera ${sub(truth)} non è più nella lista</span>: ${ion !== P.ion ? "il tipo di ione è sbagliato" : "tolleranza, elementi o regole la escludono"}.`) +
        ` Calcolo ${it(ms, 0)} ms.`;
      say();
    }
    function draw(cn) {
      const { ctx, W, H } = c, ink = tok("ink"), line = tok("c1"), lab = ["Solo massa", "+ RDB", "+ H/C", "+ isotopi"];
      const flags = [true, rules.rdb, rules.hc, rules.iso];
      ctx.clearRect(0, 0, W, H); ctx.font = "13px system-ui,sans-serif"; ctx.textBaseline = "middle";
      const mx = Math.log10(Math.max(cn[0], 1) + 1), x0 = 120, bh = 26, gap = 10;
      cn.forEach((n, i) => {
        const y = 10 + i * (bh + gap), w = Math.max(2, (W - x0 - 90) * Math.log10(n + 1) / (mx || 1));
        ctx.fillStyle = ink; ctx.textAlign = "right"; ctx.fillText(lab[i], x0 - 8, y + bh / 2);
        ctx.lineWidth = 2; ctx.strokeStyle = line; ctx.fillStyle = line;
        if (flags[i]) ctx.fillRect(x0, y, w, bh); else { ctx.setLineDash([5, 3]); ctx.strokeRect(x0 + 1, y + 1, w - 2, bh - 2); ctx.setLineDash([]); }
        ctx.fillStyle = ink; ctx.textAlign = "left"; ctx.fillText(n + (flags[i] ? "" : " (regola spenta)"), x0 + w + 8, y + bh / 2);
      });
      ctx.textAlign = "right"; ctx.fillText("scala logaritmica", W - 8, H - 8);
    }
    run();
  });

  // ---------------------------------------------------------------- figure 30.2
  CHEMI.register("sim-chemi-candidati", el => {
    let seed = 3;
    const v = TP.controls(el, [
      { id: "tol", label: "Tolleranza", min: 1, max: 50, step: 1, value: 10, unit: "ppm" },
      { id: "c", label: "Candidato da mostrare", num: false, value: "B", options: F.ISOMERS.map(x => [x.id, x.id + " · " + x.name]) },
      { id: "w", label: "Peso dell'intensità (0 = conta i picchi, 1 = lineare, 2 = favorisce i picchi alti)", min: 0, max: 2, step: 0.25, value: 1, fmt: x => it(x, 2) },
    ], () => run());
    button(el, "Nuovi dati", () => { seed += 1; run(); });
    const c = TP.canvas(el, 230); c.onresize = () => run();
    const tb = document.createElement("div"); el.appendChild(tb);
    const out = document.createElement("div"); out.className = "readout"; out.setAttribute("aria-live", "polite"); el.appendChild(out);
    const say = debounced(out, () => say.txt);
    function run() {
      const pk = F.peaks(seed), rs = F.ISOMERS.map(x => Object.assign({ x }, F.explained(pk, x, v.tol, v.w)));
      const sel = rs.find(r => r.x.id === v.c), ord = rs.slice().sort((a, b) => b.frac - a.frac);
      draw(pk, sel);
      tb.innerHTML = `<table><caption>Classifica dei tre isomeri (spettro sintetico di [M+H]<sup>+</sup> 137,0597, seme ${seed})</caption><tr><th scope="col">Posto</th><th scope="col">Candidato</th><th scope="col">Segnale spiegato</th><th scope="col">Picchi spiegati</th></tr>` +
        ord.map((r, i) => `<tr><td>${i + 1}</td><td>${r.x.id} · ${r.x.name}</td><td>${it(r.frac * 100, 0)} %</td><td>${r.matched.length} su ${pk.length}</td></tr>`).join("") + "</table>";
      CHEMI.table(el, ["m/z", "Intensità", "Formula assegnata"], pk.map(p => [it(p.mz, 4), p.h, p.f || "non assegnato"]), "Picchi dello spettro sintetico");
      const tied = ord.filter(r => ord[0].frac - r.frac < 0.02);
      say.txt = tied.length > 1 ? `${tied.length === 2 ? "Due candidati spiegano" : "Tre candidati spiegano"} il <b>${it(ord[0].frac * 100, 0)} %</b> del segnale: lo spettro non li distingue.`
        : `Il candidato <b>${ord[0].x.id}</b> spiega il <b>${it(ord[0].frac * 100, 0)} %</b> del segnale, gli altri al più il ${it(ord[1].frac * 100, 0)} %: qui lo spettro li distingue.`;
      say();
    }
    function draw(pk, sel) {
      const { ctx, W, H } = c, ink = tok("ink"), col = tok("c1"), mu = tok("muted"), L = 46, B = 34, T = 22;
      ctx.clearRect(0, 0, W, H); ctx.font = "12px system-ui,sans-serif";
      const lo = 45, hi = 130, X = m => L + (m - lo) / (hi - lo) * (W - L - 12), Y = h => H - B - h / 110 * (H - B - T);
      ctx.strokeStyle = mu; ctx.fillStyle = ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, H - B); ctx.lineTo(W - 8, H - B); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let m = 50; m <= 130; m += 20) ctx.fillText(String(m), X(m), H - B + 4);
      ctx.fillText("m/z (spettro sintetico)", L + (W - L) / 2, H - 14);
      ctx.save(); ctx.translate(12, T + (H - T - B) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("intensità relativa", 0, 0); ctx.restore();
      pk.forEach((p, i) => {
        const ok = sel.matched.indexOf(i) >= 0, x = X(p.mz);
        ctx.strokeStyle = ok ? col : mu; ctx.lineWidth = ok ? 3 : 2; ctx.setLineDash(ok ? [] : [4, 3]);
        ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, Y(p.h)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText((ok ? "✓ " : "✗ ") + (ok ? p.f : p.f ? "" : "?"), x, Y(p.h) - 3);
      });
      ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = ink; ctx.fillText(`Candidato ${sel.x.id}: ✓ spiegato, ✗ non spiegato`, L + 6, 4);
    }
    run();
  });
})();
