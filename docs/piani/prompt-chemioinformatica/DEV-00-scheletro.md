# DEV-CHEMI-00 - chemioinformatica, skeleton of part VII

Paste this whole file as the first message of a new Claude Code session on `Freeesta/BasePeak`.
Design source: `docs/piani/chemioinformatica.md` (read it; this prompt repeats what you need).

## 0. Confirm
First reply to the COO session only: "DEV-CHEMI-00 started - branch `dev/chemi-scheletro`". Then work autonomously.

## 1. Role
You are **DEV-CHEMI-00** (DEV, Sonnet). You write the skeleton of part VII: chapter pages 22-32 with their outline, the CHAPTERS rows, index cards, glossary stubs, the shared module `assets/chemi-common.js` with lazy loading, and the tests every later prompt relies on. You do NOT merge, do NOT decide architecture (if the design is
wrong or impossible, stop and report to the COO with the reason), do NOT touch files outside your scope, do NOT talk
to Federico.

## 2. Scope
- Touches: `assets/teoria.js` (only 11 new CHAPTERS rows after row 21), `index.html` (new h3 "VII. Chemioinformatica" with 11 cards; fix the sentence that counts the parts), `capitoli/22..32-*.html` + `capitoli/src/22..32-*.md` (new), `assets/chemi-common.js` (new), `capitoli/19-glossario.html` (stub entries), regenerated `assets/glossario-dati.js` and `assets/indice-ricerca.js`, `docs/COME-MODIFICARE.md` (rows for part VII and a short "Figure caricate al bisogno" section), `tests/test_numerazione.py` (only the literal 21 -> 32), new `tests/test_chemi.py`, new `tests/chemi_common_node.mjs`, new `tests_e2e/e2e_chemi.py`, `docs/piani/riferimenti-chemioinformatica.tsv` (append `preexisting` rows only).
- Does not touch: navigation code in `assets/teoria.js` and `assets/teoria.css` (DEV8's), other chapters, existing `sim-*.js`, `pratica/`, `tools/` (except running them), `tools/teoria_base.json`, `.github/`.
- Neighbouring chats: DEV8 (PR #10, navigation) must be merged first; after you, DEV-CHEMI-01..05 work in parallel on the chapter files you create.
- Branch: `dev/chemi-scheletro` from the latest `origin/main`.

## 3. Context to read (only these)
- `docs/COORDINAMENTO.md`, `docs/COME-MODIFICARE.md`, `docs/piani/chemioinformatica.md` (all of it: you implement
  sections 1, 3.2, 3.3, 8, 9, 11).
- `assets/teoria.js` (CHAPTERS, `groupOf()` from DEV8, `slug()`, the `TP` helpers), `tools/nuovo_capitolo.py`
  (it writes `data-esteso`, `noindex` and a draft comment: remove them, part VII is public), `capitoli/11-formula.html`
  and `capitoli/src/11-formula.md` (page and twin model), `tests/test_numerazione.py`, `tests/test_integrita_sito.py`,
  `tests/test_indice_teoria.py`, `tools/controlla_teoria.py`, `tests_e2e/lib.py`, `tests_e2e/e2e_a11y_pratica.py`
  (axe/keyboard pattern to copy), `tests_e2e/run_all.py`.
- Known traps: `test_numerazione.py` asserts `len(rows) == 21` (update the literal to 32, nothing else); the rows must
  be appended after row 21 so array order stays 1..32; DEV8's `groupOf()` puts any non-pratica row whose part is not
  "Reference" in "Teoria": check prev/next around chapters 18, 19-21 and 22 in the browser and report what you see
  (do not change navigation code); `controlla_teoria.py` rejects `TODO`, `???`, "da verificare"; the search index and
  the glossary data are generated files.

## 4. Work, in order (one PR)
1. `git fetch origin main && git checkout -b dev/chemi-scheletro origin/main`; check DEV8 is merged
   (`grep -c groupOf assets/teoria.js` -> >= 1). If not, stop and report.
2. `assets/chemi-common.js`: implement the API of design section 3.2 exactly (`rng`, `normal`, `poisson`, `gauss`,
   `emg`, `chrom`, `profile`, `ppm`, `table`, `register`, `preset`, `fmtIt`, `fn` namespace for pure functions) and the
   lazy loader (IntersectionObserver, rootMargin "600px 0px", one script per URL in document order, `init(el, preset)`
   for each registered id on the page, `data-ready="1"`, immediate load without IntersectionObserver). Header comment
   in English explaining the contract. <= 4 KB gzip. It must also run in node for tests (guard `window`/`document`).
3. Chapters 22-32: files and titles of design section 1.2, created from the template of `capitoli/11-formula.html`
   (head with theme snippet and icons, `kicker` "Capitolo N", h1, a `p.lead` of 1-2 Italian sentences saying what the
   chapter will teach, a `div.box key` "Capitolo in costruzione" with one sentence, all h2/h3 of the outline with one
   short Italian sentence each (no placeholders like TODO), one `<details class="q storia"><summary>Un po' di
   storia</summary>` with one sentence, the `.sim` divs of design section 5 with `data-sim`,
   `h4` "Figura N.x Titolo" and a `p.nota` describing the figure; scripts at the end: `tema.js` is in the head as in
   the model, then `appname.js`, (`masse.js` for 30 and 32), `teoria.js`, `chemi-common.js`. The `data-sim` targets do
   not exist yet: create each `assets/sim-chemi-*.js` of design section 5 as a 3-line stub that only registers nothing
   and carries a header comment "owned by DEV-CHEMI-0n" (so the link test is green and ownership is explicit).
   Markdown twins in `capitoli/src/` with `{kicker: Capitolo N}`.
4. `assets/teoria.js`: 11 rows `["capitoli/22-segnale.html", "22", "Segnale, profilo e centroide", "VII. Chemioinformatica"],` ...
   (menu titles from design section 1.2). `index.html`: h3 "VII. Chemioinformatica" with 11 cards (one Italian line
   each). `capitoli/19-glossario.html`: stub entries for the new terms of design section 11 that do not exist yet
   (`dt` with id `g-...`, `dd` with one plain Italian sentence + link to the chapter); then
   `python3 tools/genera_glossario.py` and `python3 tools/genera_indice_teoria.py`.
5. `tests/test_chemi.py` (pytest, no network): rows 22-32 in CHAPTERS with part "VII. Chemioinformatica" and files +
   twins present; each chapter loads `chemi-common.js` after `teoria.js` and has no `<script src` to `sim-chemi-`;
   every `data-sim` points to an existing `assets/sim-chemi-*.js`; every figure id is unique and starts with
   `sim-chemi-`; gzip -9 size: `chemi-common.js` <= 4096 bytes, each `sim-chemi-*.js` <= 15360 bytes; each chapter
   HTML <= 40960 bytes; no `http://`/`https://` in `chemi-common.js` and `sim-chemi-*.js`; words per h2 section <= 350
   and per paragraph <= 90 in chapters 22-32; no `fotocatal|TiO|prodotti di trasformazione` in chapters 22-32;
   every `href="...#anchor"` in chapters 22-32 (and links into them) resolves with a Python port of `slug()` or an
   explicit id; node test `tests/chemi_common_node.mjs` (run from pytest if node exists, fail if missing in CI):
   same seed -> same sequence, `gauss` peak = 1, `ppm(100.001, 100)` = 10, `chrom` deterministic.
   DOI integrity (`-k doi`): collect every `doi.org/10.` link in all published pages (`index.html`, `capitoli/`,
   `pratica/`); each must be a row of `docs/piani/riferimenti-chemioinformatica.tsv`; in chapters 22-32 and in the
   chemioinformatics section of the ch. 19 bibliography the row status must be `verified`; append the DOIs already
   present in other pages as rows with status `preexisting` and an empty citation (no network in tests: the TSV is
   the committed truth); no DOI may appear twice in the ch. 19 bibliography. Each chapter 22-32 has exactly one
   `details.q.storia`.
   `tests/test_numerazione.py`: 21 -> 32.
6. `tests_e2e/e2e_chemi.py` (Playwright, pattern of `e2e_a11y_pratica.py`): for each chapter 22-32, light and dark:
   axe serious/critical = 0, accessible names, Tab reaches controls with visible focus; record requests: no
   `sim-chemi-` request before scrolling; after `scrollIntoView` of each `.sim[data-sim]`, `data-ready="1"` within
   3 s (with the stubs: the loader must still set it even if nothing registered, so the test is meaningful now); with
   `emulate_media(reduced_motion="reduce")` no running `requestAnimationFrame` loop after 1 s (count rAF calls).
7. `docs/COME-MODIFICARE.md`: part VII rows (files 22-32, figure files and owners) and a short section on lazy figures
   (`data-sim`, `CHEMI.register`). Italian, as the rest of that file.
8. Run the acceptance commands below, check pages by eye (light/dark/390 px/reduced motion), commit, push
   `git push -u origin dev/chemi-scheletro`, open the PR ready, wait for `ci` green.

### Acceptance (all must hold)
- `python3 -m pytest -q tests` -> all passed; `python3 tools/controlla_teoria.py` -> exit 0, `git diff origin/main -- tools/teoria_base.json` -> empty.
- `python3 tests_e2e/run_all.py` -> all e2e scripts passed (including the new `e2e_chemi.py`).
- `git ls-files '*.js' '*.mjs' | xargs -n1 node --check` -> no error.
- `gzip -9c assets/chemi-common.js | wc -c` -> <= 4096.
- `grep -c '"VII. Chemioinformatica"' assets/teoria.js` -> 11; `ls capitoli/2[2-9]-*.html capitoli/3[0-2]-*.html | wc -l` -> 11.
- `git diff --name-only origin/main` -> only files listed in Scope (+ the 11 stub `assets/sim-chemi-*.js`).
- In the PR description: what prev/next shows around chapters 18-22 with DEV8's navigation (observation, no change).

## Outlines of all chapters (design section 4, pasted; use h2/h3 exactly, the rest guides the one-line summaries)
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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 22 | Gross2017; Murray2013; Brenton2010; WileyMcLaren1955; ComisarowMarshall1974; Makarov2000; Kind2018 | textbook basis; IUPAC terms (resolution, accuracy); ppm/mDa conventions and treatment of mass errors; history of TOF, FT-ICR and Orbitrap detection |

History box (design 12):
| 22 | From scanning instruments to digital transients: the improved-resolution TOF of 1955; Fourier-transform detection in ion cyclotron resonance in 1974; the Orbitrap in 2000; terminology fixed by IUPAC in 2013 | WileyMcLaren1955, ComisarowMarshall1974, Makarov2000, Murray2013 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 23 | Pedrioli2004; Deutsch2008; Martens2011; Teleman2014; Griss2014; Hoffmann2019; McDonald1988; Lampen1994; Kessner2008; Chambers2012; Hulstaert2020; PSI-MS-CV | open formats and their genealogy (mzXML -> mzML), compression, results formats, JCAMP-DX origin and MS extension, conversion tools |

History box (design 12):
| 23 | From proprietary files to open formats: mzXML (2004), the merge into mzML announced 2008 and published 2011, numerical compression (2014), results formats mzTab (2014) and mzTab-M (2019); JCAMP-DX born for IR (1988) and extended to MS (1994) | Pedrioli2004, Deutsch2008, Martens2011, Teleman2014, Griss2014, Hoffmann2019, McDonald1988, Lampen1994 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 24 | HitesBiemann1970; Smith2006; Tautenhahn2008; Myers2017 | computer evaluation of continuously scanned GC-MS data (history), binning vs ROI, comparison of chromatogram builders |

History box (design 12):
| 24 | Computers reading continuously scanned GC-MS spectra in 1970 (reconstructed ion chromatograms: `to verify against source`), up to fixed bins (XCMS 2006) and ROIs for high resolution (2008) | HitesBiemann1970, Smith2006, Tautenhahn2008 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 25 | SavitzkyGolay1964; Smith2006; Du2006; Tautenhahn2008; Stein1999; Zhang2014; Myers2017; Pluskal2010; Schmid2023; Rost2016; Tsugawa2015 | smoothing, matched filter, CWT, centWave, AMDIS deconvolution, peak quality, the open software families |

History box (design 12):
| 25 | Least-squares smoothing (1964), matched filtration in XCMS (2006), wavelets for MS peaks (2006) and for LC-MS (2008), deconvolution of GC-MS data (AMDIS, 1999), the open platforms MZmine 2 (2010), OpenMS (2016), MS-DIAL (2015), MZmine 3 (2023) | SavitzkyGolay1964, Smith2006, Du2006, Tautenhahn2008, Stein1999, Pluskal2010, Rost2016, Tsugawa2015, Schmid2023 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 26 | Kuhl2012; Broeckling2014 | annotation of isotopes/adducts and feature clustering |

History box (design 12):
| 26 | From manual inspection of isotope clusters to automatic annotation (CAMERA, 2012) and clustering of features (RAMClust, 2014) | Kuhl2012, Broeckling2014 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 27 | SakoeChiba1978; Cleveland1979; Prince2006; Smith2006; Lange2008; Dieterle2006; Dunn2011; Broadhurst2018 | DTW (from speech recognition), LOWESS, OBI-Warp, peak-group alignment, comparison of aligners, PQN, QC-based correction, QC guidelines |

History box (design 12):
| 27 | Dynamic time warping comes from speech recognition (1978); robust local regression (1979); applied to LC-MS alignment by OBI-Warp and XCMS (2006); comparison of aligners (2008); QC-based correction in large studies (2011) | SakoeChiba1978, Cleveland1979, Prince2006, Smith2006, Lange2008, Dunn2011 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 28 | Hertz1971; McLafferty1974; SteinScott1994; Watrous2012; Bittremieux2022; Li2021 | first computer library search, probability-based matching, optimisation of the dot product, modified cosine, comparison of alignment scores, spectral entropy |

History box (design 12):
| 28 | Computer search of a file of known spectra (1971), probability-based matching (1974), optimisation of the dot product (1994), modified cosine with molecular networking (2012), spectral entropy (2021) | Hertz1971, McLafferty1974, SteinScott1994, Watrous2012, Li2021 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 29 | Hertz1971; McLafferty1974; Stein1995; Stein2012; Horai2010; Wang2016; Aron2020; Tsugawa2015; Tsugawa2020; Vinaixa2016; Kind2018; EliasGygi2007; Scheubert2017; BenjaminiHochberg1995 | EI library search history, substructure information, reference libraries today, MassBank, GNPS and molecular networking protocol, MS-DIAL libraries, database review, target-decoy, FDR in metabolomics |

History box (design 12):
| 29 | Reference libraries from EI collections to MS/MS (review 2012), the public MassBank (2010) and GNPS (2016), protocols for reproducible networking (2020), decoys borrowed from proteomics (2007) and adapted to small molecules (2017) | Stein2012, Horai2010, Wang2016, Aron2020, EliasGygi2007, Scheubert2017 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 30 | KindFiehn2007; Wolf2010; Ruttkies2016; Allen2014; Allen2015; Wang2021; Duhrkop2015; Duhrkop2019; Ludwig2020; Duhrkop2021; Blazenovic2018 | formula rules, MetFrag, CFM-ID (1 to 4), CSI:FingerID, SIRIUS 4, ZODIAC, CANOPUS, overview of tools |

History box (design 12):
| 30 | Heuristic formula rules (2007), MetFrag (2010, relaunched 2016), CFM-ID (2014 -> 4.0 in 2021), CSI:FingerID (2015), SIRIUS 4 (2019), ZODIAC (2020), CANOPUS (2021) | KindFiehn2007, Wolf2010, Ruttkies2016, Allen2014, Wang2021, Duhrkop2015, Duhrkop2019, Ludwig2020, Duhrkop2021 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 31 | Sumner2007; Schymanski2014; Creek2014; Sumner2014; Schymanski2015; Charbonnet2022; Alseekh2021; Hollender2017; Hollender2023 | MSI levels, Schymanski levels, debate and later proposals, PFAS extension, reporting practices, NTS guidance |

History box (design 12):
| 31 | MSI minimum reporting levels (2007), the debate of 2014 (Creek; Sumner's metrics proposal), Schymanski levels (2014) tested in a collaborative trial (2015), extensions for PFAS (2022) and reporting guides (2021, NORMAN 2023) | Sumner2007, Creek2014, Sumner2014, Schymanski2014, Schymanski2015, Charbonnet2022, Alseekh2021, Hollender2023 |

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

Literature (design 7.1; keys -> full entries in section 7 and in `docs/piani/riferimenti-chemioinformatica.tsv`):
| 32 | Hollender2017; Hollender2023; Schymanski2015; Helmus2021; Winkler2020; Pluskal2010; Schmid2023; Tsugawa2015; Rost2016 | the full NTS workflow and open software as examples (no tutorial) |

History box (design 12):
| 32 | The idea of "non-target screening" as a workflow: readiness review (2017) and guidance (2023); open platforms as examples | Hollender2017, Hollender2023, Helmus2021 |

## 5. Report (to the COO session only, max 5 lines)
`PR #n - <40-char head SHA> - ci <status> - what remains`, plus open scientific doubts in one line. Never ask Federico.

## 6. Handoff
If your context passes ~200k tokens: put a handoff block (max 15 lines: state, next step, traps) in the PR
description, report to the COO, stop.

## Hard requirements (all of them, every commit)
- Repository `Freeesta/BasePeak` only. Never read, change or open PRs in any other repository (no mzLab repos).
- Code, comments, commits, PR text: English. Handbook files (`capitoli/*.html`, `capitoli/src/*.md`, `index.html`,
  figure labels, readouts, notes): Italian only.
- Dyslexia and a11y rules: left-aligned text (never justified); keep the theme's 60-75 ch line length and
  line-height >= 1.5 (do not override them in chapter HTML or figure code); contrast >= 7:1 for text and essential
  marks on cream, blue and high-contrast backgrounds and in dark mode (use the theme tokens); h1 > h2 > h3 without
  skipping levels; short paragraphs (<= 90 words), ~one screen per h2 (<= 350 words); no animation when
  `TP.reduced()` is true (no autoplay ever); everything usable with the keyboard (native controls, visible focus,
  targets >= 24x24 px); no colour-only encoding (dash, shape, words, ✓/✗); every canvas has a text alternative
  (`CHEMI.table`) and a `div.readout` summary (debounced 150 ms).
- Figures: plain JS, no libraries, no CDN, no `fetch`, no network, no build step, works from `file://`; lazy-loaded
  through `data-sim` (never a `<script src="../assets/sim-chemi-...">` in a chapter); deterministic seeded data
  (`CHEMI.rng`); `init(el, preset)` registered with `CHEMI.register(id, init)`; <= 15 KB gzip per figure file.
- Data: synthetic only, labelled "dati sintetici" / "spettro sintetico"; a real spectrum only from MassBank Europe
  with accession, authors, licence shown under it and a note in `docs/provenance/`; never NIST; no private data,
  no lab method compounds, no photocatalysis / TiO2 / transformation-product storyline (examples: generic
  pesticides, drugs, metabolites, EI library compounds).
- References: only those marked `verified` in section 7 of `docs/piani/chemioinformatica.md`; never invent a DOI or
  an author list. Never write `TODO`, `???` or "da verificare" in a chapter (`tools/controlla_teoria.py` rejects
  them); a doubt goes in your PR description for the ARCH review.
- The `ci` check must be green. Never skip, disable, quarantine or loosen a test; never raise a size budget; never
  add entries to `tools/teoria_base.json` to hide new errors. No `.github/` changes. No new dependencies.
- Do not merge. Do not push to `main`. One small PR, ready for review (not draft), base `main`.
