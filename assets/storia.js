"use strict";
/* STORIA_UI: tiny helpers shared by the history chapters (classic script, works from file://).
   svg(tag, attrs, parent)  creates an SVG element, sets its attributes and appends it to parent when given.
   player(root, {steps, fps}) builds the controls of a step animation inside root: steps = [{label, draw(t)}], t from 0 to 1.
       Buttons: Avvia/Pausa (aria-pressed), Passo indietro, Passo avanti, Ricomincia, plus a polite live line "Passo i di n".
       It starts paused on the first frame, pauses when the figure is off screen or the tab is hidden, and with reduced
       motion (TP.reduced() or the media query) never autoplays: "Avvia" shows the final frame of the next step.
   lazy(host, src)  injects <script src> once, when host is within 200 px of the viewport (on load without IntersectionObserver).
   live(el, text)   sets the text of a live region, at most once every 300 ms (the last text wins). */
const STORIA_UI = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const reduced = () => (window.TP && TP.reduced && TP.reduced()) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const timers = new WeakMap();
  const live = (el, text) => {
    const s = timers.get(el) || { at: 0 };
    s.text = text;
    if (s.timer) return;
    s.timer = setTimeout(() => { s.timer = 0; s.at = Date.now(); el.textContent = s.text; }, Math.max(0, 300 - (Date.now() - s.at)));
    timers.set(el, s);
  };
  const lazy = (host, src) => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      const s = document.createElement("script");
      s.src = src;
      document.head.appendChild(s);
    };
    if (!("IntersectionObserver" in window)) return addEventListener("load", go);
    const io = new IntersectionObserver(r => { if (r.some(x => x.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: "200px" });
    io.observe(host);
  };
  const player = (root, o) => {
    const steps = o.steps, n = steps.length, dt = 1000 / (o.fps || 30), len = 2000;
    let i = 0, t = 0, run = false, visible = true, last = 0, timer = 0;
    const btn = (txt, fn) => { const b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.addEventListener("click", fn); bar.appendChild(b); return b; };
    const bar = document.createElement("div");
    bar.className = "storia-comandi";
    const info = document.createElement("p");
    info.className = "storia-passo";
    info.setAttribute("aria-live", "polite");
    const show = () => { steps[i].draw(t); live(info, `Passo ${i + 1} di ${n}: ${steps[i].label}`); };
    const stop = () => { run = false; clearInterval(timer); play.setAttribute("aria-pressed", "false"); play.textContent = "Avvia"; };
    const go = k => { i = Math.min(n - 1, Math.max(0, k)); t = 1; show(); };
    const tick = () => {
      if (!visible || document.hidden) return;
      t += (Date.now() - last) / len; last = Date.now();
      if (t >= 1) { if (i < n - 1) { i++; t = 0; } else { t = 1; stop(); } }
      show();
    };
    const play = btn("Avvia", () => {
      if (run) return stop();
      if (reduced()) return go(t === 1 && i === n - 1 ? 0 : i + (t === 1 ? 1 : 0));
      if (t === 1 && i === n - 1) { i = 0; t = 0; }
      run = true; last = Date.now(); play.setAttribute("aria-pressed", "true"); play.textContent = "Pausa";
      timer = setInterval(tick, dt);
    });
    play.setAttribute("aria-pressed", "false");
    btn("Passo indietro", () => { stop(); go(i - 1); });
    btn("Passo avanti", () => { stop(); go(i + 1); });
    btn("Ricomincia", () => { stop(); i = 0; t = 0; show(); });
    root.appendChild(bar);
    root.appendChild(info);
    if ("IntersectionObserver" in window) new IntersectionObserver(r => { visible = r[r.length - 1].isIntersecting; }).observe(root);
    show();
    return { stop, go };
  };
  return { svg, player, lazy, live };
})();
