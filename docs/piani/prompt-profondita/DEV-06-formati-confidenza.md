# DEV-06 - depth: 23-formati, 31-confidenza

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - profondita formati-confidenza`, branch `dev/profondita-formati-confidenza`, base `main`.
Wave 1. Runs in parallel with every other wave-1 and wave-2 prompt (no shared hand-edited file); the COO merges one PR at a time.

## 0. Confirm
One line to the COO session: `DEV profondita-formati-confidenza started, branch dev/profondita-formati-confidenza`.

## 1. Role
You are a DEV (Sonnet). You deepen the explaining prose of 2 chapter(s) of the handbook (Italian text) following `docs/piani/profondita.md`. You do NOT change the plan, other chapters, shared engine files, tests or tools; you do NOT merge.

## 2. Scope
- Touches: `capitoli/23-formati.html`, `capitoli/31-confidenza.html`, `assets/indice-ricerca.js` (regenerated only).
- Does not touch: everything else (list in the rules below). Neighbours: the other DEV-NN of `docs/piani/prompt-profondita/` each own different chapter files.

## 3. Context (read only these)
- `docs/piani/profondita.md` (sections 1-4: why, measurements, targets, quality bar).
- Your chapter file(s) in full, and as the quality bar `capitoli/15-origine.html` (criteria explained one per h3, worked example in prose) and `capitoli/17-hr-dda.html` (numbers with arithmetic in the text).
- `docs/COME-MODIFICARE.md` section «I blocchi già pronti» (box markup).
- Measured now (`python3 docs/piani/profondita-misura.py`): `23-formati.html` prose 545, menu 15; `31-confidenza.html` prose 380, menu 6.
- Trap: the sidebar menu lists every h2/h3 outside boxes, figures and `details`: each one you remove shortens the menu.

### 23 · File e formati aperti (545 -> >= 1300 prose words, menu 15 -> <= 10)
- `mzML dall'interno`: the 3-item list becomes 2 paragraphs (what each part is for when a program reads the file).
- `Il vocabolario controllato`: one paragraph on why a code (MS:1000511 for ms level, use only codes you check in `psi-ms.obo`, PSI-MS-CV is a verified TSV row) is safer than a free text name.
- `Gli array binari`: the 3-step list -> prose; explain why base64 exists (XML is text), the 4/3 growth with the existing example, and the float32 precision with the existing 0,06 ppm number.
- `L'indice`: fine, keep.
- `Gli altri formati` (h2 + 4 h3): no h3: 4 paragraphs (mzXML, MGF/MSP, JCAMP-DX/netCDF, mzTab-M), each saying what it is for and what it loses (-4 menu). Keep under 350 words with the figure host.
- `Dal formato del costruttore al formato aperto` (h2 + 2 h3): keep 1 h3 or none; the "centroid during conversion?" question deserves 2 paragraphs (irreversible; vendor algorithm; what to write in the log).
- `I metadati che contano`: 2 paragraphs reading the table (why a lost polarity or time unit changes results silently).
- The box `Errori frequenti` may stay.

### 31 · Livelli di confidenza (380 -> >= 1100 prose words, menu 6 -> <= 7)
- `Perché serve un livello`: it repeats the "Un po' di storia" details; remove the repetition and add a worked contrast: the same name reported from (a) a library hit, (b) a standard injected with the same method, and what each allows you to claim.
- `La scala di Schymanski (2014)`: one paragraph per level (1, 2a/2b, 3, 4, 5) with an example of evidence that reaches it; keep the table (Schymanski2014 verified).
- `La scala MSI (2007)`: the 4-item list stays; add one paragraph on the main difference with Schymanski (orthogonal data vs HRMS evidence).
- `Un punteggio non è un livello`: add one worked case (cosine 0,95, isomers with the same spectrum, why RT and a standard decide).
- `Che cosa riportare`: 2 paragraphs reading the table (Alseekh2021, Hollender2023 verified).
- Optional new h2 `Errori di comunicazione frequenti` only if the box `Errori frequenti` becomes prose there (then remove the box).

## 4. Work, in order
1. Branch from fresh `origin/main`; read the files above.
2. Write the prose following the outline, section by section; keep what is already good.
3. Re-read every added sentence against its source; build the PR table `claim | source (TSV key or reference in the chapter) | checked`.
4. Regenerate the index, run the checks, commit, push, open the PR (ready for review, base `main`). The PR body has: before/after numbers from `profondita-misura.py`, the claim table, "Sources to add" (or "none"), headings kept because cited elsewhere (or "none").

## 5. Acceptance
- `python3 docs/piani/profondita-misura.py capitoli/23-formati.html capitoli/31-confidenza.html` -> `23-formati.html` prose >= 1300, menu <= 10, prose/menu >= 130; `31-confidenza.html` prose >= 1100, menu <= 7, prose/menu >= 150; prose% >= 55 for each.
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
python3 docs/piani/profondita-misura.py capitoli/23-formati.html capitoli/31-confidenza.html   # targets of section 3 met
grep -n "da verificare\|in costruzione\|TODO\|<h2>Verifica" capitoli/23-formati.html capitoli/31-confidenza.html          # no output
```

- Part VII limits (enforced by `tests/test_chemi.py`, never loosen them): every `<h2>` section, counted with everything inside it (h3, boxes, lists, tables, the references list), has <= 350 words; every `<p>` has <= 90 words; the words `fotocatal`, `prodotti di trasformazione`, `TiO` never appear; every DOI in "Per approfondire" is a `verified` row of the TSV and is already in the Chemioinformatica block of the glossary bibliography. If a section would pass 350 words, split it into two `<h2>` (merge h3 elsewhere so the menu does not grow).

## 6. Report
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines), plus the number of facts dropped or flagged.

## 7. Handoff
Above ~200k tokens of context: write a handoff block (max 15 lines: state, next step, traps) in the PR description and stop.
