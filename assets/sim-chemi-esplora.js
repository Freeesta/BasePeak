// Figure file for chapter pages: owned by DEV-CHEMI-03 (sim-chemi-tabella).
// Figure 27.3: explore a synthetic feature table (3 blanks, 6 samples, 4 QCs, 60 features with 5 planted artefacts): filters and normalisation.
// Synthetic and seeded; the pure functions live in CHEMI.fn (tested in node).
"use strict";
(function () {
  const C = CHEMI, F = C.fn, SEEDS = [3, 12, 23, 41, 58, 64];
  const NB = 3, NSM = 6, NQ = 4, NF = 60;
  const DIL = [1.0, 0.7, 1.35, 0.85, 1.2, 0.6], QCDRIFT = [1, 0.93, 0.86, 0.78], FEATDRIFT = [1, 1.6, 2.4, 3.4];
  const med = a => { const s = a.filter(x => x > 0).sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const rsd = a => { const m = mean(a); return m > 0 ? 100 * Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)) / m : NaN; };

  /** Synthetic study. art: null | "contaminante" | "frammento" | "isotopo" | "rumore" | "deriva" (the five planted artefacts). */
  F.makeStudy = seed => {
    const r = C.rng(seed), feats = [];
    for (let i = 0; i < NF; i++) {
      const L = 10 ** (3.6 + 2.2 * r()), sdq = r() < 0.3 ? 0.1 + 0.3 * r() : 0.03 + 0.05 * r(), pr = r() < 0.15 ? 0.45 : 0.97, f = { mz: 120 + 580 * r(), rt: 1 + 17 * r(), L, sdq, art: null, ann: "" };
      f.samp = DIL.map(d => (r() > pr ? 0 : L * d * (1 + 0.06 * C.normal(r))));
      f.qc = QCDRIFT.map(g => L * g * (1 + sdq * C.normal(r)));
      f.blank = r() < 0.4 ? [0, 1, 2].map(() => L * (0.01 + 0.35 * r())) : [0, 0, 0];
      feats.push(f);
    }
    const mark = (i, art) => { feats[i].art = art; return feats[i]; };
    const k = mark(7, "contaminante"); k.samp = DIL.map(() => k.L * 1.1 * (1 + 0.05 * C.normal(r))); k.blank = [0, 1, 2].map(() => k.L * (0.9 + 0.1 * r())); k.qc = QCDRIFT.map(() => k.L * (1 + 0.04 * C.normal(r)));
    [12, 30].forEach(i => { const p = feats[i]; p.samp = DIL.map(d => p.L * d * (1 + 0.06 * C.normal(r))); p.qc = QCDRIFT.map(g => p.L * g * (1 + 0.04 * C.normal(r))); p.blank = [0, 0, 0]; });
    const p1 = feats[12], fr = mark(20, "frammento"); Object.assign(fr, { mz: p1.mz - 18.0106, rt: p1.rt, parent: p1, blank: [0, 0, 0] });
    fr.samp = p1.samp.map(x => x * 0.12 * (1 + 0.04 * C.normal(r))); fr.qc = p1.qc.map(x => x * 0.12 * (1 + 0.04 * C.normal(r)));
    const p2 = feats[30], is = mark(35, "isotopo"); Object.assign(is, { mz: p2.mz + 1.0033548, rt: p2.rt, parent: p2, blank: [0, 0, 0] });
    is.samp = p2.samp.map(x => x * 0.18 * (1 + 0.04 * C.normal(r))); is.qc = p2.qc.map(x => x * 0.18 * (1 + 0.04 * C.normal(r)));
    const nz = mark(44, "rumore"); nz.blank = [0, 0, 0]; nz.samp = [0, 0, 380 * (1 + r()), 0, 0, 0]; nz.qc = [0, 250, 0, 0];
    const dr = mark(51, "deriva"); dr.blank = [0, 0, 0]; dr.qc = FEATDRIFT.map((g, i) => dr.L * QCDRIFT[i] * g * (1 + 0.03 * C.normal(r))); dr.sdq = 0.4;
    feats.sort((a, b) => a.mz - b.mz); feats.forEach((f, i) => { f.id = "F" + (i + 1); });
    feats.forEach(f => { if (f.parent) f.ann = (f.art === "frammento" ? "frammento di " : "isotopo 13C di ") + f.parent.id + (f.art === "frammento" ? " (−H2O)" : ""); });
    return { feats };
  };
  F.study = F.makeStudy;

  /** Normalisation factors for the samples and the QCs. method: none | tot | med | pqn. */
  F.normFactors = (st, method) => {
    const cols = [].concat(Array.from({ length: NSM }, (_, j) => st.feats.map(f => f.samp[j])), Array.from({ length: NQ }, (_, j) => st.feats.map(f => f.qc[j])));
    if (method === "none") return cols.map(() => 1);
    let raw;
    if (method === "tot") raw = cols.map(c => c.reduce((a, b) => a + b, 0));
    else if (method === "med") raw = cols.map(med);
    else {
      const tot = cols.map(c => c.reduce((a, b) => a + b, 0)), tm = med(tot), n = cols.map((c, j) => c.map(x => x * tm / tot[j]));
      const ref = st.feats.map((_, i) => med(n.slice(NSM).map(c => c[i])));
      raw = n.map((c, j) => med(c.map((x, i) => (ref[i] > 0 && x > 0 ? x / ref[i] : 0))) * tot[j] / tm);
    }
    const m = med(raw); return raw.map(x => x / m);
  };

  /** Metrics and verdict per feature. o: {fold, minRep, maxRsd, norm, annot}. */
  F.evalStudy = (st, o) => {
    const fac = F.normFactors(st, o.norm);
    return st.feats.map(f => {
      const s = f.samp.map((x, j) => x / fac[j]), q = f.qc.map((x, j) => x / fac[NSM + j]), bm = mean(f.blank), sm = mean(s), reps = f.samp.filter(x => x > 0).length;
      const ratio = bm > 0 ? mean(f.samp) / bm : Infinity, rq = rsd(q), rs = rsd(s), why = [];
      if (ratio < o.fold) why.push(`nel bianco: rapporto ${TPfmt(ratio, 1)} < ${o.fold}`);
      if (reps < o.minRep) why.push(`presente in ${reps} campioni su ${NSM} (ne servono ${o.minRep})`);
      if (!(rq <= o.maxRsd)) why.push(`RSD dei QC ${isFinite(rq) ? TPfmt(rq, 0) : "non calcolabile"}% > ${o.maxRsd}%`);
      if (o.annot && f.ann) why.push(f.ann);
      return { f, mean: sm, ratio, reps, rq, rs, why, keep: !why.length };
    });
  };
  const TPfmt = (x, d) => (typeof TP !== "undefined" && TP.fmt ? TP.fmt(x, d) : (+x).toFixed(d));

  C.register("sim-chemi-tabella", el => {
    let si = 0, sk = "mz", dir = 1, timer = 0;
    const later = () => { clearTimeout(timer); timer = setTimeout(draw, 150); };
    const v = TP.controls(el, [
      { id: "fold", label: "Rapporto minimo campione/bianco", min: 1, max: 20, step: 1, value: 5 },
      { id: "minRep", label: "Campioni in cui deve comparire (su 6)", min: 1, max: 6, step: 1, value: 4 },
      { id: "maxRsd", label: "RSD massimo dei QC", min: 5, max: 60, step: 1, value: 30, unit: "%" },
      { id: "norm", label: "Normalizzazione", options: [["none", "nessuna"], ["tot", "intensità totale"], ["med", "mediana"], ["pqn", "PQN"]], value: "none", num: false },
      { id: "show", label: "Righe mostrate", options: [["all", "tutte"], ["keep", "solo quelle che restano"], ["out", "solo quelle escluse"]], value: "all", num: false },
      { id: "q", label: "Filtra per m/z (testo)", text: true, value: "" },
    ], later);
    const lab = document.createElement("label"), cb = document.createElement("input"); cb.type = "checkbox"; cb.onchange = later;
    lab.style.cssText = "display:flex;gap:6px;margin:6px 0"; lab.append(cb, "Togli isotopi e frammenti annotati (capitolo 26)"); el.appendChild(lab);
    const nb = document.createElement("div"); nb.className = "btns"; const bt = document.createElement("button"); bt.type = "button"; bt.textContent = "Nuovi dati";
    bt.onclick = () => { si = (si + 1) % SEEDS.length; later(); }; nb.appendChild(bt); el.appendChild(nb);
    const COLS = [["id", "Feature"], ["mz", "m/z"], ["rt", "RT (min)"], ["bl", "Bianco (media)"], ["me", "Campioni (media)"], ["ra", "Campione/bianco"], ["re", "Campioni"], ["rq", "RSD QC (%)"], ["rs", "RSD campioni (%)"], ["ok", "Esito"]];
    const reg = document.createElement("div"); reg.setAttribute("role", "region"); reg.setAttribute("aria-label", "Tabella delle feature, scorrevole"); reg.tabIndex = 0; reg.style.cssText = "max-height:26em;overflow:auto";
    const tb = document.createElement("table"), cap = document.createElement("caption"), th = document.createElement("thead"), tr = document.createElement("tr"), body = document.createElement("tbody");
    cap.textContent = "Tabella delle feature di uno studio sintetico (3 bianchi, 6 campioni, 4 QC)"; tb.appendChild(cap);
    COLS.forEach(([k, t]) => {
      const h = document.createElement("th"), b = document.createElement("button"); h.scope = "col"; h.dataset.k = k; b.type = "button"; b.textContent = t; b.style.cssText = "font:inherit;background:none;border:0;color:inherit;cursor:pointer;padding:2px 4px;min-height:24px;font-weight:650";
      b.onclick = () => { if (sk === k) dir = -dir; else { sk = k; dir = 1; } draw(); b.focus(); }; h.appendChild(b); tr.appendChild(h);
    });
    th.appendChild(tr); tb.append(th, body); reg.appendChild(tb); el.appendChild(reg);
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);
    const key = (r, k) => ({ id: +r.f.id.slice(1), mz: r.f.mz, rt: r.f.rt, bl: mean(r.f.blank), me: r.mean, ra: r.ratio, re: r.reps, rq: r.rq, rs: r.rs, ok: r.keep ? 1 : 0 }[k]);
    function draw() {
      const st = F.study(SEEDS[si]), rows = F.evalStudy(st, { fold: v.fold, minRep: v.minRep, maxRsd: v.maxRsd, norm: v.norm, annot: cb.checked });
      const kept = rows.filter(r => r.keep).length, art = rows.filter(r => r.f.art), gone = art.filter(r => !r.keep).length;
      const q = String(v.q || "").trim().replace(",", ".");
      let view = rows.filter(r => (v.show === "all" || (v.show === "keep") === r.keep) && (!q || r.f.mz.toFixed(4).includes(q)));
      view.sort((a, b) => { const x = key(a, sk), y = key(b, sk); return ((isNaN(x) ? -1e18 : x) - (isNaN(y) ? -1e18 : y)) * dir || a.f.mz - b.f.mz; });
      th.querySelectorAll("th").forEach(h => h.setAttribute("aria-sort", h.dataset.k === sk ? (dir > 0 ? "ascending" : "descending") : "none"));
      body.innerHTML = view.map(r => `<tr><td>${r.f.id}</td><td>${TP.fmt(r.f.mz, 4)}</td><td>${TP.fmt(r.f.rt, 2)}</td><td>${Math.round(mean(r.f.blank))}</td><td>${Math.round(r.mean)}</td><td>${isFinite(r.ratio) ? TP.fmt(r.ratio, 1) : "nessun segnale"}</td><td>${r.reps}/6</td><td>${isFinite(r.rq) ? TP.fmt(r.rq, 0) : "—"}</td><td>${isFinite(r.rs) ? TP.fmt(r.rs, 0) : "—"}</td><td>${r.keep ? "✓ resta" : "✗ " + r.why.join("; ")}</td></tr>`).join("");
      const rk = rows.filter(r => r.keep && !r.f.art).map(r => r.rs).filter(isFinite).sort((a, b) => a - b);
      out.textContent = `Restano ${kept} feature su ${rows.length}; ${gone} artefatti su ${art.length} eliminati. RSD mediano dei campioni, nelle righe buone: ${TP.fmt(rk.length ? rk[Math.floor(rk.length / 2)] : 0, 0)}%. Dati sintetici, seme ${SEEDS[si]}.`;
    }
    draw();
  });
})();
