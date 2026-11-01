# DEV-01 - depth: 18-disegno, 21-tempi

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - profondita disegno-tempi`, branch `dev/profondita-disegno-tempi`, base `main`.
Wave 1. Runs in parallel with every other wave-1 and wave-2 prompt (no shared hand-edited file); the COO merges one PR at a time.

## 0. Confirm
One line to the COO session: `DEV profondita-disegno-tempi started, branch dev/profondita-disegno-tempi`.

## 1. Role
You are a DEV (Sonnet). You deepen the explaining prose of 2 chapter(s) of the handbook (Italian text) following `docs/piani/profondita.md`. You do NOT change the plan, other chapters, shared engine files, tests or tools; you do NOT merge.

## 2. Scope
- Touches: `capitoli/18-disegno.html`, `capitoli/21-tempi.html`, `assets/indice-ricerca.js` (regenerated only).
- Does not touch: everything else (list in the rules below). Neighbours: the other DEV-NN of `docs/piani/prompt-profondita/` each own different chapter files.

## 3. Context (read only these)
- `docs/piani/profondita.md` (sections 1-4: why, measurements, targets, quality bar).
- Your chapter file(s) in full, and as the quality bar `capitoli/15-origine.html` (criteria explained one per h3, worked example in prose) and `capitoli/17-hr-dda.html` (numbers with arithmetic in the text).
- `docs/COME-MODIFICARE.md` section «I blocchi già pronti» (box markup).
- Measured now (`python3 docs/piani/profondita-misura.py`): `18-disegno.html` prose 473, menu 14; `21-tempi.html` prose 339, menu 6.
- Trap: the sidebar menu lists every h2/h3 outside boxes, figures and `details`: each one you remove shortens the menu.

### 18 · Disegno sperimentale e strutture (473 -> >= 1800 prose words, menu 14 -> <= 11)
Today almost every section is a 1-2 line statement plus a list or table. Turn the lists into explanation; keep a list only for a real checklist.
- `Dalla domanda al disegno`: two paragraphs on why every decision is written before the first injection (a design chosen after seeing the data adapts to the noise). One worked count: a time series with 6 sampling times, 3 independent replicates, blanks, an untreated control and QC every 5-10 injections: how many injections, and how long the sequence is at a given run time.
- `Bianchi e controlli`: before the table, one paragraph per blank type saying which question it answers (solvent blank: carry-over and system background; procedural blank: contamination from preparation; matrix blank: endogenous interferences; untreated control: losses not caused by the treatment, e.g. adsorption on the vial). One paragraph on carry-over: a solvent blank right after the highest standard, what an acceptable carry-over looks like (give a number only from a source you open, else the English comment flag).
- `Repliche`: explain what the standard deviation of each replicate type contains and why three injections of one vial underestimate the experiment's variability; one number: the Student t factor for a 95% interval with n = 3 (2 degrees of freedom) is 4,30, with n = 6 it is 2,57 (standard t table), so three replicates give a wide interval.
- `Controlli di qualità (QC)`: rewrite the list as 3-4 paragraphs (conditioning, control standard, pooled QC, internal standard): what each detects, what you do when one fails. Pooled QC in untargeted work: Broadhurst2018 (TSV row, verified) for the use of QC to filter features; Dunn2011 (TSV, verified) for the QC-based workflow. Bioanalytical acceptance limits (±15%, ±20% at the lowest level) only if you open the guideline (ICH M10 / EMA) and cite it in the PR's "Sources to add" table; otherwise keep the existing wording.
- `Taratura`: why matrix-matched standards (ion suppression, chapter 4), why independent dilutions (error propagation of a serial dilution, with a 2-line numeric example: a 2% error on the stock is carried into every level), why bracketing.
- `Randomizzazione e blocchi`: worked example: 18 samples of 3 conditions over 2 days, how the blocks are built and why the order inside a block is drawn with a random generator.
- `La sequenza di iniezione`: one paragraph per block of the table explaining the reason for its position.
- Move `Controllo prima di iniziare` (h2, a checklist) into a `box lab` titled «Prima di iniziare» at the end of `La sequenza di iniezione` (-1 menu entry; the checklist list may stay).
- `Rappresentare le strutture in un rapporto`: merge h3 `SMILES` and `Figure e tabelle di strutture` into one h3 `Scrivere la struttura: SMILES e figure`; fold `Quanto è sicura la struttura?` into the end of `Molecola o ione?` as one paragraph pointing to chapter 31 (-2 menu entries). Before renaming, grep for the old titles (see rules).

### 21 · Tempi degli analizzatori (339 -> >= 1100 prose words, menu stays 6)
- `21.1 Le tre definizioni fondamentali`: the three definitions are long list items; rewrite each as a short paragraph with one worked number (dwell 20 ms x 50 transitions + pauses -> cycle time; 900 Da swept in 0,45 s -> 2000 Da/s; duty cycle of a 1 Da window over 900 Da = 0,11%, already in the text: reuse it once, do not repeat).
- `21.2 Il quadrupolo in full scan e in MRM`: add the consequence for sensitivity: why SIM/MRM gains roughly the ratio of the swept range to the window (same numbers as above), and the price (no spectrum).
- `21.3 TOF e Orbitrap in full scan`: rewrite the two bullets as paragraphs; TOF: duty cycle of orthogonal acceleration depends on the m/z (fill length vs flight distance; Guilhaus2000 is a verified TSV row, use only what it says); Orbitrap: injection time, AGC, transient length vs resolution (R proportional to transient time is already in the text as eq. 21.2; explain it in words with the 128 ms / 256 ms example).
- `21.4 Confronto diretto in full scan`: 2 paragraphs reading the table: which analyser for which question (quantification of a list vs screening).
- The two boxes may stay; do not add a box.

## 4. Work, in order
1. Branch from fresh `origin/main`; read the files above.
2. Write the prose following the outline, section by section; keep what is already good.
3. Re-read every added sentence against its source; build the PR table `claim | source (TSV key or reference in the chapter) | checked`.
4. Regenerate the index, run the checks, commit, push, open the PR (ready for review, base `main`). The PR body has: before/after numbers from `profondita-misura.py`, the claim table, "Sources to add" (or "none"), headings kept because cited elsewhere (or "none").

## 5. Acceptance
- `python3 docs/piani/profondita-misura.py capitoli/18-disegno.html capitoli/21-tempi.html` -> `18-disegno.html` prose >= 1800, menu <= 11, prose/menu >= 150; `21-tempi.html` prose >= 1100, menu <= 6, prose/menu >= 150; prose% >= 55 for each.
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
python3 docs/piani/profondita-misura.py capitoli/18-disegno.html capitoli/21-tempi.html   # targets of section 3 met
grep -n "da verificare\|in costruzione\|TODO\|<h2>Verifica" capitoli/18-disegno.html capitoli/21-tempi.html          # no output
```


## 6. Report
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines), plus the number of facts dropped or flagged.

## 7. Handoff
Above ~200k tokens of context: write a handoff block (max 15 lines: state, next step, traps) in the PR description and stop.
