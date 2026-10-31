// BasePeak - part VII, chapter 31: figure sim-chemi-livelli. owned by DEV-CHEMI-05.
// The decision procedure is a pure function (CHEMI.fn.livello, tested in node); the DOM part only shows it. No canvas: the output is HTML.
"use strict";
(function () {
  const F = CHEMI.fn;
  F.LIB_SCORE = 0.7;                                      // didactic thresholds of the "library match" criterion
  F.LIB_PEAKS = 3;
  F.NOMI = {
    "1": "Struttura confermata da standard di riferimento (Confirmed structure by reference standard)",
    "2a": "Struttura probabile per corrispondenza con lo spettro di libreria (Probable structure by library spectrum match)",
    "2b": "Struttura probabile per evidenza diagnostica (Probable structure by diagnostic evidence)",
    "3": "Candidato o candidati provvisori (Tentative candidate(s))",
    "4": "Formula molecolare univoca (Unequivocal molecular formula)",
    "5": "Massa esatta di interesse (Exact mass of interest)",
  };
  F.NOMI_MSI = {
    "1": "Composti identificati (Identified compounds)",
    "2": "Composti annotati in via provvisoria (Putatively annotated compounds)",
    "3": "Classi di composti caratterizzate in via provvisoria (Putatively characterised compound classes)",
    "4": "Composti sconosciuti (Unknown compounds)",
  };
  /** Approximate mapping (didactic): Schymanski level -> MSI level. */
  F.MSI = { "1": "1", "2a": "2", "2b": "2", "3": "2-3", "4": "4", "5": "4" };
  /** Library match counts only with the checkbox, a score >= LIB_SCORE and >= LIB_PEAKS matched peaks. */
  F.libOk = e => !!(e.lib && e.ms2 && e.score >= F.LIB_SCORE && e.peaks >= F.LIB_PEAKS);
  /** Evidence {mass, formula, ms2, lib, score, peaks, diag, std} -> {level, msi, steps, missing}. Level 1 needs a reference standard run with the same method. */
  F.livello = e => {
    const lib = F.libOk(e), std = !!(e.std && e.ms2);
    const steps = [
      ["Massa esatta misurata", !!e.mass],
      ["Formula univoca dal pattern isotopico", !!e.formula],
      ["Spettro MS2 acquisito", !!e.ms2],
      [`Corrispondenza in libreria (punteggio ≥ ${F.LIB_SCORE}, ≥ ${F.LIB_PEAKS} picchi)`, lib],
      ["Evidenza diagnostica (frammenti, contesto)", !!e.diag && !!e.ms2],
      ["Standard di riferimento, stesso metodo: RT, MS e MS2 coincidono", std],
    ];
    let level = null;
    if (e.mass && std) level = "1";
    else if (e.mass && lib) level = "2a";
    else if (e.mass && e.ms2 && e.diag) level = "2b";
    else if (e.mass && e.formula && (e.ms2 || e.diag)) level = "3";
    else if (e.mass && e.formula) level = "4";
    else if (e.mass) level = "5";
    const next = {
      "": "Serve almeno una massa esatta misurata: senza di essa non c'è nessun livello.",
      "5": "Per salire al livello 4 serve una formula molecolare univoca, ricavata dal pattern isotopico.",
      "4": "Per salire al livello 3 serve uno spettro MS2 (o altra evidenza) compatibile con uno o più candidati.",
      "3": "Per salire al livello 2 serve una corrispondenza in libreria (2a) o un'evidenza diagnostica (2b).",
      "2a": "Per salire al livello 1 serve uno standard di riferimento misurato con lo stesso metodo: RT, MS e MS2 devono coincidere.",
      "2b": "Per salire al livello 1 serve uno standard di riferimento misurato con lo stesso metodo: RT, MS e MS2 devono coincidere.",
      "1": "Niente: è il livello più alto della scala.",
    };
    return { level, msi: level ? F.MSI[level] : null, steps, missing: next[level || ""] };
  };

  CHEMI.register("sim-chemi-livelli", el => {
    const names = [["mass", "Massa esatta misurata"], ["formula", "Formula univoca dal pattern isotopico"], ["ms2", "Spettro MS2 acquisito"], ["lib", "Corrispondenza in libreria"],
      ["diag", "Evidenza diagnostica (frammenti, contesto)"], ["std", "Standard di riferimento iniettato con lo stesso metodo: RT, MS, MS2 coincidono"]];
    const ev = { mass: true, formula: false, ms2: false, lib: false, diag: false, std: false, score: 0.8, peaks: 5 };
    const fs = document.createElement("fieldset"); fs.style.cssText = "border:0;padding:0;margin:6px 0"; fs.innerHTML = "<legend>Prove disponibili</legend>";
    names.forEach(([k, lab]) => {
      const l = document.createElement("label"); l.style.cssText = "display:flex;gap:8px;align-items:center;min-height:28px";
      l.innerHTML = `<input type="checkbox"${ev[k] ? " checked" : ""}> ${lab}`;
      l.firstChild.onchange = e => { ev[k] = e.target.checked; show(); };
      fs.appendChild(l);
    });
    el.appendChild(fs);
    const v = TP.controls(el, [
      { id: "score", label: "Punteggio di corrispondenza (coseno)", min: 0, max: 1, step: 0.01, value: 0.8, fmt: x => CHEMI.fmtIt(x, 2) },
      { id: "peaks", label: "Picchi in comune", min: 0, max: 10, step: 1, value: 5 },
    ], x => { ev.score = x.score; ev.peaks = x.peaks; show(); });
    const big = document.createElement("div"); big.setAttribute("aria-live", "off"); big.style.cssText = "font-size:1.5rem;font-weight:650;margin:10px 0 4px"; el.appendChild(big);
    const ol = document.createElement("ol"); ol.style.margin = "4px 0"; el.appendChild(ol);
    const out = document.createElement("div"); out.className = "readout"; out.setAttribute("aria-live", "polite"); el.appendChild(out);
    let t = null;
    function show() {
      const r = F.livello(ev), nm = r.level ? F.NOMI[r.level] : "nessun livello";
      big.innerHTML = r.level ? `Schymanski: livello ${r.level} · MSI: ${r.msi}` : "Nessun livello assegnabile";
      ol.innerHTML = r.steps.map(s => `<li>${s[1] ? "<b>✓ sì</b>" : "✗ no"}: ${s[0]}</li>`).join("");
      CHEMI.table(el, ["Prova", "Presente"], r.steps.map(s => [s[0], s[1] ? "sì" : "no"]), "Percorso nell'albero delle decisioni");
      clearTimeout(t);
      t = setTimeout(() => { out.innerHTML = `<b>${nm}</b>. ${r.missing}` + (ev.lib && !ev.std && ev.score >= 0.95 ? " Un punteggio alto da solo non porta oltre il livello 2a." : ""); }, 150);
    }
    show();
  });
})();
