// Figure file for chapter pages: owned by DEV-CHEMI-03 (sim-chemi-gruppi).
// Figure 26.1: grouping of features into compounds by retention time, EIC shape correlation and mass differences (CAMERA-like).
// All data are synthetic and seeded. The pure functions live in CHEMI.fn so that node can test them.
"use strict";
(function () {
  const C = CHEMI, F = C.fn;
  const T0 = 2.5, DT = 0.01, NPT = 601;          // shared RT grid (min)
  const SEEDS = [7, 12, 23, 41, 58, 64, 77, 91];

  // Mass differences (u) between two ions of the same compound. Recomputed from assets/masse.js by tests/test_chemi_tabella.py.
  F.RULES = [
    { k: "c13", dms: [1.0033548], labs: ["13C invece di 12C"], ratio: [0.02, 0.6] },
    { k: "cl", dms: [1.9970499, 1.9979521], labs: ["37Cl invece di 35Cl", "81Br invece di 79Br"], ratio: [0.2, 1.1] },
    { k: "na", dms: [21.9819443], labs: ["Na invece di H"] },
    { k: "nh4", dms: [17.0265491], labs: ["NH4 invece di H"] },
    { k: "k", dms: [37.9558814], labs: ["K invece di H"] },
    { k: "h2o", dms: [18.0105647], labs: ["perdita di H2O"] },
    { k: "dimer", labs: ["dimero [2M+H]+"] },
  ];
  const PROTON = 1.00727646;

  // Compounds: [label, rt (min), sigma (min), [[role, m/z, relative height], ...]]; the first feature is the base ion.
  const CPD = [
    ["C15H12N2O (tipo farmaco)", 6.20, 0.040, [["[M+H]+", 237.1022, 100], ["13C", 238.1056, 16.8], ["[M+Na]+", 259.0842, 22], ["[M+H-H2O]+", 219.0917, 9], ["[2M+H]+", 473.1972, 6]]],
    ["C8H14ClN5 (tipo pesticida)", 7.45, 0.045, [["[M+H]+", 216.1010, 100], ["13C", 217.1044, 9.4], ["37Cl", 218.0981, 32], ["[M+Na]+", 238.0830, 14]]],
    ["C6H12O6 (tipo metabolita)", 3.10, 0.040, [["[M+H]+", 181.0707, 40], ["13C", 182.0740, 2.6], ["[M+Na]+", 203.0526, 100], ["[M+NH4]+", 198.0972, 35], ["[M+H-H2O]+", 163.0601, 14]]],
    ["secondo composto co-eluente", 6.235, 0.040, [["[M+H]+", 254.1288, 60], ["13C", 255.1322, 10], ["[M+H-H2O]+", 236.1182, 9]]],
  ];

  F.COMPOUNDS = CPD;
  F.pearson = (x, y, lo, hi) => {
    let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    for (let i = lo; i <= hi; i++) { n++; sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; syy += y[i] * y[i]; sxy += x[i] * y[i]; }
    const d = (n * sxx - sx * sx) * (n * syy - sy * sy);
    return n < 3 || d <= 0 ? 0 : (n * sxy - sx * sy) / Math.sqrt(d);
  };
  const idx = rt => Math.round((rt - T0) / DT);

  /** Synthetic features sorted by m/z, ids F1..Fn. second = include the co-eluting second compound. */
  F.makeFeatures = (seed, second) => {
    const r = C.rng(seed), out = [];
    CPD.forEach((c, ci) => {
      if (ci === 3 && !second) return;
      c[3].forEach((f, fi) => {
        const eic = [], h = f[2], noise = 1 + 0.1 * Math.sqrt(h);
        for (let i = 0; i < NPT; i++) eic.push(h * C.gauss(T0 + i * DT, c[1], c[2]) + noise * C.normal(r));
        out.push({ mz: f[1] * (1 + 1.5e-6 * C.normal(r)), rt: c[1], h, role: f[0], cpd: ci, base: fi === 0, eic });
      });
    });
    out.sort((a, b) => a.mz - b.mz);
    out.forEach((f, i) => { f.id = "F" + (i + 1); });
    return out;
  };

  /** Rule that explains the pair (a lower m/z, b higher m/z) or null. o: {ppm, rules:{k:true}}. */
  F.matchRule = (a, b, o) => {
    const d = b.mz - a.mz, tol = b.mz * o.ppm * 1e-6, ratio = b.h / a.h;
    for (const R of F.RULES) {
      if (!o.rules[R.k]) continue;
      if (R.k === "dimer") {
        if (Math.abs(b.mz - (2 * a.mz - PROTON)) <= tol) return { rule: R.k, lab: R.labs[0], d };
        continue;
      }
      if (R.ratio && (ratio < R.ratio[0] || ratio > R.ratio[1])) continue;
      const hit = R.dms.map((m, i) => (Math.abs(d - m) <= tol ? R.labs[i] : null)).filter(Boolean);
      if (hit.length) return { rule: R.k, lab: hit.length > 1 ? "37Cl o 81Br (indistinguibili a questa tolleranza)" : hit[0], d };
    }
    return null;
  };

  /** Links, groups (connected components) and the comparison with the truth. o: {drt (min), rmin, ppm, rules}. */
  F.groupFeatures = (fs, o) => {
    const n = fs.length, links = [], pairs = [], par = fs.map((_, i) => i);
    const find = i => (par[i] === i ? i : (par[i] = find(par[i])));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const a = fs[i], b = fs[j];
      if (!(b.mz > a.mz) || Math.abs(a.rt - b.rt) > o.drt + 1e-9) continue;
      const lo = Math.max(0, idx(Math.min(a.rt, b.rt)) - 15), hi = Math.min(NPT - 1, idx(Math.max(a.rt, b.rt)) + 15);
      const r = F.pearson(a.eic, b.eic, lo, hi), m = r >= o.rmin ? F.matchRule(a, b, o) : null;
      pairs.push({ a: i, b: j, r, m });
      if (m) { links.push({ a: i, b: j, r, d: m.d, lab: m.lab, rule: m.rule, wrong: a.cpd !== b.cpd }); par[find(i)] = find(j); }
    }
    const comp = {};
    fs.forEach((_, i) => { (comp[find(i)] = comp[find(i)] || []).push(i); });
    const groups = Object.values(comp).sort((x, y) => x[0] - y[0]), gid = [];
    groups.forEach((g, k) => g.forEach(i => { gid[i] = k + 1; }));
    const truth = new Set(fs.map(f => f.cpd)).size;
    const missed = fs.filter(f => !f.base && gid[fs.findIndex(g => g.cpd === f.cpd && g.base)] !== gid[fs.indexOf(f)]).length;
    return { links, pairs, groups, gid, truth, wrong: links.filter(l => l.wrong).length, missed };
  };

  C.register("sim-chemi-gruppi", el => {
    const css = getComputedStyle(document.documentElement), col = n => css.getPropertyValue("--c" + n).trim(), ink = css.getPropertyValue("--ink").trim() || "#24231f";
    let si = 0, second = false, timer = 0;
    const rules = { c13: true, cl: true, na: true, nh4: true, k: false, h2o: true, dimer: true };
    const v = TP.controls(el, [
      { id: "drt", label: "Tolleranza sul tempo di ritenzione", min: 0.01, max: 0.3, step: 0.01, value: 0.06, fmt: x => TP.fmt(x, 2), unit: "min" },
      { id: "rmin", label: "Soglia di correlazione delle forme", min: 0.3, max: 0.99, step: 0.01, value: 0.8, fmt: x => TP.fmt(x, 2) },
      { id: "ppm", label: "Tolleranza di massa", min: 1, max: 100, step: 1, value: 5, unit: "ppm" },
    ], () => later());
    const fs = document.createElement("fieldset"); fs.className = "ctl"; fs.style.border = "0"; fs.style.padding = "0";
    const lg = document.createElement("legend"); lg.textContent = "Regole attive"; lg.style.fontSize = "13.5px"; fs.appendChild(lg);
    const box = (txt, on, fn) => {
      const l = document.createElement("label"), i = document.createElement("input"); i.type = "checkbox"; i.checked = on;
      i.onchange = () => { fn(i.checked); later(); }; l.style.flexDirection = "row"; l.style.gap = "6px"; l.append(i, txt); fs.appendChild(l);
    };
    [["c13", "isotopi 13C"], ["cl", "Cl/Br"], ["na", "Na"], ["nh4", "NH4"], ["k", "K"], ["h2o", "perdita di H2O"], ["dimer", "dimero"]].forEach(([k, t]) => box(t, rules[k], x => { rules[k] = x; }));
    box("secondo composto co-eluente", false, x => { second = x; });
    el.appendChild(fs);
    const nb = document.createElement("div"); nb.className = "btns"; const bt = document.createElement("button"); bt.type = "button"; bt.textContent = "Nuovi dati";
    bt.onclick = () => { si = (si + 1) % SEEDS.length; later(); }; nb.appendChild(bt); el.appendChild(nb);
    const wrap = document.createElement("div"); wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start";
    const left = document.createElement("div"); left.style.cssText = "flex:1 1 320px;min-width:0";
    const right = document.createElement("div"); right.style.cssText = "flex:1 1 300px;min-width:0;overflow-x:auto";
    wrap.append(left, right); el.appendChild(wrap);
    const c = TP.canvas(left, 340); c.onresize = draw;
    const out = document.createElement("div"); out.className = "readout"; el.appendChild(out);

    function later() { clearTimeout(timer); timer = setTimeout(draw, 150); }
    function draw() {
      const feats = F.makeFeatures(SEEDS[si], second), g = F.groupFeatures(feats, { drt: v.drt, rmin: v.rmin, ppm: v.ppm, rules });
      const ng = g.groups.length, ax = TP.axes(c, { x0: 2.5, x1: 8.5, y0: 0, y1: ng, xl: "tempo di ritenzione (min)", yl: "gruppo (EIC normalizzati)", yfmt: () => "", grid: false, yticks: [], m: { l: 30 } });
      const { ctx } = ax; ctx.save(); ctx.font = "11px system-ui,sans-serif";
      g.groups.forEach((members, k) => {
        const y0 = ng - 1 - k, color = col(k % 6 + 1);
        ctx.fillStyle = ink; ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText("G" + (k + 1), ax.m.l - 4, ax.Y(y0 + 0.4));
        ctx.strokeStyle = "#9b978c"; ctx.setLineDash([]); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(ax.m.l, ax.Y(y0)); ctx.lineTo(ax.W - ax.m.r, ax.Y(y0)); ctx.stroke();
        members.forEach((i, mi) => {
          const f = feats[i], mx = Math.max(...f.eic), xs = [], ys = [];
          for (let t = 0; t < NPT; t++) { xs.push(T0 + t * DT); ys.push(y0 + 0.85 * Math.max(0, f.eic[t]) / mx); }
          TP.line(ax, xs, ys, color, 1.4, TP.DASH[mi % 4]);
          ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(f.id, ax.X(f.rt + (mi % 3 - 1) * 0.16), ax.Y(y0 + 0.88) - 1);
        });
      });
      ctx.restore();
      const byId = {}; feats.forEach((f, i) => { byId[i] = f.id; });
      let h = "<table><caption>Feature, gruppi e legami (dati sintetici)</caption><tr><th scope=col>Feature</th><th scope=col>m/z</th><th scope=col>Gruppo</th><th scope=col>Legame</th></tr>";
      feats.forEach((f, i) => {
        const ls = g.links.filter(l => l.b === i).map(l => `${f.id} → ${byId[l.a]}: +${TP.fmt(l.d, 4)} = ${l.lab}${l.wrong ? " (✗ casuale)" : ""}`);
        h += `<tr><td>${f.id}</td><td>${TP.fmt(f.mz, 4)}</td><td>G${g.gid[i]}</td><td>${ls.join("; ") || "—"}</td></tr>`;
      });
      right.innerHTML = h + "</table>";
      C.table(el, ["Da", "A", "ΔRT (min)", "r", "Esito"], g.pairs.filter(p => p.r >= 0.3).map(p => [feats[p.a].id, feats[p.b].id, TP.fmt(Math.abs(feats[p.a].rt - feats[p.b].rt), 2), TP.fmt(p.r, 2), p.m ? "✓ " + p.m.lab : "✗ nessuna regola"]), "Coppie con tempi vicini e correlazione almeno 0,3");
      out.textContent = `${ng} gruppi (composti veri: ${g.truth}); ${g.wrong} ${g.wrong === 1 ? "legame casuale" : "legami casuali"}; ${g.missed} ${g.missed === 1 ? "feature separata" : "feature separate"} dal proprio composto. Dati sintetici, seme ${SEEDS[si]}.`;
    }
    draw();
  });
})();
