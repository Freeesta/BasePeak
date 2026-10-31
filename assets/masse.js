/* BasePeak - Teoria: own element data and mass helpers (plain JS, no build step, no wasm, no CDN).
   One source of truth for the Teoria, the periodic table (tavola-periodica.js) and the tests (tests/chem_ref.py reads the array below as strict JSON).

   Data sources (public physical constants, no copyright):
   - isotope masses: AME2020 atomic mass evaluation (Wang et al., Chin. Phys. C 45, 030003, 2021), as tabulated by NIST
     (https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl); 12C = 12 exactly by definition;
   - natural abundances: IUPAC Commission on Isotopic Abundances (Meija et al., Pure Appl. Chem. 88, 293, 2016), values in %.
   Only the elements met in organic and environmental MS carry isotope data (the periodic table shows the others as «rare»).
   IUPAC 2013/2016 abundances; DO NOT write the declaration keyword in a comment before the array (tests patch the first one).

   ELEMENTS: [{ s: symbol, n: Italian name, z: atomic number, iso: [[massNumber, exactMass (u), abundance (%)], ...] }]
   MASSE:    parse(formula), exact(formula), pattern(formula, n), ELECTRON (u). A formula is a string ("C6H5Cl") or an object ({C:6,H:5,Cl:1}). */
"use strict";
const ELEMENTS = [
  {"s": "H", "n": "Idrogeno", "z": 1, "iso": [[1, 1.00782503223, 99.9885], [2, 2.01410177812, 0.0115]]},
  {"s": "B", "n": "Boro", "z": 5, "iso": [[10, 10.01293695, 19.9], [11, 11.00930536, 80.1]]},
  {"s": "C", "n": "Carbonio", "z": 6, "iso": [[12, 12.0, 98.93], [13, 13.00335483507, 1.07]]},
  {"s": "N", "n": "Azoto", "z": 7, "iso": [[14, 14.00307400443, 99.636], [15, 15.00010889888, 0.364]]},
  {"s": "O", "n": "Ossigeno", "z": 8, "iso": [[16, 15.99491461957, 99.757], [17, 16.9991317565, 0.038], [18, 17.99915961286, 0.205]]},
  {"s": "F", "n": "Fluoro", "z": 9, "iso": [[19, 18.99840316273, 100.0]]},
  {"s": "Na", "n": "Sodio", "z": 11, "iso": [[23, 22.989769282, 100.0]]},
  {"s": "Mg", "n": "Magnesio", "z": 12, "iso": [[24, 23.9850417, 78.99], [25, 24.98583696, 10.0], [26, 25.98259297, 11.01]]},
  {"s": "Si", "n": "Silicio", "z": 14, "iso": [[28, 27.97692653465, 92.223], [29, 28.9764946649, 4.685], [30, 29.973770136, 3.092]]},
  {"s": "P", "n": "Fosforo", "z": 15, "iso": [[31, 30.97376199842, 100.0]]},
  {"s": "S", "n": "Zolfo", "z": 16, "iso": [[32, 31.9720711744, 94.99], [33, 32.9714589098, 0.75], [34, 33.967867004, 4.25], [36, 35.96708071, 0.01]]},
  {"s": "Cl", "n": "Cloro", "z": 17, "iso": [[35, 34.968852682, 75.76], [37, 36.965902602, 24.24]]},
  {"s": "K", "n": "Potassio", "z": 19, "iso": [[39, 38.9637064864, 93.2581], [40, 39.963998166, 0.0117], [41, 40.9618252579, 6.7302]]},
  {"s": "Ca", "n": "Calcio", "z": 20, "iso": [[40, 39.9625908, 96.941], [42, 41.95861783, 0.647], [43, 42.9587668, 0.135], [44, 43.9554811, 2.086], [46, 45.953689, 0.004], [48, 47.95252276, 0.187]]},
  {"s": "Fe", "n": "Ferro", "z": 26, "iso": [[54, 53.93960899, 5.845], [56, 55.93493633, 91.754], [57, 56.93539284, 2.119], [58, 57.93327443, 0.282]]},
  {"s": "Cu", "n": "Rame", "z": 29, "iso": [[63, 62.92959772, 69.15], [65, 64.9277897, 30.85]]},
  {"s": "Zn", "n": "Zinco", "z": 30, "iso": [[64, 63.92914201, 49.17], [66, 65.92603381, 27.73], [67, 66.92712775, 4.04], [68, 67.92484455, 18.45], [70, 69.9253192, 0.61]]},
  {"s": "Se", "n": "Selenio", "z": 34, "iso": [[74, 73.922475934, 0.89], [76, 75.919213704, 9.37], [77, 76.919914154, 7.63], [78, 77.91730928, 23.77], [80, 79.9165218, 49.61], [82, 81.9166995, 8.73]]},
  {"s": "Br", "n": "Bromo", "z": 35, "iso": [[79, 78.9183376, 50.69], [81, 80.9162897, 49.31]]},
  {"s": "I", "n": "Iodio", "z": 53, "iso": [[127, 126.9044719, 100.0]]}
];
const MASSE = (function () {
  const ELECTRON = 0.000548579909;                       // electron mass (u), CODATA 2018
  const bySym = {}; ELEMENTS.forEach(e => { bySym[e.s] = e; });
  const top = e => e.iso.reduce((a, x) => (x[2] > a[2] ? x : a));   // most abundant isotope = monoisotopic one
  /** "C6H5Cl" -> {C:6, H:5, Cl:1}; subscript digits accepted; null if the text is not a formula of known elements. */
  function parse(f) {
    if (f && typeof f === "object") return f;
    f = String(f || "").replace(/\s+/g, "").replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080));
    if (!/^([A-Z][a-z]?\d*)+$/.test(f)) return null;
    const out = {}; let ok = true;
    f.replace(/([A-Z][a-z]?)(\d*)/g, (_, e, n) => { if (!bySym[e]) ok = false; out[e] = (out[e] || 0) + (n === "" ? 1 : +n); return ""; });
    return ok ? out : null;
  }
  /** Monoisotopic mass (u) of a neutral formula; NaN if invalid. */
  function exact(f) {
    f = parse(f); if (!f) return NaN;
    return Object.keys(f).reduce((a, s) => a + top(bySym[s])[1] * f[s], 0);
  }
  /** Unit-resolution isotope pattern: intensities at M, M+1, ..., M+n-1 relative to M = 100 (convolution by nominal mass shift). */
  function pattern(f, n) {
    f = parse(f); n = n || 7; if (!f) return null;
    let dist = [1];
    Object.keys(f).forEach(s => {
      const el = bySym[s], t = top(el), one = [];
      el.iso.forEach(x => { const d = x[0] - t[0]; if (d >= 0) one[d] = (one[d] || 0) + x[2] / 100; });
      for (let i = 0; i < f[s]; i++) {
        const out = new Array(Math.min(dist.length + one.length - 1, n)).fill(0);
        dist.forEach((a, x) => one.forEach((b, y) => { if (b && x + y < n) out[x + y] += a * b; }));
        dist = out;
      }
    });
    return dist.map(v => v / dist[0] * 100);
  }
  return { ELECTRON, parse, exact, pattern };
})();
if (typeof module !== "undefined") module.exports = { ELEMENTS, MASSE };
