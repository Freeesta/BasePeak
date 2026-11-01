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

- New part label in `CHAPTERS` (`assets/teoria.js`): **"VIII. Storia"**.
  DEV8 (PR #10, `dev/nav-patroon`) is rewriting the menu into Teoria / Pratica /
  Reference groups and merges before this is built: DEV-00 reads the merged
  `CHAPTERS` format and puts "VIII. Storia" as the **last part of the Teoria
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

Index page (`index.html`): one new card group "VIII. Storia" with ten cards
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

### S1 · La storia in una pagina (`NN-storia-mappa`)

```text
# La storia in una pagina
lead: In poco più di un secolo la spettrometria di massa è passata da un tubo
di vetro che separava gli isotopi del neon agli strumenti che sequenziano
proteine. Questa pagina è la mappa: ogni tappa rimanda al suo capitolo.
## Come leggere questa parte
   - Un capitolo per famiglia di strumenti, in ordine di tempo.
   - Ogni passo ha risolto un problema preciso: lo diciamo sempre.
   - La teoria sta nei capitoli tecnici: qui ci sono i link.
## La linea del tempo            [visualizzatore 5.1 + elenco statico <ol>]
## L'albero degli analizzatori    [visualizzatore 5.2 + schema statico]
## I premi Nobel                  [tabella: anno, premio, persona, motivo in breve]
## Tre problemi che tornano sempre
   ### Separare masse vicine (risoluzione)
   ### Vedere poche molecole (sensibilità)
   ### Portare in fase gas molecole grandi e fragili (sorgenti)
## Fonti
```

People/milestones: none new (summary of S2-S10). Nobel table rows, all from
nobelprize.org [N1906, N1922, N1989, N2002]:
J.J. Thomson (Fisica 1906, conduzione dell'elettricità nei gas);
F.W. Aston (Chimica 1922, isotopi con lo spettrografo di massa e regola dei
numeri interi); W. Paul con H.G. Dehmelt (Fisica 1989, metà del premio, la
tecnica della trappola ionica; l'altra metà a N.F. Ramsey);
J.B. Fenn e K. Tanaka (Chimica 2002, metà del premio, metodi di ionizzazione
per desorbimento morbido per l'analisi di macromolecole biologiche; l'altra
metà a K. Wüthrich, NMR). Wording of each motivation: paraphrase the official
one on nobelprize.org, do not translate it literally.

Why it mattered: gives the reader the whole map before the details; the three
recurring problems (resolution, sensitivity, getting big molecules into the
gas phase) are the thread of every later chapter.

### S2 · Le origini (`NN-storia-origini`)

```text
# Le origini: raggi catodici, raggi canale, raggi positivi
lead: Prima di misurare masse bisognava capire che cosa vola dentro un tubo a
scarica. Tra il 1886 e il 1913 si passa dai bagliori nel vetro agli isotopi.
## Il tubo a scarica
   ### Raggi catodici: particelle negative (Thomson 1897)
   ### Raggi canale: qualcosa va nell'altro verso (Goldstein 1886)
## Wien: deviare i raggi canale (1898)
   ### Campo elettrico e magnetico: misurare q/m
   ### L'idrogeno è lo ione più leggero
## Thomson e il metodo delle parabole
   ### Campi paralleli: ogni q/m disegna una parabola     [figura sf-parabola]
   ### La lastra fotografica come rivelatore
## Il neon ha due masse (1912-1913)
   ### La parabola a 20 e la "compagna" a 22
   ### Isotopi: la parola di Soddy, la prova di Thomson e Aston
## Chi era  [J.J. Thomson; E. Goldstein; W. Wien]
## Perché contava
## Per capire meglio  -> 09-risoluzione (potere risolutivo), 06-vuoto (perché serve il vuoto)
## Verifica
## Fonti
```

Key facts and sources:
- Goldstein observes the rays that pass through the holes of a perforated
  cathode ("Kanalstrahlen"), 1886 [Goldstein 1886] (no DOI; archive.org scan;
  reprinted in Ann. Phys. 1898).
- Thomson's 1897 paper on cathode rays: q/m of the particles of cathode rays
  [Thomson 1897].
- Wien deflects canal rays with magnetic and electric fields, 1898 [Wien 1898]
  (the paper's title is about discharges in rarefied gases; the deflection
  experiment is in it: the DEV checks the content in the scan before writing).
- Thomson's positive-ray parabola method and the two neon parabolas (20 and
  22) [Thomson 1913 Bakerian; Thomson 1913 book]; Thomson's Nobel 1906 was for
  conduction of electricity in gases, not for the parabolas [N1906].
- "Isotope" word by F. Soddy, 1913 (dv: cite Soddy 1913 Nature 92, 399 only
  after checking).

Why it mattered: separating ions by q/m in fields is the principle of every
mass spectrometer; the neon result was the first evidence that a stable
element is a mixture of atoms of different mass.

### S3 · Aston e Dempster (`NN-storia-aston-dempster`)

```text
# Aston e Dempster: isotopi e numeri interi
lead: Nel 1919 due strumenti diversi trasformano le parabole di Thomson in
spettri veri: uno fotografa le masse, l'altro le conta.
## Aston: lo spettrografo di massa (1919)
   ### Focalizzare per velocità: un campo elettrico e un magnete in serie
   ### La lastra: righe al posto delle parabole
## La regola dei numeri interi
   ### Cloro 35 e 37: la massa atomica 35,5 è una media
   ### Il difetto di massa e la "packing fraction"   [-> 11-formula]
## Dempster: lo spettrometro a 180° (1918)
   ### Focalizzare per direzione                      [figura sf-settore, 180°]
   ### Contare gli ioni con un elettrometro
   ### Ionizzare con elettroni: la prima sorgente EI   [-> 05-ei-ci]
## Due strade: spettrografo (lastra) e spettrometro (corrente)
## Chi era  [F.W. Aston; A.J. Dempster]
## Perché contava
## Per capire meglio -> 09-risoluzione, 11-formula, 05-ei-ci
## Verifica
## Fonti
```

Key facts and sources: Aston's positive-ray spectrograph [Aston 1919a]; the
constitution of the elements and the whole-number rule [Aston 1919b]; Nobel
Chemistry 1922 and his Nobel lecture [N1922]; Dempster's 180° direction-focusing
instrument with electron-impact ionization [Dempster 1918]; Dempster's
discovery of uranium-235 (1935, dv: Nature 136, 180 — check before use).
History accounts: [Downard 2007], [Griffiths 2008], [Budzikiewicz 2006].

Why it mattered: whole-number masses settled the isotope question for most
elements; the small deviations (mass defect) became nuclear binding energy;
Dempster's electrical detection and electron ionization are the ancestors of
today's quantitative MS and of the EI source.

### S4 · Settori magnetici e doppia focalizzazione (`NN-storia-settori`)

```text
# Settori magnetici e doppia focalizzazione
lead: Per misurare masse con sei o sette cifre bisognava focalizzare gli ioni
due volte: per direzione e per energia.
## Il problema: ioni con energie diverse
## Bainbridge: selettore di velocità e masse precise (anni '30)
## Mattauch e Herzog (1934): tutte le masse a fuoco su un piano
## Nier: il settore a 60° e lo strumento di routine (1940)  [figura sf-settore, 60°]
   ### Meno ferro, stessa focalizzazione
   ### Rapporti isotopici: datazioni e geochimica
## Nier-Johnson (1953): doppia focalizzazione a punto  [figura sf-doppia]
## Gli spettrometri a settore nella chimica organica (anni '50-'70)
   ### Petrolio: le prime analisi quantitative di miscele
   ### Alta risoluzione: formule dalle masse esatte    [-> 11-formula]
## Chi era  [K.T. Bainbridge; J. Mattauch; A.O. Nier]
## Perché contava
## Per capire meglio -> 09-risoluzione, 11-formula
## Verifica
## Fonti
```

Key facts and sources: [Bainbridge 1933] (mass-energy equivalence check),
[Bainbridge-Jordan 1936]; [Mattauch-Herzog 1934];
[Nier 1940]; [Johnson-Nier 1953]; Nier's recollections [Nier 1990] and isotope
abundances [Nier 1950]. Petroleum and Consolidated Engineering Corporation
instruments of the 1940s (dv: only from [Grayson 2002] or
[Encyclopedia vol. 9]). Uranium separation with calutrons (dv: mention only if
a verified source is found).

Why it mattered: double focusing gave the accurate masses that later made
elemental formulas from mass alone possible; Nier's 60° instrument made isotope
ratio MS routine (geochronology, isotope geochemistry).

### S5 · Il tempo di volo (`NN-storia-tof`)

```text
# Il tempo di volo
lead: Niente magneti: si dà a tutti gli ioni la stessa spinta e si misura
quanto ci mettono ad arrivare.
## L'idea di Stephens (1946)
   ### Ioni a pacchetti, massa dal tempo        [figura sf-tof, lineare]
## Wiley e McLaren (1955): due campi per una risoluzione migliore
   ### Ioni nati in punti diversi arrivano insieme
## Il reflectron (Mamyrin, 1973)
   ### Uno specchio elettrostatico corregge l'energia   [figura sf-tof, reflectron]
## Accelerazione ortogonale: il TOF per le sorgenti continue
## Perché il TOF torna di moda: MALDI e ESI
## Chi era  [W.C. Wiley; B.A. Mamyrin]
## Perché contava
## Per capire meglio -> 09-risoluzione (sim-tof), 21-tempi
## Verifica
## Fonti
```

Key facts and sources: [Stephens 1946] (an APS meeting abstract, `to verify`:
if the abstract page cannot be confirmed, cite it only through [Mamyrin 2001]
or [Griffiths 2008] as "secondo ...");
[Wiley-McLaren 1955]; [Mamyrin 1973]; review [Mamyrin 2001]; orthogonal
acceleration (dv: Dodonov et al. 1987/1991 or Guilhaus 1995 review —
cite only after checking).

Why it mattered: unlimited mass range and a full spectrum for every pulse;
with the reflectron and orthogonal acceleration TOF became the high-resolution
partner of MALDI and ESI.

### S6 · Campi a radiofrequenza (`NN-storia-rf`)

```text
# Campi a radiofrequenza: quadrupolo e trappola ionica
lead: Nel 1953 a Bonn si scopre che un campo che cambia segno un milione di
volte al secondo può filtrare gli ioni per massa, senza magnete.
## Paul e Steinwedel (1953): il filtro di massa a quadrupolo
   ### Stabile o instabile: l'equazione di Mathieu   [figura sf-rf, filtro; -> 07-quadrupolo]
## Dal laboratorio all'industria
   ### Piccolo, economico, veloce: il quadrupolo per la GC-MS
## La trappola di Paul
   ### Chiudere il campo in tre dimensioni              [figura sf-rf, trappola]
   ### Il premio Nobel 1989
## La trappola ionica come spettrometro (anni '80)
   ### Espulsione per instabilità di massa
   ### Le trappole lineari
## Chi era  [W. Paul; H.G. Dehmelt]
## Perché contava
## Per capire meglio -> 07-quadrupolo, 08-qqq, 21-tempi
## Verifica
## Fonti
```

Key facts and sources: [Paul-Steinwedel 1953]; US patent 2,939,952 [Paul
patent 1960]; Nobel Physics 1989 and Paul's Nobel lecture [N1989; Paul 1990];
mass-selective instability ion trap [Stafford 1984]; review [March 1997];
linear ion trap (dv: Schwartz, Senko, Syka 2002, J. Am. Soc. Mass Spectrom.
13, 659 — cite only after checking).

Why it mattered: no magnet, low cost, fast electronic scanning: the
quadrupole made benchtop GC-MS and later LC-MS possible; the trap gave
MS^n in one small device.

### S7 · Ioni che girano: ICR, FT-ICR, Orbitrap (`NN-storia-ft`)

```text
# Ioni che girano: ICR, FT-ICR, Orbitrap
lead: Se uno ione gira in un campo con una frequenza che dipende solo dalla
sua massa, misurare una massa diventa misurare una frequenza: la cosa che la
fisica sa fare meglio.
## La risonanza ciclotronica (anni '40-'50)
   ### Frequenza e massa: f = qB/(2πm)               [figura sf-ft, ICR]
   ### L'omegatron di Hipple, Sommer e Thomas (1949)
## Comisarow e Marshall (1974): la trasformata di Fourier
   ### Tutti gli ioni insieme: il transiente
   ### Più tempo, più risoluzione
## Kingdon (1923) e Makarov (2000): l'Orbitrap
   ### Una trappola solo elettrostatica                 [figura sf-ft, Orbitrap]
   ### Dal prototipo allo strumento commerciale
## Chi era  [A.G. Marshall; M.B. Comisarow; A. Makarov]
## Perché contava
## Per capire meglio -> 09-risoluzione
## Verifica
## Fonti
```

Key facts and sources: cyclotron principle [Lawrence-Livingston 1932]; [Hipple-Sommer-Thomas 1949]; [Comisarow-Marshall 1974];
primer [Marshall 1998]; [Kingdon 1923]; [Makarov 2000]; Q-Orbitrap
[Michalski 2011]. First commercial Orbitrap year (dv: 2005, LTQ Orbitrap —
cite only from a verified source, e.g. Makarov et al. 2006 Anal. Chem. 78,
2113, to check).

Why it mattered: the highest resolving power and mass accuracy, needed for
complex mixtures (petroleomics, proteomics, untargeted analysis); the Orbitrap
brought that power to a benchtop instrument without a superconducting magnet.

### S8 · Le sorgenti (`NN-storia-sorgenti`)

```text
# Le sorgenti: dall'impatto elettronico alla ionizzazione morbida
lead: Per decenni la spettrometria di massa vedeva solo molecole piccole e
volatili. La storia delle sorgenti è la storia di come si è arrivati alle
proteine.
## Impatto elettronico: lo standard da Dempster a Nier       [-> 05-ei-ci]
## Ionizzazione chimica (Munson e Field, 1966)              [-> 05-ei-ci]
## Desorbire invece di evaporare
   ### Desorbimento di campo (Beckey, 1969)
   ### FAB: atomi veloci su una matrice liquida (Barber, 1981)
## Liquidi direttamente nello strumento
   ### Thermospray (Blakley e Vestal, 1983)
   ### APCI: ionizzare a pressione atmosferica (Horning, 1973)
## Elettrospray                                            [-> 04-esi]
   ### L'idea di Dole (1968)
   ### Yamashita e Fenn (1984) e le proteine (1989)
## MALDI
   ### Karas e Hillenkamp: la matrice che assorbe il laser
   ### Tanaka: nanoparticelle in glicerolo e proteine fino a 100 000
   ### Il Nobel 2002 e la discussione sui meriti
## ICP-MS: un plasma per gli elementi (Houk, 1980)
## Chi era  [J.B. Fenn; K. Tanaka; F. Hillenkamp e M. Karas]
## Perché contava
## Per capire meglio -> 05-ei-ci, 04-esi, 13-ei-metodo
## Verifica
## Fonti
```

Key facts and sources: [Munson-Field 1966]; [Beckey 1969]; [Barber 1981];
[Blakley-Vestal 1983]; [Horning 1973]; [Dole 1968]; [Yamashita-Fenn 1984];
[Fenn 1989]; [Karas-Hillenkamp 1988]; [Tanaka 1988]; [N2002] and Fenn's Nobel
lecture; [Houk 1980]. The "discussion on merit" (MALDI credit) is told
neutrally, one paragraph, from the Nobel page and a verified history source
only (dv).

Why it mattered: soft ionization put intact proteins, nucleic acids,
polymers and polar drugs in the gas phase; ESI also made LC-MS routine; ICP-MS
made trace elements and isotopes measurable at ppt level.

### S9 · Accoppiamenti, MS/MS e ibridi (`NN-storia-accoppiamenti`)

```text
# Accoppiamenti, MS/MS e ibridi
lead: Uno spettro di una miscela è un groviglio. Prima si separa, poi si
pesa; e se non basta, si rompe lo ione e si pesano i pezzi.
## GC-MS: il primo accoppiamento (anni '50)           [-> 03-gc]
   ### Gohlke e McLafferty: il gas di trasporto e il vuoto
## LC-MS: trent'anni di interfacce                     [-> 02-lc, 04-esi]
   ### Introduzione diretta, nastro mobile, thermospray
   ### Le sorgenti a pressione atmosferica chiudono la partita
## Spettrometria di massa tandem
   ### Ioni metastabili e settori (anni '60-'70)
   ### Yost ed Enke (1978): il triplo quadrupolo         [-> 08-qqq]
## Gli ibridi
   ### Q-TOF (1996)
   ### Trappola lineare + Orbitrap e Q-Orbitrap (2011)    [-> 17-hr-dda]
## Mobilità ionica: separare per forma                  [figura sf-mobilita]
   ### Dalla "cromatografia di plasma" (1970) agli strumenti IM-MS
## Chi era  [F.W. McLafferty; R.A. Yost e C.G. Enke]
## Perché contava
## Per capire meglio -> 03-gc, 02-lc, 08-qqq, 10-dati, 17-hr-dda
## Verifica
## Fonti
```

Key facts and sources: [Gohlke 1959]; [Gohlke-McLafferty 1993];
[Baldwin-McLafferty 1973] (LC-MS direct introduction); thermospray
[Blakley-Vestal 1983]; [Yost-Enke 1978]; [Morris 1996]; [Michalski 2011];
[Cohen-Karasek 1970]. Moving-belt interface (dv: McFadden et al. 1976 —
check before use).

Why it mattered: separation plus MS turned identification of single compounds
into analysis of real mixtures; MS/MS gave selectivity (MRM) and structure;
hybrids joined the fast, selective quadrupole to high-resolution analyzers.

### S10 · Rivelatori, dati, applicazioni (`NN-storia-rivelatori-dati`)

```text
# Rivelatori, dati, applicazioni
lead: Un rivelatore trasforma ioni in un segnale, un calcolatore trasforma il
segnale in una risposta. Anche qui la storia è fatta di salti.
## Dalla lastra fotografica alla corrente
   ### Lastra fotografica (Thomson, Aston)
   ### Elettrometro e coppa di Faraday (Dempster, Nier)
## Moltiplicare gli elettroni                     [figura sf-moltiplicatore; -> 08-qqq]
   ### Il moltiplicatore a dinodi
   ### Le piastre a microcanali                   [-> 09-risoluzione]
## Dai registratori a carta ai calcolatori
   ### Misurare a mano i picchi
   ### Le librerie di spettri e la ricerca automatica   [-> 05-ei-ci]
## Cinque campi che la MS ha cambiato
   ### Geochimica isotopica e datazioni
   ### Petrolio
   ### Proteomica
   ### Metabolomica
   ### Analisi ambientale                        [-> 16-strategia]
## Chi era  [K. Biemann; J.R. Yates III] (only if verified sources and allowed images)
## Perché contava
## Per capire meglio -> 08-qqq, 09-risoluzione, 10-dati, 05-ei-ci
## Verifica
## Fonti
```

Key facts and sources: [Wiza 1979] (MCP); [Hertz-Hites-Biemann 1971] (computer
library search); [Eng-McCormack-Yates 1994] (SEQUEST, proteomics);
[Nier 1950] (isotope abundances); overview [Yates 2011], [Griffiths 2008].
Improved electron multiplier particle counter [Allen 1947] (it is an improvement, not the invention: say "migliorato", the earlier history is dv).
Metabolomics and environmental milestones: only with a verified review (dv);
otherwise keep them as short general paragraphs without dates.

Why it mattered: single-ion detection made MS the most sensitive general
detector; computers and libraries turned spectra into identifications at
scale; the application fields show what each technical step made possible.


---

## 4. Images

Hard rules: every image is public domain, CC0, CC BY (any version) or an
original drawing made for this project (licence: CC BY 4.0, BasePeak, like the
texts). **Not allowed:** NC, ND, BY-SA (share-alike would bind the page),
fair use, "permission" templates, publisher figures, images of unclear origin,
AI-generated "historical photos". Nobel Prize photos on nobelprize.org are
not under a free licence (see 4.4): not used.

Technical rules: SVG preferred; raster only WebP or JPEG, <= 90 KB each at
display size (max 720 px wide; portraits 240x300); files in the repo under
`assets/img/storia/` (`foto/` for third-party raster, `schemi/` for original
SVG); `<img loading="lazy" decoding="async" width=".." height="..">` with a
meaningful Italian `alt` (what is seen, <= 125 characters) inside a
`<figure>` with a visible `<figcaption>`: "Figura NN.k Descrizione. Autore,
anno. Licenza (fonte)". Works offline: no hotlinking, no third-party request,
no `srcset` to external hosts.

### 4.1 `docs/IMMAGINI.md` format (one row per file)

| Campo | Contenuto |
|---|---|
| File | path under `assets/` (a glob such as `assets/icone/*.png` only for the project icon set) |
| Mostra | what it shows, Italian |
| Fonte | exact source page URL (Commons file page, museum record, ...) or `disegno originale` |
| Autore | as stated on the source page |
| Data | as stated on the source page |
| Licenza | one of: `Pubblico dominio`, `CC0 1.0`, `CC BY 2.0`/`2.5`/`3.0`/`4.0`, `Originale (CC BY 4.0, BasePeak)`, `MIT (BasePeak)` (icons only) |
| Attribuzione | the text printed in the caption (for CC BY: author, title, licence with link, source, "ritagliata e ridimensionata" if changed) |
| Modifiche | crop, resize, format conversion |
| Stato | `verificata` (the DEV re-opened the page and read the licence on the day of download, date in this column) |

### 4.2 Original drawings (hand-written SVG, `assets/img/storia/schemi/`)

Common spec: `viewBox` only (no fixed pixel size inside the file), `role="img"`
and `<title>` in Italian, `currentColor` and the palette of `assets/teoria.css`
written as plain colours with enough contrast on both light and dark
backgrounds (the existing chapters use `#2b5c8a`, `#c2410c`, `#24231f` on a
transparent background: keep the same), text >= 12 px at 720 px width,
labels in Italian, no `<script>`, no event attributes, no external
references, no embedded raster, <= 25 KB each, hand-written or generated by a
small script that is NOT committed (only the SVG). Each drawing is also the
static fallback of its animation (section 5.3): same geometry as the first
frame.

| File | Shows | Labels | Used in |
|---|---|---|---|
| `albero-analizzatori.svg` | family tree, x = year 1880-2020, branches: settori, TOF, RF, FT, ibridi | names + years | mappa |
| `tubo-raggi-canale.svg` | discharge tube with perforated cathode; cathode rays one way, canal rays through the holes the other way | catodo forato, anodo, raggi catodici, raggi canale | origini |
| `parabola-thomson.svg` | ion beam through parallel E and B fields onto a plate; two parabolas for m/z 20 and 22 | campo E, campo B, lastra, Ne 20, Ne 22 | origini |
| `spettrografo-aston.svg` | Aston: slits, electric plates, magnet, plate; fast and slow ions of one mass meet on one point | fenditure, campo elettrico, magnete, lastra | aston-dempster |
| `settore-180.svg` | Dempster 180° magnetic sector, three diverging rays refocused | sorgente, magnete, fenditura, rivelatore | aston-dempster |
| `settore-60.svg` | Nier 60° sector (symmetric) | as above | settori |
| `mattauch-herzog.svg` | electric sector 31,8° + magnetic sector 90°, focal plane with lines | settore elettrico, settore magnetico, piano focale | settori |
| `nier-johnson.svg` | electric sector 90° + magnetic sector 60°, point focus | as above | settori |
| `tof-lineare.svg` | source, accelerating field, field-free tube, detector, two packets | sorgente, accelerazione, tubo di volo, rivelatore | tof |
| `tof-reflectron.svg` | as above with an ion mirror; fast ion goes deeper | reflectron, ione veloce, ione lento | tof |
| `quadrupolo-sezione.svg` | four rods, +/- pairs, one stable and one unstable trajectory | +(U−V cos Ωt), −(U−V cos Ωt) | rf |
| `trappola-paul.svg` | ring electrode and two end caps, ion cloud | elettrodo ad anello, calotte | rf |
| `cella-icr.svg` | cubic cell in a magnetic field, excite and detect plates, ion orbit | B, eccitazione, rivelazione | ft |
| `orbitrap.svg` | spindle and barrel electrodes, spiral trajectory, axis z | elettrodo centrale, elettrodo esterno, asse z | ft |
| `sorgente-ei.svg` | filament, electron beam, ion repeller, ion beam | filamento, elettroni 70 eV, ioni | sorgenti |
| `cono-taylor.svg` | ESI capillary, Taylor cone, jet, droplets dividing | capillare, cono di Taylor, gocce | sorgenti |
| `maldi.svg` | laser pulse on a matrix crystal, plume, ions to TOF | laser, matrice, pennacchio | sorgenti |
| `ibridi.svg` | block diagrams: QqQ, Q-TOF, Q-Orbitrap | Q1, q2, Q3, TOF, Orbitrap | accoppiamenti |
| `mobilita.svg` | drift tube with gas, two ions of equal m/z and different shape | tubo di deriva, gas, campo E | accoppiamenti |
| `moltiplicatore.svg` | discrete-dynode cascade 1 -> 2 -> 4 ... electrons | ione, dinodo 1..n, anodo | rivelatori-dati |
| `mcp.svg` | microchannel plate cross-section, one channel cascade | canale, elettroni | rivelatori-dati |

### 4.3 The image test (`tests/test_immagini.py`, DEV-00)

1. Every image file under `assets/` (`.svg .png .jpg .jpeg .webp .gif .ico
   .avif`) matches exactly one row of `docs/IMMAGINI.md` (path or glob).
2. Every row matches at least one file (no stale rows).
3. `Licenza` is in the allowed list of 4.1; under `assets/img/storia/` only
   `Pubblico dominio`, `CC0 1.0`, `CC BY x.y`, `Originale (CC BY 4.0, BasePeak)`.
4. `Stato` starts with `verificata` for every row; `Fonte` is an `https://`
   URL or `disegno originale`; `Autore` and `Attribuzione` are not empty.
5. Size caps: raster under `assets/img/` <= 92 160 bytes (90 KB) and only
   `.webp/.jpg/.jpeg`; SVG under `assets/img/` <= 25 600 bytes.
6. SVG under `assets/img/` contains no `<script`, no ` on\w+=` attribute, no
   `href="http` / `xlink:href="http`, no `<image` with a data URI over 1 KB.
7. Every `<img>` in `index.html`, `capitoli/*.html`, `pratica/*.html` whose
   `src` is under `assets/img/` has `loading="lazy"`, `decoding="async"`,
   numeric `width` and `height`, non-empty `alt`, and sits in a `<figure>`
   whose `<figcaption>` contains the licence name of its row (`pubblico
   dominio`, `CC0`, `CC BY x.y`, or `disegno originale`), case-insensitive.
8. No `<img>`/`<source>` `src` in those pages starts with `http:`, `https:` or `//`.
9. Every third-party file under `assets/img/storia/foto/` is named in
   `LICENZE-TERZI.md`.


### 4.4 Third-party images: approved candidates

How they were checked (2026-10-31): Science History Institute pages were read
directly; the Wikimedia Commons file metadata (`extmetadata`) was read through
the Commons API, but the container was rate-limited (HTTP 429) and the API
answers passed through a summarising fetch. Commons rows are therefore marked
`to verify`. DEV-01 re-opens every file page and the API answer before
downloading, as its prompt requires. The full candidate notes (direct file
URLs, pixel sizes) were produced during this study; DEV-01 takes the
original-file URL from the API, never from this table.

| id (file slug) | Shows | Source page | Author | Date | Licence | Attribution (caption) | Used in | Status |
|---|---|---|---|---|---|---|---|---|
| thomson-ritratto | J.J. Thomson, portrait | https://commons.wikimedia.org/wiki/File:J.J._Thomson_LCCN2014715407.jpg | Bain News Service (Library of Congress) | c. 1920-1925 | Public domain | Bain News Service, Library of Congress; pubblico dominio | origini | to verify |
| thomson-laboratorio | Thomson in the Cavendish laboratory | https://commons.wikimedia.org/wiki/File:JJ_Thomson_in_his_lab.jpg | U.S. Department of Energy (as stated) | early 1900s | Public domain | U.S. DOE; pubblico dominio | origini | to verify (the PD reason must be confirmed on the page) |
| thomson-parabole-1913 | Thomson's parabola photographs, Plate I/II of *Rays of Positive Electricity* | https://commons.wikimedia.org/wiki/File:Thomson_RoPE_1913_Plate_II.jpg (Plate I: `..._Plate_I.jpg`) | J.J. Thomson | 1913 | Public domain | J.J. Thomson, 1913; pubblico dominio | origini | to verify |
| neon-parabole | Parabola plate showing neon 20 and 22 (from Aston, *Isotopes*, 1922) | https://commons.wikimedia.org/wiki/File:Discovery_of_neon_isotopes.JPG | F.W. Aston (book figure) | 1922 | Public domain | F.W. Aston, *Isotopes*, 1922; pubblico dominio | origini | to verify |
| wien-ritratto | Wilhelm Wien, Nobel portrait 1911 | https://commons.wikimedia.org/wiki/File:Wilhelm_Wien_1911.jpg | unknown | 1911 | Public domain (PD-Sweden-photo) | Autore sconosciuto, 1911; pubblico dominio | origini | to verify |
| aston-ritratto | F.W. Aston, portrait | https://commons.wikimedia.org/wiki/File:Dr._F.W._Aston_LCCN2014715455.jpg | Bain News Service (Library of Congress) | 1922 | Public domain | Bain News Service, Library of Congress; pubblico dominio | aston-dempster | to verify |
| aston-spettrografo-1919 | Aston's first mass spectrograph with lettered key (*Isotopes*, 1922) | https://digital.sciencehistory.org/works/9w0324230 | F.W. Aston | 1922 | Public domain (Public Domain Mark 1.0) | F.W. Aston, *Isotopes*, 1922; Science History Institute; pubblico dominio | aston-dempster | verified |
| aston-spettri | Aston's mass spectra of Ne, Cl, Ar, Kr | https://digital.sciencehistory.org/works/9s1617373 | F.W. Aston | 1922 | Public domain (Public Domain Mark 1.0) | as above | aston-dempster | verified |
| aston-spettri-2 | Aston's mass spectra of Hg, B, Br, S, P | https://digital.sciencehistory.org/works/gq67js400 | F.W. Aston | 1922 | Public domain (Public Domain Mark 1.0) | as above | aston-dempster (optional) | verified |
| dempster-1918 | Diagram of Dempster's 1918 spectrometer (figure of the paper) | https://commons.wikimedia.org/wiki/File:Dempster_Mass_Spectrometer.gif | A.J. Dempster | 1918 | Public domain | A.J. Dempster, *Phys. Rev.* 1918; pubblico dominio | aston-dempster | to verify |
| bainbridge-ritratto | K.T. Bainbridge | https://commons.wikimedia.org/wiki/File:Kenneth_Bainbridge.jpg | Los Alamos National Laboratory | 1940s | Public domain (PD-LosAlamos; the LANL notice must be reproduced) | Los Alamos National Laboratory + notice | settori | to verify |
| nier-strumento | Parts of a Nier-design mass spectrometer (museum object) | https://digital.sciencehistory.org/works/klwoj0c | Science History Institute | object 1972 | CC BY 4.0 | Science History Institute, CC BY 4.0 | settori | verified |
| calutron-racetrack | Alpha I calutron "racetrack", Y-12, Oak Ridge | https://commons.wikimedia.org/wiki/File:Y-12_Calutron_Alpha_racetrack.jpg | J.E. Westcott (U.S. government) | c. 1944-1945 | Public domain (U.S. government) | Ed Westcott, U.S. Army / DOE; pubblico dominio | settori (only if the calutron paragraph has a verified source) | to verify |
| cec-21-110 | DuPont CEC 21-110 double-focusing spectrometer | https://commons.wikimedia.org/wiki/File:DuPontCEC21-110.jpg | Abderitestatos | photo 2015 | CC BY 4.0 | Abderitestatos, CC BY 4.0, via Wikimedia Commons | settori | to verify |
| paul-brevetto | Fig. 5 of US patent 2,939,952 | https://commons.wikimedia.org/wiki/File:Paul_Patent_2939952_Fig5.gif | W. Paul, H. Steinwedel (USPTO) | 1960 | Public domain | Brevetto US 2 939 952; pubblico dominio | rf | to verify |
| trappola-paul-demo | Demonstration Paul trap (macroscopic) | https://commons.wikimedia.org/wiki/File:Paul_quadrupole_trap.jpg | Jan Pavelka | 2017 | CC BY 4.0 | Jan Pavelka, CC BY 4.0, via Wikimedia Commons | rf | to verify |
| fticr-magnete | IonSpec FT-ICR instrument and magnet | https://commons.wikimedia.org/wiki/File:IonSpec_FT-ICR_(Fourier_transform_Ion_cyclotron_resonance)_Mass_spectrometer.jpg | Michael Pereckas | 2010 | CC BY 2.0 | Michael Pereckas, CC BY 2.0, via Wikimedia Commons | ft | to verify |
| fenn-ritratto | John B. Fenn | https://commons.wikimedia.org/wiki/File:John_B_Fenn01.jpg | Walkerma (released by the photographer) | 2000s | Public domain (PD-self release) | to be copied from the page | sorgenti | to verify |
| tanaka-ritratto | Koichi Tanaka | https://commons.wikimedia.org/wiki/File:Koichi_Tanaka_2003.jpg | Cabinet Public Relations Office, Japan | 2003 | CC BY 4.0 (Government of Japan terms 2.0, compatible) | Cabinet Public Relations Office, Japan, CC BY 4.0 | sorgenti | to verify |
| coppa-faraday | Faraday cup | https://commons.wikimedia.org/wiki/File:Faraday_cup.jpg | Angelpeream | 2008 | Public domain | Angelpeream; pubblico dominio | rivelatori-dati | to verify |

**Rejected** (not allowed under the rules; listed so nobody re-proposes them):
- Nobel Prize photos on nobelprize.org: the terms forbid reproduction without
  written permission (only the API data are CC0).
- Science Museum Group photos of Aston's spectrographs: CC BY-NC-SA 4.0.
- Caltech photo of Aston's spectrograph: for education and research only.
- AIP Emilio Segrè photos on Commons (Nier with Bainbridge 1969, Dehmelt):
  a "permission" statement, not a free licence.
- BY-SA: Aston's 3rd spectrograph replica and Fenn's ESI instrument
  (Jeff Dahl), Paul trap 1955/1965 replica in Deutsches Museum Bonn
  (A. Hindemith), Orbitrap analyzer photos (Thermo Fisher; Gbdivers),
  quadrupole rods, electron multipliers, ICR cell, CEC 21-101, R. Yost
  portrait. **Open choice for Federico** (section 8): accept BY-SA for single images.
- "No known copyright" only: Aston Smithsonian portrait, Bendix TOF and GC-MS
  photos of the 1960s, Exxon CEC 21-103: rights unclear, excluded.
- Dempster portrait on Commons: tagged PD-old but from AIP with no author
  date: doubtful, excluded.

**Gaps** (no free image found; use the original SVG drawings instead):
portraits of Goldstein, Mattauch, W. Paul, Stephens, Marshall, Makarov,
Hillenkamp, Karas, McLafferty, Biemann, Yost, Enke; photos of Nier's 1940
sector, of an original Dempster instrument, of an Orbitrap cutaway (CC BY),
of an MCP, of the first MALDI and ESI instruments. The "Chi era" boxes of
these people have no portrait.


---

## 5. Visualizers

Common rules for every visualizer: plain JS + inline SVG built by
`STORIA_UI.svg`, no library, no CDN, no canvas text (screen readers read SVG
`<title>`/`aria-label` and the live summary), colours from the CSS variables of
`assets/teoria.css` (`--c1`..`--c6`) so light/dark/high-contrast themes work,
and **never colour alone**: every category also has a shape or a text label,
every line style has a dash pattern. Under reduced motion
(`TP.reduced()` or `prefers-reduced-motion`) nothing moves by itself: "Play"
becomes "Mostra il passo successivo" and draws the final frame of each step.
Every animated figure starts **paused** on a static frame identical to the
static SVG file (section 4.2); the animation script loads only when the figure
nears the viewport (`STORIA_UI.lazy`). Without JS the static `<img>` stays.

### 5.1 Interactive timeline (`assets/storia-fig-linea.js`, chapter 1; compact mode embeddable in chapters 8-10)

- **Teaching point:** a century of MS is a chain of problems solved: each
  card says what was impossible before.
- **Data:** `STORIA.tappe` items
  `{id, anno, anno_fine?, titolo, persone: [..], famiglia: "origini|settore|tof|rf|ft|sorgente|accoppiamento|rivelatore|dati|applicazione", perche, capitolo: "storia-xxx", rif: ["R3"], nobel?: "Fisica 1906"}`.
  Only `verified` facts (section 6) enter the data file; DEV-00 writes it from
  the "Tappe" tables of section 3, about 45 items.
- **Layout:** a vertical list of cards on phones (< 600 px) and a horizontal
  scale of decades (1880-2020) with the cards listed below on wide screens.
  Each card: year (big), title, people, one-line "Perché contava", link
  "Leggi il capitolo" to the chapter, and a Nobel badge (text "Nobel", not only
  a colour).
- **Controls:** filter chips (toggle buttons, `aria-pressed`) by family
  (Analizzatori / Sorgenti / Accoppiamenti / Rivelatori e dati /
  Applicazioni), a `<select>` "Persona" (generated from the data), a
  "Solo premi Nobel" checkbox, and a decade slider. Keyboard: Tab reaches the
  controls then the list; in the list, Up/Down or Left/Right move between cards
  (roving tabindex), Home/End jump to first/last, Enter opens the chapter link.
- **Computed live:** the filtered list and the summary "N tappe dal AAAA al
  AAAA, filtro: ..." in an `aria-live="polite"` region (updated at most once
  per 300 ms).
- **Static fallback:** without JS the chapter shows the same milestones as an
  ordinary `<ol>` generated at build time by DEV-03 (text in the page, so search
  and print see it).
- **Size estimate:** 4-6 KB gzip (+ data file <= 8 KB gzip).

### 5.2 Family tree of the analyzers (`assets/storia-fig-albero.js`, chapter 1)

- **Teaching point:** each analyzer descends from an earlier idea (what led to
  what): parabola -> magnetic sector -> double focusing; Wien filter; TOF ->
  reflectron -> oa-TOF; RF quadrupole -> Paul trap -> linear trap; cyclotron
  resonance -> omegatron -> FT-ICR; Kingdon trap -> Orbitrap; and the hybrids
  (QqQ, Q-TOF, Q-Orbitrap, IM-MS) as joins of two branches.
- **Data:** `STORIA.famiglie` (nodes `{id, nome, anno, capitolo}`) and
  `STORIA.archi` (`[from, to, "idea passed on"]`), written by DEV-00 from
  section 3; only edges supported by a `verified` reference.
- **Layout:** a layered left-to-right graph (x = year, y = branch), computed in
  the script (no layout library: fixed branch rows, x from the year). On
  phones it becomes a nested `<ul>` tree (the same data).
- **Controls:** each node is a `<button>`; focusing or clicking it highlights
  ancestors and descendants (thicker stroke + dashed edges + a text list
  "Viene da: ...; porta a: ..."), the list is announced in the live region.
  Arrow keys move along edges (Left = parent, Right = first child,
  Up/Down = siblings). A "Mostra tutto" reset button.
- **Static fallback:** `assets/img/storia/schemi/albero-analizzatori.svg`
  (section 4.2) as `<img>`, plus the nested list in the page.
- **Size estimate:** 3-5 KB gzip.

### 5.3 Principle diagrams, one per analyzer family

Shared behaviour (from `STORIA_UI.player`): buttons "Avvia/Pausa",
"Indietro di un passo", "Avanti di un passo", "Ricomincia"; a step caption
(`<p class="storia-passo" aria-live="polite">Passo 2 di 5: ...</p>`);
animation at <= 30 fps with `requestAnimationFrame`, paused when the figure is
off screen (IntersectionObserver) or the tab is hidden; under reduced motion
the steps are shown as still frames. Each figure has a `<div class="sim
storia-fig" id="sf-...">` host containing the static `<img>`; the script
replaces the image with live SVG when it loads. Trajectories are computed live
from the formula written in the caption (no pre-recorded paths).

| id / file | Chapter | Teaching point | Computed live | Controls (besides the player) | Static SVG | gzip |
|---|---|---|---|---|---|---|
| `sf-parabola` / `storia-fig-thomson.js` | origini | parallel E and B fields deflect each ion on two axes; all ions with the same m/z land on one parabola, whatever their speed | small-angle deflections x = k_E·q/(m v²), y = k_B·q/(m v); parabola y² ∝ (q/m)·x; points for ions of m/z 20 and 22 with random speeds | radio "Ioni: H+ / Ne+ (20 e 22) / entrambi", slider "numero di ioni" (10-200) | `parabola-thomson.svg` | 3-4 KB |
| `sf-settore` / `storia-fig-settore.js` | aston-dempster, settori | a magnetic field bends ions on circles of radius r = m v/(q B); a 180° (Dempster) or 60° (Nier) sector refocuses a diverging beam on the slit | r = sqrt(2 m U/q)/B, three rays at ±α entering the sector, focal point; mass spectrum built by scanning B | radio "Geometria: 180° Dempster / 60° Nier"; slider "campo B"; ion masses 20/22 or 35/37 | `settore-180.svg`, `settore-60.svg` | 4-6 KB |
| `sf-doppia` / `storia-fig-settore.js` (same file, second block) | settori | an electrostatic sector disperses by energy, the magnet by momentum: combined, the energy spread cancels (double focusing) | radius in the electric sector r_e = 2U/E; rays with energy U±ΔU through ESA+magnet, image spot size with and without ESA | toggle "con / senza settore elettrostatico"; select "Mattauch-Herzog (piano focale) / Nier-Johnson (punto)" | `mattauch-herzog.svg`, `nier-johnson.svg` | in the file above |
| `sf-tof` / `storia-fig-tof.js` | tof | same energy, different mass: lighter ions arrive first, t = L·sqrt(m/(2 z e U)); Wiley-McLaren two-field source corrects the start-position spread; the reflectron corrects the energy spread | flight times of ions with spread in start position and energy; arrival histogram for linear / two-stage / reflectron | radio "Lineare / Due campi (Wiley-McLaren) / Reflectron"; slider "dispersione di energia" | `tof-lineare.svg`, `tof-reflectron.svg` | 4-5 KB |
| `sf-rf` / `storia-fig-rf.js` | rf | an oscillating saddle field keeps some m/z stable (filter) and in 3D can trap them (Paul trap) | Mathieu equation integrated with a few RK4 steps per frame (small own implementation, not imported from `sim-quad.js`); stable/unstable trajectories for 3 masses; for the trap, the ion cloud oscillating at its secular frequency | radio "Filtro di massa / Trappola 3D"; slider "ampiezza RF V" | `quadrupolo-sezione.svg`, `trappola-paul.svg` | 5-7 KB |
| `sf-ft` / `storia-fig-ft.js` | ft | ions circle (ICR) or oscillate along the axis (Orbitrap) at a frequency fixed by m/z; the image current is a sum of sines, and the Fourier transform turns it into a spectrum | f_c = qB/(2π m); Orbitrap ω = sqrt(k·z/m); transient = sum of sines with decay; DFT on 512 points (own 30-line FFT) | radio "FT-ICR / Orbitrap"; slider "durata del transiente" (shows resolution growing with time) | `cella-icr.svg`, `orbitrap.svg` | 5-6 KB |
| `sf-mobilita` / `storia-fig-mobilita.js` | accoppiamenti | in a gas-filled drift tube ions separate by size and shape (collision cross section), not only m/z | drift velocity v = K·E; two ions with the same m/z and different cross sections; arrival-time histogram | slider "pressione del gas", "campo E" | `mobilita.svg` | 2-3 KB |
| `sf-moltiplicatore` / `storia-fig-rivelatore.js` | rivelatori-dati | one ion becomes 10^6 electrons through a cascade of dynodes (gain = δ^n) | gain δ^n for n dynodes and secondary yield δ; electrons per stage drawn as dots (log scale label) | sliders "dinodi n" (4-20), "resa δ" (1,5-4) | `moltiplicatore.svg` | 2-3 KB |

No animation is planned for the ion sources (chapter 8): the sources are told
with static SVG drawings (EI, ESI cone, MALDI plume) and the compact timeline
filtered on "Sorgenti".

### 5.4 Milestones for `STORIA.tappe` (DEV-00 writes them; Italian `perche` lines are drafts the DEV may shorten)

Only rows whose reference is `verified` in section 6. Family codes as in 5.1.

| Year | Title (IT) | People | Family | Chapter | Ref | Perché contava (draft) |
|---|---|---|---|---|---|---|
| 1886 | Raggi canale | E. Goldstein | origini | storia-origini | Goldstein 1886 | Nel tubo a scarica c'è anche qualcosa di positivo che va verso il catodo |
| 1897 | Raggi catodici: q/m dell'elettrone | J.J. Thomson | origini | storia-origini | Thomson 1897 | Primo rapporto carica/massa misurato con campi elettrici e magnetici |
| 1898 | Deviazione dei raggi positivi | W. Wien | origini | storia-origini | Wien 1898 | I raggi positivi si deviano: hanno q/m molto più piccolo degli elettroni |
| 1906 | Nobel per la fisica a Thomson | J.J. Thomson | origini | storia-mappa | N1906 | Riconosce lo studio della conduzione dell'elettricità nei gas |
| 1913 | Parabole e i due neon | J.J. Thomson | origini | storia-origini | Thomson 1913 Bakerian | Una parabola per ogni q/m: il neon ne mostra due, 20 e 22 |
| 1918 | Spettrometro a 180° con ionizzazione elettronica | A.J. Dempster | settore | storia-aston-dempster | Dempster 1918 | Focalizzazione in direzione e ioni contati come corrente |
| 1919 | Spettrografo di massa | F.W. Aston | settore | storia-aston-dempster | Aston 1919a | Righe nette su lastra: masse confrontabili con precisione |
| 1919 | Regola dei numeri interi | F.W. Aston | applicazione | storia-aston-dempster | Aston 1919b | Le masse atomiche frazionarie sono medie di isotopi |
| 1922 | Nobel per la chimica ad Aston | F.W. Aston | settore | storia-mappa | N1922 | Isotopi di molti elementi e regola dei numeri interi |
| 1923 | Trappola di Kingdon | K.H. Kingdon | ft | storia-ft | Kingdon 1923 | Ioni intrappolati da un solo campo elettrostatico: l'idea dietro l'Orbitrap |
| 1932 | Il ciclotrone | E.O. Lawrence, M.S. Livingston | ft | storia-ft | Lawrence-Livingston 1932 | La frequenza di rotazione di uno ione dipende da q/m e dal campo |
| 1933 | Masse precise e E = mc² | K.T. Bainbridge | settore | storia-settori | Bainbridge 1933 | Le masse misurate confermano l'equivalenza massa-energia |
| 1934 | Doppia focalizzazione Mattauch-Herzog | J. Mattauch, R. Herzog | settore | storia-settori | Mattauch-Herzog 1934 | Tutte le masse a fuoco su un piano |
| 1940 | Settore a 60° di Nier | A.O. Nier | settore | storia-settori | Nier 1940 | Rapporti isotopici di routine con uno strumento più semplice |
| 1947 | Moltiplicatore di elettroni migliorato | J.S. Allen | rivelatore | storia-rivelatori-dati | Allen 1947 | Contare ioni singoli |
| 1949 | Omegatron | J.A. Hipple, H. Sommer, H.A. Thomas | ft | storia-ft | Hipple-Sommer-Thomas 1949 | Misurare una massa come una frequenza |
| 1950 | Abbondanze isotopiche di riferimento | A.O. Nier | applicazione | storia-settori | Nier 1950 | Rapporti isotopici accurati per geochimica e datazioni |
| 1953 | Doppia focalizzazione Nier-Johnson | E.G. Johnson, A.O. Nier | settore | storia-settori | Johnson-Nier 1953 | Fuoco a punto con aberrazioni ridotte: alta risoluzione |
| 1953 | Filtro di massa a quadrupolo | W. Paul, H. Steinwedel | rf | storia-rf | Paul-Steinwedel 1953 | Separare le masse senza magnete |
| 1955 | TOF a due campi | W.C. Wiley, I.H. McLaren | tof | storia-tof | Wiley-McLaren 1955 | Ioni nati in punti diversi arrivano insieme: più risoluzione |
| 1959 | GC con TOF | R.S. Gohlke | accoppiamento | storia-accoppiamenti | Gohlke 1959 | Separare prima di pesare: la GC-MS |
| 1966 | Ionizzazione chimica | M.S.B. Munson, F.H. Field | sorgente | storia-sorgenti | Munson-Field 1966 | Ioni molecolari che l'EI distrugge |
| 1968 | Fasci di macroioni da uno spray | M. Dole e coll. | sorgente | storia-sorgenti | Dole 1968 | Prima idea di portare macromolecole in fase gas da uno spray |
| 1969 | Desorbimento di campo | H.D. Beckey | sorgente | storia-sorgenti | Beckey 1969 | Molecole poco volatili e instabili al calore |
| 1970 | Cromatografia di plasma (mobilità ionica) | M.J. Cohen, F.W. Karasek | accoppiamento | storia-accoppiamenti | Cohen-Karasek 1970 | Separare ioni per mobilità in un gas |
| 1971 | Ricerca in libreria al calcolatore | H.S. Hertz, R.A. Hites, K. Biemann | dati | storia-rivelatori-dati | Hertz-Hites-Biemann 1971 | Identificare uno spettro confrontandolo con migliaia di spettri noti |
| 1973 | Reflectron | B.A. Mamyrin e coll. | tof | storia-tof | Mamyrin 1973 | Lo specchio elettrostatico corregge la dispersione di energia |
| 1973 | APCI | E.C. Horning e coll. | sorgente | storia-sorgenti | Horning 1973 | Ionizzare a pressione atmosferica: sensibilità al picogrammo |
| 1973 | Liquidi direttamente in sorgente CI | M.A. Baldwin, F.W. McLafferty | accoppiamento | storia-accoppiamenti | Baldwin-McLafferty 1973 | Primo passo dell'LC-MS |
| 1974 | FT-ICR | M.B. Comisarow, A.G. Marshall | ft | storia-ft | Comisarow-Marshall 1974 | Tutte le masse insieme, risoluzione altissima |
| 1978 | Triplo quadrupolo | R.A. Yost, C.G. Enke | accoppiamento | storia-accoppiamenti | Yost-Enke 1978 | MS/MS semplice e selettiva: nasce l'MRM |
| 1979 | Piastre a microcanali | J.L. Wiza (rassegna) | rivelatore | storia-rivelatori-dati | Wiza 1979 | Rivelatori piatti e veloci, adatti al TOF |
| 1980 | ICP-MS | R.S. Houk e coll. | sorgente | storia-sorgenti | Houk 1980 | Elementi in traccia e isotopi da un plasma |
| 1981 | FAB | M. Barber e coll. | sorgente | storia-sorgenti | Barber 1981 | Peptidi e molecole polari da una matrice liquida |
| 1983 | Thermospray | C.R. Blakley, M.L. Vestal | accoppiamento | storia-accoppiamenti | Blakley-Vestal 1983 | LC-MS di routine prima dell'elettrospray |
| 1984 | Trappola ionica a instabilità di massa | G.C. Stafford e coll. | rf | storia-rf | Stafford 1984 | La trappola di Paul diventa uno spettrometro da banco |
| 1984 | Sorgente elettrospray | M. Yamashita, J.B. Fenn | sorgente | storia-sorgenti | Yamashita-Fenn 1984 | Ioni da una soluzione con uno spray carico |
| 1988 | MALDI | M. Karas, F. Hillenkamp | sorgente | storia-sorgenti | Karas-Hillenkamp 1988 | Proteine oltre 10 000 Da con una matrice organica |
| 1988 | Desorbimento laser di proteine | K. Tanaka e coll. | sorgente | storia-sorgenti | Tanaka 1988 | Proteine e polimeri fino a m/z 100 000 |
| 1989 | ESI di grandi biomolecole | J.B. Fenn e coll. | sorgente | storia-sorgenti | Fenn 1989 | Ioni multicarica: proteine su analizzatori comuni |
| 1989 | Nobel per la fisica a Paul (con Dehmelt e Ramsey) | W. Paul, H.G. Dehmelt | rf | storia-rf | N1989 | La tecnica della trappola ionica |
| 1994 | SEQUEST | J.K. Eng, A.L. McCormack, J.R. Yates III | dati | storia-rivelatori-dati | Eng-McCormack-Yates 1994 | Spettri MS/MS collegati alle sequenze di una banca dati: proteomica |
| 1996 | Q-TOF | H.R. Morris e coll. | accoppiamento | storia-accoppiamenti | Morris 1996 | Quadrupolo e TOF ortogonale: MS/MS ad alta risoluzione |
| 2000 | Orbitrap | A. Makarov | ft | storia-ft | Makarov 2000 | Alta risoluzione con una trappola solo elettrostatica |
| 2002 | Nobel per la chimica a Fenn e Tanaka | J.B. Fenn, K. Tanaka | sorgente | storia-sorgenti | N2002 | Ionizzazione morbida delle macromolecole biologiche |
| 2011 | Q-Orbitrap da banco | A. Michalski e coll. | accoppiamento | storia-accoppiamenti | Michalski 2011 | Quadrupolo + Orbitrap per la proteomica di routine |

Not in the data until verified (cite in a chapter only after checking):
Stephens 1946 (TOF idea), Soddy 1913 ("isotopo"), Dempster 1935 (²³⁵U),
first commercial Orbitrap (2005?), linear ion trap (Schwartz 2002?),
orthogonal-acceleration TOF (Dodonov / Guilhaus), moving-belt interface
(McFadden 1976?), Calutron.

Family tree edges (`STORIA.archi`): parabola (Thomson 1913) -> spettrografo
(Aston 1919); parabola -> settore 180° (Dempster 1918); settore -> doppia
focalizzazione (Mattauch-Herzog 1934, Johnson-Nier 1953); settore 180° ->
settore 60° (Nier 1940); ciclotrone (1932) -> omegatron (1949) -> FT-ICR
(1974); trappola di Kingdon (1923) -> Orbitrap (2000); quadrupolo (1953) ->
trappola di Paul -> trappola a instabilità di massa (1984); quadrupolo ->
triplo quadrupolo (1978); TOF a due campi (1955) -> reflectron (1973); TOF +
quadrupolo -> Q-TOF (1996); quadrupolo + Orbitrap -> Q-Orbitrap (2011);
cromatografia di plasma (1970) -> IM-MS. Each edge carries the ref keys of
both ends; the edge label says the idea passed on (e.g. "campo magnetico
come prisma", "frequenza invece di traiettoria").


---

## 6. References

Checked on 2026-10-31 by the ARCH against Crossref (`api.crossref.org/works/<DOI>`), nobelprize.org, jetp.ras.ru, Google Patents, archive.org and Open Library. Corrections to the hints given in the request are in the Note column ("corrected:"). Key = the id used in sections 3 and 5.4.

| Key | Authors | Year | Title | Journal / publisher | DOI or URL | Status | Note |
|---|---|---|---|---|---|---|---|
| Goldstein 1886 | E. Goldstein | 1886 | Über eine noch nicht untersuchte Strahlungsform an der Kathode inducirter Entladungen | Sitzungsber. Königl. Preuss. Akad. Wiss. Berlin 1886 (XXXIX, Gesammtsitzung 29 July 1886), 691–699 | no DOI; scan: https://archive.org/details/sitzungsberichte1886deutsch | verified (archive.org scan OCR) | Presented by Helmholtz. Reprinted in Ann. Phys. 300 (=Wied. Ann. 64), 38–48 (1898), DOI 10.1002/andp.18983000105 (Crossref verified) |
| Wien 1898 | W. Wien | 1898 | Untersuchungen über die electrische Entladung in verdünnten Gasen | Ann. Phys. 301 (=Wied. Ann. 65), 440–452 | 10.1002/andp.18983010618 | verified | Volume 301/65 correct. corrected:: the real title is the one shown here, not "deflection of canal rays" |
| Thomson 1897 | J. J. Thomson | 1897 | Cathode Rays | Phil. Mag. (5th ser.) 44, 293–316 | 10.1080/14786449708621070 | verified | – |
| Thomson 1913 Bakerian | J. J. Thomson | 1913 | Bakerian Lecture: Rays of positive electricity | Proc. R. Soc. Lond. A 89, 1–20 | 10.1098/rspa.1913.0057 | verified | – |
| Thomson 1913 book | J. J. Thomson | 1913 | Rays of Positive Electricity and their Application to Chemical Analyses | Book, Longmans, Green & Co., London | https://archive.org/details/1913raysofpositi00thomuoft (also rayspositiveele01thomgoog) | verified (archive.org metadata) | 1st ed. 1913; 2nd ed. 1921 (archive.org raysofpositivel00thomrich) |
| Aston 1919a | F. W. Aston | 1919 | A positive ray spectrograph | Phil. Mag. (6th ser.) 38, 707–714 | 10.1080/14786441208636004 | verified | – |
| Aston 1919c | F. W. Aston | 1919 | Neon | Nature 104, 334 | 10.1038/104334d0 | verified | – |
| Aston 1919b | F. W. Aston | 1919 | The Constitution of the Elements | Nature 104, 393 | 10.1038/104393b0 | verified | Aston also published further Nature notes with the same title in 1920 (105, 8; 106, 468) |
| N1922 | F. W. Aston | 1922 | Nobel Prize in Chemistry 1922; Nobel Lecture "Mass Spectra and Isotopes" (12 Dec 1922) | Nobel Lectures, Chemistry 1922–1941 (Elsevier, 1966) | https://www.nobelprize.org/prizes/chemistry/1922/aston/facts/ ; https://www.nobelprize.org/prizes/chemistry/1922/aston/lecture/ | verified | Prize citation: "for his discovery, by means of his mass spectrograph, of isotopes, in a large number of non-radioactive elements, and for his enunciation of the whole-number rule" |
| N1906 | J. J. Thomson | 1906 | Nobel Prize in Physics 1906; Nobel Lecture "Carriers of Negative Electricity" (11 Dec 1906) | Nobel Lectures, Physics 1901–1921 (Elsevier, 1967) | https://www.nobelprize.org/prizes/physics/1906/thomson/facts/ | verified | Prize citation: "in recognition of the great merits of his theoretical and experimental investigations on the conduction of electricity by gases" |
| Dempster 1918 | A. J. Dempster | 1918 | A new Method of Positive Ray Analysis | Phys. Rev. 11, 316–325 | 10.1103/PhysRev.11.316 | verified | – |
| Bainbridge 1933 | K. T. Bainbridge | 1933 | The Equivalence of Mass and Energy | Phys. Rev. 44, 123 | 10.1103/PhysRev.44.123.2 | verified | "Bainbridge 1933" is ambiguous. Other 1933 papers: "The Masses of the Lithium Isotopes", Phys. Rev. 44, 56 (10.1103/PhysRev.44.56.2); "Comparison of the masses of He and H1 on a mass-spectrograph", J. Franklin Inst. 215, 201–205 (10.1016/S0016-0032(33)91249-1) |
| Bainbridge-Jordan 1936 | K. T. Bainbridge, E. B. Jordan | 1936 | Mass Spectrum Analysis 1. The Mass Spectrograph. 2. The Existence of Isobars of Adjacent Elements | Phys. Rev. 50, 282–296 | 10.1103/PhysRev.50.282 | verified | corrected:: the full title is longer than the hint's "Mass spectrum analysis" |
| Mattauch-Herzog 1934 | J. Mattauch, R. Herzog | 1934 | Über einen neuen Massenspektrographen | Z. Phys. 89, 786–795 | 10.1007/BF01341392 | verified | – |
| Nier 1940 | A. O. Nier | 1940 | A Mass Spectrometer for Routine Isotope Abundance Measurements | Rev. Sci. Instrum. 11, 212–216 | 10.1063/1.1751688 | verified | – |
| Johnson-Nier 1953 | E. G. Johnson, A. O. Nier | 1953 | Angular Aberrations in Sector Shaped Electromagnetic Lenses for Focusing Beams of Charged Particles | Phys. Rev. 91, 10–17 | 10.1103/PhysRev.91.10 | verified | – |
| Stephens 1946 | W. E. Stephens | 1946 | A Pulsed Mass Spectrometer with Time Dispersion (APS meeting abstract) | Phys. Rev. 69, 691 (in "Proceedings of the American Physical Society") | Proceedings DOI 10.1103/PhysRev.69.674 (Crossref lists page 674 only) | to verify | Crossref has no record for the abstract itself. Page 691 inside the Proceedings is not confirmed. Do not confuse with M. M. Wolff & W. E. Stephens 1953, same title, Rev. Sci. Instrum. 24, 616–617, 10.1063/1.1770801 (verified) |
| Wiley-McLaren 1955 | W. C. Wiley, I. H. McLaren | 1955 | Time-of-Flight Mass Spectrometer with Improved Resolution | Rev. Sci. Instrum. 26, 1150–1157 | 10.1063/1.1715212 | verified | – |
| Mamyrin 1973 | B. A. Mamyrin, V. I. Karataev, D. V. Shmikk, V. A. Zagulin | 1973 | The mass-reflectron, a new nonmagnetic time-of-flight mass spectrometer with high resolution | Sov. Phys. JETP 37(1), 45 (July 1973); Russian original Zh. Eksp. Teor. Fiz. 64(1), 82 | no DOI; http://www.jetp.ras.ru/cgi-bin/e/index/e/37/1/p45?a=list | verified (jetp.ras.ru) | Co-authors added; received 21 July 1972 |
| Paul-Steinwedel 1953 | W. Paul, H. Steinwedel | 1953 | Ein neues Massenspektrometer ohne Magnetfeld | Z. Naturforsch. A 8, 448–450 | 10.1515/zna-1953-0710 | verified | Crossref adds the section prefix "Notizen:" to the title |
| N1989; Paul 1990 | W. Paul | 1989/1990 | Electromagnetic traps for charged and neutral particles (Nobel Lecture, 8 Dec 1989) | Rev. Mod. Phys. 62, 531–540 (1990) | 10.1103/RevModPhys.62.531 ; https://www.nobelprize.org/prizes/physics/1989/paul/facts/ | verified | Nobel Physics 1989: one half to N. F. Ramsey; the other half jointly to H. G. Dehmelt and W. Paul "for the development of the ion trap technique" |
| Paul patent 1960 | W. Paul, H. Steinwedel | 1960 | Apparatus for separating charged particles of different specific charges | US Patent 2,939,952, granted 7 Jun 1960 | https://patents.google.com/patent/US2939952A/en | verified (Google Patents) | corrected:: official title given here; filed 21 Dec 1954 (Ser. No. 476,812); German priority 23 Dec 1953 |
| Stafford 1984 | G. C. Stafford, P. E. Kelley, J. E. P. Syka, W. E. Reynolds, J. F. J. Todd | 1984 | Recent improvements in and analytical applications of advanced ion trap technology | Int. J. Mass Spectrom. Ion Processes 60, 85–98 | 10.1016/0168-1176(84)80077-4 | verified | – |
| Comisarow-Marshall 1974 | M. B. Comisarow, A. G. Marshall | 1974 | Fourier transform ion cyclotron resonance spectroscopy | Chem. Phys. Lett. 25, 282–283 | 10.1016/0009-2614(74)89137-2 | verified | – |
| Hipple-Sommer-Thomas 1949 | J. A. Hipple, H. Sommer, H. A. Thomas | 1949 | A Precise Method of Determining the Faraday by Magnetic Resonance | Phys. Rev. 76, 1877–1878 | 10.1103/PhysRev.76.1877.2 | verified | – |
| Lawrence-Livingston 1932 | E. O. Lawrence, M. S. Livingston | 1932 | The Production of High Speed Light Ions Without the Use of High Voltages | Phys. Rev. 40, 19–35 | 10.1103/PhysRev.40.19 | verified | Cyclotron paper. Earlier abstract: Phys. Rev. 38, 834 (1931) |
| Makarov 2000 | A. Makarov | 2000 | Electrostatic Axially Harmonic Orbital Trapping: A High-Performance Technique of Mass Analysis | Anal. Chem. 72, 1156–1162 | 10.1021/ac991131p | verified | – |
| Kingdon 1923 | K. H. Kingdon | 1923 | A Method for the Neutralization of Electron Space Charge by Positive Ionization at Very Low Gas Pressures | Phys. Rev. 21, 408–418 | 10.1103/PhysRev.21.408 | verified | – |
| Yost-Enke 1978 | R. A. Yost, C. G. Enke | 1978 | Selected ion fragmentation with a tandem quadrupole mass spectrometer | J. Am. Chem. Soc. 100, 2274–2275 | 10.1021/ja00475a072 | verified | – |
| Munson-Field 1966 | M. S. B. Munson, F. H. Field | 1966 | Chemical Ionization Mass Spectrometry. I. General Introduction | J. Am. Chem. Soc. 88, 2621–2630 | 10.1021/ja00964a001 | verified | – |
| Barber 1981 | M. Barber, R. S. Bordoli, R. D. Sedgwick, A. N. Tyler | 1981 | Fast atom bombardment of solids (F.A.B.): a new ion source for mass spectrometry | J. Chem. Soc., Chem. Commun. 1981, 325 | 10.1039/C39810000325 | verified | Companion paper: "Fast atom bombardment of solids as an ion source in mass spectrometry", Nature 293, 270–275 (1981), 10.1038/293270a0 (verified) |
| Beckey 1969 | H. D. Beckey | 1969 | Field desorption mass spectrometry: A technique for the study of thermally unstable substances of low volatility | Int. J. Mass Spectrom. Ion Phys. 2, 500–502 | 10.1016/0020-7381(69)80047-1 | verified | – |
| Blakley-Vestal 1983 | C. R. Blakley, M. L. Vestal | 1983 | Thermospray interface for liquid chromatography/mass spectrometry | Anal. Chem. 55, 750–754 | 10.1021/ac00255a036 | verified | – |
| Horning 1973 | E. C. Horning, M. G. Horning, D. I. Carroll, I. Dzidic, R. N. Stillwell | 1973 | New picogram detection system based on a mass spectrometer with an external ionization source at atmospheric pressure | Anal. Chem. 45, 936–943 | 10.1021/ac60328a035 | verified | – |
| Dole 1968 | M. Dole, L. L. Mack, R. L. Hines, R. C. Mobley, L. D. Ferguson, M. B. Alice | 1968 | Molecular Beams of Macroions | J. Chem. Phys. 49, 2240–2249 | 10.1063/1.1670391 | verified | – |
| Yamashita-Fenn 1984 | M. Yamashita, J. B. Fenn | 1984 | Electrospray ion source. Another variation on the free-jet theme | J. Phys. Chem. 88, 4451–4459 | 10.1021/j150664a002 | verified | – |
| Fenn 1989 | J. B. Fenn, M. Mann, C. K. Meng, S. F. Wong, C. M. Whitehouse | 1989 | Electrospray Ionization for Mass Spectrometry of Large Biomolecules | Science 246, 64–71 | 10.1126/science.2675315 | verified | – |
| Karas-Hillenkamp 1988 | M. Karas, F. Hillenkamp | 1988 | Laser desorption ionization of proteins with molecular masses exceeding 10,000 daltons | Anal. Chem. 60, 2299–2301 | 10.1021/ac00171a028 | verified | – |
| Tanaka 1988 | K. Tanaka, H. Waki, Y. Ido, S. Akita, Y. Yoshida, T. Yoshida, T. Matsuo | 1988 | Protein and polymer analyses up to m/z 100 000 by laser ionization time-of-flight mass spectrometry | Rapid Commun. Mass Spectrom. 2, 151–153 | 10.1002/rcm.1290020802 | verified | – |
| N2002; Fenn 2003 | J. B. Fenn, K. Tanaka, K. Wüthrich | 2002 | Nobel Prize in Chemistry 2002. Fenn Nobel Lecture (8 Dec 2002): "Electrospray Wings for Molecular Elephants" | Also printed in Angew. Chem. Int. Ed. 42, 3871–3894 (2003) | https://www.nobelprize.org/prizes/chemistry/2002/summary/ ; https://www.nobelprize.org/prizes/chemistry/2002/fenn/lecture/ ; DOI 10.1002/anie.200300605 | verified | Half to Fenn and Tanaka "for their development of soft desorption ionisation methods for mass spectrometric analyses of biological macromolecules"; half to Wüthrich. Tanaka's lecture: "The Origin of Macromolecule Ionization by Laser Irradiation" |
| Houk 1980 | R. S. Houk, V. A. Fassel, G. D. Flesch, H. J. Svec, A. L. Gray, C. E. Taylor | 1980 | Inductively coupled argon plasma as an ion source for mass spectrometric determination of trace elements | Anal. Chem. 52, 2283–2289 | 10.1021/ac50064a012 | verified | – |
| Gohlke 1959 | R. S. Gohlke | 1959 | Time-of-Flight Mass Spectrometry and Gas-Liquid Partition Chromatography | Anal. Chem. 31, 535–541 | 10.1021/ac50164a024 | verified | – |
| Gohlke-McLafferty 1993 | R. S. Gohlke, F. W. McLafferty | 1993 | Early gas chromatography/mass spectrometry | J. Am. Soc. Mass Spectrom. 4, 367–371 | 10.1016/1044-0305(93)85001-E | verified | – |
| Baldwin-McLafferty 1973 | M. A. Baldwin, F. W. McLafferty | 1973 | Liquid chromatography-mass spectrometry interface—I: The direct introduction of liquid solutions into a chemical ionization mass spectrometer | Org. Mass Spectrom. 7, 1111–1112 | 10.1002/oms.1210070913 | verified | corrected:: the full title adds the subtitle shown here |
| Arpino 1989 | P. Arpino | 1989 | Combined liquid chromatography mass spectrometry. Part I. Coupling by means of a moving belt interface | Mass Spectrom. Rev. 8, 35–55 | 10.1002/mas.1280080103 | verified | Series continues: Part II (thermospray), Mass Spectrom. Rev. 9, 631–669 (1990), 10.1002/mas.1280090603; Part III, Mass Spectrom. Rev. 11, 3–40 (1992), 10.1002/mas.1280110103 |
| Allen 1947 | J. S. Allen | 1947 | An Improved Electron Multiplier Particle Counter | Rev. Sci. Instrum. 18, 739–749 | 10.1063/1.1740838 | verified | – |
| Wiza 1979 | J. L. Wiza | 1979 | Microchannel plate detectors | Nucl. Instrum. Methods 162, 587–601 | 10.1016/0029-554X(79)90734-1 | verified | Crossref mis-parses the name as "Ladislas Wiza Joseph". Cite as J. L. Wiza |
| Cohen-Karasek 1970 | M. J. Cohen, F. W. Karasek | 1970 | Plasma Chromatography—A New Dimension for Gas Chromatography and Mass Spectrometry | J. Chromatogr. Sci. 8, 330–337 | 10.1093/chromsci/8.6.330 | verified | corrected:: the full title adds a subtitle. The modern IMS review was not specified, so it was not searched |
| Morris 1996 | H. R. Morris, T. Paxton, A. Dell, J. Langhorne, M. Berg, R. S. Bordoli, J. Hoyes, R. H. Bateman | 1996 | High Sensitivity Collisionally-activated Decomposition Tandem Mass Spectrometry on a Novel Quadrupole/Orthogonal-acceleration Time-of-flight Mass Spectrometer | Rapid Commun. Mass Spectrom. 10, 889–896 | 10.1002/(SICI)1097-0231(19960610)10:8<889::AID-RCM615>3.0.CO;2-F | verified | – |
| Michalski 2011 | A. Michalski, E. Damoc, J.-P. Hauschild, O. Lange, A. Wieghaus, A. Makarov, N. Nagaraj, J. Cox, M. Mann, S. Horning | 2011 | Mass Spectrometry-based Proteomics Using Q Exactive, a High-performance Benchtop Quadrupole Orbitrap Mass Spectrometer | Mol. Cell. Proteomics 10, M111.011015 | 10.1074/mcp.M111.011015 | verified | All 10 authors confirmed in Crossref (S. = Stevan Horning) |
| Hertz-Hites-Biemann 1971 | H. S. Hertz, R. A. Hites, K. Biemann | 1971 | Identification of mass spectra by computer-searching a file of known spectra | Anal. Chem. 43, 681–691 | 10.1021/ac60301a009 | verified | – |
| Eng-McCormack-Yates 1994 | J. K. Eng, A. L. McCormack, J. R. Yates III | 1994 | An approach to correlate tandem mass spectral data of peptides with amino acid sequences in a protein database | J. Am. Soc. Mass Spectrom. 5, 976–989 | 10.1016/1044-0305(94)80016-2 | verified | – |
| Nier 1950 | A. O. Nier | 1950 | A Redetermination of the Relative Abundances of the Isotopes of Carbon, Nitrogen, Oxygen, Argon, and Potassium | Phys. Rev. 77, 789–793 | 10.1103/PhysRev.77.789 | verified | Companion paper: Phys. Rev. 79, 450–454 (1950) on Ne, Kr, Rb, Xe and Hg, 10.1103/PhysRev.79.450 |
| Downard 2007 | K. M. Downard | 2007 | Francis William Aston: The Man Behind the Mass Spectrograph | Eur. J. Mass Spectrom. 13, 177–190 | 10.1255/ejms.878 | verified | corrected:: the author is **Kevin** M. Downard, not "Keith". Crossref's title has no "Historical account:" prefix (that may be the journal's section heading) |
| Griffiths 2008 | J. Griffiths | 2008 | A Brief History of Mass Spectrometry | Anal. Chem. 80, 5678–5683 | 10.1021/ac8013065 | verified | – |
| Grayson 2002 | M. A. Grayson (ed.) | 2002 | Measuring Mass: From Positive Rays to Proteins | Chemical Heritage Press, Philadelphia; ix + 149 pp. | ISBN 0-941901-31-9 | verified (Open Library; Crossref review in Isis 94, 348, 10.1086/379411) | – |
| Encyclopedia vol. 9 | K. A. Nier, A. L. Yergey, P. J. Gale (eds) | 2015/2016 | The Encyclopedia of Mass Spectrometry, Vol. 9: Historical Perspectives. Part A: The Development of Mass Spectrometry; Part B: Notable People in Mass Spectrometry | Elsevier | Part B ISBN 978-0-08-100379-4 (2015). Part A: Crossref chapter records carry ISBN 978-0-08-043848-1 (issued 2016); Open Library lists 978-0-08-091325-4 (2015) | to verify (Part A ISBN/year) | corrected:: the volume editors are Nier, Yergey and Gale, not Gross and Caprioli (Gross and Caprioli are the series editors; that is from memory and not checked). Part B is verified. Part A's ISBN differs between sources, so check it on the Elsevier page |
| Budzikiewicz 2006 | H. Budzikiewicz, R. D. Grigsby | 2006 | Mass spectrometry and isotopes: A century of research and discussion | Mass Spectrom. Rev. 25, 146–157 | 10.1002/mas.20061 | verified | Crossref's "issued" year is 2005 (online first); the print issue is volume 25, 2006 |
| Yates 2011 | J. R. Yates III | 2011 | A century of mass spectrometry: from atoms to proteomes | Nat. Methods 8, 633–637 | 10.1038/nmeth.1659 | verified | – |
| Nier 1990 | A. O. Nier | 1990 | Some reflections on the early days of mass spectrometry at the University of Minnesota | Int. J. Mass Spectrom. Ion Processes 100, 1–13 | 10.1016/0168-1176(90)85063-8 | verified | – |
| Marshall 1998 | A. G. Marshall, C. L. Hendrickson, G. S. Jackson | 1998 | Fourier transform ion cyclotron resonance mass spectrometry: A primer | Mass Spectrom. Rev. 17, 1–35 | 10.1002/(SICI)1098-2787(1998)17:1<1::AID-MAS1>3.0.CO;2-K | verified | – |
| Mamyrin 2001 | B. A. Mamyrin | 2001 | Time-of-flight mass spectrometry (concepts, achievements, and prospects) | Int. J. Mass Spectrom. 206, 251–266 | 10.1016/S1387-3806(00)00392-4 | verified | – |
| March 1997 | R. E. March | 1997 | An Introduction to Quadrupole Ion Trap Mass Spectrometry | J. Mass Spectrom. 32, 351–369 | 10.1002/(SICI)1096-9888(199704)32:4<351::AID-JMS512>3.0.CO;2-Y | verified | – |

Nobel prizes (from the nobelprize.org pages above): Thomson, Physics 1906; Aston, Chemistry 1922; Paul, Physics 1989 (one half to Ramsey, the other half jointly to Dehmelt and Paul, for the ion trap technique); Fenn and Tanaka, Chemistry 2002 (one half jointly, for soft desorption ionization of biological macromolecules; the other half to Wüthrich, NMR). Wien's own Nobel (Physics 1911) was for heat radiation, not for canal rays: do not link the two.

Not yet checked (cite only after verification): Soddy 1913 (word "isotope"), Dempster 1935 (uranium-235), Makarov et al. 2006 (first commercial Orbitrap), Schwartz-Senko-Syka 2002 (linear ion trap), Dodonov / Guilhaus (orthogonal TOF), McFadden 1976 (moving belt), a modern ion-mobility review.


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

1. **"dall'idra"**: read as "dalle origini" (Goldstein 1886, Thomson). If
   Federico meant something else, only chapter 2 of the part changes.
2. **BY-SA images** (Federico's choice, licences are his): the best photos
   of Aston's 3rd spectrograph, Fenn's first ESI instrument, the Bonn Paul
   trap and an Orbitrap cutaway are CC BY-SA. The rules exclude them. Allowing
   BY-SA for single image files is possible: the share-alike applies to the
   image, not to the page. It needs his yes.
3. **Portraits**: no free portrait exists for Paul, Mattauch, Makarov,
   Marshall, Karas, Hillenkamp, McLafferty or Biemann. The "Chi era" boxes stay
   text-only. Do not commission drawn portraits that imitate photos.
4. **Stephens 1946** (TOF idea) is an APS meeting abstract with no Crossref
   record of its own. It stays `to verify`. If it cannot be confirmed, the TOF
   chapter starts from Wiley-McLaren 1955 and mentions the earlier idea only
   through a verified review.
5. **Commons licences** were read through a rate-limited API: all Commons
   rows are `to verify` until DEV-01 re-opens them.
6. **Calutron** (uranium enrichment with magnetic sectors) is good history,
   but no verified text source is in section 6 yet. It stays out unless the
   chapter DEV verifies one.
7. **Numbering vs ARCH1**: both sections append chapters. Whichever merges
   second renumbers its own rows only (the `storia-` slug keeps the files
   findable).
8. **`tests/test_numerazione.py`** asserts exactly 21 chapters. DEV-00 changes
   that number to the new exact count. This updates the test, it does not
   loosen it. The COO should confirm this reading.


---

## 9. DEV prompts (order)

| # | File | Who | Depends on | Touches |
|---|---|---|---|---|
| 0 | `DEV-00-scheletro.md` | DEV | DEV8 nav (PR #10) merged | the only prompt on shared engine files: CHAPTERS, index cards, numbering test count, CSS, `storia.js`, `storia-dati.js`, `docs/IMMAGINI.md`, `tests/test_immagini.py`, empty draft chapters |
| 1 | `DEV-01-immagini-foto.md` | DEV | DEV-00 | third-party photos (section 4.4), `docs/IMMAGINI.md` "Foto", `LICENZE-TERZI.md` |
| 2 | `DEV-02-disegni-svg.md` | DEV | DEV-00 (parallel with DEV-01) | 21 original SVGs, `docs/IMMAGINI.md` "Schemi" |
| 3 | `DEV-03-cap-mappa.md` | DEV | DEV-00..02 | chapter 1 of the part + timeline + family tree |
| 4-12 | `DEV-04-cap-origini.md` … `DEV-12-cap-rivelatori-dati.md` | DEV | DEV-00..02 (DEV-06 after DEV-05; DEV-10 and DEV-12 after DEV-03) | one chapter + its figure script each, in parallel |
| 13 | `DEV-13-glossario-ricerca-link.md` | DEV | all chapters | glossary, search index, cross-links |
| 14 | `ARCH-14-revisione.md` | ARCH (Opus) | DEV-13 | cold review of every date, name, claim, licence, reference; fills DEV-15 |
| 15 | `DEV-15-pubblica.md` | DEV | ARCH-14 | applies the must-fix list and makes the part public |

The chapters stay drafts (administrator-only, `data-esteso`, noindex) until
DEV-15, so nothing unreviewed reaches the public site. DEV-15 was added to the
requested sequence because the review must come before publication.

