/* mzLab - Pratica: shared helpers (LCUI) of the high-resolution games (giochi-hr-nt.js): level frame, feedback, step locking, three-level aids.
   Classic script on top of teoria.js (TP) and motore.js (PAL). Data are CONSTRUCTED for teaching.
   The program never gives the answer before an attempt: aids (3 levels) narrow the reasoning, the coherence check gives numbers. */
"use strict";
const LCUI = (() => {
  const last = {};                                          // last exercise of each game (read by the tests)
  const num = v => { const x = parseFloat(String(v).replace(",", ".")); return Number.isFinite(x) ? x : null; };
  function frame(root, lvOpts, onNew) {
    root.innerHTML = `<div class="gbar noprint"><label>Livello <select class="lv">${lvOpts}</select></label><button type="button" class="nw">Nuovo problema</button><span class="pts" role="status"></span></div><div class="wk"></div>`;
    const bar = root.querySelector(".gbar"), wk = root.querySelector(".wk");
    bar.querySelector(".nw").onclick = onNew;
    bar.querySelector(".lv").onchange = onNew;
    return { bar, wk, level: () => +bar.querySelector(".lv").value, pts: game => { const s = PAL.stats(game); bar.querySelector(".pts").textContent = s.plays ? `${s.plays} problemi · media ${s.mean}` : ""; } };
  }
  const seed = () => Math.floor(Math.random() * 2 ** 31);
  const fbSet = (el, ok, html) => { el.className = "fb " + (ok ? "ok" : "no"); el.innerHTML = html; };
  const lock = st => { st.querySelectorAll("button,input,select").forEach(b => { b.disabled = true; }); };
  const open = st => { st.classList.remove("off"); st.removeAttribute("inert"); const c = st.querySelector("button,input,select"); if (c) c.focus(); };   // the answered step is disabled: focus moves on

  /** aids button: reveals the next of 3 levels (cumulative) in a live region */
  function aids(box, help) {
    let n = 0;
    box.innerHTML = `<div class="row"><button type="button" class="hp">Aiuto (livello 1 di 3)</button><span class="note">Gli aiuti non dicono la risposta.</span></div><div class="fb hi hpt"></div>`;
    const b = box.querySelector(".hp"), t = box.querySelector(".hpt");
    b.onclick = () => {
      n++;
      t.innerHTML = help.slice(0, n).map((h, i) => `<p><b>Aiuto ${i + 1}.</b> ${h}</p>`).join("");
      if (n >= help.length) { b.disabled = true; b.textContent = "Aiuti finiti"; } else b.textContent = `Aiuto (livello ${n + 1} di 3)`;
    };
    return box;
  }
  const ds = '<p class="note">Dati costruiti a scopo didattico: formule inventate, non misure.</p>';
  return { last, num, frame, seed, fbSet, lock, open, aids, ds };
})();
