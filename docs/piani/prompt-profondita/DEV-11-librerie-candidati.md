# DEV-11 - depth: 29-librerie, 30-candidati

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - profondita librerie-candidati`, branch `dev/profondita-librerie-candidati`, base `main`.
Wave 2. Runs in parallel with every other wave-1 and wave-2 prompt (no shared hand-edited file); start it when a wave-1 slot frees up (max 4 chats of this plan at once).

## 0. Confirm
One line to the COO session: `DEV profondita-librerie-candidati started, branch dev/profondita-librerie-candidati`.

## 1. Role
You are a DEV (Sonnet). You deepen the explaining prose of 2 chapter(s) of the handbook (Italian text) following `docs/piani/profondita.md`. You do NOT change the plan, other chapters, shared engine files, tests or tools; you do NOT merge.

## 2. Scope
- Touches: `capitoli/29-librerie.html`, `capitoli/30-candidati.html`, `assets/indice-ricerca.js` (regenerated only).
- Does not touch: everything else (list in the rules below). Neighbours: the other DEV-NN of `docs/piani/prompt-profondita/` each own different chapter files.

## 3. Context (read only these)
- `docs/piani/profondita.md` (sections 1-4: why, measurements, targets, quality bar).
- Your chapter file(s) in full, and as the quality bar `capitoli/15-origine.html` (criteria explained one per h3, worked example in prose) and `capitoli/17-hr-dda.html` (numbers with arithmetic in the text).
- `docs/COME-MODIFICARE.md` section «I blocchi già pronti» (box markup).
- Measured now (`python3 docs/piani/profondita-misura.py`): `29-librerie.html` prose 599, menu 8; `30-candidati.html` prose 624, menu 9.
- Trap: the sidebar menu lists every h2/h3 outside boxes, figures and `details`: each one you remove shortens the menu.

### 29 · Librerie e falsi positivi (599 -> >= 1200, menu 8)
- `Quanti risultati sono falsi?` (27 words own): intro with a worked count: 1000 queries, a score threshold, how many wrong hits a 1% vs 5% FDR means.
- `L'approccio target-decoy` (37): explain how decoy spectra are built and why their score distribution estimates the false hits (Scheubert2017, EliasGygi2007 verified).
- `FDR e q-value`: one worked example of a q-value from a sorted list of 10 hits (compute in the text).
- `Le reti molecolari`: fine; one paragraph on what an edge means (modified cosine above a threshold, Watrous2012/Wang2016 verified).

### 30 · Formule e candidati in silico (624 -> >= 1300, menu 9)
- `Regole euristiche`: the list (Kind-Fiehn seven rules, KindFiehn2007 verified) -> 2 paragraphs explaining why each rule removes impossible formulas.
- `Dalla formula ai candidati`: worked example of how many structures one formula has in PubChem (give a number only if you look it up and write the date; otherwise generic).
- `Frammentazione in silico` (22 words own) + 3 h3: intro paragraph comparing the three ideas (break bonds, predict spectra, fingerprints); add 1-2 paragraphs to `MetFrag: rompere legami` (30 words) on how the score is formed (Ruttkies2016 verified).

## 4. Work, in order
1. Branch from fresh `origin/main`; read the files above.
2. Write the prose following the outline, section by section; keep what is already good.
3. Re-read every added sentence against its source; build the PR table `claim | source (TSV key or reference in the chapter) | checked`.
4. Regenerate the index, run the checks, commit, push, open the PR (ready for review, base `main`). The PR body has: before/after numbers from `profondita-misura.py`, the claim table, "Sources to add" (or "none"), headings kept because cited elsewhere (or "none").

## 5. Acceptance
- `python3 docs/piani/profondita-misura.py capitoli/29-librerie.html capitoli/30-candidati.html` -> `29-librerie.html` prose >= 1200, menu <= 8, prose/menu >= 150; `30-candidati.html` prose >= 1300, menu <= 9, prose/menu >= 144; prose% >= 55 for each.
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
python3 docs/piani/profondita-misura.py capitoli/29-librerie.html capitoli/30-candidati.html   # targets of section 3 met
grep -n "da verificare\|in costruzione\|TODO\|<h2>Verifica" capitoli/29-librerie.html capitoli/30-candidati.html          # no output
```

- Part VII limits (enforced by `tests/test_chemi.py`, never loosen them): every `<h2>` section, counted with everything inside it (h3, boxes, lists, tables, the references list), has <= 350 words; every `<p>` has <= 90 words; the words `fotocatal`, `prodotti di trasformazione`, `TiO` never appear; every DOI in "Per approfondire" is a `verified` row of the TSV and is already in the Chemioinformatica block of the glossary bibliography. If a section would pass 350 words, split it into two `<h2>` (merge h3 elsewhere so the menu does not grow).

## 6. Report
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines), plus the number of facts dropped or flagged.

## 7. Handoff
Above ~200k tokens of context: write a handoff block (max 15 lines: state, next step, traps) in the PR description and stop.
