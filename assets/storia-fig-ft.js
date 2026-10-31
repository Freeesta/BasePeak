"use strict";
/* sf-ft (chapter "Ioni che girano"): ions circle in a magnetic field (FT-ICR) or oscillate along the axis of an
   Orbitrap; the image current is the sum of their sines; an own radix-2 FFT turns it into a spectrum.
   Scaled-down demo: frequencies are in "cycles per 512 samples" (the ratios between ions are the real ones).
   ICR: f = K/m (f = qB/(2 pi m)); Orbitrap: f = K/sqrt(m) (omega = sqrt(k z/m)). Classic script, works from file://. */
(() => {
  const host = document.getElementById("sf-ft");
  const img = host && host.querySelector("img");
  if (!host || host.dataset.live || typeof STORIA_UI === "undefined") return;
  host.dataset.live = "1";
  const U = STORIA_UI, S = U.svg, N = 512, L = 2048, TAU = 800, TWO = 2 * Math.PI;
  const IONS = [{ mz: 300, a: 1, r: 40, sh: "c", col: 1 }, { mz: 308, a: 0.8, r: 58, sh: "q", col: 2 }, { mz: 450, a: 0.6, r: 76, sh: "t", col: 3 }];   // the close pair is 308 (ICR) or 312 (Orbitrap)
  const MODES = {
    icr: { k: 45000, p: 1, lo: 92, hi: 158, label: "FT-ICR", aria: "Ioni che girano in un campo magnetico, corrente immagine e spettro ottenuto con la trasformata di Fourier",
      step: "gli ioni girano nel campo magnetico: ogni frequenza dipende solo da m/z" },
    orb: { k: 3464.1, p: 0.5, lo: 150, hi: 212, label: "Orbitrap", aria: "Ioni che oscillano lungo l'asse di un Orbitrap, corrente immagine e spettro ottenuto con la trasformata di Fourier",
      step: "gli ioni oscillano lungo l'asse: ogni frequenza dipende solo da m/z" }
  };
  let mode = "icr", nt = 512, spec = null;
  const PAIR = { icr: 308, orb: 312 };
  const freq = (m, mz) => MODES[m].k / Math.pow(mz, MODES[m].p);
  const mzOf = (m, f) => Math.pow(MODES[m].k / f, 1 / MODES[m].p);
  const dec = (x, n) => x.toFixed(n).replace(".", ",");

  // radix-2 FFT in place (re, im: arrays of power-of-two length)
  const fft = (re, im) => {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let b = n >> 1;
      for (; j & b; b >>= 1) j ^= b;
      j ^= b;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const w = -TWO / len, h = len >> 1;
      for (let i = 0; i < n; i += len) for (let k = 0; k < h; k++) {
        const c = Math.cos(w * k), s = Math.sin(w * k), p = i + k, q = p + h;
        const tr = re[q] * c - im[q] * s, ti = re[q] * s + im[q] * c;
        re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
      }
    }
  };

  const transient = () => {
    IONS[1].mz = PAIR[mode];
    const x = new Float64Array(N), w = new Float64Array(N), fs = IONS.map(o => freq(mode, o.mz));
    for (let n = 0; n < nt; n++) {
      let s = 0;
      IONS.forEach((o, k) => { s += o.a * Math.sin(TWO * fs[k] * (n - nt / 2) / N); });
      x[n] = s * Math.exp(-n / TAU) / 2.4;
      w[n] = x[n] * (0.5 - 0.5 * Math.cos(TWO * (n + 0.5) / nt));   // Hann window before the FFT (usual in FT-MS)
    }
    return [x, w];
  };

  // spectrum: magnitude of the FFT of the transient (zero padded to L points), peaks, resolving power of the isolated ion
  const analyse = () => {
    const [x, w] = transient(), re = new Float64Array(L), im = new Float64Array(L);
    re.set(w);
    fft(re, im);
    const m = MODES[mode], g = L / N, i0 = Math.floor(m.lo * g), i1 = Math.ceil(m.hi * g), mag = [];
    let max = 0;
    for (let i = i0; i <= i1; i++) { const v = Math.hypot(re[i], im[i]); mag.push(v); if (v > max) max = v; }
    const y = mag.map(v => v / max), peaks = [];
    for (let i = 1; i < y.length - 1; i++) if (y[i] > 0.15 && y[i] >= y[i - 1] && y[i] > y[i + 1]) {
      const d = (y[i - 1] - y[i + 1]) / (2 * (y[i - 1] - 2 * y[i] + y[i + 1]));
      peaks.push({ i, f: (i0 + i + d) / g, y: y[i] });
    }
    let fw = NaN;                                    // FWHM (in frequency) of the first peak: m/z 450, always isolated
    const last = peaks[0];
    if (last) {
      let a = last.i, b = last.i;
      while (a > 0 && y[a] > last.y / 2) a--;
      while (b < y.length - 1 && y[b] > last.y / 2) b++;
      fw = (b - a) / g;
    }
    const fC = freq(mode, IONS[2].mz);
    return { x, y, peaks, i0, g, R: fC / (fw * (mode === "orb" ? 2 : 1)), cycles: fC * nt / N };
  };

  // ---- DOM
  const fig = host.querySelector("figure"), cap = fig.querySelector("figcaption");
  const svg = S("svg", { viewBox: "0 0 720 470", role: "img", "aria-label": MODES.icr.aria, style: "width:100%;height:auto;color:var(--ink)" });
  let fz = 13;   // user units: grows on narrow screens so that the text stays about 12 px high
  const T = (p, x, y, s, a, w) => { const t = S("text", { x, y, "text-anchor": a || "start", style: `fill:currentColor;font:${w || 400} ${fz}px system-ui,sans-serif` }, p); t.textContent = s; return t; };
  const P = (p, st, w) => S("path", { fill: "none", style: `stroke:${st};stroke-width:${w || 1.6}` }, p);
  const gAxes = S("g", {}, svg), gMove = S("g", {}, svg), gTr = S("g", {}, svg), gSp = S("g", {}, svg);
  const markers = IONS.map(o => {
    const c = S("g", {}, gMove), st = `fill:var(--c${o.col});stroke:currentColor;stroke-width:1.2`;
    S(o.sh === "c" ? "circle" : o.sh === "q" ? "rect" : "path", o.sh === "c" ? { r: 7, style: st } : o.sh === "q" ? { x: -6, y: -6, width: 12, height: 12, style: st } : { d: "M0-8L8 6L-8 6Z", style: st }, c);
    return { c, o, t: null };
  });
  const orbit = IONS.map(() => P(gMove, "var(--muted)", 1.1)), trace = P(gTr, "currentColor", 1.4), curve = P(gSp, "var(--accent)", 2.2), labels = S("g", {}, gSp);
  orbit.forEach(o => o.setAttribute("stroke-dasharray", "4 4"));
  const frame = S("g", {}, gAxes);
  let cur = [0, 0];

  const ctl = document.createElement("div"), box = document.createElement("div"), readout = document.createElement("p");
  box.className = "ctl";
  ctl.className = "storia-comandi";
  readout.className = "storia-passo";
  readout.setAttribute("aria-live", "polite");
  const radio = (id, txt) => {
    const l = document.createElement("label"), i = document.createElement("input");
    i.type = "radio"; i.name = "sf-ft-mode"; i.value = id; i.checked = id === mode;
    i.addEventListener("change", () => { mode = id; build(); ctrl.go(0); });
    l.style.cssText = "flex-direction:row;align-items:center;gap:6px";
    l.append(i, txt);
    return l;
  };
  const fs = document.createElement("fieldset"), lg = document.createElement("legend");
  fs.style.cssText = "border:0;padding:0;margin:0";
  lg.textContent = "Analizzatore";
  fs.append(lg, radio("icr", "FT-ICR (campo magnetico)"), radio("orb", "Orbitrap (campo elettrostatico)"));
  const sl = document.createElement("label"), rg = document.createElement("input"), out = document.createElement("output"), top = document.createElement("span");
  rg.type = "range"; rg.min = 64; rg.max = N; rg.step = 32; rg.value = nt;
  top.append("Durata del transiente", out);
  sl.append(top, rg);
  box.append(fs, sl);

  // ---- layout: motion panel (left), transient (right), spectrum (bottom)
  const TX = 340, TW = 370, TY = 105, SX = 40, SW = 660, SB = 440, SH = 130;
  const build = () => {
    const m = MODES[mode];
    IONS[1].mz = PAIR[mode];
    fz = Math.round(Math.max(13, 12 * 720 / (host.clientWidth || 720)));
    svg.setAttribute("aria-label", m.aria);
    frame.replaceChildren();
    markers.forEach((k, j) => { if (k.t) k.t.remove(); k.t = T(k.c, 11, [-9, 20, 4][j], String(k.o.mz)); });
    T(frame, 8, 20, "Moto degli ioni", "start", 700);
    T(frame, TX, 20, "Corrente immagine", "start", 700);
    T(frame, SX, 275, "Spettro (masse leggere a destra)", "start", 700);
    P(frame, "var(--muted)", 1).setAttribute("d", `M${TX} ${TY}H${TX + TW}`);
    P(frame, "currentColor", 1.2).setAttribute("d", `M${SX} ${SB}H${SX + SW}`);
    T(frame, TX + TW, TY + 100, "tempo →", "end");
    T(frame, SX + SW, SB + 8 + fz, "frequenza →", "end");
    if (mode === "icr") {
      S("rect", { x: 55, y: 35, width: 190, height: 190, fill: "none", style: "stroke:var(--muted);stroke-width:1.2" }, frame);
      T(frame, 150, 245, "dall'alto, B esce dal foglio", "middle");
    } else {
      S("ellipse", { cx: 150, cy: 130, rx: 118, ry: 15, style: "fill:var(--panel);stroke:currentColor;stroke-width:1.4" }, frame);
      S("path", { d: "M30 130C30 62 270 62 270 130C270 198 30 198 30 130Z", fill: "none", style: "stroke:currentColor;stroke-width:1.4" }, frame);
      T(frame, 150, 245, "sezione: fuso e barile", "middle");
    }
    spec = analyse();
    rg.max = N;
    out.textContent = `${nt} di ${N} punti`;
    orbit.forEach((o, k) => o.setAttribute("d", mode === "icr" ? `M${150 + IONS[k].r} 130A${IONS[k].r} ${IONS[k].r} 0 1 1 ${150 - IONS[k].r} 130A${IONS[k].r} ${IONS[k].r} 0 1 1 ${150 + IONS[k].r} 130` : ""));
    const R = spec.R;
    readout.textContent = "";
    U.live(readout, `Con ${nt} punti lo ione di m/z 450 compie ${dec(spec.cycles, 0)} cicli e il suo picco ha potere risolutivo circa ${dec(R, 0)} (scala ridotta). `
      + (spec.peaks.length === 3 ? `I due ioni vicini, m/z 300 e ${PAIR[mode]}, sono separati.` : `I due ioni vicini, m/z 300 e ${PAIR[mode]}, non sono separati: si vede un solo picco.`));
  };

  const draw = (i, t) => {
    cur = [i, t];
    const s = i + t;
    IONS.forEach((o, k) => {
      const ph = TWO * freq(mode, o.mz) / 100 * s;
      let x, y;
      if (mode === "icr") { x = 150 + o.r * Math.cos(ph); y = 130 - o.r * Math.sin(ph); }
      else { x = 150 + 100 * Math.cos(ph * 1.2); y = 130 + o.r * 0.9 * Math.sin(TWO * 4 * s); }
      markers[k].c.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    });
    const cut = i === 0 ? 0 : i === 1 ? Math.floor(nt * t) : nt;
    let d = "";
    for (let n = 0; n < cut; n++) d += (n ? "L" : "M") + (TX + TW * n / N).toFixed(1) + " " + (TY - 90 * spec.x[n]).toFixed(1);
    trace.setAttribute("d", d);
    const y = spec.y, show = i < 2 ? 0 : Math.floor(y.length * t);
    d = "";
    for (let k = 0; k < show; k++) d += (k ? "L" : "M") + (SX + SW * k / (y.length - 1)).toFixed(1) + " " + (SB - SH * y[k]).toFixed(1);
    curve.setAttribute("d", d);
    labels.replaceChildren();
    if (i === 2 && t >= 1) spec.peaks.forEach(p => {
      const px = SX + SW * (p.f * spec.g - spec.i0) / (y.length - 1);
      T(labels, px, SB - SH * p.y - 8, `m/z ${dec(mzOf(mode, p.f), 1)}`, "middle", 700);
    });
  };

  const steps = [
    { get label() { return MODES[mode].step; }, draw: t => draw(0, t) },
    { label: "la corrente indotta sugli elettrodi è la somma delle oscillazioni: il transiente", draw: t => draw(1, t) },
    { label: "la trasformata di Fourier separa le frequenze: ogni picco è una massa", draw: t => draw(2, t) }
  ];
  build();
  const ctrl = U.player(ctl, { steps });
  const wrap = document.createElement("div");
  wrap.append(box, ctl, readout);
  if (img) img.replaceWith(svg); else fig.insertBefore(svg, cap);
  fig.insertBefore(wrap, cap);
  if (window.ResizeObserver) new ResizeObserver(() => { const f = fz; if (Math.round(Math.max(13, 12 * 720 / (host.clientWidth || 720))) !== f) { build(); draw(cur[0], cur[1]); } }).observe(host);
  rg.addEventListener("input", () => { nt = +rg.value; build(); ctrl.go(2); });
  ctrl.go(0);
})();
