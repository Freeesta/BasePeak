/* BasePeak - part VII (chemoinformatics): shared helpers and lazy loader of the interactive figures.
   Classic script, no modules, no network: the pages must work from file://. Loaded by chapters 22-32 after teoria.js. Runs in node too (tests).
   CONTRACT
   - A figure is <div class="sim" id="sim-chemi-x" data-sim="../assets/sim-chemi-y.js" data-preset="name">; a chapter never links sim-chemi-*.js directly.
   - The loader watches every .sim[data-sim] (IntersectionObserver, rootMargin 600px 0px), appends the script once per URL, in document order,
     then calls init(el, preset) for every element whose id the script registered, and sets data-ready="1" on all the elements of that URL
     (also when the file registered nothing). Without IntersectionObserver everything loads at once.
   - A figure file calls CHEMI.register("sim-chemi-x", (el, preset) => {...}); pure helpers shared between files go in CHEMI.fn.
   - Presets: CHEMI.preset("name", data) stores, CHEMI.preset("name") reads; init gets the stored object of el.dataset.preset (or undefined).
   - Data are synthetic and seeded: CHEMI.rng(seed) returns the same sequence for the same seed. */
"use strict";
(function (G) {
  const CHEMI = { fn: {} }, REG = {}, PRE = {}, URLS = {};
  const SQ2 = Math.SQRT2;

  /** mulberry32: floats in [0,1), same seed = same sequence. */
  CHEMI.rng = seed => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  /** Standard normal from the generator r (Box-Muller). */
  CHEMI.normal = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  /** Poisson integer: Knuth below 30, rounded normal approximation above. */
  CHEMI.poisson = (r, lam) => {
    if (lam <= 0) return 0;
    if (lam >= 30) return Math.max(0, Math.round(lam + Math.sqrt(lam) * CHEMI.normal(r)));
    const L = Math.exp(-lam); let k = 0, p = 1;
    do { k++; p *= r(); } while (p > L);
    return k - 1;
  };
  CHEMI.gauss = (x, x0, s) => Math.exp(-((x - x0) * (x - x0)) / (2 * s * s));
  /** erfc, Abramowitz-Stegun 7.1.26 (absolute error < 1.5e-7). */
  const erfc = x => {
    const z = Math.abs(x), t = 1 / (1 + 0.3275911 * z);
    const y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z);
    return x >= 0 ? y : 2 - y;
  };
  CHEMI.fn.erfc = erfc;
  const EMGMAX = {};
  const emgRaw = (x, x0, s, tau) => {
    const d = x - x0, a = s / tau;
    return Math.exp(0.5 * a * a - d / tau) * erfc((a - d / s) / SQ2);
  };
  /** Exponentially modified Gaussian scaled to height 1 (tau <= s/10 is treated as a Gaussian). */
  CHEMI.emg = (x, x0, s, tau) => {
    if (!(tau > s / 10)) return CHEMI.gauss(x, x0, s);
    const k = s + "|" + tau;
    if (EMGMAX[k] === undefined) {
      let m = 0;
      for (let i = 0; i <= 200; i++) m = Math.max(m, emgRaw(x0 - 3 * s + (6 * s + 6 * tau) * i / 200, x0, s, tau));
      EMGMAX[k] = m;
    }
    return emgRaw(x, x0, s, tau) / EMGMAX[k];
  };
  CHEMI.ppm = (meas, theo) => (meas - theo) / theo * 1e6;

  /** Chromatogram {t, y, truth}: opt {t0, t1, dt, peaks:[{rt,h,s,tau}], noise, baseline (number or [offset, slope per unit t]), spikes, seed}. */
  CHEMI.chrom = opt => {
    const r = CHEMI.rng(opt.seed || 1), t = [], y = [], dt = opt.dt || 0.5, pk = opt.peaks || [];
    const b = Array.isArray(opt.baseline) ? opt.baseline : [opt.baseline || 0, 0];
    const sp = [];
    for (let i = 0; i < (opt.spikes || 0); i++) sp.push([opt.t0 + r() * (opt.t1 - opt.t0), (5 + 10 * r()) * (opt.noise || 1)]);
    for (let x = opt.t0; x <= opt.t1 + 1e-9; x += dt) {
      let v = b[0] + b[1] * (x - opt.t0);
      for (const p of pk) v += p.h * (p.tau ? CHEMI.emg(x, p.rt, p.s, p.tau) : CHEMI.gauss(x, p.rt, p.s));
      for (const q of sp) if (Math.abs(x - q[0]) < dt / 2) v += q[1];
      t.push(x); y.push(v + (opt.noise || 0) * CHEMI.normal(r));
    }
    return { t, y, truth: pk.map(p => ({ rt: p.rt, h: p.h, area: p.h * p.s * Math.sqrt(2 * Math.PI), s: p.s, tau: p.tau || 0 })) };
  };
  /** Profile spectrum {mz, y, fwhm, step}: opt {peaks:[{mz,h}], R, pointsPerFwhm, noise, offset (fraction of a step), seed}. */
  CHEMI.profile = opt => {
    const r = CHEMI.rng(opt.seed || 1), pk = opt.peaks, ref = pk[0].mz, fwhm = ref / opt.R, step = fwhm / (opt.pointsPerFwhm || 5), s = fwhm / 2.3548;
    const lo = Math.min(...pk.map(p => p.mz)) - 4 * fwhm, hi = Math.max(...pk.map(p => p.mz)) + 4 * fwhm, mz = [], y = [];
    for (let x = lo + (opt.offset || 0) * step; x <= hi; x += step) {
      let v = 0;
      for (const p of pk) v += p.h * CHEMI.gauss(x, p.mz, s);
      mz.push(x); y.push(v + (opt.noise || 0) * CHEMI.normal(r));
    }
    return { mz, y, fwhm, step };
  };
  CHEMI.fmtIt = (x, d = 2) => (G.TP && G.TP.fmt ? G.TP.fmt(x, d) : (+x).toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d }));

  CHEMI.register = (id, init) => { REG[id] = init; };
  CHEMI.preset = (name, data) => (data === undefined ? PRE[name] : (PRE[name] = data));

  /** Text alternative of a canvas: a <details> with a table of the numbers behind the plot (replaced at every call). */
  CHEMI.table = (el, head, rows, caption) => {
    const d = G.document;
    let box = el.querySelector(":scope > details.chemi-numeri");
    if (!box) {
      box = d.createElement("details"); box.className = "chemi-numeri";
      const s = d.createElement("summary"); s.textContent = "Mostra i numeri"; box.appendChild(s); el.appendChild(box);
    }
    while (box.children.length > 1) box.removeChild(box.lastChild);
    const t = d.createElement("table"), c = d.createElement("caption"), tr = d.createElement("tr");
    c.textContent = caption || ""; t.appendChild(c);
    head.forEach(h => { const th = d.createElement("th"); th.scope = "col"; th.textContent = h; tr.appendChild(th); });
    t.appendChild(tr);
    rows.forEach(row => { const r = d.createElement("tr"); row.forEach(v => { const td = d.createElement("td"); td.textContent = String(v); r.appendChild(td); }); t.appendChild(r); });
    box.appendChild(t);
    return box;
  };

  // ---- lazy loader (browser only)
  const done = (url, ok) => {
    const u = URLS[url]; u.state = ok ? "done" : "error";
    u.els.forEach(el => {
      if (ok && REG[el.id] && !el.dataset.ready) {
        try { REG[el.id](el, CHEMI.preset(el.dataset.preset || "")); } catch (e) { setTimeout(() => { throw e; }); }
      }
      el.dataset.ready = ok ? "1" : "0";
    });
  };
  const load = el => {
    const url = new G.URL(el.getAttribute("data-sim"), G.document.baseURI).href;
    const u = URLS[url] || (URLS[url] = { state: "new", els: [] });
    if (u.els.indexOf(el) < 0) u.els.push(el);
    if (u.state === "done" || u.state === "error") return done(url, u.state === "done");
    if (u.state === "loading") return;
    u.state = "loading";
    const s = G.document.createElement("script");
    s.src = url; s.onload = () => done(url, true); s.onerror = () => done(url, false);
    G.document.head.appendChild(s);
  };
  const byOrder = (a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1);
  CHEMI.scan = () => {
    const els = [].slice.call(G.document.querySelectorAll(".sim[data-sim]"));
    if (!("IntersectionObserver" in G)) return els.forEach(load);
    const io = new G.IntersectionObserver(es => {
      es.filter(e => e.isIntersecting).map(e => e.target).sort(byOrder).forEach(el => { io.unobserve(el); load(el); });
    }, { rootMargin: "600px 0px" });
    els.forEach(el => io.observe(el));
  };
  if (G.document) {
    if (G.document.readyState === "loading") G.document.addEventListener("DOMContentLoaded", CHEMI.scan);
    else CHEMI.scan();
  }
  G.CHEMI = CHEMI;
  if (typeof module !== "undefined" && module.exports) module.exports = CHEMI;
})(typeof window !== "undefined" ? window : globalThis);
