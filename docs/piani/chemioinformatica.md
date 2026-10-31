# Design: part VII "Chemioinformatica per la spettrometria di massa"

Status: design (ARCH1). Author of the request: Federico. This file is the single source for the DEV prompts in
`docs/piani/prompt-chemioinformatica/`. Code, comments and this file are English; the handbook text is Italian.

Goal: a new part of the handbook that explains, from the beginning and vendor-neutral, how non-targeted / suspect HRMS
data become a list of identified compounds: (1) the files, (2) how the signal is recorded, (3) how a feature table is
built and with which algorithms, (4) spectral matching, (5) confidence levels. The algorithms are explained step by step
(what they do, parameters, failure modes), and every chapter teaches through interactive figures ("visualizzatori").

Out of scope: any app (no mzLab, no vendor software tutorial), the removed photocatalysis / transformation-product
storyline (examples are generic: pesticides, drugs, metabolites, EI library compounds), private data of any kind.

---------------------------------------------------------------------------------------------------------------------

## 1. Placement and numbering

### 1.1 Where it goes
- A new part **"VII. Chemioinformatica"** of the Teoria group, chapters **22-32** (11 chapters), appended after the
  current last chapter (21). Facts measured on `main` at 5e2cad5 and on PR #10 (DEV8, `dev/nav-patroon`):
  - `CHAPTERS` in `assets/teoria.js` is `[file, number, title, part(, admin)]`; `tests/test_numerazione.py` requires the
    `capitoli/` rows, in array order, to be numbered 1..N without gaps, file prefix `NN-`, kicker `Capitolo N`, figure
    numbers `Figura N.x`, and a Markdown twin `capitoli/src/NN-name.md` containing `{kicker: Capitolo N}`.
    It also asserts `len(rows) == 21`: DEV-00 changes that literal to 32 (an updated expectation, not a loosened test).
  - PR #10 moves 19-21 to a "Reference" group placed after "Pratica" and groups the menu by `groupOf()`:
    rows that are not `pratica/` and whose part is not `"Reference"` are "Teoria". So the new rows go **at the end of
    the array, after row 21**, with part `"VII. Chemioinformatica"`: the menu shows them in the Teoria group after part VI,
    and the numbering test still sees 1..32 in array order. DEV-00 must re-check this against the merged DEV8 code
    (prev/next follows array order: check what "next" of chapter 18 and "previous" of 22 are, and report; do not change
    the navigation code, that belongs to DEV8).
- Why not insert before the appendix: it would renumber 19-21 (redirect stubs, search index, glossary links). Not worth it.
- The chapters are public (no 5th `true` field, no `noindex`, no `data-esteso`). `tools/nuovo_capitolo.py` writes
  `data-esteso` + `noindex` + a draft comment: DEV-00 removes them from its output.

### 1.2 The chapters (titles are the Italian `<h1>`; menu title in brackets)

| N | File | Title (menu) | Backbone |
|---|---|---|---|
| 22 | `22-segnale.html` | Dal rivelatore allo spettro: profilo, centroide e accuratezza (Segnale, profilo e centroide) | A |
| 23 | `23-formati.html` | I file dei dati: mzML e gli altri formati aperti (File e formati aperti) | A |
| 24 | `24-tracce.html` | Tracce di massa: XIC e regioni d'interesse (Tracce di massa e ROI) | B |
| 25 | `25-picchi.html` | Trovare i picchi cromatografici (Trovare i picchi) | B |
| 26 | `26-gruppi.html` | Dai picchi ai composti: isotopi, addotti, frammenti in sorgente (Isotopi, addotti, frammenti) | B |
| 27 | `27-tabella.html` | Dalla serie di campioni alla tabella delle feature (La tabella delle feature) | B |
| 28 | `28-somiglianza.html` | Spettri MS2 e somiglianza spettrale (Somiglianza spettrale) | C |
| 29 | `29-librerie.html` | Ricerca in libreria e falsi positivi (Librerie e falsi positivi) | C |
| 30 | `30-candidati.html` | Formule e strutture candidate (Formule e candidati in silico) | C |
| 31 | `31-confidenza.html` | Livelli di confidenza dell'identificazione (Livelli di confidenza) | D |
| 32 | `32-esempio.html` | Un esempio dall'inizio alla fine (Esempio completo) | E |

Glossary and formulary are not new chapters: they extend `capitoli/19-glossario.html` and `capitoli/20-formulario.html`
(new section "6. Chemioinformatica (capitoli 22-32)").

### 1.3 Page rules (all chapters)
- One page per chapter, ~one screen of text per h2 (test: <= 350 words per h2 section, <= 90 words per paragraph),
  short paragraphs, h1 > h2 > h3 without skipping, left-aligned, the existing CSS gives 60-75 ch lines and
  line-height >= 1.5 (do not override it).
- Standard blocks from `docs/COME-MODIFICARE.md` (`box key/warn/lab/math`, `details.poe` before a figure,
  `details.q` questions, numbered `span.eq`, `Figura N.x`). Every chapter ends with "Verifica" (3-5 `details.q`) and
  "Per approfondire" (references with DOI, only from section 7 below, `verified` ones; `to verify` ones are not cited
  until checked).
- Literature in the text: author-year citations ("(Tautenhahn et al., 2008)") where an idea is introduced, each one
  matching an entry of the chapter's "Per approfondire" list (section 7.1) and of the merged bibliography in
  `capitoli/19-glossario.html`. Cite and paraphrase only; never copy sentences, tables or figures from a source.
  One short clause per source saying what it contributes ("ha introdotto ...", "confronta ...").
- History: each chapter has one collapsible box placed after the lead or at the end of the first h2:
  `<details class="q storia"><summary>Un po' di storia</summary><p>5-8 righe</p></details>` (the class `q` reuses
  the existing `details.q` style of `teoria.css`, so no CSS change is needed; `storia` only marks it for the tests). Content per chapter in section 12; every name and date comes from a
  `verified` source of section 7 and is cited author-year; a claim that cannot be verified is left out.
- DOI integrity (test, DEV-00): every `doi.org/10.` link in chapters 22-32 and in the new bibliography section of
  chapter 19 must be listed in `docs/piani/riferimenti-chemioinformatica.tsv` with status `verified`; DOIs found in
  the other published pages are recorded there by DEV-00 with status `preexisting` (not re-checked here, flagged for
  the ARCH review), so that no DOI anywhere in the site is missing from the committed list.
- Never write `TODO`, `???` or "da verificare" in a chapter: `tools/controlla_teoria.py` (check e) rejects them.
  Scientific doubts live in this file (section 10), not in the pages.
- Reuse, do not duplicate: where an existing chapter already explains something, one sentence + link (section 2).

---------------------------------------------------------------------------------------------------------------------

## 2. Links to existing chapters (reuse, do not duplicate)

Anchors are the ids `teoria.js` generates from the heading text (`slug()`: lower case, accents stripped, non
alphanumerics to `-`, max 48 chars). DEV-00 adds a test that resolves every `#anchor` used by chapters 22-32 with a
Python port of `slug()`.

| New chapter | Points to (existing paragraph) | What it takes from there |
|---|---|---|
| 22 | `09-risoluzione.html#potere-risolutivo-e-risoluzione`, `#accuratezza-di-massa`, `#il-rivelatore`, `#orbitrap`, `#tempo-di-volo-tof` | definitions of R, FWHM, ppm, detector physics: not repeated |
| 22 | `10-dati.html#profilo-e-centroide` | what profile/centroid are; ch. 22 adds HOW centroiding is computed |
| 23 | `10-dati.html#che-cosa-contiene-un-file`, `#formati-aperti-mzml-e-mzxml`, `#formati-dei-costruttori-e-conversione`, `#che-cosa-controllare-quando-si-importa-un-file` | overview of formats; ch. 23 goes inside the file |
| 24 | `10-dati.html#cromatogrammi-tic-bpc-xic`, `#la-finestra-di-estrazione` | TIC/BPC/XIC basics; ch. 24 adds ROI building |
| 24 | `17-hr-dda.html#potere-risolutivo-accuratezza-e-ppm`, `#difetto-di-massa-e-masse-quasi-uguali` | near-isobars |
| 25 | `01-cromatografia.html` (Figura 1.1: w½ = 2,355σ, asymmetry) | peak width definitions |
| 26 | `10-dati.html#pattern-isotopici`, `11-formula.html#gli-isotopi-a-risoluzione-unitaria`, `04-esi.html#addotti-differenze`, `15-origine.html` | isotope and adduct basics, in-source fragments |
| 27 | `18-disegno.html#bianchi-e-controlli`, `#controlli-di-qualita-qc`, `#repliche`, `#la-sequenza-di-iniezione` | why blanks/QC exist; ch. 27 adds the filters computed on them |
| 28 | `10-dati.html#dda`, `#dia`, `17-hr-dda.html#finestra-di-isolamento-e-spettri-misti`, `12-frammentazione-esi.html` | acquisition modes; chimeric spectra |
| 29 | `03-gc.html#gli-indici-di-ritenzione`, `13-ei-metodo.html` | RI formula; manual EI interpretation |
| 30 | `11-formula.html#ad-alta-risoluzione` (and its figure `#sim-formule`), `11-formula.html#anelli-piu-doppi-legami-rdb`, `#la-regola-dell-azoto` | formula enumeration and RDB; ch. 30 adds scoring and in silico |
| 31 | `18-disegno.html#quanto-e-sicura-la-struttura` | the one-line mention of Schymanski; ch. 31 is the full treatment |

Note: `16-strategia.html` and parts of `17-hr-dda.html` still carry app/TP wording; do not link them from part VII
(except the two ch. 17 anchors above, which are generic).

Back-links (DEV-07): one sentence "Approfondimento: capitolo NN" at the end of the matching paragraph in chapters
9, 10, 11, 17, 18 (and 3 for RI), nothing else in those chapters.

---------------------------------------------------------------------------------------------------------------------

## 3. Figure engine and conventions (all visualizers)

### 3.1 What exists (measured)
- Figures are `<div class="sim" id="sim-...">` with an `<h4>` title; the code is a classic script `assets/sim-*.js`
  loaded with a plain `<script src>` at the end of the chapter, runs on `DOMContentLoaded`, and uses the helpers that
  `assets/teoria.js` exposes as `TP`: `TP.controls(el, spec, onchange)` (sliders/selects with `<output aria-live>`),
  `TP.buttons`, `TP.canvas(el, h)` (HiDPI canvas, `role="img"` + `aria-label`), `TP.axes`, `TP.line`, `TP.sticks`,
  `TP.label`, `TP.legend`, `TP.DASH` (dash patterns: series differ by more than colour), `TP.fmt`, `TP.reduced()`.
  A `div.readout` gets `aria-live="polite"` automatically. Colours come from CSS variables `--c1..`.
- There is **no lazy loading today**: all `sim-*.js` load eagerly.

### 3.2 New: `assets/chemi-common.js` (DEV-00) and lazy loading
One small classic script (no modules: pages must work from `file://`), loaded by every chapter 22-32 after `teoria.js`.
Target <= 4 KB gzip. API on `window.CHEMI`:

```
CHEMI.rng(seed)            -> function returning floats in [0,1)   (mulberry32; same seed = same sequence, tested)
CHEMI.normal(r)            -> standard normal from rng r (Box-Muller)
CHEMI.poisson(r, lambda)   -> integer (Knuth for lambda < 30, rounded normal approximation above)
CHEMI.gauss(x, x0, s)      -> exp(-(x-x0)^2 / (2 s^2))
CHEMI.emg(x, x0, s, tau)   -> exponentially modified Gaussian, area-normalised to height ~1 (erfc by Abramowitz-Stegun 7.1.26)
CHEMI.chrom(opt)           -> {t:[], y:[], truth:[...]}  opt: {t0,t1,dt, peaks:[{rt,h,s,tau}], noise, baseline, spikes, seed}
CHEMI.profile(opt)         -> {mz:[], y:[]} profile peaks: opt {peaks:[{mz,h}], R, pointsPerFwhm, noise, seed}
CHEMI.ppm(meas, theo)      -> (meas - theo) / theo * 1e6
CHEMI.table(el, head, rows, caption)  -> fills/replaces a <details><summary>Mostra i numeri</summary><table>...; the
                              text alternative of every canvas (screen readers, no colour-only encoding)
CHEMI.register(id, init)   -> a figure file registers init(el, preset) for the element with that id
CHEMI.fmtIt(x, d)          -> Italian decimal comma (wraps TP.fmt)
```

Lazy loading, inside `chemi-common.js`:
- A figure is written in the chapter as
  `<div class="sim" id="sim-chemi-xic" data-sim="../assets/sim-chemi-tracce.js" data-preset="..."><h4>...</h4><p class="nota">...</p></div>`.
  No `<script src="../assets/sim-chemi-*.js">` in any chapter (tested).
- An `IntersectionObserver` with `rootMargin: "600px 0px"` watches every `.sim[data-sim]`; on first intersection it
  appends `<script src=data-sim>` once per URL (deduplicated), and when it has loaded calls the registered `init` for
  every element of that page whose id was registered by that file. Without `IntersectionObserver` it loads at once.
  The element gets `data-ready="1"` after init (used by the e2e test).
- Before loading, the div shows its `<h4>` and a one-line Italian description (`p.nota`) so the page reads well
  without JS and before scrolling.
- `test_integrita_sito.py` already validates `data-sim` paths (its regex matches `src=` after `data-`): good.

### 3.3 Figure rules (every visualizer)
- Plain JS, canvas via `TP.*` (preferred, house style) or inline SVG; no libraries, no CDN, no network, no `fetch`,
  no workers, no wasm. Data generated in the browser by `CHEMI.rng(seed)` with a fixed seed shown in the readout
  ("seme 7"), plus a "Nuovi dati" button that changes the seed (deterministic sequence of seeds).
- One file per chapter (`assets/sim-chemi-<name>.js`), registering only its own ids `sim-chemi-*`. Files are disjoint
  between prompts. A file may use `TP`, `CHEMI`, and `MASSE` (`assets/masse.js`, only if the chapter loads it).
- Readout: a `div.readout` with an Italian sentence summarising the result (it is `aria-live="polite"`); updates are
  debounced (150 ms) so a screen reader is not flooded while a slider moves.
- Text alternative: `CHEMI.table(...)` with the numbers behind the plot.
- No colour-only encoding: series differ by dash (`TP.DASH`), marker shape and a text label; accepted/rejected items
  carry a word or symbol (✓/✗ plus text), not only a colour. Text and essential marks use theme tokens with
  contrast >= 7:1 on all three backgrounds (cream, blue, high contrast) and in dark mode.
- Keyboard: every control is a native `input`/`select`/`button`; peak editing in the mirror plot is done with a
  `select` (which peak) + sliders/buttons, never only by dragging. Visible focus (theme CSS). Targets >= 24x24 px.
- Motion: no autoplay. Step-by-step figures advance only on click ("Passo successivo"); an optional "Esegui tutto"
  animates only when `!TP.reduced()`, otherwise it jumps to the end.
- Every figure says in its note that the data are synthetic ("dati sintetici, a scopo didattico") or names the
  public source and licence.
- Size: <= 15 KB gzip per file (test), typical 4-8 KB. Measured references: `sim-hr.js` 14.4 KB raw, `sim-chrom.js`
  13.4 KB raw (about 4-5 KB gzip).

---------------------------------------------------------------------------------------------------------------------

## 4. Chapters

Each block: learning goals, Italian outline (h2/h3, pasted in the DEV prompt), algorithms (pseudocode level),
formulas, pitfalls, visualizers. Figure ids are final.

### Chapter 22 - Dal rivelatore allo spettro: profilo, centroide e accuratezza

Goals: know what number the instrument actually stores (ion counts, digitised current, transient + FFT); compute a
centroid three ways and see their bias; separate accuracy from precision; know what calibration and lock mass do.

Outline (IT):
```
h2 Dal rivelatore al numero
  h3 Contare gli ioni: il TDC
  h3 Misurare una corrente: l'ADC
  h3 Orbitrap: dalla corrente immagine allo spettro (FFT)
h2 Profilo e centroide: quanti punti servono
h2 Tre modi di calcolare un centroide
  h3 Il massimo locale
  h3 L'interpolazione su tre punti
  h3 Il baricentro dell'area
  h3 Che cosa fa il software dello strumento
h2 Rumore e soglie
  h3 La statistica degli ioni
  h3 Rumore elettronico e linea di base
  h3 Saturazione e tempo morto
h2 Accuratezza, precisione e taratura
  h3 Errore in ppm e in mDa
  h3 Taratura esterna, lock mass e ricalibrazione
h2 Verifica
h2 Per approfondire
```

Algorithms:
```
local maxima:   for i in 1..n-2: if y[i] > y[i-1] and y[i] >= y[i+1] and y[i] > threshold -> peak at mz[i]
3-point (uniform spacing d):  a=y[i-1], b=y[i], c=y[i+1]
   parabola:  delta = (a - c) / (2 (a - 2b + c));   mz* = mz[i] + delta * d
   Gaussian:  same formula on ln a, ln b, ln c (exact for a noise-free Gaussian)
centroid of area: take the contiguous points around the apex with y >= f * y[i] (f = 0.5 typical);
   mz* = sum(mz_j y_j) / sum(y_j);  intensity = sum(y_j) (area-like) or y[i] (height): say which one the file stores
TDC dead time (didactic model): each push detects at most one ion per time bin -> observed counts
   k_obs = 1 - exp(-k_true) per bin and push (Poisson); high abundance -> intensity underestimated and the centroid
   shifts toward the early side of the peak. Mark as simplified model.
calibration TOF:  m/z = A (t - t0)^2  (fit A, t0 on calibrants); recalibration on lock mass: multiply all m/z by
   m_lock_theo / m_lock_meas (one-point, linear in m/z) - say it is the simplest scheme.
```

Formulas: `ppm = (m_mis - m_teor) / m_teor x 10^6`; `FWHM = (m/z) / R`; points per FWHM = FWHM / sampling step;
counting precision `sigma_N = sqrt(N)`; centroid precision ~ FWHM / (2.355 sqrt(N)) for N ions in a Gaussian peak
(statistical lower bound, `to verify against source`, present as approximate).

Pitfalls: centroiding already-centroided data; software expecting centroids fed with profile (or vice versa);
too few points per FWHM bias the 3-point centroid; saturated/dead-time peaks shifted; an intensity threshold that
deletes the M+1/M+2 isotopes breaks isotope scoring later (ch. 30); ppm vs mDa at low m/z (1 mDa at m/z 100 = 10 ppm).

Visualizers:
1. `sim-chemi-centroide` - "Dal profilo al centroide". Teaching point: centroid bias depends on algorithm, sampling
   and noise. Controls: resolving power R (10 000-240 000, log slider), points per FWHM (2-20), noise (S/N of the
   apex 5-1000), number of ions (Poisson mode toggle), algorithm (massimo / parabola / gaussiana / baricentro f),
   true m/z offset within a sampling step (slider). Live: profile peak generated by `CHEMI.profile`, centroid by the
   chosen algorithm, error in ppm; "Ripeti 200 volte" computes mean error and SD over 200 seeded noise draws
   (no animation). Output: plot (profile line, sampling points as markers, vertical line + label for true and found
   m/z), readout ("Errore medio +0,4 ppm, dispersione 1,1 ppm con 5 punti per FWHM"), table of the 200-draw stats per
   algorithm. ~7 KB gzip.
2. `sim-chemi-taratura` - "Taratura e lock mass". Teaching point: systematic drift vs random error; a lock mass
   removes the drift, not the scatter. Controls: drift (ppm per hour, 0-5), temperature step toggle, lock mass on/off,
   random error SD (0.5-3 ppm), m/z range of compounds. Live: synthetic run of 60 min, 8 compounds; errors before and
   after one-point recalibration. Output: error-vs-time plot with two series (dash differs), readout with mean |error|
   before/after, table. ~4 KB gzip.

### Chapter 23 - I file dei dati: mzML e gli altri formati aperti

Goals: open an mzML in a text editor and know what every block is; understand binary arrays, precision, compression
and the index; choose a format for raw data, spectra lists and results; know what metadata must survive conversion.

Outline (IT):
```
h2 Che cosa c'è in un file di dati
h2 mzML dall'interno
  h3 Il vocabolario controllato
  h3 Gli array binari: base64, precisione, compressione
  h3 L'indice
h2 Gli altri formati
  h3 mzXML
  h3 MGF e MSP: elenchi di spettri
  h3 JCAMP-DX e netCDF (ANDI)
  h3 mzTab-M: i risultati, non i dati
h2 Dal formato del costruttore al formato aperto
  h3 Conversione
  h3 Centroidare durante la conversione?
h2 I metadati che contano
h2 Verifica
h2 Per approfondire
```

Content facts (PSI-MS CV accessions `verified` against `psi-ms.obo`, HUPO-PSI GitHub, 2026-10-31):
MS:1000514 m/z array; MS:1000515 intensity array; MS:1000521 32-bit float; MS:1000523 64-bit float;
MS:1000574 zlib compression; MS:1000576 no compression; MS:1000127 centroid spectrum; MS:1000128 profile spectrum;
MS:1000511 ms level; MS:1000016 scan start time; MS:1002312 MS-Numpress linear prediction compression;
MS:1002313 MS-Numpress positive integer compression; MS:1002314 MS-Numpress short logged float compression;
MS:1000744 selected ion m/z; MS:1000041 charge state.
mzML binary arrays: little-endian IEEE floats, optionally zlib-compressed, then base64 (`to verify against source`:
byte order statement in the mzML 1.1 spec). indexedmzML: a wrapper with byte offsets of each spectrum for random access.
mzXML: older ISB format, `<peaks>` with interleaved m/z-intensity pairs in network byte order (big-endian)
(`to verify against source`). MGF: text, `BEGIN IONS` / `PEPMASS=` / `CHARGE=` / `RTINSECONDS=` / peak lines / `END IONS`.
MSP: NIST text library format (`Name:`, `Num Peaks:`, peak lines). JCAMP-DX for MS: Lampen 1994. netCDF/ANDI-MS:
ASTM E2077 (`to verify against source`). mzTab-M: tab-separated results (Hoffmann 2019).
Vendor formats: Thermo `.raw`, Agilent and Bruker `.d` folders, Sciex `.wiff`/`.wiff2`, Waters `.raw` folders;
conversion with ProteoWizard msconvert (Chambers 2012) or ThermoRawFileParser (Hulstaert 2020).

Metadata table: polarity, MS level, scan start time + unit, profile/centroid, precursor m/z + isolation window +
charge, collision energy + its type (eV vs NCE), resolution, instrument model, ion source, conversion software +
version, filters applied (e.g. peak picking during conversion).

Pitfalls: vendor centroiding during conversion silently applied or not; 32-bit float m/z loses precision at high m/z
(float32 has a 24-bit significand: rounding error up to ~6e-8 relative, i.e. ~0.06 ppm, fine for m/z storage
but it adds up when large intensities are summed; show the number computed in the figure); MGF has no standard for RT units; polarity lost;
time in seconds vs minutes; files converted with different software versions in the same study.

Visualizers:
3. `sim-chemi-codifica` - "Come si scrive uno spettro in un file". Teaching point: what base64, precision and
   compression do to size and to the numbers. Controls: number of peaks (10-2000), precision (32/64 bit), compression
   (nessuna / zlib / "previsione lineare" didactic), profile vs centroid source. Live: encodes a seeded synthetic
   m/z array; zlib via the browser `CompressionStream("deflate")` when available (it is the zlib wrapper; if absent,
   the option is disabled with a sentence, never a network call); the "previsione lineare" option is a didactic
   fixed-point linear-prediction encoder labelled "schema semplificato ispirato a MS-Numpress, non il codec
   ufficiale". Output: bytes raw / compressed / base64, ratio, max absolute and ppm error after decoding, first
   80 characters of the base64 text, the mzML `<binaryDataArray>` snippet with the right cvParams. ~6 KB gzip.
4. `sim-chemi-formati` - "Lo stesso spettro in cinque formati". Teaching point: what each format keeps. Controls:
   format buttons (mzML, mzXML, MGF, MSP, mzTab-M), "mostra solo i metadati". Live: renders the same synthetic MS2
   spectrum as text in a `<pre>`; a checklist table marks which metadata survive (✓/✗ + word). ~4 KB gzip.

### Chapter 24 - Tracce di massa: XIC e regioni d'interesse

Goals: think of LC-HRMS data as a cloud of (RT, m/z, I) points; pick an XIC window from mass error and resolution;
know how ROI / mass traces are built and how they fail.

Outline (IT):
```
h2 I dati come nuvola di punti
h2 La finestra di estrazione in ppm
  h3 Quanto larga: errore di massa e risoluzione
  h3 Isobari vicini
h2 Costruire le tracce di massa
  h3 L'algoritmo passo per passo
  h3 I parametri
  h3 Quando sbaglia: tracce spezzate o fuse
h2 L'alternativa a bin fissi
h2 Verifica
h2 Per approfondire
```

Algorithms:
```
XIC(m, tol_ppm): for each scan s: I(s) = sum (or max) of centroid intensities with |mz - m| <= m * tol_ppm * 1e-6
ROI building (centWave first stage, Tautenhahn 2008; simplified):
  rois = []
  for each scan s in RT order:
    for each centroid (mz, I) in s:
      r = roi with |mz - r.mzMean| <= r.mzMean * ppm * 1e-6, not yet extended in scan s (closest if several)
      if r: append (s, mz, I); update r.mzMean (running/weighted mean)
      else: start a new roi
    close rois not extended for > gap scans
  keep roi if length >= minScans and at least k scans have I >= Imin   (prefilter = c(k, Imin))
binning (matchedFilter, Smith 2006): cut m/z into fixed bins (binSize, default 0.1); the XIC of a bin is the max (or sum)
  per scan -> peak detection on each bin; good for unit resolution, wasteful/merging at HR.
```
Parameters (xcms `CentWaveParam` defaults, `verified` in xcms source `R/functions-Params.R`, devel branch, 2026-10-31):
`ppm = 25`, `peakwidth = c(20, 50)` s, `snthresh = 10`, `prefilter = c(3, 100)`, `mzCenterFun = "wMean"`,
`integrate = 1`, `mzdiff = -0.001`, `noise = 0`, `fitgauss = FALSE`. Say that defaults are a starting point, not a
recommendation, and that ppm must reflect the scan-to-scan scatter of the instrument (often far below 25 ppm on
modern Orbitrap/TOF; give no single number as truth).

Formulas: window half-width in Da = m x tol x 1e-6; two ions of masses m1, m2 are separated by the window if
|m1 - m2| > window; minimum resolving power to separate them R = m / Delta m (link ch. 9).

Pitfalls: window narrower than the real scatter (holes in the XIC, split traces); window wider than the distance to a
near-isobar (merged traces, wrong area); low-intensity scans with worse mass accuracy (scatter grows at the peak
edges); ppm tolerance applied to a moving mean that drifts; matrix background traces (ever-present m/z) become ROIs.

Visualizers:
5. `sim-chemi-xic` - "La finestra in ppm". Teaching point: too narrow loses signal, too wide merges an isobar.
   Controls: window (+-0.5 to 50 ppm, log), instrument scatter (SD 0.5-10 ppm, with intensity-dependent scatter
   toggle), isobar distance (1-50 ppm) and intensity, resolving power (for whether the two are even resolved).
   Live: seeded LC-HRMS points near the target; XIC computed; area vs true area. Output: top panel RT x m/z scatter
   with the window band drawn (points inside filled, outside hollow: shape, not colour), bottom panel the XIC;
   readout "Area recuperata 74 %, isobaro incluso: sì". ~6 KB gzip.
6. `sim-chemi-roi` - "Costruire una traccia, scansione per scansione". Teaching point: the ROI algorithm and its
   parameters. Controls: ppm tolerance, max gap (0-3 scans), min length, prefilter k and Imin; buttons "Passo
   successivo", "Esegui tutto", "Ricomincia". Live: 40 scans of 3 co-eluting traces (one weak and noisy, one
   near-isobar pair) plus random noise centroids; ROI assignment step by step. Output: m/z-vs-scan plot with each
   ROI as a numbered polyline (number labels + dash, not colour only), list of ROIs with kept/discarded and why
   ("scartata: 2 scansioni < 5"). ~6 KB gzip.

### Chapter 25 - Trovare i picchi cromatografici

Goals: understand smoothing, three peak-detection families (local extrema, matched filter, CWT/centWave), how S/N is
defined (and that definitions differ), peak quality metrics, and overlapping peaks.

Outline (IT):
```
h2 Che cosa cerca un algoritmo di picchi
h2 Lisciare il segnale
h2 Tre famiglie di algoritmi
  h3 Massimi e minimi locali
  h3 Il filtro adattato
  h3 La trasformata wavelet continua (centWave)
h2 Segnale, rumore e linea di base
h2 La qualità di un picco
h2 Picchi sovrapposti
  h3 Valle e minimo locale
  h3 Somma di curve
  h3 Deconvoluzione degli spettri in GC-EI
h2 Verifica
h2 Per approfondire
```

Algorithms:
```
moving average (window w) and Savitzky-Golay (window w, polynomial order p: least-squares local polynomial; preserves
  height/width better than moving average for the same noise reduction; Savitzky & Golay 1964)
local extrema: smooth -> maxima above threshold -> walk down both sides to minima or baseline -> area by trapezoids
matched filter (Smith 2006): convolve the EIC with the negative second derivative of a Gaussian of sigma = fwhm/2.3548
  (default fwhm 30 s, snthresh 10: `verified` xcms MatchedFilterParam); maxima of the filtered trace above
  snthresh x noise -> peak limits where the filtered signal crosses zero.
CWT / centWave (Tautenhahn 2008, building on Du 2006):
  for each ROI: compute CWT coefficients C(a, t) with a Mexican-hat wavelet for scales a spanning peakwidth
  (in scans); find local maxima of C at each scale; link maxima across scales into ridge lines; a peak = a ridge that
  persists over enough scales, with its best scale giving the width; S/N test (snthresh) against a noise estimate
  from the ROI surroundings; integrate on the raw (integrate = 1, from the CWT-derived limits) or on the
  Mexican-hat-filtered data (integrate = 2). Exact noise estimate and ridge rules: `to verify against source`
  (Tautenhahn 2008 and xcms code); present as the idea, not as the xcms implementation.
S/N definitions (say they differ by program): (apex - baseline) / SD(noise); (apex - baseline) / (noise peak-to-peak / 2)
  or with a MAD; never compare S/N values across programs.
quality metrics: FWHM; points across the peak (link scan rate); asymmetry As = b/a at 10 % height; tailing factor
  Tf = (a+b)/(2a) at 5 %; Gaussian-fit R^2 (shape similarity); zigzag / sharpness indices (Zhang 2014, `verified`
  DOI; definitions `to verify against source`).
overlap: valley split (split at the minimum if valley/smaller apex < v, e.g. 0.5); sum of Gaussians/EMG fitted by
  least squares (initial guesses from maxima); GC-EI spectral deconvolution (AMDIS, Stein 1999): model ion
  chromatograms that share the same apex/shape are grouped into one "pure" component spectrum.
```

Formulas: SG smoothing as weighted moving average (weights from the polynomial fit); Gaussian w½ = 2.355 sigma; area of
a Gaussian = h sigma sqrt(2 pi); As, Tf; EMG.

Pitfalls: smoothing wider than the peak (merges and lowers peaks); peakwidth range not matching the real widths
(centWave misses narrow or wide peaks); too few points per peak (fast UHPLC with slow MS2-heavy duty cycle);
spikes counted as peaks; S/N thresholds not transferable between programs; integrating a split peak twice.

Visualizers:
7. `sim-chemi-picchi` - "Cercare i picchi in un cromatogramma rumoroso". Teaching point: the effect of smoothing,
   algorithm and thresholds, with a ground truth. Controls: algorithm (massimi locali / filtro adattato / CWT),
   smoothing (nessuno / media mobile / Savitzky-Golay) and width, CWT scale range (min-max in s), S/N threshold,
   minimum width; "Nuovi dati". Live: `CHEMI.chrom` with 5 peaks (one tailing EMG, one co-eluting pair at
   adjustable resolution Rs 0.6-1.5, one small at S/N ~5, one spike) plus baseline drift; detection; comparison to
   the truth (found / missed / false). Optional view "scalogramma" (CWT coefficient heat map, grey scale + ridge
   lines; skipped from the a11y story by a text summary). Output: plot with detected limits as brackets and labels
   P1..Pn, markers for truth; table RT, height, area, FWHM, S/N, As, verdict (✓ vero / ✗ falso / mancato).
   ~9 KB gzip.
8. `sim-chemi-qualita` - "Quanto è buono questo picco?". Teaching point: points per peak and tailing change the
   numbers you report. Controls: tailing tau, scan time (0.05-1 s) i.e. points across the peak, noise, baseline
   slope. Live: metrics FWHM, As(10 %), Tf(5 %), Gaussian R^2, S/N with two definitions side by side, area error vs
   the true area. Output: plot with sampled points, readout, table. ~5 KB gzip.

### Chapter 26 - Dai picchi ai composti: isotopi, addotti, frammenti in sorgente

Goals: one molecule gives many features; group them by RT, shape correlation and mass differences; know the main
Delta m values; know how grouping fails.

Outline (IT):
```
h2 Una molecola, molte feature
h2 Raggruppare per tempo e per forma
h2 Gli isotopologhi
h2 Addotti e perdite neutre
h2 I frammenti in sorgente
h2 Quando il raggruppamento sbaglia
h2 Verifica
h2 Per approfondire
```

Algorithms (CAMERA-like, Kuhl 2012; RAMClust, Broeckling 2014):
```
1. RT groups: features whose apex RT differ by <= f x FWHM (CAMERA groupFWHM; `to verify against source` for the
   exact default) or <= dRT
2. shape test: Pearson correlation of the EICs over the common RT range >= rmin (e.g. 0.8), optionally also
   correlation of intensities across samples
3. isotopes inside a group: pairs with Delta m = k x 1.003355 / z within tol (13C - 12C = 1.0033548 u) and an
   intensity ratio plausible for the number of C (M+1/M ~ n_C x 1.07 %); Cl/Br: Delta m 1.99705 (37Cl-35Cl) and
   1.99795 (81Br-79Br) with the known ratios (link ch. 10, 11)
4. adducts inside a group: pairs whose Delta m matches a rule list -> a hypothesis for the neutral M
5. in-source fragments: Delta m of a common neutral loss (H2O 18.0106, NH3 17.0265, CO2 43.9898) with the same
   shape and RT (link ch. 15)
6. a "compound" = connected component of the graph of explained links
```
Delta m table to put in the chapter (positive mode, all values to 4 decimals, computed with `assets/masse.js` by the
DEV and checked by a test): [M+Na]+ - [M+H]+ = 21.9819; [M+NH4]+ - [M+H]+ = 17.0265; [M+K]+ - [M+H]+ = 37.9559;
[2M+H]+ vs [M+H]+ (M dependent); negative: [M+Cl]- - [M-H]- = 35.9767; [M+HCOO]- - [M-H]- = 46.0055.
(The DEV recomputes each value from masse.js; the test asserts agreement within 0.0001.)

Pitfalls: two co-eluting compounds grouped as one; isotope of one compound taken as another compound; adduct rules
generate false "neutral masses" (Delta m coincidences grow with the rule list); dimers and multiply charged ions;
correlation over few points is meaningless; in-source fragment mistaken for a separate compound (and vice versa).

Visualizers:
9. `sim-chemi-gruppi` - "Chi appartiene a chi?". Teaching point: rules + tolerance + correlation decide the grouping,
   and every extra rule adds coincidences. Controls: RT tolerance, correlation threshold, mass tolerance (ppm),
   checkboxes for rules (isotopi 13C, Cl/Br, Na, NH4, K, perdita di H2O, dimero), "secondo composto co-eluente"
   toggle. Live: 2-3 synthetic compounds (generic: a drug-like C15H12N2O, a chlorinated pesticide-like formula with
   Cl isotopes, a metabolite-like C6H12O6 with Na/NH4 adducts) produce ~15 features with seeded EICs; graph of links.
   Output: left the EICs (dash per group, labels), right a node-link list (features as rows, links as text
   "F3 → F1: +21,9819 = Na invece di H"), groups numbered; readout "3 gruppi; 1 legame casuale". ~7 KB gzip.

### Chapter 27 - Dalla serie di campioni alla tabella delle feature

Goals: why RT drifts and how alignment works (anchor + LOWESS, warping); how features are matched across samples
(correspondence), how gaps are filled, which filters and normalisations exist, and what each column of a feature
table means.

Outline (IT):
```
h2 Perché il tempo di ritenzione si sposta
h2 Allineare i campioni
  h3 Picchi di riferimento e curva LOWESS
  h3 Deformare l'asse dei tempi (DTW, OBI-Warp)
  h3 Come controllare l'allineamento
h2 Corrispondenza fra campioni
h2 Riempire i buchi
h2 Filtrare: bianchi, repliche, QC
h2 Normalizzare
h2 La tabella delle feature
h2 Verifica
h2 Per approfondire
```

Algorithms:
```
peak-groups alignment (Smith 2006): find "well-behaved" groups (present in most samples, one peak per sample);
  for each sample fit deviation d(rt) = rt_sample - median_rt_group with LOWESS (Cleveland 1979; tricube weights
  w = (1 - |u|^3)^3 on the span, robustness iterations) -> corrected rt = rt - d(rt)
DTW (Sakoe & Chiba 1978): cost matrix between two profiles (1 - correlation); cumulative cost
  D(i,j) = c(i,j) + min(D(i-1,j), D(i,j-1), D(i-1,j-1)); backtrack the minimal path; optional band constraint.
  OBI-Warp (Prince & Marcotte 2006) is a dynamic-programming warping on whole-scan similarity followed by a
  monotone piecewise interpolation ("ordered bijective interpolated warping").
correspondence, peak density (xcms; defaults `verified` PeakDensityParam: bw = 30, minFraction = 0.5, minSamples = 1,
  binSize = 0.25): slice m/z into bins; inside a slice build a kernel density of the peaks' RT (bandwidth bw); each
  density maximum defines a feature group with the peaks under it; keep if present in >= minFraction of a sample group.
correspondence, tolerance join (MZmine-style): score = w_mz (1 - dmz/tol_mz) + w_rt (1 - drt/tol_rt); assign
  greedily by best score (one peak per sample per feature).
gap filling: for a missing (feature, sample) integrate the raw signal in [mzmin, mzmax] x [rtmin, rtmax] of the
  feature in that sample; the value is a measurement of what is there (often noise), not a detection; flag it.
filters: blank: keep if mean(sample) / mean(blank) >= fold (illustrative 3-10; literature varies); replicate
  frequency: present in >= n of m replicates; QC: RSD(QC) <= 20-30 % (Broadhurst 2018 discusses criteria).
normalisation: total intensity; median; PQN (Dieterle 2006: median of feature-wise quotients to a reference
  spectrum); internal standards; QC-based drift correction (LOESS on QC injection order; Dunn 2011).
```

Feature table: one row per feature: `id, mz (median), mzmin, mzmax, rt, rtmin, rtmax, npeaks`, one intensity column
per sample (height or area: say which), annotation columns (isotope, adduct, group from ch. 26), flags (riempito,
nel bianco, RSD QC). How it goes wrong: one compound split into two rows (RT drift > bw), two compounds merged in one
row (near-isobars, wide bins), filled values read as detections, area and height mixed, normalisation hiding a real
effect, blank filter removing a real compound present at trace in the blank.

Visualizers:
10. `sim-chemi-allinea` - "Allineare due corse". Teaching point: anchor features + LOWESS span; overfitting vs
    underfitting. Controls: drift shape (lineare / curva / gradino), number of anchor features (5-40), LOWESS span
    (0.2-1), outlier anchors (0-5 wrong matches), method (LOWESS / DTW). Live: two synthetic BPCs (run A reference,
    run B warped); fitted d(rt); corrected run. Output: top two BPCs before/after (dash differs), bottom deviation vs
    RT with anchors as markers and the fitted curve; readout "Scarto residuo mediano 0,8 s (era 14 s)". ~7 KB gzip.
11. `sim-chemi-corrispondenza` - "Lo stesso composto in sei campioni". Teaching point: density bandwidth and
    minFraction decide splits/merges; gap filling fills with what is there. Controls: bw, minFraction, m/z bin, RT
    drift left after alignment, gap filling on/off. Live: 6 samples x ~12 compounds with missing detections; density
    curves; resulting feature table. Output: density plot per m/z slice + a small HTML table (not canvas) with
    filled cells marked "(riempito)" and in italics; readout counts features, splits, merges vs truth. ~7 KB gzip.
12. `sim-chemi-tabella` - "Esplora la tabella delle feature". Teaching point: filters and normalisation change the
    list; artefacts are recognisable. Controls: blank fold threshold, replicate frequency, QC RSD threshold,
    normalisation (nessuna / totale / mediana / PQN), sort by column (keyboard-accessible table headers as buttons),
    text filter by m/z. Live: synthetic study (3 blanks, 6 samples, 4 QCs, ~60 features including planted artefacts:
    blank contaminant, in-source fragment, isotope duplicate, noise filled feature, drifting QC feature). Output:
    sortable table (native `<table>`, `aria-sort`), per-row reason of exclusion in words, readout "Restano 31 feature
    su 60; 4 artefatti su 5 eliminati". ~8 KB gzip.

### Chapter 28 - Spettri MS2 e somiglianza spettrale

Goals: know where MS2 spectra come from and why they can be impure; preprocess spectra; compute cosine, weighted
cosine, modified cosine and spectral entropy similarity by hand; know forward vs reverse search.

Outline (IT):
```
h2 Da dove vengono gli spettri MS2
  h3 DDA e DIA
  h3 Purezza del precursore e spettri chimerici
h2 Preparare uno spettro
h2 Accoppiare i picchi
h2 I punteggi di somiglianza
  h3 Prodotto scalare e coseno
  h3 Coseno pesato
  h3 Coseno modificato
  h3 Entropia spettrale
h2 Ricerca diretta e inversa
h2 Verifica
h2 Per approfondire
```

Algorithms:
```
preprocess: drop peaks with m/z > precursor - small margin (precursor removal; margin choice `to verify`, program
  dependent), relative intensity threshold (e.g. < 1 % of base peak), optional top-k peaks per window, normalise to
  max = 1 or sum = 1, intensity transform I^p (p = 0.5 is common)
matching: candidate pairs with |mz_a - mz_b| <= tol (Da or ppm); one-to-one assignment by descending product
  a_i b_j (greedy; Hungarian is the exact alternative)
cosine: cos = sum a_i b_i / (sqrt(sum a^2) sqrt(sum b^2)) over the matched pairs (unmatched peaks count in the norms)
weighted cosine (Stein & Scott 1994): weights w = (m/z)^n x I^m before the cosine; values of m, n depend on the
  library/program (EI and MS/MS differ); give the idea, cite, mark the numeric exponents `to verify against source`
modified cosine (Watrous 2012; compared in Bittremieux 2022): a peak may match either directly (|dmz| <= tol) or
  shifted by Delta = precursor_a - precursor_b; the one-to-one assignment uses both kinds of pairs; captures
  analogues differing by a modification. Exact pair-selection rule: `to verify against source`.
spectral entropy (Li 2021; `verified` against the authors' reference code SpectralEntropy/math_distance.py):
  p_i = intensities normalised to sum 1; S = - sum p_i ln p_i
  weighting: if S < 3: w = 0.25 + 0.25 S; p_i <- p_i^w, renormalise   (the code's docstring says a different
  expression; the code does the above: `to verify against the paper` and say "versione pesata")
  merged spectrum M = (A + B)/2 after matching within tol (matched peaks summed, unmatched kept)
  similarity = 1 - (2 S_M - S_A - S_B) / ln 4      (0 = nothing shared, 1 = identical)
forward vs reverse: forward uses all query peaks; reverse ignores query peaks absent in the library spectrum
  (robust to impure/chimeric queries; also more prone to false hits with sparse library spectra).
```

Pitfalls: comparing spectra at different collision energies or instrument types; chimeric spectra (co-isolated
precursors) lowering scores; few peaks giving a high cosine by chance (require a minimum number of matched peaks);
precursor peak left in dominating the cosine; tolerance in Da at high m/z vs ppm; scores not comparable across
transforms (sqrt vs raw).

Visualizers:
13. `sim-chemi-specchio` - "Specchio: due spettri, quattro punteggi". Teaching point: each score reacts differently to
    the same change. Controls: preset pair (identico / rumore aggiunto / analogo +CH2 (14,0157) / energia diversa /
    composto diverso), peak editor (select a peak of the query; slider for its intensity; buttons "elimina",
    "aggiungi picco di rumore", "sposta di Delta"), tolerance (0.001-0.5 Da or ppm), intensity power (0, 0.5, 1),
    m/z power (0-3), precursor removal toggle, reverse toggle. Live: matching + cosine, weighted cosine, modified
    cosine, entropy similarity, matched peaks count. Output: mirror plot (query up, library down; matched peaks
    drawn solid with a ✓ marker, unmatched hollow, shifted matches dotted connector), a score panel (four numbers
    with bars and text), table of pairs. All spectra synthetic, generic (drug-like fragments). ~9 KB gzip.
14. `sim-chemi-purezza` - "Quando la finestra di isolamento prende due ioni". Teaching point: isolation width and a
    co-eluting ion produce chimeric spectra; purity predicts the score loss. Controls: isolation width (0.4-4 m/z),
    distance and intensity of the co-eluting ion, RT offset between the two peaks, acquisition time inside the peak.
    Live: precursor purity = target intensity / total intensity in the window; chimeric spectrum = weighted sum;
    cosine vs the pure library spectrum. Output: MS1 window plot + mirror mini-plot + readout. ~5 KB gzip.

### Chapter 29 - Ricerca in libreria e falsi positivi

Goals: know the libraries (content, scope, licences); EI search with match factor + retention index; MS/MS search
filters (precursor, polarity, energy); estimate false discoveries with target-decoy; understand molecular networking.

Outline (IT):
```
h2 Le librerie spettrali
h2 Ricerca EI: match factor e indice di ritenzione
h2 Ricerca MS/MS: precursore, energia, punteggio
h2 Quanti risultati sono falsi?
  h3 L'approccio target-decoy
  h3 FDR e q-value
h2 Le reti molecolari
h2 Verifica
h2 Per approfondire
```

Content: libraries table - NIST (commercial licence, EI + MS/MS; never redistributed here); MassBank (Horai 2010;
open, licence set per record: CC BY / CC BY-SA / CC BY-NC-SA / CC0 among others, `to verify` the current set on
massbank.eu); GNPS libraries (Wang 2016; licence terms `to verify` on the GNPS site); MoNA (per-record licences,
`to verify`). EI search: match factor and reverse match factor on a 0-999 scale (NIST MS Search; composite score
details `to verify against the NIST MS Search manual`), RI window filter (link ch. 3), hit list probability.
MS/MS: filter by precursor m/z (tol), polarity, adduct, instrument class, collision energy; score; min matched peaks.

Algorithms:
```
target-decoy (Elias & Gygi 2007, adapted to metabolomics by Scheubert 2017):
  build a decoy library (e.g. spectra with peaks re-assigned/shuffled, or fragmentation-tree-based decoys as in
  Scheubert 2017); search each query against targets + decoys; keep the best hit per query
  at threshold t: FDR(t) ~= (#decoy best hits >= t) / (#target best hits >= t)
  q-value(score s) = min over t <= s of FDR(t)
  report hits with q <= 0.01 or 0.05; say that decoy quality decides whether the estimate is honest
molecular networking (Watrous 2012; GNPS, Wang 2016): nodes = consensus MS2 spectra; edges where modified cosine
  >= threshold and matched peaks >= k; keep each node's top-K edges; components = families of related molecules;
  annotation propagates from library-matched nodes. GNPS default values (cosine 0.7, 6 matched peaks, top-K 10):
  `to verify against GNPS documentation`.
```

Pitfalls: top hit taken as an identification; RI from a different column phase; libraries with one energy only;
"no hit" read as "absent"; FDR estimated with poor decoys; networks with permissive thresholds connect everything;
licence: no NIST spectra may appear in the handbook.

Visualizers:
15. `sim-chemi-libreria` - "Classifica dei risultati e falsi positivi". Teaching point: a score threshold has an FDR
    and target-decoy estimates it. Controls: score threshold, library size (100-2000), fraction of queries whose
    true compound is in the library (0-100 %), decoy type (casuale / mescolato "più realistico"), RI filter toggle
    (EI preset). Live: synthetic library + queries (true matches with noise, unknowns with partial similarity);
    best-hit scores; target and decoy histograms; estimated FDR and true FDR (known in the simulation); hit list
    for one selectable query with forward/reverse scores and RI deviation. Output: two histograms (solid vs hatched,
    labelled), FDR curve with threshold line, readout "Soglia 0,72: 140 risultati, FDR stimata 4,8 %, vera 5,3 %".
    ~8 KB gzip.
16. `sim-chemi-rete` - "Una rete molecolare". Teaching point: thresholds decide families. Controls: cosine threshold,
    min matched peaks, top-K, modified vs plain cosine. Live: 14 synthetic spectra (3 families of analogues + 2
    singletons); pairwise scores; edges. Output: fixed-layout node-link drawing (nodes labelled N1..N14, family
    shown by shape and a text list), edge list as text; readout "4 famiglie, 2 isolati, 1 legame fra famiglie
    diverse". ~6 KB gzip.

### Chapter 30 - Formule e strutture candidate

Goals: generate and rank molecular formulas from accurate mass + isotope pattern + rules; know what candidate
retrieval and in silico fragmentation (MetFrag, CFM-ID, SIRIUS/CSI:FingerID) do in principle and their limits.

Outline (IT):
```
h2 Dalla massa alle formule
h2 Il pattern isotopico come filtro
h2 Regole euristiche
h2 Dalla formula ai candidati
h2 Frammentazione in silico
  h3 MetFrag: rompere legami
  h3 CFM-ID: prevedere lo spettro
  h3 SIRIUS e CSI:FingerID: alberi di frammentazione e impronte
h2 Verifica
h2 Per approfondire
```

Algorithms:
```
formula enumeration: all CcHhNnOoPpSsClx... with |m_calc - m_ion| <= tol, element ranges, ion type; RDB = C - H/2
  + N/2 + 1 >= 0 (link ch. 11; existing figure sim-formule already enumerates: reuse by link, do not rebuild)
isotope score (didactic): theoretical pattern from MASSE.pattern(formula); measured relative abundances r_k;
  score = 1 - sum |r_k - t_k| / sum t_k  (or a chi-square); state that real programs use their own scores
seven golden rules (Kind & Fiehn 2007): element number limits, LEWIS and SENIOR rules, isotope pattern, H/C ratio,
  NOPS/C ratios, element probability checks (list the seven, numbers `to verify against source`)
MetFrag (Wolf 2010; Ruttkies 2016): candidates from a structure database by formula or mass; combinatorial bond
  disconnection of each candidate up to a depth; fragments matched to peaks; score from matched peaks (bond-energy
  penalties) plus optional terms (references, RT, etc.).
CFM-ID (Allen 2014/2015): a probabilistic model of fragmentation trained on spectra predicts a spectrum for each
  candidate at low/medium/high energy; candidates ranked by similarity to the measured spectrum.
SIRIUS (Dührkop 2019): fragmentation trees + isotope pattern -> ranked formulas; CSI:FingerID (Dührkop 2015)
  predicts a molecular fingerprint from the spectrum/tree with machine learning and searches structure databases by
  fingerprint similarity. Say: candidates are only as good as the database; the top candidate is level 3 at best
  unless confirmed (ch. 31).
```

Pitfalls: ppm window too tight for the real error; wrong ion type (adduct) -> all formulas wrong; isotope pattern
distorted by saturation or thresholds (ch. 22); isomers are indistinguishable by formula and often by MS2; in silico
ranks change with database choice; trusting a single top-1.

Visualizers:
17. `sim-chemi-formula` - "Quante formule restano?". Teaching point: each piece of evidence cuts the list; isotope
    fidelity matters. Controls: measured m/z (preset generic compounds), ion type ([M+H]+, [M+Na]+, [M-H]-), ppm
    tolerance, element set checkboxes (C H N O always; P S Cl Br F), measured isotope pattern quality (good /
    saturated / missing M+2), rules toggles (RDB >= 0 and integer/half-integer as appropriate, H/C range, isotope score
    >= x). Live: enumeration with MASSE (bounded search, budget <= 50 ms; the chapter loads `masse.js`), scoring,
    funnel counts. Output: funnel bar chart with numbers written on bars, top-10 table with ppm, RDB, isotope score;
    readout "Da 312 a 4 candidati". ~8 KB gzip.
18. `sim-chemi-candidati` - "Tre isomeri, uno spettro". Teaching point: in silico scoring explains peaks but isomers
    tie. Controls: tolerance, which candidate to show, "peso dell'intensità". Live: three hand-written didactic
    candidates (isomers of one generic formula) each with a small list of predicted fragment m/z (data written in the
    file, computed from formulas with MASSE, no external database); fraction of explained intensity per candidate.
    Output: measured spectrum with explained peaks marked per candidate (✓ + fragment formula label), ranking table;
    readout "Due candidati spiegano l'80 % del segnale: lo spettro non li distingue". ~5 KB gzip.

### Chapter 31 - Livelli di confidenza dell'identificazione

Goals: assign and report a confidence level from the evidence; distinguish score from level; know Schymanski 2014 and
MSI 2007 and their mapping.

Outline (IT):
```
h2 Perché serve un livello
h2 La scala di Schymanski (2014)
h2 La scala MSI (2007)
h2 Un punteggio non è un livello
h2 Che cosa riportare
h2 Verifica
h2 Per approfondire
```

Content (wording `to verify against source` before publishing; the DEV must read the papers, open access status
`to verify`):
- Schymanski et al. 2014 (`verified` DOI): Level 1 confirmed structure (reference standard: MS, MS/MS, RT);
  Level 2 probable structure, 2a library spectrum match, 2b diagnostic evidence; Level 3 tentative candidate(s);
  Level 4 unequivocal molecular formula; Level 5 exact mass (m/z) of interest. Minimum data per level as in the
  paper's figure.
- MSI, Sumner et al. 2007 (`verified` DOI): 1 identified compound (two or more orthogonal properties compared with an
  authentic standard under identical conditions); 2 putatively annotated compound; 3 putatively characterised
  compound class; 4 unknown.
- Extensions to mention only as "further proposals": Charbonnet 2022 for PFAS (`verified` DOI).
- Mapping (didactic, state it is approximate): S1 ~ MSI 1; S2a/2b ~ MSI 2; S3 ~ MSI 2-3; S4/S5 ~ MSI 4.
- Score vs level: a cosine 0.95 without RT of a standard is still level 2a at best; a level 1 needs the standard
  measured in the same lab/method.
- What to report (table): m/z, RT, ion type, formula + ppm, isotope fit, MS2 evidence (library, score, matched peaks,
  energy), RI if GC, standard (lot/source) if level 1, level with its scale, software + versions + parameters.

Visualizers:
19. `sim-chemi-livelli` - "Che livello ho?". Teaching point: the level follows from evidence, not from a score.
    Controls: checkboxes of evidence (massa esatta misurata; formula univoca dal pattern; spettro MS2 acquisito;
    corrispondenza in libreria con punteggio >= soglia e >= n picchi; evidenza diagnostica (frammenti, contesto);
    standard di riferimento iniettato con stesso metodo: RT, MS, MS2 coincidono), a score slider. Live: decision
    procedure as written in the paper; produces Schymanski level and MSI level, with the sentence "che cosa manca
    per salire di livello". Output: HTML (no canvas): the path through the decision tree as an ordered list with
    ✓/✗ words, the levels in large text, readout. The slider demonstrates that raising the score never changes the
    level beyond 2a without a standard. ~4 KB gzip.

### Chapter 32 - Un esempio dall'inizio alla fine

Goals: see the whole chain once on one generic synthetic dataset: file -> centroids -> ROI -> peaks -> groups ->
feature table -> MS2 match -> formula -> level; know what goes in the report.

Outline (IT):
```
h2 Il problema
h2 1. Dal file agli spettri centroidati
h2 2. Dalle tracce ai picchi
h2 3. Dai picchi alla tabella delle feature
h2 4. Dallo spettro MS2 al candidato
h2 5. Il livello di confidenza
h2 Che cosa scrivere nel rapporto
h2 Verifica
```

Example (generic, no TP storyline): a synthetic surface-water extract with three compounds: a drug that is a suspect
and has a reference standard (carbamazepine, C15H12N2O, [M+H]+ computed with masse.js), a pesticide-like suspect
without a standard (level 2a from a synthetic library spectrum), an unknown with only a formula (level 4). All
spectra are synthetic and labelled so; optionally one MassBank record with an explicit open licence (source line and
`docs/provenance/chemi-esempio.md`), never NIST.

Visualizer:
20. `sim-chemi-esempio` - "Il percorso completo, un passo alla volta". Teaching point: each step's output is the next
    step's input. Implementation: a stepper with 6 steps; each step reuses an existing figure family with a preset
    (`data-preset="esempio"`) by placing the corresponding `.sim` divs of chapters 22, 24, 25, 27, 28, 31 on the page
    (their files must accept the `esempio` preset: DEV-06 adds the preset data inside its own file
    `sim-chemi-esempio.js` and passes it via `CHEMI.preset("esempio", {...})`, which the other figure files read if
    present). Output per step: a readout sentence and the intermediate table. ~4 KB gzip for the stepper + presets.
    Requires DEV-01..05 merged; the figure files must expose a preset hook (`init(el, preset)`) from the start
    (DEV-00 contract).

---------------------------------------------------------------------------------------------------------------------

## 5. Visualizers summary

| # | id | Chapter | File | Interaction | gzip est. |
|---|---|---|---|---|---|
| 1 | sim-chemi-centroide | 22 | sim-chemi-segnale.js | sliders, algorithm select, 200 draws | 7 KB |
| 2 | sim-chemi-taratura | 22 | sim-chemi-segnale.js | sliders, toggles | 4 KB |
| 3 | sim-chemi-codifica | 23 | sim-chemi-formati.js | selects, CompressionStream | 6 KB |
| 4 | sim-chemi-formati | 23 | sim-chemi-formati.js | format buttons, text | 4 KB |
| 5 | sim-chemi-xic | 24 | sim-chemi-tracce.js | sliders | 6 KB |
| 6 | sim-chemi-roi | 24 | sim-chemi-tracce.js | stepper | 6 KB |
| 7 | sim-chemi-picchi | 25 | sim-chemi-picchi.js | algorithm, smoothing, thresholds, truth | 9 KB |
| 8 | sim-chemi-qualita | 25 | sim-chemi-picchi.js | sliders | 5 KB |
| 9 | sim-chemi-gruppi | 26 | sim-chemi-gruppi.js | rule checkboxes, tolerances | 7 KB |
| 10 | sim-chemi-allinea | 27 | sim-chemi-tabella.js | drift, anchors, span | 7 KB |
| 11 | sim-chemi-corrispondenza | 27 | sim-chemi-tabella.js | bw, minFraction, gap fill | 7 KB |
| 12 | sim-chemi-tabella | 27 | sim-chemi-esplora.js | filters, sort, normalisation | 8 KB |
| 13 | sim-chemi-specchio | 28 | sim-chemi-somiglianza.js | peak editor, 4 scores | 9 KB |
| 14 | sim-chemi-purezza | 28 | sim-chemi-somiglianza.js | isolation window | 5 KB |
| 15 | sim-chemi-libreria | 29 | sim-chemi-librerie.js | threshold, decoys, FDR | 8 KB |
| 16 | sim-chemi-rete | 29 | sim-chemi-librerie.js | thresholds, graph | 6 KB |
| 17 | sim-chemi-formula | 30 | sim-chemi-candidati.js | ppm, elements, rules funnel | 8 KB |
| 18 | sim-chemi-candidati | 30 | sim-chemi-candidati.js | isomer explanation | 5 KB |
| 19 | sim-chemi-livelli | 31 | sim-chemi-confidenza.js | evidence checkboxes | 4 KB |
| 20 | sim-chemi-esempio | 32 | sim-chemi-esempio.js | stepper + presets | 4 KB |

Per-file gzip estimates (sum of its figures): segnale 11, formati 10, tracce 12, picchi 14, gruppi 7, tabella 14 + esplora 8,
somiglianza 14, librerie 14, candidati 13, confidenza 4, esempio 4, chemi-common 4. The 15 KB limit is per figure
**file**; chapter 27's three figures (~22 KB together) are therefore split into `sim-chemi-tabella.js` (figures 10, 11)
and `sim-chemi-esplora.js` (figure 12), both owned by DEV-03. Files near the limit (picchi, somiglianza, librerie) must
measure early and move a figure's helpers out of the shared path rather than ask for a bigger budget. Whole section ~130 KB gzip if every page were opened; a single page loads
chemi-common (4) + its file(s) (<= 15) only when scrolled near.

---------------------------------------------------------------------------------------------------------------------

## 6. Data and licences
- All figure data are synthetic, generated in the browser by `CHEMI.rng(seed)`; no data files, no private spectra,
  no sample names, no compounds of the laboratory methods (rule from `docs/COME-MODIFICARE.md`).
- Compound names used as examples are generic, public, textbook compounds (carbamazepine, caffeine, atrazine-like
  chlorinated triazines, glucose, generic EI library compounds); formulas/masses are computed with `assets/masse.js`
  (AME2020 / IUPAC data already in the repo).
- Synthetic spectra are labelled "spettro sintetico" in the figure note and are never presented as measured.
- A real spectrum, if any, comes only from MassBank Europe with its record accession, authors and licence shown under
  it (as in `docs/DATI-EI.md`) and a provenance note in `docs/provenance/`. EI spectra already in `pratica/ei-dati.js`
  (CC BY-NC-SA) may be reused in ch. 29 through the existing `div.eispec` block (no new data file).
- No NIST library content anywhere. Library names are cited, not their data.
- Text CC BY 4.0, code MIT (unchanged). `LICENZE-TERZI.md` changes only if a MassBank record is added (DEV-06).

---------------------------------------------------------------------------------------------------------------------

## 7. References

`verified` = DOI resolved on Crossref on 2026-10-31 and first author, year, title, journal, volume, pages matched.
`to verify` = do not cite until checked. Content claims attributed to a paper are separately marked in section 4.

| Key | Reference | DOI | Status |
|---|---|---|---|
| Schymanski2014 | Schymanski E.L. et al. (2014) Identifying small molecules via high resolution mass spectrometry: communicating confidence. Environ. Sci. Technol. 48, 2097-2098 | 10.1021/es5002105 | verified |
| Sumner2007 | Sumner L.W. et al. (2007) Proposed minimum reporting standards for chemical analysis. Metabolomics 3, 211-221 | 10.1007/s11306-007-0082-2 | verified |
| Charbonnet2022 | Charbonnet J.A. et al. (2022) Communicating confidence of per- and polyfluoroalkyl substance identification via HRMS. Environ. Sci. Technol. Lett. 9, 473-481 | 10.1021/acs.estlett.2c00206 | verified |
| Smith2006 | Smith C.A. et al. (2006) XCMS: processing mass spectrometry data for metabolite profiling using nonlinear peak alignment, matching, and identification. Anal. Chem. 78, 779-787 | 10.1021/ac051437y | verified |
| Tautenhahn2008 | Tautenhahn R. et al. (2008) Highly sensitive feature detection for high resolution LC/MS. BMC Bioinformatics 9, 504 | 10.1186/1471-2105-9-504 | verified |
| Du2006 | Du P. et al. (2006) Improved peak detection in mass spectrum by incorporating continuous wavelet transform-based pattern matching. Bioinformatics 22, 2059-2065 | 10.1093/bioinformatics/btl355 | verified |
| Myers2017 | Myers O.D. et al. (2017) Detailed investigation and comparison of the XCMS and MZmine 2 chromatogram construction and chromatographic peak detection methods. Anal. Chem. 89, 8689-8695 | 10.1021/acs.analchem.7b01069 | verified |
| Zhang2014 | Zhang W., Zhao P.X. (2014) Quality evaluation of extracted ion chromatograms and chromatographic peaks in LC/MS-based metabolomics data. BMC Bioinformatics 15 (Suppl 11), S5 | 10.1186/1471-2105-15-S11-S5 | verified |
| SavitzkyGolay1964 | Savitzky A., Golay M.J.E. (1964) Smoothing and differentiation of data by simplified least squares procedures. Anal. Chem. 36, 1627-1639 | 10.1021/ac60214a047 | verified |
| Stein1999 | Stein S.E. (1999) An integrated method for spectrum extraction and compound identification from GC/MS data. J. Am. Soc. Mass Spectrom. 10, 770-781 | 10.1016/S1044-0305(99)00047-1 | verified |
| Kuhl2012 | Kuhl C. et al. (2012; online 2011) CAMERA: an integrated strategy for compound spectra extraction and annotation of LC/MS data sets. Anal. Chem. 84, 283-289 | 10.1021/ac202450g | verified |
| Broeckling2014 | Broeckling C.D. et al. (2014) RAMClust: a novel feature clustering method. Anal. Chem. 86, 6812-6817 | 10.1021/ac501530d | verified |
| Prince2006 | Prince J.T., Marcotte E.M. (2006) Chromatographic alignment of ESI-LC-MS proteomics data sets by ordered bijective interpolated warping. Anal. Chem. 78, 6140-6152 | 10.1021/ac0605344 | verified |
| Cleveland1979 | Cleveland W.S. (1979) Robust locally weighted regression and smoothing scatterplots. J. Am. Stat. Assoc. 74, 829-836 | 10.1080/01621459.1979.10481038 | verified |
| SakoeChiba1978 | Sakoe H., Chiba S. (1978) Dynamic programming algorithm optimization for spoken word recognition. IEEE Trans. ASSP 26, 43-49 | 10.1109/TASSP.1978.1163055 | verified |
| Lange2008 | Lange E. et al. (2008) Critical assessment of alignment procedures for LC-MS proteomics and metabolomics measurements. BMC Bioinformatics 9, 375 | 10.1186/1471-2105-9-375 | verified |
| Broadhurst2018 | Broadhurst D. et al. (2018) Guidelines and considerations for the use of system suitability and quality control samples in mass spectrometry assays applied in untargeted clinical metabolomic studies. Metabolomics 14, 72 | 10.1007/s11306-018-1367-3 | verified (article number 72 to verify) |
| Dieterle2006 | Dieterle F. et al. (2006) Probabilistic quotient normalization as robust method to account for dilution of complex biological mixtures. Anal. Chem. 78, 4281-4290 | 10.1021/ac051632c | verified |
| Dunn2011 | Dunn W.B. et al. (2011) Procedures for large-scale metabolic profiling of serum and plasma using GC and LC coupled to MS. Nat. Protoc. 6, 1060-1083 | 10.1038/nprot.2011.335 | verified (first author not returned by Crossref: to verify) |
| Pluskal2010 | Pluskal T. et al. (2010) MZmine 2. BMC Bioinformatics 11, 395 | 10.1186/1471-2105-11-395 | verified |
| Schmid2023 | Schmid R. et al. (2023) Integrative analysis of multimodal mass spectrometry data in MZmine 3. Nat. Biotechnol. 41, 447-449 | 10.1038/s41587-023-01690-2 | verified |
| Tsugawa2015 | Tsugawa H. et al. (2015) MS-DIAL: data-independent MS/MS deconvolution for comprehensive metabolome analysis. Nat. Methods 12, 523-526 | 10.1038/nmeth.3393 | verified |
| Rost2016 | Röst H.L. et al. (2016) OpenMS. Nat. Methods 13, 741-748 | 10.1038/nmeth.3959 | verified |
| Helmus2021 | Helmus R. et al. (2021) patRoon: open source software platform for environmental mass spectrometry based non-target screening. J. Cheminform. 13, 1 | 10.1186/s13321-020-00477-w | verified |
| Hollender2017 | Hollender J. et al. (2017) Nontarget screening with high resolution mass spectrometry in the environment: ready to go? Environ. Sci. Technol. 51, 11505-11512 | 10.1021/acs.est.7b02184 | verified |
| Martens2011 | Martens L. et al. (2011) mzML - a community standard for mass spectrometry data. Mol. Cell. Proteomics 10, R110.000133 | 10.1074/mcp.R110.000133 | verified |
| Pedrioli2004 | Pedrioli P.G.A. et al. (2004) A common open representation of mass spectrometry data and its application to proteomics research (mzXML). Nat. Biotechnol. 22, 1459-1466 | 10.1038/nbt1031 | verified |
| Teleman2014 | Teleman J. et al. (2014) Numerical compression schemes for proteomics mass spectrometry data (MS-Numpress). Mol. Cell. Proteomics 13, 1537-1542 | 10.1074/mcp.O114.037879 | verified |
| Griss2014 | Griss J. et al. (2014) The mzTab data exchange format. Mol. Cell. Proteomics 13, 2765-2775 | 10.1074/mcp.O113.036681 | verified |
| Hoffmann2019 | Hoffmann N. et al. (2019) mzTab-M: a data standard for sharing quantitative results in mass spectrometry metabolomics. Anal. Chem. 91, 3302-3310 | 10.1021/acs.analchem.8b04310 | verified |
| Lampen1994 | Lampen P. et al. (1994) JCAMP-DX for mass spectrometry. Appl. Spectrosc. 48, 1545-1552 | 10.1366/0003702944027840 | verified |
| McDonald1988 | McDonald R.S., Wilks P.A. (1988) JCAMP-DX: a standard form for exchange of infrared spectra in computer readable form. Appl. Spectrosc. 42, 151-162 | 10.1366/0003702884428734 | verified |
| ASTM-E2077 | ASTM E2077, Standard specification for analytical data interchange protocol for mass spectrometric data (ANDI-MS / netCDF) | none | to verify (number, title, current version) |
| Chambers2012 | Chambers M.C. et al. (2012) A cross-platform toolkit for mass spectrometry and proteomics (ProteoWizard). Nat. Biotechnol. 30, 918-920 | 10.1038/nbt.2377 | verified |
| Kessner2008 | Kessner D. et al. (2008) ProteoWizard: open source software for rapid proteomics tools development. Bioinformatics 24, 2534-2536 | 10.1093/bioinformatics/btn323 | verified |
| Hulstaert2020 | Hulstaert N. et al. (2020; online 2019) ThermoRawFileParser: modular, scalable, and cross-platform RAW file conversion. J. Proteome Res. 19, 537-542 | 10.1021/acs.jproteome.9b00328 | verified |
| PSI-MS-CV | HUPO-PSI, psi-ms.obo controlled vocabulary, github.com/HUPO-PSI/psi-ms-CV | none | verified (accessions listed in ch. 23, read 2026-10-31) |
| SteinScott1994 | Stein S.E., Scott D.R. (1994) Optimization and testing of mass spectral library search algorithms for compound identification. J. Am. Soc. Mass Spectrom. 5, 859-866 | 10.1016/1044-0305(94)87009-8 | verified |
| Stein1995 | Stein S.E. (1995) Chemical substructure identification by mass spectral library searching. J. Am. Soc. Mass Spectrom. 6, 644-655 | 10.1016/1044-0305(95)00291-K | verified (Crossref lists two DOIs for it; use this one) |
| Watrous2012 | Watrous J. et al. (2012) Mass spectral molecular networking of living microbial colonies. PNAS 109, E1743-E1752 | 10.1073/pnas.1203689109 | verified (pages to verify) |
| Bittremieux2022 | Bittremieux W. et al. (2022) Comparison of cosine, modified cosine, and neutral loss based spectrum alignment for discovery of structurally related molecules. J. Am. Soc. Mass Spectrom. 33, 1733-1744 | 10.1021/jasms.2c00153 | verified |
| Li2021 | Li Y. et al. (2021) Spectral entropy outperforms MS/MS dot product similarity for small-molecule compound identification. Nat. Methods 18, 1524-1531 | 10.1038/s41592-021-01331-z | verified |
| SpectralEntropyCode | Li Y., SpectralEntropy reference code, github.com/YuanyueLi/SpectralEntropy, `spectral_entropy/math_distance.py` | none | verified (read 2026-10-31) |
| Horai2010 | Horai H. et al. (2010) MassBank: a public repository for sharing mass spectral data for life sciences. J. Mass Spectrom. 45, 703-714 | 10.1002/jms.1777 | verified |
| Wang2016 | Wang M. et al. (2016) Sharing and community curation of mass spectrometry data with GNPS. Nat. Biotechnol. 34, 828-837 | 10.1038/nbt.3597 | verified |
| Vinaixa2016 | Vinaixa M. et al. (2016) Mass spectral databases for LC/MS- and GC/MS-based metabolomics: state of the field and future prospects. TrAC 78, 23-35 | 10.1016/j.trac.2015.09.005 | verified |
| Kind2018 | Kind T. et al. (2018; online 2017) Identification of small molecules using accurate mass MS/MS search. Mass Spectrom. Rev. 37, 513-532 | 10.1002/mas.21535 | verified |
| EliasGygi2007 | Elias J.E., Gygi S.P. (2007) Target-decoy search strategy for increased confidence in large-scale protein identifications by mass spectrometry. Nat. Methods 4, 207-214 | 10.1038/nmeth1019 | verified |
| Scheubert2017 | Scheubert K. et al. (2017) Significance estimation for large scale metabolomics annotations by spectral matching. Nat. Commun. 8, 1494 | 10.1038/s41467-017-01318-5 | verified (article number to verify) |
| BenjaminiHochberg1995 | Benjamini Y., Hochberg Y. (1995) Controlling the false discovery rate. J. R. Stat. Soc. B 57, 289-300 | 10.1111/j.2517-6161.1995.tb02031.x | verified |
| KindFiehn2007 | Kind T., Fiehn O. (2007) Seven Golden Rules for heuristic filtering of molecular formulas obtained by accurate mass spectrometry. BMC Bioinformatics 8, 105 | 10.1186/1471-2105-8-105 | verified |
| Wolf2010 | Wolf S. et al. (2010) In silico fragmentation for computer assisted identification of metabolite mass spectra (MetFrag). BMC Bioinformatics 11, 148 | 10.1186/1471-2105-11-148 | verified |
| Ruttkies2016 | Ruttkies C. et al. (2016) MetFrag relaunched. J. Cheminform. 8, 3 | 10.1186/s13321-016-0115-9 | verified |
| Allen2014 | Allen F. et al. (2014) CFM-ID: a web server for annotation, spectrum prediction and metabolite identification from tandem mass spectra. Nucleic Acids Res. 42, W94-W99 | 10.1093/nar/gku436 | verified |
| Allen2015 | Allen F. et al. (2015; online 2014) Competitive fragmentation modeling of ESI-MS/MS spectra for putative metabolite identification. Metabolomics 11, 98-110 | 10.1007/s11306-014-0676-4 | verified |
| Duhrkop2015 | Dührkop K. et al. (2015) Searching molecular structure databases with tandem mass spectra using CSI:FingerID. PNAS 112, 12580-12585 | 10.1073/pnas.1509788112 | verified |
| Duhrkop2019 | Dührkop K. et al. (2019) SIRIUS 4: a rapid tool for turning tandem mass spectra into metabolite structure information. Nat. Methods 16, 299-302 | 10.1038/s41592-019-0344-8 | verified |
| Duhrkop2021 | Dührkop K. et al. (2021; online 2020) Systematic classification of unknown metabolites using high-resolution fragmentation mass spectra (CANOPUS). Nat. Biotechnol. 39, 462-471 | 10.1038/s41587-020-0740-8 | verified (optional) |
| Brenton2010 | Brenton A.G., Godfrey A.R. (2010) Accurate mass measurement: terminology and treatment of data. J. Am. Soc. Mass Spectrom. 21, 1821-1835 | 10.1016/j.jasms.2010.06.006 | verified |
| Murray2013 | Murray K.K. et al. (2013) Definitions of terms relating to mass spectrometry (IUPAC Recommendations 2013). Pure Appl. Chem. 85, 1515-1609 | 10.1351/PAC-REC-06-04-06 | verified |
| WileyMcLaren1955 | Wiley W.C., McLaren I.H. (1955) Time-of-flight mass spectrometer with improved resolution. Rev. Sci. Instrum. 26, 1150-1157 | 10.1063/1.1715212 | verified |
| ComisarowMarshall1974 | Comisarow M.B., Marshall A.G. (1974) Fourier transform ion cyclotron resonance spectroscopy. Chem. Phys. Lett. 25, 282-283 | 10.1016/0009-2614(74)89137-2 | verified |
| Makarov2000 | Makarov A. (2000) Electrostatic axially harmonic orbital trapping: a high-performance technique of mass analysis. Anal. Chem. 72, 1156-1162 | 10.1021/ac991131p | verified |
| HitesBiemann1970 | Hites R.A., Biemann K. (1970) Computer evaluation of continuously scanned mass spectra of gas chromatographic effluents. Anal. Chem. 42, 855-860 | 10.1021/ac60290a009 | verified |
| Hertz1971 | Hertz H.S., Hites R.A., Biemann K. (1971) Identification of mass spectra by computer-searching a file of known spectra. Anal. Chem. 43, 681-691 | 10.1021/ac60301a009 | verified (co-authors from the title search; check the author list on the publisher page) |
| McLafferty1974 | McLafferty F.W. et al. (1974) Probability based matching of mass spectra. Rapid identification of specific compounds in mixtures. Org. Mass Spectrom. 9, 690-702 | 10.1002/oms.1210090710 | verified |
| Stein2012 | Stein S. (2012) Mass spectral reference libraries: an ever-expanding resource for chemical identification. Anal. Chem. 84, 7274-7282 | 10.1021/ac301205z | verified |
| Deutsch2008 | Deutsch E. (2008) mzML: a single, unifying data format for mass spectrometer output. Proteomics 8, 2776-2777 | 10.1002/pmic.200890049 | verified |
| Tsugawa2020 | Tsugawa H. et al. (2020) A lipidome atlas in MS-DIAL 4. Nat. Biotechnol. 38, 1159-1163 | 10.1038/s41587-020-0531-2 | verified |
| Aron2020 | Aron A.T. et al. (2020) Reproducible molecular networking of untargeted mass spectrometry data using GNPS. Nat. Protoc. 15, 1954-1991 | 10.1038/s41596-020-0317-5 | verified |
| Wang2021 | Wang F. et al. (2021) CFM-ID 4.0: more accurate ESI-MS/MS spectral prediction and compound identification. Anal. Chem. 93, 11692-11700 | 10.1021/acs.analchem.1c01465 | verified |
| Ludwig2020 | Ludwig M. et al. (2020) Database-independent molecular formula annotation using Gibbs sampling through ZODIAC. Nat. Mach. Intell. 2, 629-641 | 10.1038/s42256-020-00234-6 | verified |
| Creek2014 | Creek D.J. et al. (2014) Metabolite identification: are you sure? And how do your peers gauge your confidence? Metabolomics 10, 350-353 | 10.1007/s11306-014-0656-8 | verified |
| Sumner2014 | Sumner L.W. et al. (2014) Proposed quantitative and alphanumeric metabolite identification metrics. Metabolomics 10, 1047-1049 | 10.1007/s11306-014-0739-6 | verified |
| Schymanski2015 | Schymanski E.L. et al. (2015) Non-target screening with high-resolution mass spectrometry: critical review using a collaborative trial on water analysis. Anal. Bioanal. Chem. 407, 6237-6255 | 10.1007/s00216-015-8681-7 | verified |
| Alseekh2021 | Alseekh S. et al. (2021) Mass spectrometry-based metabolomics: a guide for annotation, quantification and best reporting practices. Nat. Methods 18, 747-756 | 10.1038/s41592-021-01197-1 | verified |
| Hollender2023 | Hollender J. et al. (2023) NORMAN guidance on suspect and non-target screening in environmental monitoring. Environ. Sci. Eur. 35, 75 | 10.1186/s12302-023-00779-4 | verified (article number 75 to verify) |
| Blazenovic2018 | Blaženović I. et al. (2018) Software tools and approaches for compound identification of LC-MS/MS data in metabolomics. Metabolites 8, 31 | 10.3390/metabo8020031 | verified |
| Gross2017 | Gross J.H. (2017) Mass Spectrometry: A Textbook, 3rd ed., Springer | 10.1007/978-3-319-54398-7 | verified (DOI and year; edition number not in Crossref, already cited as 3rd ed. in ch. 19) |
| Winkler2020 | Winkler R. (ed.) (2020) Processing Metabolomics and Proteomics Data with Open Software. Royal Society of Chemistry (New Developments in Mass Spectrometry) | 10.1039/9781788019880 | verified (editor from Crossref) |
| deHoffmann2007 | de Hoffmann E., Stroobant V. (2007) Mass Spectrometry: Principles and Applications, 3rd ed., Wiley (ISBN 978-0-470-03310-4) | none | to verify (ISBN lookup failed; already in ch. 19 bibliography) |
| McLaffertyTurecek1993 | McLafferty F.W., Tureček F. (1993) Interpretation of Mass Spectra, 4th ed., University Science Books | none | to verify (no DOI; already in ch. 19 bibliography) |
| xcms-src | xcms R package source, `R/functions-Params.R` (CentWaveParam, MatchedFilterParam, PeakDensityParam defaults), github.com/sneumann/xcms, devel | none | verified (read 2026-10-31; defaults may change between versions: cite "versione corrente al 2026") |
| NIST-MSSearch | NIST Mass Spectral Search Program manual (match factor, reverse match factor, probability) | none | to verify (official NIST page) |
| GNPS-docs | GNPS documentation, molecular networking parameters | none | to verify |
| MassBank-licences | massbank.eu record licences | none | to verify |

### 7.1 Literature per chapter (author-year in the text, full entry in "Per approfondire", merged in ch. 19)

Only `verified` keys. "Contributes" says what the DEV writes about each source (paraphrase, never copy).

| Ch. | Keys | Contributes |
|---|---|---|
| 22 | Gross2017; Murray2013; Brenton2010; WileyMcLaren1955; ComisarowMarshall1974; Makarov2000; Kind2018 | textbook basis; IUPAC terms (resolution, accuracy); ppm/mDa conventions and treatment of mass errors; history of TOF, FT-ICR and Orbitrap detection |
| 23 | Pedrioli2004; Deutsch2008; Martens2011; Teleman2014; Griss2014; Hoffmann2019; McDonald1988; Lampen1994; Kessner2008; Chambers2012; Hulstaert2020; PSI-MS-CV | open formats and their genealogy (mzXML -> mzML), compression, results formats, JCAMP-DX origin and MS extension, conversion tools |
| 24 | HitesBiemann1970; Smith2006; Tautenhahn2008; Myers2017 | computer evaluation of continuously scanned GC-MS data (history), binning vs ROI, comparison of chromatogram builders |
| 25 | SavitzkyGolay1964; Smith2006; Du2006; Tautenhahn2008; Stein1999; Zhang2014; Myers2017; Pluskal2010; Schmid2023; Rost2016; Tsugawa2015 | smoothing, matched filter, CWT, centWave, AMDIS deconvolution, peak quality, the open software families |
| 26 | Kuhl2012; Broeckling2014 | annotation of isotopes/adducts and feature clustering |
| 27 | SakoeChiba1978; Cleveland1979; Prince2006; Smith2006; Lange2008; Dieterle2006; Dunn2011; Broadhurst2018 | DTW (from speech recognition), LOWESS, OBI-Warp, peak-group alignment, comparison of aligners, PQN, QC-based correction, QC guidelines |
| 28 | Hertz1971; McLafferty1974; SteinScott1994; Watrous2012; Bittremieux2022; Li2021 | first computer library search, probability-based matching, optimisation of the dot product, modified cosine, comparison of alignment scores, spectral entropy |
| 29 | Hertz1971; McLafferty1974; Stein1995; Stein2012; Horai2010; Wang2016; Aron2020; Tsugawa2015; Tsugawa2020; Vinaixa2016; Kind2018; EliasGygi2007; Scheubert2017; BenjaminiHochberg1995 | EI library search history, substructure information, reference libraries today, MassBank, GNPS and molecular networking protocol, MS-DIAL libraries, database review, target-decoy, FDR in metabolomics |
| 30 | KindFiehn2007; Wolf2010; Ruttkies2016; Allen2014; Allen2015; Wang2021; Duhrkop2015; Duhrkop2019; Ludwig2020; Duhrkop2021; Blazenovic2018 | formula rules, MetFrag, CFM-ID (1 to 4), CSI:FingerID, SIRIUS 4, ZODIAC, CANOPUS, overview of tools |
| 31 | Sumner2007; Schymanski2014; Creek2014; Sumner2014; Schymanski2015; Charbonnet2022; Alseekh2021; Hollender2017; Hollender2023 | MSI levels, Schymanski levels, debate and later proposals, PFAS extension, reporting practices, NTS guidance |
| 32 | Hollender2017; Hollender2023; Schymanski2015; Helmus2021; Winkler2020; Pluskal2010; Schmid2023; Tsugawa2015; Rost2016 | the full NTS workflow and open software as examples (no tutorial) |

Textbooks (bibliography "Manuali" already lists Gross, de Hoffmann & Stroobant, McLafferty & Tureček; ch. 22 and 32
cite Gross2017 and Winkler2020; the two without DOI stay as they are in ch. 19 and are not re-cited in part VII until
verified).

Committed machine-readable list: `docs/piani/riferimenti-chemioinformatica.tsv` (key, DOI, status, chapters,
citation). It is the source for the DOI integrity test; a DEV adding a reference adds a row with status
`verified` only after resolving the DOI on Crossref/doi.org and matching authors, year, title, journal, pages.

---------------------------------------------------------------------------------------------------------------------

## 8. Technical budget
- No third-party requests, no CDN, no fonts beyond the existing ones, no `fetch`, works from `file://`.
- `assets/chemi-common.js` <= 4 KB gzip; each `assets/sim-chemi-*.js` <= 15 KB gzip (test in DEV-00:
  `tests/test_chemi.py::test_gzip_budget`, level-9 gzip of the file bytes). Never raise these numbers to get green.
- Chapter HTML <= 40 KB raw each (largest existing chapter 10 is 25.8 KB; test). If the repo-wide page budget test
  (queue item 3) lands first, it governs and these limits must not exceed it.
- Lazy loading: no `sim-chemi-*.js` request at page load (e2e test watches requests), loaded when its figure comes
  within 600 px; figures initialise in < 100 ms on a mid laptop (no heavy loops; formula enumeration bounded).
- Service worker (future): figure files are static assets with stable names; if the SW uses a precache list, DEV-07
  adds the chemi files to it (coordinate through the COO).

---------------------------------------------------------------------------------------------------------------------

## 9. Dependencies, order and shared files

Prerequisite: PR #10 (DEV8, navigation) merged. Nothing of part VII starts before.

| Prompt | Depends on | Shared files touched | Own files (disjoint) |
|---|---|---|---|
| DEV-00 skeleton | #10 merged | `assets/teoria.js` (CHAPTERS rows 22-32 only), `index.html` (part VII cards), `capitoli/19-glossario.html` (stubs), `assets/glossario-dati.js` + `assets/indice-ricerca.js` (regenerated), `docs/COME-MODIFICARE.md`, `tests/test_numerazione.py` (count 21 -> 32), `tests_e2e/` (new file), `docs/piani/riferimenti-chemioinformatica.tsv` (append `preexisting` DOIs) | `assets/chemi-common.js`, `capitoli/22..32-*.html`, `capitoli/src/22..32-*.md`, `tests/test_chemi.py`, `tests/chemi_common_node.mjs`, `tests_e2e/e2e_chemi.py` |
| DEV-01 ch 22-23 | DEV-00 | `assets/indice-ricerca.js` (regenerate only) | `capitoli/22-segnale.*`, `capitoli/23-formati.*`, `assets/sim-chemi-segnale.js`, `assets/sim-chemi-formati.js` |
| DEV-02 ch 24-25 | DEV-00 | idem | `capitoli/24-tracce.*`, `capitoli/25-picchi.*`, `assets/sim-chemi-tracce.js`, `assets/sim-chemi-picchi.js` |
| DEV-03 ch 26-27 | DEV-00 | idem | `capitoli/26-gruppi.*`, `capitoli/27-tabella.*`, `assets/sim-chemi-gruppi.js`, `assets/sim-chemi-tabella.js`, `assets/sim-chemi-esplora.js` |
| DEV-04 ch 28-29 | DEV-00 | idem | `capitoli/28-somiglianza.*`, `capitoli/29-librerie.*`, `assets/sim-chemi-somiglianza.js`, `assets/sim-chemi-librerie.js` |
| DEV-05 ch 30-31 | DEV-00 | idem | `capitoli/30-candidati.*`, `capitoli/31-confidenza.*`, `assets/sim-chemi-candidati.js`, `assets/sim-chemi-confidenza.js` |
| DEV-06 ch 32 | DEV-01..05 | idem (+ `LICENZE-TERZI.md` only if a MassBank record is used) | `capitoli/32-esempio.*`, `assets/sim-chemi-esempio.js`, `docs/provenance/chemi-esempio.md` (optional) |
| DEV-07 glossary, formulary, bibliography, search, cross-links | DEV-06 | `docs/piani/riferimenti-chemioinformatica.tsv` (chapters column), `capitoli/19-glossario.html` (+ bibliography section), `capitoli/20-formulario.html`, `assets/glossario-dati.js`, `assets/indice-ricerca.js`, one sentence in chapters 3, 9, 10, 11, 17, 18 (+ their `src/*.md`), `index.html` (card texts), `docs/COME-MODIFICARE.md` | none new |
| DEV-08 ARCH review | DEV-07 | none (docs-only) | `docs/piani/revisione-chemioinformatica.md` |

- DEV-01..05 run in parallel. Their only common file is the generated `assets/indice-ricerca.js`
  (`tests/test_indice_teoria.py::test_index_is_fresh` requires it fresh): on a conflict, merge `main` and re-run
  `python3 tools/genera_indice_teoria.py`; never hand-merge it. The COO merges them one at a time.
- Registration of a figure = the `data-sim` attribute in the DEV's own chapter; no registry file, no edit of
  `chemi-common.js` (it belongs to DEV-00; a needed helper goes in the DEV's own file, or is requested from the COO).
- The preset hook (`init(el, preset)`, `CHEMI.preset(name)`) is part of the DEV-00 contract so DEV-06 needs no edit of
  other files.

---------------------------------------------------------------------------------------------------------------------

## 10. Open scientific doubts (resolve before or during DEV-08; never written into pages as doubts)
1. centWave details: exact noise estimate, ridge-line rules, how `snthresh` is computed (Tautenhahn 2008 + xcms code).
2. Modified cosine: exact pair-selection rule and intensity/m/z powers used by GNPS vs matchms (Watrous 2012,
   Bittremieux 2022).
3. Weighted cosine exponents (Stein & Scott 1994; MassBank/NIST implementations).
4. Spectral entropy weighting: code `w = 0.25 + 0.25 S` for `S < 3` vs the code's own docstring
   (`0.25 + 0.5 S`, `S < 1.5`): check Li 2021 Methods.
5. Schymanski 2014 level wording and minimum data per level (read the paper's figure); MSI level 1 wording.
6. CAMERA groupFWHM default and correlation thresholds.
7. NIST MS Search match factor / reverse match factor definitions and composite score.
8. GNPS molecular networking default parameters.
9. mzML byte order statement and mzXML byte order; ASTM E2077 number.
10. Centroid precision ~ FWHM / (2.355 sqrt(N)): source for the statistical bound.
11. Licences of MassBank records, GNPS libraries, MoNA (current terms).

---------------------------------------------------------------------------------------------------------------------

## 11. Glossary and formulary content (DEV-00 stubs, DEV-07 full)

Glossary terms (Italian headword; check `capitoli/19-glossario.html` first: existing entries such as "Accuratezza di
massa / errore in ppm", "Addotto", "Centroide", "XIC", "DDA", "DIA" are extended with a chapter link, not duplicated):
feature; tabella delle feature; traccia di massa / ROI; centWave; trasformata wavelet continua (CWT); filtro adattato;
Savitzky-Golay; rapporto segnale/rumore (S/N); fattore di asimmetria; deconvoluzione; isotopologo; frammento in
sorgente; allineamento dei tempi di ritenzione; LOWESS; deformazione temporale dinamica (DTW); corrispondenza fra
campioni; riempimento dei buchi (gap filling); bianco di processo; QC pooled; RSD; normalizzazione PQN; mzML; mzXML;
MGF; MSP; mzTab-M; vocabolario controllato (CV, cvParam); base64; compressione zlib; MS-Numpress; lock mass; TDC; ADC;
purezza del precursore; spettro chimerico; similarità del coseno; coseno pesato; coseno modificato; entropia
spettrale; ricerca inversa; match factor; libreria spettrale; spettro decoy; FDR; q-value; rete molecolare;
frammentazione in silico; impronta molecolare (fingerprint); livello di confidenza (Schymanski); livelli MSI.

Formulary, new section "6. Chemioinformatica (capitoli 22-32)": ppm error; XIC window; FWHM = m/R; 3-point parabolic
vertex; centroid of area; Poisson sigma = sqrt(N); 13C spacing 1.003355/z; Gaussian area h sigma sqrt(2 pi); As and Tf;
LOWESS tricube weight; DTW recursion; cosine; weighted cosine; spectral entropy and entropy similarity; FDR and q-value;
RSD; fold change vs blank; PQN; RDB (link ch. 11).

---------------------------------------------------------------------------------------------------------------------

## 12. "Un po' di storia" boxes (outline + sources; 5-8 Italian lines each, author-year citations)

Rule: only what the cited source itself establishes (its year, its title, what it introduced as stated in its
abstract). Items marked `to verify against source` may be written only after the DEV has read the paper and agrees;
otherwise they are left out. No anecdotes, no "first ever" claims without a source.

| Ch. | Outline | Sources |
|---|---|---|
| 22 | From scanning instruments to digital transients: the improved-resolution TOF of 1955; Fourier-transform detection in ion cyclotron resonance in 1974; the Orbitrap in 2000; terminology fixed by IUPAC in 2013 | WileyMcLaren1955, ComisarowMarshall1974, Makarov2000, Murray2013 |
| 23 | From proprietary files to open formats: mzXML (2004), the merge into mzML announced 2008 and published 2011, numerical compression (2014), results formats mzTab (2014) and mzTab-M (2019); JCAMP-DX born for IR (1988) and extended to MS (1994) | Pedrioli2004, Deutsch2008, Martens2011, Teleman2014, Griss2014, Hoffmann2019, McDonald1988, Lampen1994 |
| 24 | Computers reading continuously scanned GC-MS spectra in 1970 (reconstructed ion chromatograms: `to verify against source`), up to fixed bins (XCMS 2006) and ROIs for high resolution (2008) | HitesBiemann1970, Smith2006, Tautenhahn2008 |
| 25 | Least-squares smoothing (1964), matched filtration in XCMS (2006), wavelets for MS peaks (2006) and for LC-MS (2008), deconvolution of GC-MS data (AMDIS, 1999), the open platforms MZmine 2 (2010), OpenMS (2016), MS-DIAL (2015), MZmine 3 (2023) | SavitzkyGolay1964, Smith2006, Du2006, Tautenhahn2008, Stein1999, Pluskal2010, Rost2016, Tsugawa2015, Schmid2023 |
| 26 | From manual inspection of isotope clusters to automatic annotation (CAMERA, 2012) and clustering of features (RAMClust, 2014) | Kuhl2012, Broeckling2014 |
| 27 | Dynamic time warping comes from speech recognition (1978); robust local regression (1979); applied to LC-MS alignment by OBI-Warp and XCMS (2006); comparison of aligners (2008); QC-based correction in large studies (2011) | SakoeChiba1978, Cleveland1979, Prince2006, Smith2006, Lange2008, Dunn2011 |
| 28 | Computer search of a file of known spectra (1971), probability-based matching (1974), optimisation of the dot product (1994), modified cosine with molecular networking (2012), spectral entropy (2021) | Hertz1971, McLafferty1974, SteinScott1994, Watrous2012, Li2021 |
| 29 | Reference libraries from EI collections to MS/MS (review 2012), the public MassBank (2010) and GNPS (2016), protocols for reproducible networking (2020), decoys borrowed from proteomics (2007) and adapted to small molecules (2017) | Stein2012, Horai2010, Wang2016, Aron2020, EliasGygi2007, Scheubert2017 |
| 30 | Heuristic formula rules (2007), MetFrag (2010, relaunched 2016), CFM-ID (2014 -> 4.0 in 2021), CSI:FingerID (2015), SIRIUS 4 (2019), ZODIAC (2020), CANOPUS (2021) | KindFiehn2007, Wolf2010, Ruttkies2016, Allen2014, Wang2021, Duhrkop2015, Duhrkop2019, Ludwig2020, Duhrkop2021 |
| 31 | MSI minimum reporting levels (2007), the debate of 2014 (Creek; Sumner's metrics proposal), Schymanski levels (2014) tested in a collaborative trial (2015), extensions for PFAS (2022) and reporting guides (2021, NORMAN 2023) | Sumner2007, Creek2014, Sumner2014, Schymanski2014, Schymanski2015, Charbonnet2022, Alseekh2021, Hollender2023 |
| 32 | The idea of "non-target screening" as a workflow: readiness review (2017) and guidance (2023); open platforms as examples | Hollender2017, Hollender2023, Helmus2021 |
