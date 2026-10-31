/* Periodic table with isotopes (used by teoria/strumenti/tavola.js). Classic script: TAVOLA.create({elements, t, nome}) -> {periodic(), bindPeriodic(host)}.
   elements = ELEMENTS (teoria/masse.js); t(key, params) gives the texts; nome(el) the name of an element with data. The 118 symbols and the layout are fixed here;
   an element without isotope data in ELEMENTS is drawn too and says it is rare. Hover or focus shows the isotopes, click or Enter pins them, a second click unpins. */
"use strict";
const TAVOLA = (function () {
  const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
  const ORGANIC = new Set(["H", "C", "N", "O", "F", "P", "S", "Cl", "Br", "I"]);
  /** [row, column] of atomic number z in the grid: 7 periods of 18 columns, lanthanides and actinides in two rows below. */
  function cell(z) {
    if (z === 1) return [1, 1];
    if (z === 2) return [1, 18];
    const ranges = [[3, 10, 2], [11, 18, 3], [19, 36, 4], [37, 54, 5], [55, 86, 6], [87, 118, 7]];
    for (const [a, b, row] of ranges) {
      if (z < a || z > b) continue;
      if (row <= 3) return [row, z - a + 1 + (z - a >= 2 ? 10 : 0)];
      if (row <= 5) return [row, z - a + 1];
      if (z >= (row === 6 ? 57 : 89) && z <= (row === 6 ? 71 : 103)) return [row + 3, z - (row === 6 ? 57 : 89) + 3];
      return [row, z - a + 1 - (z >= (row === 6 ? 72 : 104) ? 14 : 0)];
    }
    return [1, 1];
  }
  const CSS = `.pt{display:grid;grid-template-columns:repeat(18,minmax(0,1fr));gap:2px;margin:0 0 .6rem}
.pt-c{grid-column:var(--c);grid-row:var(--r);min-height:34px;padding:1px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:3px;cursor:pointer}
.pt-c small{font-size:.62em;color:var(--muted)}.pt-c b{font-size:.92em}
.pt-c.org{background:var(--sel);border-color:var(--accent)}.pt-c.rare b{font-weight:400}
.pt-c.pin{background:var(--accent);border-color:var(--accent)}.pt-c.pin,.pt-c.pin small{color:var(--panel)}
.pt-c:focus-visible{outline:2px solid var(--accent2);outline-offset:-2px}
.pt-gap{grid-column:3;align-self:center;text-align:center;font-size:.62em;color:var(--muted)}
.pt-info{min-height:9rem;margin:.4rem 0 0;padding:.5rem .7rem;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)}
.pt-info table{border-collapse:collapse;margin:.4rem 0}.pt-info th,.pt-info td{padding:.15rem .6rem;text-align:right;border-bottom:1px solid var(--line)}`;
  function create({ elements, t, nome }) {
    const byS = new Map(elements.map(e => [e.s, e]));
    const f = (x, d) => Number(x).toFixed(d);
    function periodic() {
      let h = `<style>${CSS}</style><div class="pt" role="group" aria-label="${t("tbl.pt.info")}">`;
      SYM.forEach((s, i) => {
        const z = i + 1, [r, c] = cell(z), e = byS.get(s);
        h += `<button type="button" class="pt-c${ORGANIC.has(s) ? " org" : ""}${e ? "" : " rare"}" data-s="${s}" style="--r:${r};--c:${c}" aria-label="${s}, ${z}${e ? ", " + nome(e) : ""}"><small>${z}</small><b>${s}</b></button>`;
      });
      h += `<span class="pt-gap" style="grid-row:6">57–71</span><span class="pt-gap" style="grid-row:7">89–103</span></div><div id="pt-info" class="pt-info" aria-live="polite"><span class="muted">${t("tbl.pt.info")}</span></div>`;
      return h;
    }
    function info(s) {
      const e = byS.get(s), z = SYM.indexOf(s) + 1;
      if (!e) return `<b>${s}</b> (Z = ${z}) · ${t("tbl.pt.rare")}`;
      const top = e.iso.slice().sort((a, b) => b[2] - a[2])[0], tot = e.iso.reduce((a, i) => a + i[2], 0);
      const w = e.iso.reduce((a, i) => a + i[1] * i[2], 0) / tot;
      let h = `<p><b>${nome(e)}</b> (${s}, Z = ${z})</p><p>${t("tbl.pt.avgWeight", { w: f(w, 4) })}<br>${t("tbl.pt.mono", { m: f(top[1], 5), a: top[0], s })}</p>`;
      h += `<table><tr><th>${t("tbl.pt.col.iso")}</th><th>${t("tbl.pt.col.mass")}</th><th>${t("tbl.pt.col.abund")}</th><th>${t("tbl.pt.col.delta")}</th></tr>`;
      e.iso.forEach(i => { h += `<tr><td><sup>${i[0]}</sup>${s}</td><td>${f(i[1], 5)}</td><td>${f(i[2], 2)}</td><td>${i[0] === top[0] ? "–" : "+" + (i[0] - top[0])}</td></tr>`; });
      h += "</table>";
      const mi = e.iso.filter(i => i[0] > top[0]).sort((a, b) => b[2] - a[2])[0];
      if (mi) h += `<p>${t("tbl.pt.peak", { s, off: "M+" + (mi[0] - top[0]), pct: f(mi[2] / top[2] * 100, 1) })}</p>`;
      return h;
    }
    function bindPeriodic(host) {
      const box = host.querySelector("#pt-info"); let pinned = null;
      const show = s => { box.innerHTML = info(s); };
      host.querySelectorAll(".pt-c").forEach(b => {
        const s = b.dataset.s;
        const peek = () => { if (!pinned) show(s); };
        b.addEventListener("mouseenter", peek); b.addEventListener("focus", peek);
        b.addEventListener("click", () => {
          host.querySelectorAll(".pt-c.pin").forEach(x => { x.classList.remove("pin"); x.removeAttribute("aria-pressed"); });
          if (pinned === s) { pinned = null; return; }
          pinned = s; b.classList.add("pin"); b.setAttribute("aria-pressed", "true"); show(s);
        });
      });
    }
    return { periodic, bindPeriodic };
  }
  return { create };
})();
