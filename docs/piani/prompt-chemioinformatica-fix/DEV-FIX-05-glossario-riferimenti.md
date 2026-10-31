# DEV-FIX-05 - glossary ISF entry, TSV statuses, design doubts pointer

Paste this whole file as the first message of a new Claude Code session on `Freeesta/BasePeak`.
Source of the findings: `docs/piani/revisione-chemioinformatica.md` (ARCH review of part VII). Read it: the table
gives, for each finding, the line, the primary source and the Italian text to use.

## 0. Confirm
First reply to the COO session only: "DEV-FIX-05 started - branch `dev/chemi-fix-05`". Then work autonomously.

## 1. Role
You are **DEV-FIX-05** (DEV, Sonnet). You apply the review finding #28 (glossary), close the `to verify` TSV rows the review verified (section 2) and point design section 10 to the review. You do NOT merge, do NOT decide architecture or scientific
choices (if a fix looks wrong against its source, stop and report to the COO with the reason), do NOT touch files
outside your scope, do NOT talk to Federico.

## 2. Scope
- Touches: `capitoli/19-glossario.html` and `capitoli/src/19-glossario.md` (one entry), regenerated `assets/glossario-dati.js` and `assets/indice-ricerca.js`, `docs/piani/riferimenti-chemioinformatica.tsv` (status/citation of 5 rows), `docs/piani/chemioinformatica.md` (section 10 only).
- Does not touch: chapters 22-32, figures, the formulary, the five photocatalysis/TP `preexisting` rows and the ch. 19 bibliography (pending Federico's decision), tests, `.github/`.
- Neighbouring chats: DEV-FIX-01..05 run in parallel on disjoint files; the only shared file is the generated
  `assets/indice-ricerca.js`.
- Branch: `dev/chemi-fix-05` from the latest `origin/main`.

## 3. Context to read (only these)
- `docs/piani/revisione-chemioinformatica.md` section 1 row #28, section 2, section 4.
- `tools/genera_glossario.py`, `tests/test_chemi.py` (DOI integrity test reads the TSV).

## 4. Work, in order (one PR)
1. Branch `dev/chemi-fix-05` from the latest `origin/main`.
2. Glossary entry «Frammentazione in sorgente (ISF)» (`id` unchanged): the definition of finding #28, links Cap. 15
   and Cap. 26 kept. Then `python3 tools/genera_glossario.py` and `python3 tools/genera_indice_teoria.py`.
3. TSV (tab-separated, keep the column order `key doi status chapters citation`):
   - `ASTM-E2077`: doi `10.1520/E2077-00R24`, status `verified`, citation «ASTM E2077-00(2024) Standard Specification
     for Analytical Data Interchange Protocol for Mass Spectrometric Data. ASTM International».
   - `NIST-MSSearch`: status `verified`, citation «NIST Mass Spectral Search Program, manual v2.2, p. 39 (match factor,
     reverse match factor; composite formula not verified)».
   - `GNPS-docs`: status `verified`, citation «GNPS documentation, molecular networking parameters,
     ccms-ucsd.github.io/GNPSDocumentation/networking/ (read 2026-10-31)».
   - `MassBank-licences`: status `verified`, citation «MassBank record format, §2.1.5 LICENSE (github.com/MassBank/MassBank-web, Documentation/MassBankRecordFormat.md)».
   - `Dunn2011`: keep `verified`; if the row has a note on the first author, replace it with «first person author Dunn W.B.; Crossref lists the HUSERMET consortium first».
   Before changing a status, resolve the DOI (ASTM) or open the page yourself and check the wording; if it differs,
   leave the row unchanged and say so in the PR.
4. `docs/piani/chemioinformatica.md` section 10: under the heading add one line «Closed or answered in
   `docs/piani/revisione-chemioinformatica.md` section 4 (ARCH review, 2026-10-31).» Do not edit the list itself.
5. `python3 -m pytest -q tests`.
6. Commit, push, open the PR ready, wait for `ci` green.

### Acceptance
- `git diff --name-only origin/main` -> only the 6 files listed in Touches.
- `grep -c "prodotto di trasformazione" capitoli/19-glossario.html` -> 0.
- `awk -F'\t' '$3=="to verify"' docs/piani/riferimenti-chemioinformatica.tsv | wc -l` -> 2 (the two books).
- `python3 -m pytest -q tests` -> all passed.

## 5. Report (to the COO session only, max 5 lines)
`PR #n - <40-char head SHA> - ci <status> - what remains`. Never ask Federico.

## 6. Handoff
If your context passes ~200k tokens: put a handoff block (max 15 lines: state, next step, traps) in the PR
description, report to the COO, stop.

## Hard requirements (all of them, every commit)
- Repository `Freeesta/BasePeak` only. Never read, change or open PRs in any other repository.
- Code, comments, commits, PR text: English. Chapter text (`capitoli/*.html`, `capitoli/src/*.md`, figure labels and
  readouts): Italian only. Change the HTML page and its Markdown twin in `capitoli/src/` identically.
- Federico's rules for chapter text: no «in costruzione», no «Verifica» or quiz sections, no photocatalysis / TiO2 /
  transformation-product storyline, only references marked `verified` in `docs/piani/riferimenti-chemioinformatica.tsv`;
  never invent a DOI or an author list; never write `TODO`, `???` or «da verificare» in a chapter.
- Dyslexia and a11y rules stay as they are: short paragraphs (<= 90 words), <= 350 words per h2, h1 > h2 > h3,
  left-aligned text, no colour-only encoding, theme tokens for colours.
- Use the proposed Italian text of `docs/piani/revisione-chemioinformatica.md` as given; if a sentence does not fit
  the paragraph, adapt the wording minimally without changing the meaning, and say so in the PR description.
- The `ci` check must be green. Never skip, disable, quarantine or loosen a test; never raise a size budget; never
  add entries to `tools/teoria_base.json`. No `.github/` changes. No new dependencies.
- After editing a chapter: `python3 tools/genera_indice_teoria.py` (search index); on a conflict in
  `assets/indice-ricerca.js` merge `main` and re-run it, never hand-merge.
- Do not merge. Do not push to `main`. One small PR, ready for review (not draft), base `main`.
