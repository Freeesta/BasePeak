# Plan: "Storia della spettrometria di massa" (ARCH2)

Design study (ARCH2, read-only). Nothing here is built yet; the build is split into
the ready DEV prompts in `docs/piani/prompt-storia-ms/` (order in section 9).
Repository code, comments and prompts are English; every handbook text is Italian.

Federico's request: a whole section on the history of mass spectrometry, with
images, "dall'idra". Read as **"dalle origini"** (from the very beginning): the
section starts with cathode rays and canal rays (Goldstein 1886) and Thomson's
positive rays, then follows the analyzers family by family. If he meant
something else (e.g. "dall'idrogeno": the first mass measured), only chapter S1
changes: hydrogen is already the first ion that Wien and Thomson measured.

Status words used everywhere in this plan:
`verified` = the ARCH opened the source (Crossref record, publisher page,
nobelprize.org page, Wikimedia Commons file page with its licence metadata) and
the fields match; `to verify` = from memory or from a secondary source, the DEV
must check before writing it, and drop it if it cannot be confirmed.
**No date, name or reference may enter the handbook in `to verify` state.**

---

## 1. Placement and structure

### 1.1 A new part "Storia", appended after the last chapter

- New part label in `CHAPTERS` (`assets/teoria.js`): **"VII. Storia"**.
  DEV8 (PR #10, `dev/nav-patroon`) is rewriting the menu into Teoria / Pratica /
  Reference groups and merges before this is built: DEV-00 reads the merged
  `CHAPTERS` format and puts "VII. Storia" as the **last part of the Teoria
  group**, before Pratica (history is reading material, not reference). If the
  merged format has no notion of groups, the part label alone is enough.
- **Numbering.** Chapter numbers run 1..N without gaps
  (`tests/test_numerazione.py`). The history chapters take the numbers
  **B+1 .. B+10**, where **B = the number of the last numbered chapter in
  `CHAPTERS` on `main` when DEV-00 starts** (21 today; more if ARCH1's
  cheminformatics chapters, `docs/piani/chemioinformatica.md`, merge first).
  Whichever section merges second takes the next free numbers; nothing in this
  plan hard-codes 22..31.
- **File names.** Every history file carries the slug prefix `storia-` so later
  prompts find their file without knowing B:
  `capitoli/NN-storia-<name>.html` + `capitoli/src/NN-storia-<name>.md`
  (`ls capitoli/*-storia-*.html`). Kicker `Capitolo NN`, figures `Figura NN.k`
  (the numbering test checks both).
- **Disjoint from ARCH1.** History owns only: `capitoli/*-storia-*`,
  `capitoli/src/*-storia-*`, `assets/storia*.js`, `assets/img/storia/**`,
  `docs/IMMAGINI.md`, `tests/test_immagini.py`, `docs/piani/storia-ms.md`,
  `docs/piani/prompt-storia-ms/**`. Shared files touched once, by DEV-00 only:
  `assets/teoria.js` (CHAPTERS rows), `index.html` (one card group),
  `tests/test_numerazione.py` (the exact chapter count), `LICENZE-TERZI.md`
  (one new section), `assets/teoria.css` (at most ~40 lines for `.storia-*`
  classes). DEV-13 (glossary/search/cross-links) touches
  `capitoli/19-glossario.html`, the generated `assets/glossario-dati.js` /
  `assets/indice-ricerca.js` and one "Per la storia" line in each linked
  technical chapter.

### 1.2 The ten chapters

| k | File (`NN = B+k`) | Title in the menu | Covers |
|---|---|---|---|
| 1 | `NN-storia-mappa` | La storia in una pagina | intro, interactive timeline, family tree of analyzers, Nobel table |
| 2 | `NN-storia-origini` | Le origini: raggi catodici, raggi canale, raggi positivi | Goldstein, Wien, J.J. Thomson, parabola, neon 20/22 |
| 3 | `NN-storia-aston-dempster` | Aston e Dempster: isotopi e numeri interi | Aston's spectrograph, whole-number rule, Dempster's 180° spectrometer and electron ionization |
| 4 | `NN-storia-settori` | Settori magnetici e doppia focalizzazione | Bainbridge, Mattauch-Herzog, Nier 60°, Nier-Johnson, isotope ratio MS |
| 5 | `NN-storia-tof` | Il tempo di volo | Stephens, Wiley-McLaren, reflectron (Mamyrin), orthogonal acceleration |
| 6 | `NN-storia-rf` | Campi a radiofrequenza: quadrupolo e trappola ionica | Paul and Steinwedel, Paul trap, Nobel 1989, commercial ion trap |
| 7 | `NN-storia-ft` | Ioni che girano: ICR, FT-ICR, Orbitrap | Hipple's omegatron, Comisarow-Marshall FT-ICR, Kingdon trap, Makarov's Orbitrap |
| 8 | `NN-storia-sorgenti` | Le sorgenti: dall'impatto elettronico alla ionizzazione morbida | EI, CI, FD, FAB, thermospray, APCI, ESI, MALDI, ICP; Nobel 2002 |
| 9 | `NN-storia-accoppiamenti` | Accoppiamenti, MS/MS e ibridi | GC-MS, LC-MS, tandem and triple quadrupole, Q-TOF, Q-Orbitrap, ion mobility |
| 10 | `NN-storia-rivelatori-dati` | Rivelatori, dati, applicazioni | plate, Faraday cup, electron multiplier, MCP; from chart recorders to libraries; geochemistry, petroleum, proteomics, metabolomics, environment |

Every chapter is **one page**, about 900-1400 words of Italian text plus
figures (a 10-15 minute read). Dyslexia rules (hard, from `COORDINATORE.md`):
paragraphs of 2-4 sentences, one idea per paragraph, h2 every 150-300 words,
h3 only inside h2, lists for enumerations, no justified text, no italics for
whole sentences, numbers with Italian decimal comma, years in digits. Line
length 60-75 characters is already given by the column width of
`assets/teoria.css` (do not change it); captions and boxes inherit it.

Fixed elements of every history chapter (in this order):

1. kicker `Capitolo NN`, `<h1>`, `<p class="lead">` (two lines: the problem
   that the period solved);
2. h2 sections from the outline (section 3);
3. a `<details class="storia-chi">` "Chi era" box per main person
   (collapsed by default; 60-120 words: dates of birth/death, where they
   worked, the one contribution; a portrait only if section 4 has one with an
   allowed licence);
4. the principle figure (static SVG + "Guarda come funziona" animation, section 5.3);
5. `<div class="box key"><b>Perché contava</b>` one box per chapter:
   the problem solved, in 3 bullets;
6. `<p class="storia-link">Per capire meglio: <a href="..">..</a></p>` lines
   pointing to the technical chapters (never re-explain their theory);
7. "Verifica" (2-3 `<details class="q">` questions, history only);
8. "Fonti" (`<ul>` with `<span class="tag">articolo|libro|storico|web</span>`,
   the format already used in chapter 19), only `verified` items of section 6.

Links to existing technical chapters (target by **slug**, the number may
change; DEV-13 checks them):

| History chapter | "Per capire meglio" links |
|---|---|
| origini, aston-dempster, settori | `09-risoluzione` (potere risolutivo, analizzatori), `11-formula` (massa esatta, difetto di massa), `06-vuoto` (cammino libero medio) |
| tof | `09-risoluzione` (TOF e reflectron, figura `sim-tof`), `21-tempi` (duty cycle) |
| rf | `07-quadrupolo` (Mathieu, diagramma di stabilità), `08-qqq`, `21-tempi` |
| ft | `09-risoluzione` (Orbitrap, FT-ICR) |
| sorgenti | `05-ei-ci`, `04-esi`, `13-ei-metodo` |
| accoppiamenti | `03-gc` (GC-MS), `02-lc`, `08-qqq` (CID, MRM), `10-dati`, `17-hr-dda` |
| rivelatori-dati | `08-qqq` and `09-risoluzione` (Il rivelatore), `10-dati`, `05-ei-ci` (librerie EI) |

Index page (`index.html`): one new card group "VII. Storia" with ten cards
(title + one line), added by DEV-00 with the final numbers.

Search and glossary: after the chapters, DEV-13 adds glossary terms
(raggi canale, spettrografo, regola dei numeri interi, frazione di
impaccamento, doppia focalizzazione, reflectron, trappola di Paul,
omegatron, trappola di Kingdon, ionizzazione morbida, matrice MALDI) and runs
`python3 tools/genera_glossario.py` and `python3 tools/genera_indice_teoria.py`.

---

## 2. Shared module and files (built by DEV-00)

| File | What | Budget |
|---|---|---|
| `assets/storia-dati.js` | `const STORIA = { tappe: [...], famiglie: [...], archi: [...] }`: the milestones of the timeline and the edges of the family tree (data only, section 5.1/5.2) | <= 8 KB gzip |
| `assets/storia.js` | tiny helpers: `STORIA_UI.svg(tag, attrs)`, `.player(root, {steps, draw})` (play/pause, step back/forward, reset, reduced-motion aware, pauses when off screen), `.lazy(el, src)` (IntersectionObserver that injects a classic `<script>` once, `rootMargin: "200px"`), `.live(el, text)` (polite aria-live summary) | <= 3 KB gzip |
| `assets/storia-fig-*.js` | one file per figure family (section 5.3), loaded by `.lazy` only when the figure nears the viewport | each <= 15 KB gzip, target 4-8 |
| `assets/img/storia/` | images: `foto/` (third-party raster, WebP/JPEG) and `schemi/` (original SVG drawings) | raster <= 90 KB, SVG <= 25 KB each |
| `docs/IMMAGINI.md` | one row per image file under `assets/` (section 4.1) | - |
| `tests/test_immagini.py` | the image-licence and size test (section 4.3) | - |

Classic scripts only (no ES modules): ES modules do not load from `file://`
(double-click), and every chapter must work offline from disk. The existing
helpers in `assets/teoria.js` (`TP.buttons`, `TP.controls`, `TP.fmt`,
`TP.reduced()`) are reused; nothing from `sim-*.js` is duplicated (the TOF and
quadrupole physics stay in `sim-quad.js` / `sim-hr.js`; the history figures are
simpler, qualitative-plus-one-formula animations).

---

## 3. Chapters: Italian outline, people, papers, why it mattered

Reference ids `[Rn]` point to section 6. A claim without a `verified` reference
is marked `(dv)` = da verificare; the chapter DEV checks it in the cited source
or drops it.

The Italian outlines below are pasted verbatim into the DEV prompts.

<!-- OUTLINES -->

---

## 4. Images

<!-- IMAGES -->

---

## 5. Visualizers

<!-- VIS -->

---

## 6. References

<!-- REFS -->

---

## 7. Technical budget

- Chapter HTML: <= 45 KB raw / <= 16 KB gzip each (chapter 7 today is 44 KB /
  17 KB: the history chapters are lighter, text plus `<img>` and small figure
  hosts). Upcoming per-page budget test (queue item 3) wins if stricter.
- JS per chapter page on first paint: only `appname.js`, `teoria.js`,
  `storia.js` (<= 3 KB gzip). `storia-dati.js` loads only on chapter 1 and on
  pages that embed a filtered timeline. Each `storia-fig-*.js` <= 15 KB gzip,
  loaded lazily; total section JS <= 60 KB gzip.
- Images: `loading="lazy"`, `decoding="async"`, explicit `width`/`height`,
  raster <= 90 KB at display size (max 720 px wide; portraits 240x300),
  original SVG <= 25 KB, no hotlinking, no third-party requests.
- Service worker (queue item 3, coming): all history files are static and
  same-origin, so they are cacheable as they are; nothing to do here.
- Measure with: `for f in assets/storia*.js; do printf "%s %s\n" $f $(gzip -9c $f | wc -c); done`.

---

## 8. Open doubts

<!-- DOUBTS -->

---

## 9. DEV prompts (order)

<!-- PROMPTS -->
