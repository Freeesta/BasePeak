# DEV-03 - storia chapter "La storia in una pagina"

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - storia mappa`, branch `dev/storia-mappa`, base `main`.

## 0. Confirm
One line to the COO session: `DEV storia-mappa started, branch dev/storia-mappa`.

## 1. Role
You are a DEV (Sonnet). You write ONE history chapter of the new part "VII. Storia" (Italian text), its figure(s) and its sources, following the plan `docs/piani/storia-ms.md`. You do NOT change the plan, other chapters, shared engine files or tests; you do NOT merge.

## 2. Scope
- Touches: `capitoli/NN-storia-mappa.html` and `capitoli/src/NN-storia-mappa.md` (find NN with `ls capitoli/*-storia-mappa.html`; the skeleton exists), the figure script `assets/storia-fig-linea.js` and `assets/storia-fig-albero.js`.
- Does not touch: `assets/teoria.js`, `assets/teoria.css`, `assets/storia.js`, `assets/storia-dati.js` (if a milestone is wrong there, report it, DEV-15 fixes it), `index.html`, other chapters, `docs/IMMAGINI.md`, images, tests, `tools/`, `.github/`.
- Keep the chapter a draft: `data-esteso`, noindex, header `verification: draft`, `CHAPTERS` 5th field `true` stay as they are (DEV-15 publishes the part after the cold review).
- Neighbours: the other history chapter DEVs (one file each, no overlap); start only when DEV-00, DEV-01, DEV-02 merged.

## 3. Context (read only these)
- `docs/piani/storia-ms.md`: section 1.2 (fixed elements of every chapter, links table), 3 (your outline, pasted below), 4.2 and 4.4 (images you may use: only rows with `Used in` = `mappa` that exist in `docs/IMMAGINI.md`), 5 (common rules + your figure), 6 (references: only `verified` rows), 7 (budget).
- `assets/storia.js` (`STORIA_UI.svg`, `.player`, `.lazy`, `.live`) and `TP` helpers in `assets/teoria.js`.
- `docs/COME-MODIFICARE.md` (blocks: `box key`, `details class="q"`, references list format).
- One existing chapter for tone and markup: `capitoli/09-risoluzione.html`.
- Facts rule: every date, name, number and claim must come from a `verified` reference of plan section 6, or you verify it now (Crossref, publisher page, nobelprize.org) and add it to the PR table; anything marked `(dv)` that you cannot verify is left out. Paraphrase; never translate a source sentence word by word; never reproduce a figure.
- Trap: classic scripts only (no ES modules: they fail from `file://`).
- Trap: `tools/controlla_teoria.py` checks headings, figure numbers `Figura NN.k`, `role="img"` + `aria-label` (<= 125 chars) on SVG, a `figdesc` (<= 80 words) per figure, captions on tables.

### Italian outline (from the plan, section 3)

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

## 4. Work, in order
1. Branch from fresh `origin/main`; `ls capitoli/*-storia-mappa.html` gives NN.
2. Write the Italian text following the outline and the fixed elements (plan 1.2): lead, h2/h3, "Chi era" `<details class="storia-chi">` boxes, `Perché contava` box, "Per capire meglio" links (to the technical chapters by their current file names), "Verifica" (2-3 `details class="q"`), "Fonti" (`<ul class="refs">`, only verified items, with DOI links). 900-1400 words. Dyslexia rules below.
3. Images: static figures from `albero-analizzatori.svg` as `<figure><img src="../assets/img/storia/schemi/x.svg" loading="lazy" decoding="async" width=".." height=".." alt="..."><figcaption><b>Figura NN.k</b> ... Disegno originale, CC BY 4.0.</figcaption></figure>`; photos/portraits from `assets/img/storia/foto/` only if listed in `docs/IMMAGINI.md` for this chapter, with the caption credit exactly as the `Attribuzione` column.
4. Figure: the interactive timeline (plan 5.1) and the family tree (plan 5.2), in `assets/storia-fig-linea.js` and `assets/storia-fig-albero.js`, as specified in plan 5.3 (teaching point, controls, computed live, static fallback = the SVG above, player from `STORIA_UI`, reduced motion, no colour-only encoding, aria-live step text). Host: `<div class="sim storia-fig" id="sf-..."><h4>...</h4><figure>...static img...</figure></div>` and `STORIA_UI.lazy(host, "../assets/storia-fig-....js")` from a 3-line inline call or a `data-src` attribute read by `storia.js`.
5. Also write, inside the chapter, the static `<ol>` of all milestones of `STORIA.tappe` (same text) as the no-JS fallback, and the Nobel table (`<table>` with `<caption>`, `scope=col`). The timeline script must also support a compact mode `data-filtro="sorgente"` (one family preselected, no decade slider) that DEV-10 and DEV-12 embed.
6. Write the same content in `capitoli/src/NN-storia-mappa.md` (the format of the other `src/*.md`).
7. Self-review: read every sentence against its source; list in the PR a table `claim | source key | checked (yes)`.
8. Checks, commit, push, PR (ready).

## 5. Acceptance
- `python3 tools/controlla_teoria.py` -> exit 0.
- `python3 -m pytest -q tests` -> pass (includes `tests/test_immagini.py`, `tests/test_numerazione.py`).
- `git ls-files '*.js' | xargs -n1 node --check` -> no output.
- `python3 tests_e2e/run_all.py` -> pass.
- Figure script size: `gzip -9c <file> | wc -c` -> <= 15360 (target 4000-8000).
- `grep -cE 'TODO|\?\?\?' capitoli/NN-storia-mappa.html` -> 0 (the chapter is complete even though it is still a draft).
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
