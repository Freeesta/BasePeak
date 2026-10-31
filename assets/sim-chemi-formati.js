// Figure file for chapter pages: owned by DEV-CHEMI-01 (sim-chemi-codifica, sim-chemi-formati).
// Chapter 23. Pure functions live in CHEMI.fn (tested in node by tests/test_chemi_segnale.py); the DOM part runs only in a browser.
"use strict";
(function (G, T) {
  const CHEMI = G.CHEMI, F = CHEMI.fn, TP = T;

  // ------------------------------------------------------------------ pure functions
  /** Seeded synthetic m/z array (Float64Array, ascending): "profile" = uniform 5 mDa grid from 300; otherwise n irregular centroids in 100-1000. */
  F.mzArray = (n, kind, seed) => {
    const a = new Float64Array(n), r = CHEMI.rng(seed || 1);
    if (kind === "profile") for (let i = 0; i < n; i++) a[i] = 300 + 0.005 * i;
    else { let x = 100; for (let i = 0; i < n; i++) { x += 900 / n * (0.2 + 1.6 * r()); a[i] = Math.min(x, 1000 + i * 1e-3); } }
    return a;
  };
  /** Float array -> bytes (little-endian by default, network order when be is true); bits 32 or 64. */
  F.toBytes = (arr, bits, be) => {
    const w = bits / 8, buf = new ArrayBuffer(arr.length * w), dv = new DataView(buf);
    arr.forEach((v, i) => bits === 32 ? dv.setFloat32(i * w, v, !be) : dv.setFloat64(i * w, v, !be));
    return new Uint8Array(buf);
  };
  F.fromBytes = (u8, bits, be) => {
    const w = bits / 8, n = u8.length / w, dv = new DataView(u8.buffer, u8.byteOffset, u8.length), a = new Float64Array(n);
    for (let i = 0; i < n; i++) a[i] = bits === 32 ? dv.getFloat32(i * w, !be) : dv.getFloat64(i * w, !be);
    return a;
  };
  const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  F.b64enc = u8 => {
    let s = "";
    for (let i = 0; i < u8.length; i += 3) {
      const a = u8[i], b = u8[i + 1], c = u8[i + 2], n = (a << 16) | ((b || 0) << 8) | (c || 0);
      s += B64[n >> 18] + B64[(n >> 12) & 63] + (i + 1 < u8.length ? B64[(n >> 6) & 63] : "=") + (i + 2 < u8.length ? B64[n & 63] : "=");
    }
    return s;
  };
  F.b64dec = s => {
    const clean = s.replace(/=+$/, ""), out = new Uint8Array(Math.floor(clean.length * 3 / 4));
    let acc = 0, bits = 0, k = 0;
    for (const ch of clean) { acc = (acc << 6) | B64.indexOf(ch); bits += 6; if (bits >= 8) { bits -= 8; out[k++] = (acc >> bits) & 255; } }
    return out;
  };
  const LP_S = 1e5;     // fixed-point scale of the didactic scheme: 10 µDa steps
  /** Didactic linear-prediction encoder (simplified scheme inspired by MS-Numpress, NOT the official codec):
   *  q = round(x * 1e5); prediction 2 q[i-1] - q[i-2]; residual as zigzag varint. Header: count (4 bytes) and q0, q1 (4 bytes each). */
  F.lpEncode = arr => {
    const q = Array.from(arr, v => Math.round(v * LP_S)), out = [], i32 = v => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
    out.push(...i32(q.length), ...i32(q[0] || 0), ...i32(q[1] || 0));
    for (let i = 2; i < q.length; i++) {
      let z = q[i] - (2 * q[i - 1] - q[i - 2]); z = z >= 0 ? z * 2 : -z * 2 - 1;
      while (z >= 128) { out.push((z % 128) | 128); z = Math.floor(z / 128); }
      out.push(z);
    }
    return Uint8Array.from(out);
  };
  F.lpDecode = u8 => {
    const rd = o => (u8[o] | (u8[o + 1] << 8) | (u8[o + 2] << 16) | (u8[o + 3] << 24)), n = rd(0), q = [rd(4), rd(8)];
    let p = 12;
    for (let i = 2; i < n; i++) {
      let z = 0, m = 1, b;
      do { b = u8[p++]; z += (b & 127) * m; m *= 128; } while (b & 128);
      q.push((z % 2 ? -(z + 1) / 2 : z / 2) + 2 * q[i - 1] - q[i - 2]);
    }
    return Float64Array.from(q.slice(0, n), v => v / LP_S);
  };
  /** Maximum absolute error and maximum error in ppm between two arrays. */
  F.maxErr = (a, b) => {
    let da = 0, dp = 0;
    a.forEach((v, i) => { const d = Math.abs(v - b[i]); if (d > da) da = d; if (d / Math.abs(v) * 1e6 > dp) dp = d / Math.abs(v) * 1e6; });
    return { abs: da, ppm: dp };
  };
  /** zlib stream (the "deflate" of CompressionStream is the zlib wrapper) or its inverse. Async; rejects if the browser has no CompressionStream. */
  const pipe = async (u8, S) => {
    const s = new G[S]("deflate"), w = s.writable.getWriter(); w.write(u8); w.close();
    return new Uint8Array(await new G.Response(s.readable).arrayBuffer());
  };
  F.hasZlib = () => typeof G.CompressionStream === "function" && typeof G.DecompressionStream === "function" && typeof G.Response === "function";
  F.zlib = u8 => pipe(u8, "CompressionStream");
  F.unzlib = u8 => pipe(u8, "DecompressionStream");
  /** Full chain: opt {n, kind, bits, comp ("none"|"zlib"|"lp"), seed} -> sizes, base64, errors after decoding. */
  F.encode = async opt => {
    const x = F.mzArray(opt.n, opt.kind, opt.seed), bits = opt.comp === "lp" ? 0 : opt.bits;
    const raw = opt.comp === "lp" ? F.lpEncode(x) : F.toBytes(x, bits), packed = opt.comp === "zlib" ? await F.zlib(raw) : raw;
    const b64 = F.b64enc(packed), back = F.b64dec(b64), un = opt.comp === "zlib" ? await F.unzlib(back) : back;
    const y = opt.comp === "lp" ? F.lpDecode(un) : F.fromBytes(un, bits), e = F.maxErr(x, y);
    return { n: opt.n, plain: opt.n * 8, raw: raw.length, packed: packed.length, b64: b64, b64len: b64.length, abs: e.abs, ppm: e.ppm };
  };
  /** Relative rounding bound of a binary float with p significant bits: 2^-p (float32: 24 bits -> 5.96e-8 = 0.0596 ppm). */
  F.floatBound = p => Math.pow(2, -p);

  // the synthetic MS2 spectrum of figure 23.2 (not a real compound)
  F.SPEC = { name: "spettro sintetico", precursor: 285.1234, charge: 1, polarity: "+", level: 2, rt: 451.2, ce: 30, int: 12500,
    peaks: [[91.0542, 520], [119.0491, 1800], [147.0441, 3400], [165.0546, 9800], [193.0859, 4100], [267.1128, 700]] };
  const f4 = x => x.toFixed(4);
  const pk = () => F.SPEC.peaks.map(p => f4(p[0]) + " " + p[1]).join("\n");
  const b64pairs = () => F.b64enc(F.toBytes(F.SPEC.peaks.flat(), 32, true));
  const cv = (acc, name, val) => `<cvParam cvRef="MS" accession="${acc}" name="${name}" value="${val}"/>`;
  /** Text of the synthetic spectrum in one of five formats; opt.only keeps just the metadata lines. */
  F.render = (fmt, only) => {
    const S = F.SPEC, bin = a => F.b64enc(F.toBytes(a, 64)), body = (fmt === "mzml") ? [
      "<spectrum index=\"1\" id=\"scan=2\" defaultArrayLength=\"6\">",
      "  " + cv("MS:1000511", "ms level", S.level), "  " + cv("MS:1000127", "centroid spectrum", ""),
      "  " + cv("MS:1000130", "positive scan", ""),
      "  <scanList><scan><cvParam cvRef=\"MS\" accession=\"MS:1000016\" name=\"scan start time\" value=\"7.52\" unitCvRef=\"UO\" unitAccession=\"UO:0000031\" unitName=\"minute\"/></scan></scanList>",
      "  <precursorList><precursor><selectedIonList><selectedIon>", "    " + cv("MS:1000744", "selected ion m/z", S.precursor),
      "    " + cv("MS:1000041", "charge state", S.charge), "  </selectedIon></selectedIonList>",
      "  <activation>" + cv("MS:1000045", "collision energy", S.ce) + "</activation></precursor></precursorList>",
      "  <binaryDataArrayList count=\"2\">",
      "    <binaryDataArray>" + cv("MS:1000523", "64-bit float", "") + cv("MS:1000576", "no compression", "") + cv("MS:1000514", "m/z array", ""),
      "      <binary>" + bin(S.peaks.map(p => p[0])) + "</binary></binaryDataArray>",
      "    <binaryDataArray>" + cv("MS:1000523", "64-bit float", "") + cv("MS:1000576", "no compression", "") + cv("MS:1000515", "intensity array", ""),
      "      <binary>" + bin(S.peaks.map(p => p[1])) + "</binary></binaryDataArray>", "  </binaryDataArrayList>", "</spectrum>"] :
      fmt === "mzxml" ? [
        "<scan num=\"2\" msLevel=\"2\" peaksCount=\"6\" polarity=\"+\" retentionTime=\"PT" + S.rt + "S\" collisionEnergy=\"" + S.ce + "\">",
        "  <precursorMz precursorIntensity=\"" + S.int + "\" precursorCharge=\"" + S.charge + "\">" + S.precursor + "</precursorMz>",
        "  <peaks precision=\"32\" byteOrder=\"network\" contentType=\"m/z-int\" compressionType=\"none\" compressedLen=\"0\">", "    " + b64pairs(), "  </peaks>", "</scan>"] :
      fmt === "mgf" ? ["BEGIN IONS", "TITLE=" + S.name + ", scan 2", "PEPMASS=" + S.precursor + " " + S.int, "CHARGE=" + S.charge + "+", "RTINSECONDS=" + S.rt, "MSLEVEL=2", pk(), "END IONS"] :
      fmt === "msp" ? ["Name: " + S.name, "PrecursorMZ: " + S.precursor, "Ion_mode: P", "Collision_energy: " + S.ce, "Num Peaks: 6", pk()] :
      ["MTD\tmzTab-version\t2.0.0-M", "MTD\tms_run[1]-scan_polarity[1]\t[MS, MS:1000130, positive scan, ]", "SMH\tSML_ID\texp_mass_to_charge\tretention_time_in_seconds\tcharge",
        "SML\t1\t" + S.precursor + "\t" + S.rt + "\t" + S.charge, "(nessun picco MS2: il file contiene i risultati, non gli spettri)"];
    const lines = Array.isArray(body) ? body : [body];
    const keep = fmt === "mzml" ? /cvParam|<spectrum|<\/spectrum/ : fmt === "mzxml" ? /<scan|<precursor|<peaks|<\/scan/ : /^[A-Za-z]/;
    return (only ? lines.filter(l => keep.test(l) && !/^\d/.test(l) && !/^ *<binary>/.test(l)) : lines).join("\n");
  };
  /** Which metadata survive in which format: 1 = yes, 0 = no, 2 = only by convention. Columns: mzML, mzXML, MGF, MSP, mzTab-M. */
  F.KEEP = [
    ["Polarità", [1, 1, 0, 1, 1], ["con un termine del vocabolario", "attributo polarity", "solo nel segno della carica", "Ion_mode", "nei metadati del file"]],
    ["Livello MS", [1, 1, 2, 2, 0], ["termine MS:1000511", "attributo msLevel", "MSLEVEL non è standard", "dipende dal programma", "non c'è: sono risultati"]],
    ["Tempo di ritenzione con unità", [1, 1, 2, 0, 1], ["unità esplicita", "durata ISO (PT…S)", "RTINSECONDS: l'unità sta nel nome", "nessun campo standard", "secondi, per ogni composto"]],
    ["Profilo o centroide", [1, 0, 0, 0, 0], ["termine MS:1000127/8", "da un attributo, se c'è", "non dichiarato", "non dichiarato", "non ha spettri"]],
    ["Precursore e carica", [1, 1, 1, 1, 1], ["m/z, finestra, carica", "m/z e carica", "PEPMASS e CHARGE", "PrecursorMZ", "m/z sperimentale e carica"]],
    ["Energia di collisione e tipo", [1, 2, 0, 2, 0], ["valore e unità, tipo a parte", "solo il valore", "assente", "valore, tipo non dichiarato", "assente"]],
    ["Software di conversione e filtri", [1, 1, 0, 0, 1], ["softwareList e dataProcessing", "dataProcessing", "assente", "assente", "elenco dei programmi"]],
  ];

  if (!G.document || !TP) return;

  // ------------------------------------------------------------------ DOM helpers
  const it = (x, d) => CHEMI.fmtIt(x, d), mk = (el, tag, cls) => { const e = G.document.createElement(tag); if (cls) e.className = cls; el.appendChild(e); return e; };
  const deb = fn => { let t = 0; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), 150); }; };
  const PRE = "white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0";
  const kb = n => it(n / 1024, 1) + " KB";

  // ------------------------------------------------------------------ figure 23.1
  CHEMI.register("sim-chemi-codifica", el => {
    const zl = F.hasZlib();
    const v = TP.controls(el, [
      { id: "n", label: "Numero di picchi", min: 10, max: 2000, step: 10, value: 500, fmt: x => String(x) },
      { id: "b", label: "Precisione dei numeri", value: "64", num: false, options: [["32", "32 bit (float)"], ["64", "64 bit (double)"]] },
      { id: "c", label: "Compressione", value: "none", num: false, options: [["none", "Nessuna"], ["zlib", zl ? "zlib" : "zlib (non disponibile)"], ["lp", "Previsione lineare (didattica)"]] },
      { id: "k", label: "Origine dello spettro", value: "centroid", num: false, options: [["centroid", "Centroidi (picchi irregolari)"], ["profile", "Profilo (punti equidistanti)"]] },
    ], () => run());
    if (!zl) el.querySelector("select option[value=zlib]").disabled = true;
    const out = mk(el, "div", "readout"), b64 = mk(el, "pre"), snip = mk(el, "pre"), note = mk(el, "p", "note nota");
    b64.style.cssText = snip.style.cssText = PRE; b64.tabIndex = snip.tabIndex = 0;
    b64.setAttribute("aria-label", "Primi 80 caratteri del testo base64"); snip.setAttribute("aria-label", "Frammento mzML dell'array binario");
    note.textContent = (zl ? "" : "Questo browser non ha CompressionStream: la compressione zlib non è disponibile qui. ") +
      "La previsione lineare è uno schema semplificato ispirato a MS-Numpress, non il codec ufficiale. Dati sintetici, seme 3: solo l'array degli m/z.";
    const say = deb(t => { out.textContent = t; });
    let tok = 0;
    async function run() {
      const me = ++tok, o = { n: v.n, kind: v.k, bits: +v.b, comp: v.c === "zlib" && !zl ? "none" : v.c, seed: 3 }, r = await F.encode(o);
      if (me !== tok) return;
      const acc = o.comp === "lp" ? ["", "(schema didattico: nel file vero si usa MS:1002312, qui non compatibile)"] : o.bits === 32 ? ["MS:1000521", "32-bit float"] : ["MS:1000523", "64-bit float"];
      const cp = [];
      if (o.comp !== "lp") cp.push(cv(acc[0], acc[1], ""), o.comp === "zlib" ? cv("MS:1000574", "zlib compression", "") : cv("MS:1000576", "no compression", ""));
      cp.push(cv("MS:1000514", "m/z array", ""));
      b64.textContent = r.b64.slice(0, 80) + (r.b64len > 80 ? "…" : "");
      snip.textContent = `<binaryDataArray encodedLength="${r.b64len}">\n  ${o.comp === "lp" ? acc[1] + "\n  " : ""}${cp.join("\n  ")}\n  <binary>${r.b64.slice(0, 24)}…</binary>\n</binaryDataArray>`;
      const ratio = r.b64len / r.plain;
      say(`${r.n} valori: ${r.raw} byte dopo la codifica, ${r.packed} dopo la compressione, ${r.b64len} caratteri in base64 (${it(ratio, 2)} volte i ${r.plain} byte di un array a 64 bit non compresso). Errore massimo dopo la lettura: ${it(r.abs, 6)} Da, ${it(r.ppm, 4)} ppm.`);
      CHEMI.table(el, ["Passaggio", "Byte"], [["Array in 64 bit, senza altro", r.plain], ["Dopo la scelta di precisione/schema", r.raw], ["Dopo la compressione", r.packed], ["Testo base64", r.b64len]],
        `${r.n} valori, ${o.kind === "profile" ? "profilo" : "centroidi"}. Errore massimo ${it(r.abs, 6)} Da (${it(r.ppm, 4)} ppm).`);
    }
    run();
  });

  // ------------------------------------------------------------------ figure 23.2
  CHEMI.register("sim-chemi-formati", el => {
    const FM = [["mzml", "mzML"], ["mzxml", "mzXML"], ["mgf", "MGF"], ["msp", "MSP"], ["mztab", "mzTab-M"]];
    const v = TP.controls(el, [
      { id: "f", label: "Formato", value: "mzml", num: false, options: FM },
      { id: "o", label: "Che cosa mostrare", value: "0", num: false, options: [["0", "Tutto lo spettro"], ["1", "Solo i metadati"]] },
    ], () => draw());
    const pre = mk(el, "pre"); pre.style.cssText = PRE; pre.tabIndex = 0; pre.setAttribute("aria-label", "Lo spettro sintetico scritto nel formato scelto");
    const out = mk(el, "div", "readout"), tb = mk(el, "table"), note = mk(el, "p", "note nota");
    note.textContent = "Spettro sintetico, a scopo didattico: precursore m/z 285,1234, sei picchi. Gli array binari sono scritti davvero (base64); i nomi dei campi seguono le specifiche di ciascun formato.";
    const say = deb(t => { out.textContent = t; });
    function draw() {
      pre.textContent = F.render(v.f, v.o === "1");
      const ci = FM.findIndex(f => f[0] === v.f), W = ["no", "sì", "per convenzione"], SY = ["✗", "✓", "~"];
      const kept = F.KEEP.filter(r => r[1][ci] === 1).length;
      say(`${FM[ci][1]} dichiara in modo esplicito ${kept} metadati su ${F.KEEP.length} (✓); gli altri mancano (✗) o dipendono da una convenzione (~).`);
      tb.innerHTML = "";
      const cap = mk(tb, "caption"); cap.textContent = `Che cosa sopravvive in ${FM[ci][1]}`;
      const h = mk(tb, "tr"); ["Metadato", "Esito", "Come"].forEach(t => { const th = mk(h, "th"); th.scope = "col"; th.textContent = t; });
      F.KEEP.forEach(r => { const tr = mk(tb, "tr"); [r[0], SY[r[1][ci]] + " " + W[r[1][ci]], r[2][ci]].forEach(t => { mk(tr, "td").textContent = t; }); });
    }
    draw();
  });
})(typeof window !== "undefined" ? window : globalThis, typeof TP !== "undefined" ? TP : null);   // TP is a global const of teoria.js, not a window property
