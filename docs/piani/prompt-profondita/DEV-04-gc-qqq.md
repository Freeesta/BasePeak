# DEV-04 - depth: 03-gc, 08-qqq

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - profondita gc-qqq`, branch `dev/profondita-gc-qqq`, base `main`.
Wave 1. Runs in parallel with every other wave-1 and wave-2 prompt (no shared hand-edited file); the COO merges one PR at a time.

## 0. Confirm
One line to the COO session: `DEV profondita-gc-qqq started, branch dev/profondita-gc-qqq`.

## 1. Role
You are a DEV (Sonnet). You deepen the explaining prose of 2 chapter(s) of the handbook (Italian text) following `docs/piani/profondita.md`. You do NOT change the plan, other chapters, shared engine files, tests or tools; you do NOT merge.

## 2. Scope
- Touches: `capitoli/03-gc.html`, `capitoli/08-qqq.html`, `assets/indice-ricerca.js` (regenerated only).
- Does not touch: everything else (list in the rules below). Neighbours: the other DEV-NN of `docs/piani/prompt-profondita/` each own different chapter files.

## 3. Context (read only these)
- `docs/piani/profondita.md` (sections 1-4: why, measurements, targets, quality bar).
- Your chapter file(s) in full, and as the quality bar `capitoli/15-origine.html` (criteria explained one per h3, worked example in prose) and `capitoli/17-hr-dda.html` (numbers with arithmetic in the text).
- `docs/COME-MODIFICARE.md` section «I blocchi già pronti» (box markup).
- Measured now (`python3 docs/piani/profondita-misura.py`): `03-gc.html` prose 565, menu 11; `08-qqq.html` prose 654, menu 13.
- Trap: the sidebar menu lists every h2/h3 outside boxes, figures and `details`: each one you remove shortens the menu.

### 3 · Gascromatografia (565 -> >= 1800 prose words, menu 11 -> <= 10)
Most of the knowledge is in tables and long bullets (803 table/figure words, 378 list words).
- `Che cosa si può analizzare in GC`: one paragraph after the table on derivatisation: why silylation/methylation makes a polar molecule volatile (replaces an active H, removes hydrogen bonds), with one example (a carboxylic acid -> methyl ester).
- `Il gas di trasporto`: the three bullets -> one paragraph per gas with the optimal velocity numbers already in the text and why hydrogen gives the flattest curve (higher diffusion coefficient, see the Golay box).
- `L'iniettore` (only a table today): 3 paragraphs: split (what the split ratio does to the mass on column, with a number: 1 µL at 10 ng/µL with split 1:50 -> 0,2 ng on column), splitless (solvent focusing, splitless time), and the typical problems in the existing sentence expanded into why they happen.
- `La colonna capillare`: explain the phase ratio β = r / 2d_f in words with the 30 m × 0,25 mm × 0,25 µm example (β = 250) and what thicker film does.
- `La ritenzione in GC e la programmata di temperatura`: bullets -> paragraphs.
- `I rivelatori` (only a table): 2 paragraphs reading the table: which detector for which question (FID universal for organics, ECD for halogens, NPD for N/P, MS for identity).
- `GC-MS`: 5 long bullets -> 5 paragraphs (they are already prose-like, mostly re-tag and split).
- `Preparazione del campione per l'analisi ambientale` (only a table): merge into one paragraph + the table under a renamed h2 only if no other file cites it; otherwise just add 2 paragraphs (extraction vs concentration vs clean-up).
- Keep the sentence `Approfondimento: <a ...>capitolo NN (...)</a>.` exactly (the md twin test counts it).

### 8 · Il triplo quadrupolo e la CID (654 -> >= 1800 prose words, menu 13 -> <= 12)
- `Architettura` (only a figure): 2 paragraphs walking an ion through Q1 -> q2 -> Q3, with pressures (link chapter 6) and what each stage selects.
- `Come si rompono gli ioni [M+H]+`: it is a teaser for chapter 12; keep it short (it is fine) and merge it into `Riscaldamento lento a molti urti` as its last paragraph (-1 menu).
- `Le modalità di scansione` (a table + a figure): one paragraph per mode (product ion, precursor ion, neutral loss, MRM, full scan Q1/Q3), each saying which question it answers and one example (precursor ion scan of a common fragment, neutral loss of 42 for an isopropyl group: use only examples already in the site).
- `Scegliere le transizioni`: bullets -> paragraphs; SANTE ±30% and the identification points of Decisione 2002/657/CE are already in the text: keep them as they are, do not add new regulatory numbers unless you open the document (then list it under "Sources to add").
- `Dwell time, tempo di ciclo, punti per picco`: add the worked example (n transitions × (dwell + pause) = cycle; peak width / cycle = points), and point to chapter 21 for the full treatment instead of repeating it.
- `Il rivelatore`: bullets -> paragraphs.
- The two `box key` may stay; the second (QTRAP, hybrid) should become prose if it is longer than 60 words.

## 4. Work, in order
1. Branch from fresh `origin/main`; read the files above.
2. Write the prose following the outline, section by section; keep what is already good.
3. Re-read every added sentence against its source; build the PR table `claim | source (TSV key or reference in the chapter) | checked`.
4. Regenerate the index, run the checks, commit, push, open the PR (ready for review, base `main`). The PR body has: before/after numbers from `profondita-misura.py`, the claim table, "Sources to add" (or "none"), headings kept because cited elsewhere (or "none").

## 5. Acceptance
- `python3 docs/piani/profondita-misura.py capitoli/03-gc.html capitoli/08-qqq.html` -> `03-gc.html` prose >= 1800, menu <= 10, prose/menu >= 150; `08-qqq.html` prose >= 1800, menu <= 12, prose/menu >= 150; prose% >= 55 for each.
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
python3 docs/piani/profondita-misura.py capitoli/03-gc.html capitoli/08-qqq.html   # targets of section 3 met
grep -n "da verificare\|in costruzione\|TODO\|<h2>Verifica" capitoli/03-gc.html capitoli/08-qqq.html          # no output
```


## 6. Report
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines), plus the number of facts dropped or flagged.

## 7. Handoff
Above ~200k tokens of context: write a handoff block (max 15 lines: state, next step, traps) in the PR description and stop.
