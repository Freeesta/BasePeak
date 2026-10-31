# DEV-13 - storia: glossary, search index and cross-links

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - storia links`, branch `dev/storia-link`, base `main`.

## 0. Confirm
One line to the COO session: `DEV storia-link started, branch dev/storia-link`.

## 1. Role
You are a DEV (Sonnet). After the ten history chapters (DEV-03..DEV-12) are merged, you connect the part to the rest of the handbook. You do NOT rewrite chapter text, do NOT publish the part (DEV-15 does, after the cold review), do NOT merge.

## 2. Scope
- Touches: `capitoli/19-glossario.html` and `capitoli/src/19-glossario.md` (new terms), generated `assets/glossario-dati.js` and `assets/indice-ricerca.js`, ONE line "Per la storia: ..." at the end of the first h2 (or in "Per approfondire") of each technical chapter listed in plan 1.2 (`04-esi`, `05-ei-ci`, `07-quadrupolo`, `08-qqq`, `09-risoluzione`, `03-gc`, `02-lc`, `10-dati`, `11-formula`) plus their `src/*.md`; the "Per capire meglio" links inside the history chapters if a target is wrong.
- Does not touch: `assets/teoria.js`, CSS, the `storia*.js` files, images, tests, `tools/`, `.github/`.
- Neighbours: none running on these files (the chapter DEVs are done). If ARCH1 cheminformatics also edits the glossary at the same time, go in series (ask the COO).

## 3. Context
- `docs/piani/storia-ms.md` sections 1.2 (links table, glossary terms) and 3.
- `docs/COME-MODIFICARE.md` (glossary: `python3 tools/genera_glossario.py`, search: `python3 tools/genera_indice_teoria.py`).
- The glossary format in `capitoli/19-glossario.html` (`<dt>`/`<dd>`, alphabetical).
- Trap: the generated files are committed; regenerate them after every edit, never hand-edit them.
- Trap: link history chapters by their actual file names (`ls capitoli/*-storia-*.html`).

## 4. Work, in order
1. Branch from fresh `origin/main`.
2. Glossary terms (Italian, 1-3 sentences each, link to the history chapter): raggi canale; spettrografo di massa; regola dei numeri interi; frazione di impaccamento (packing fraction); doppia focalizzazione; reflectron; trappola di Paul; omegatron; trappola di Kingdon; ionizzazione morbida; matrice (MALDI); mobilità ionica. Skip a term if it already exists: add the history link to it instead.
3. Cross-links: one sentence per technical chapter, e.g. `<p class="storia-link">Per la storia: <a href="NN-storia-rf.html">Campi a radiofrequenza</a>.</p>`.
4. Check every `href` inside the ten history chapters points to an existing chapter and anchor (`python3 -m pytest -q tests/test_integrita_sito.py`).
5. Regenerate glossary and search index; commit; push; PR (ready).

## 5. Acceptance
- `python3 tools/genera_glossario.py && python3 tools/genera_indice_teoria.py && git diff --stat` -> only the expected files changed.
- `grep -c 'storia-' assets/indice-ricerca.js` -> > 0; `grep -c 'storia-' assets/glossario-dati.js` -> >= 10.
- `python3 tools/controlla_teoria.py`, `python3 -m pytest -q tests`, `python3 tests_e2e/run_all.py` -> pass.
- Search in the browser for "Aston", "reflectron", "Orbitrap" finds the history chapters (screenshot in the PR).

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
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains`.

## 7. Handoff
Above ~200k tokens: handoff block in the PR description (max 15 lines) and stop.
