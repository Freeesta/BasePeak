# DEV-03 - depth: 13-ei-metodo

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - profondita ei-metodo`, branch `dev/profondita-ei-metodo`, base `main`.
Wave 1. Runs in parallel with every other wave-1 and wave-2 prompt (no shared hand-edited file); the COO merges one PR at a time.

## 0. Confirm
One line to the COO session: `DEV profondita-ei-metodo started, branch dev/profondita-ei-metodo`.

## 1. Role
You are a DEV (Sonnet). You deepen the explaining prose of 1 chapter(s) of the handbook (Italian text) following `docs/piani/profondita.md`. You do NOT change the plan, other chapters, shared engine files, tests or tools; you do NOT merge.

## 2. Scope
- Touches: `capitoli/13-ei-metodo.html`, `assets/indice-ricerca.js` (regenerated only).
- Does not touch: everything else (list in the rules below). Neighbours: the other DEV-NN of `docs/piani/prompt-profondita/` each own different chapter files.

## 3. Context (read only these)
- `docs/piani/profondita.md` (sections 1-4: why, measurements, targets, quality bar).
- Your chapter file(s) in full, and as the quality bar `capitoli/15-origine.html` (criteria explained one per h3, worked example in prose) and `capitoli/17-hr-dda.html` (numbers with arithmetic in the text).
- `docs/COME-MODIFICARE.md` section «I blocchi già pronti» (box markup).
- Measured now (`python3 docs/piani/profondita-misura.py`): `13-ei-metodo.html` prose 956, menu 21.
- Trap: the sidebar menu lists every h2/h3 outside boxes, figures and `details`: each one you remove shortens the menu.

### 13 · Risolvere uno spettro EI: il metodo (956 -> >= 2600 prose words, menu 21 -> <= 15)
The content is good but lives in long, dense bullets (976 list words) and in tables; many h3 have 0 prose words. Rewrite bullets as paragraphs, keep the step numbers (1.3, 2.1 ...) of McLafferty-Tureček that the chapter already uses.
- `Il procedimento in una pagina`: keep the table; add 2 paragraphs on why the order goes from certain to interpretative (the box says it: merge the box into the prose, -1 box).
- `Prima di interpretare: leggere lo spettro`: 5 long bullets -> 5 short paragraphs (base peak vs molecular ion; groups of peaks; start from high mass; noise of library intensities; peaks that are not the compound, with the m/z list kept inline).
- `Fase 1: la composizione elementare`: bullets -> paragraphs, each with the numeric rule already in the text (A+2 ratios, nC from M+1 / 1,1, RDB); keep the chlorobenzene worked example and add one more line of arithmetic for the RDB (6 − 3 + 1 = 4).
- `Fase 2: lo ione molecolare` (h2 with 0 words): give it an intro paragraph. Merge h3 `I tre test per M` and `Ioni a elettroni pari e dispari` into one h3 `I tre test per M e la parità degli elettroni` (-1 menu). Keep `Quando lo ione molecolare non c'è`.
- `I meccanismi`: keep the 6 mechanism h3 (each is a real concept), but each gets: when it happens, one example with m/z, how to recognise it in a spectrum. Fold `Altri riarrangiamenti utili` (a list, 0 prose) into the end of `Benzile e tropilio, fenile, benzoile` as two paragraphs (-1 menu).
- `Fase 3` and `Fase 4` (0 prose words each): bullets -> paragraphs; Fase 3 explains the "ruler" of the alkyl series with a numeric example; Fase 4 explains how to rank candidate structures.
- `Esempio svolto: 2-esanone` (12 prose words + a table): write the reasoning as 5-7 short paragraphs following the 4 phases (M 100, McLafferty 58, alpha cleavage 43 and 85), keeping the table.
- `Esempio a metà: butirrofenone` and `Tre spettri da risolvere`: these are worked exercises with `<details>` answers, not a quiz: keep them, do not add new ones. Merge the two h2 into one h2 `Esempi da completare` with two h3 (-1 menu) only if the result reads well; otherwise leave them.
- Sources: McLaffertyTurecek1993 is `to verify` in the TSV: do not add new citations of it; the chapter's existing reference list stays.

## 4. Work, in order
1. Branch from fresh `origin/main`; read the files above.
2. Write the prose following the outline, section by section; keep what is already good.
3. Re-read every added sentence against its source; build the PR table `claim | source (TSV key or reference in the chapter) | checked`.
4. Regenerate the index, run the checks, commit, push, open the PR (ready for review, base `main`). The PR body has: before/after numbers from `profondita-misura.py`, the claim table, "Sources to add" (or "none"), headings kept because cited elsewhere (or "none").

## 5. Acceptance
- `python3 docs/piani/profondita-misura.py capitoli/13-ei-metodo.html` -> `13-ei-metodo.html` prose >= 2600, menu <= 15, prose/menu >= 150; prose% >= 55 for each.
- All the checks of the "Checks" block pass; `ci` green at the head SHA.

## Rules that always apply (read before starting)
- Repository `Freeesta/BasePeak` only. Code, comments, commits, PR text in English; handbook text (`capitoli/`, captions) in **Italian only**.
- **Prose first.** The goal of this plan (`docs/piani/profondita.md`) is explanation a PhD student in analytical chemistry can learn from: why it works, how it is done, a worked example with numbers, the common mistake. A list stays a list only for a real enumeration of short items (<= 7 items, <= 25 words each); a longer item becomes a paragraph. Boxes are for one key idea, not for the main explanation.
- **Dyslexia rules:** paragraphs of 2-4 sentences, one idea each, <= 90 words; an h2 every 150-300 words; h3 only under h2; no walls of text, no whole sentences in italics, no justified text; Italian decimal comma; short sentences, active voice.
- **Menu:** do not add headings to look complete. Merging thin sub-sections into fuller ones is wanted when it shortens the menu. Before renaming or removing a heading, run `grep -rn "«<old title>»\|#<old-slug>" capitoli index.html pratica assets/*.js`; if another file cites it, keep the title unchanged (you do not edit other files) and say so in the PR.
- **No** `Verifica` section, quiz, «Domande di ripasso», «Autoverifica», new `details class="poe"`/`class="q"`; **no** «Capitolo in costruzione», TODO or placeholder text; no new figures, tables, interactive figures or numbered equations (never renumber the existing ones: the formulary cites them).
- **Facts:** every number, name or claim you add comes from a source you can open: the chapter's own `Per approfondire` list or a `verified` row of `docs/piani/riferimenti-chemioinformatica.tsv`, or textbook-standard knowledge you are certain of. If you cannot verify a fact, leave it out, or keep it with an English HTML comment right after it: `<!-- to verify against source: <what and where> -->`. Never write the Italian phrase «da verificare». Paraphrase; never copy a sentence from a source.
- **DOIs:** every DOI on the site must be a row once in `docs/piani/riferimenti-chemioinformatica.tsv` (`pytest -k doi`). You do **not** edit the TSV or the glossary (other chats run in parallel): cite only DOIs already in the TSV. A new source you need goes into a table "Sources to add" in the PR description (citation, DOI, opened on Crossref: yes, sentence it supports); DEV-16 adds it at the end.
- **Open decision (do not anticipate it):** Federico has not yet decided whether the photocatalysis / transformation-product (TP) story stays in the handbook. Do not expand and do not remove TP- or TiO2-specific text; new prose uses generic words («composto di partenza», «prodotto di degradazione», «metabolita»).
- **Twins:** do not edit `capitoli/src/*.md`. Keep every sentence `Approfondimento: <a href="NN-x.html">capitolo NN (...)</a>.` exactly as it is (tests count them in the html and the md twin).
- Static pages, offline, no new dependencies, no network requests, no `.github/` changes, no test or tool changes, never loosen a test or a budget.
- Not touched: `assets/teoria.js`, `assets/teoria.css`, every `sim-*.js`, `capitoli/19-glossario.html`, `capitoli/20-formulario.html`, other chapters, `index.html`, `docs/`, `tools/`, `tests/`.

## Generated files
- After any heading change: `python3 tools/genera_indice_teoria.py` (writes `assets/indice-ricerca.js`), then `python3 tools/genera_indice_teoria.py --controlla` -> exit 0. Commit the regenerated file.
- `python3 tools/genera_glossario.py` -> `git diff --stat assets/glossario-dati.js` must be empty (you do not touch the glossary; if it changes, stop and report).
- `assets/indice-ricerca.js` is the one file all chats of this plan regenerate. If merging `origin/main` conflicts on it: `git checkout --theirs assets/indice-ricerca.js` (or take either side), rerun `python3 tools/genera_indice_teoria.py`, commit. Never edit it by hand.

## Checks (all must pass before the PR is marked ready)
```
python3 -m pip install -r tests/requirements.txt
python3 tools/controlla_teoria.py                                   # exit 0
python3 -m pytest -q tests                                          # pass
git ls-files '*.js' '*.mjs' | xargs -n1 node --check                # no output
python3 tests_e2e/run_all.py                                        # all pass
python3 tools/genera_indice_teoria.py --controlla                   # exit 0
python3 docs/piani/profondita-misura.py capitoli/13-ei-metodo.html   # targets of section 3 met
grep -n "da verificare\|in costruzione\|TODO\|<h2>Verifica" capitoli/13-ei-metodo.html          # no output
```


## 6. Report
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines), plus the number of facts dropped or flagged.

## 7. Handoff
Above ~200k tokens of context: write a handoff block (max 15 lines: state, next step, traps) in the PR description and stop.
