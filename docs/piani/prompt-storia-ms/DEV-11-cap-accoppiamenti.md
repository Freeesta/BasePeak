# DEV-11 - storia chapter "Accoppiamenti, MS/MS e ibridi"

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - storia accoppiamenti`, branch `dev/storia-accoppiamenti`, base `main`.

## 0. Confirm
One line to the COO session: `DEV storia-accoppiamenti started, branch dev/storia-accoppiamenti`.

## 1. Role
You are a DEV (Sonnet). You write ONE history chapter of the new part "VII. Storia" (Italian text), its figure(s) and its sources, following the plan `docs/piani/storia-ms.md`. You do NOT change the plan, other chapters, shared engine files or tests; you do NOT merge.

## 2. Scope
- Touches: `capitoli/NN-storia-accoppiamenti.html` and `capitoli/src/NN-storia-accoppiamenti.md` (find NN with `ls capitoli/*-storia-accoppiamenti.html`; the skeleton exists), the figure script `assets/storia-fig-mobilita.js`.
- Does not touch: `assets/teoria.js`, `assets/teoria.css`, `assets/storia.js`, `assets/storia-dati.js` (if a milestone is wrong there, report it, DEV-15 fixes it), `index.html`, other chapters, `docs/IMMAGINI.md`, images, tests, `tools/`, `.github/`.
- Keep the chapter a draft: `data-esteso`, noindex, header `verification: draft`, `CHAPTERS` 5th field `true` stay as they are (DEV-15 publishes the part after the cold review).
- Neighbours: the other history chapter DEVs (one file each, no overlap); start only when DEV-00, DEV-01, DEV-02 merged.

## 3. Context (read only these)
- `docs/piani/storia-ms.md`: section 1.2 (fixed elements of every chapter, links table), 3 (your outline, pasted below), 4.2 and 4.4 (images you may use: only rows with `Used in` = `accoppiamenti` that exist in `docs/IMMAGINI.md`), 5 (common rules + your figure), 6 (references: only `verified` rows), 7 (budget).
- `assets/storia.js` (`STORIA_UI.svg`, `.player`, `.lazy`, `.live`) and `TP` helpers in `assets/teoria.js`.
- `docs/COME-MODIFICARE.md` (blocks: `box key`, `details class="q"`, references list format).
- One existing chapter for tone and markup: `capitoli/09-risoluzione.html`.
- Facts rule: every date, name, number and claim must come from a `verified` reference of plan section 6, or you verify it now (Crossref, publisher page, nobelprize.org) and add it to the PR table; anything marked `(dv)` that you cannot verify is left out. Paraphrase; never translate a source sentence word by word; never reproduce a figure.
- Trap: classic scripts only (no ES modules: they fail from `file://`).
- Trap: `tools/controlla_teoria.py` checks headings, figure numbers `Figura NN.k`, `role="img"` + `aria-label` (<= 125 chars) on SVG, a `figdesc` (<= 80 words) per figure, captions on tables.

### Italian outline (from the plan, section 3)

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

## 4. Work, in order
1. Branch from fresh `origin/main`; `ls capitoli/*-storia-accoppiamenti.html` gives NN.
2. Write the Italian text following the outline and the fixed elements (plan 1.2): lead, h2/h3, "Chi era" `<details class="storia-chi">` boxes, `Perché contava` box, "Per capire meglio" links (to the technical chapters by their current file names), "Verifica" (2-3 `details class="q"`), "Fonti" (`<ul class="refs">`, only verified items, with DOI links). 900-1400 words. Dyslexia rules below.
3. Images: static figures from `ibridi.svg`, `mobilita.svg` as `<figure><img src="../assets/img/storia/schemi/x.svg" loading="lazy" decoding="async" width=".." height=".." alt="..."><figcaption><b>Figura NN.k</b> ... Disegno originale, CC BY 4.0.</figcaption></figure>`; photos/portraits from `assets/img/storia/foto/` only if listed in `docs/IMMAGINI.md` for this chapter, with the caption credit exactly as the `Attribuzione` column.
4. Figure: `sf-mobilita` (plan 5.3), in `assets/storia-fig-mobilita.js`, as specified in plan 5.3 (teaching point, controls, computed live, static fallback = the SVG above, player from `STORIA_UI`, reduced motion, no colour-only encoding, aria-live step text). Host: `<div class="sim storia-fig" id="sf-..."><h4>...</h4><figure>...static img...</figure></div>` and `STORIA_UI.lazy(host, "../assets/storia-fig-....js")` from a 3-line inline call or a `data-src` attribute read by `storia.js`.
5. No extra constraints.
6. Write the same content in `capitoli/src/NN-storia-accoppiamenti.md` (the format of the other `src/*.md`).
7. Self-review: read every sentence against its source; list in the PR a table `claim | source key | checked (yes)`.
8. Checks, commit, push, PR (ready).

## 5. Acceptance
- `python3 tools/controlla_teoria.py` -> exit 0.
- `python3 -m pytest -q tests` -> pass (includes `tests/test_immagini.py`, `tests/test_numerazione.py`).
- `git ls-files '*.js' | xargs -n1 node --check` -> no output.
- `python3 tests_e2e/run_all.py` -> pass.
- Figure script size: `gzip -9c <file> | wc -c` -> <= 15360 (target 4000-8000).
- `grep -cE 'TODO|\?\?\?' capitoli/NN-storia-accoppiamenti.html` -> 0 (the chapter is complete even though it is still a draft).
- In the browser (`python3 -m http.server`, open the chapter after 5 clicks on the logo to see drafts): the figure works with mouse and keyboard only, starts paused, respects "Riduci animazioni", and works from `file://` too; screenshots at 390 px and 1280 px (light and dark) in `docs/img/` (<= 300 KB each), linked in the PR.
- Every `Fonti` item is a `verified` row of plan section 6 or listed as newly verified in the PR (with DOI).

## Rules that always apply (read before starting)
- Repository `Freeesta/BasePeak` only; never touch another repository.
- Code, comments, commits, PR text: English. Handbook files (`capitoli/`, `index.html`, captions, alt text, `docs/IMMAGINI.md` descriptions): **Italian only**.
- Dyslexia rules for handbook text: paragraphs of 2-4 sentences, one idea each; h2 every 150-300 words, h3 only under h2; lists for enumerations; left-aligned, never justified; no whole sentences in italics; Italian decimal comma; do not change the column width (60-75 characters per line comes from `assets/teoria.css`).
- `ci` must be green at your head SHA. Never skip, disable, quarantine or loosen a test; never raise a size budget to get green (shrink the file instead).
- No `.github/` changes. Do not merge. Do not push to `main`. One small PR, ready for review (not draft), base `main`.
- Facts: no date, name, claim or reference enters the handbook unless it is `verified` in `docs/piani/storia-ms.md` section 6 or you verify it yourself now (Crossref/publisher/nobelprize.org page opened). If you cannot verify it, leave it out and list it in the PR. Paraphrase; copy no sentence and no figure from any source.
- Images: only public domain, CC0, CC BY, or original drawings made for this project. Never NC, ND, BY-SA, fair use, publisher figures or AI-generated "historical" images. No hotlinking, no third-party requests.
- Report to the COO session only, one line: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines). Never ask Federico.
- Handoff: if your context passes ~200k tokens, write a handoff block (max 15 lines: state, next step, traps) in the PR description and stop.

## 6. Report
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (+ facts dropped because unverifiable).

## 7. Handoff
Above ~200k tokens: handoff block in the PR description (max 15 lines) and stop.
