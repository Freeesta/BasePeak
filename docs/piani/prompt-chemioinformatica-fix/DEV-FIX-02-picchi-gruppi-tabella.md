# DEV-FIX-02 - CWT normalisation, isotope statements, PQN, DTW cost (ch. 25, 26, 27)

Paste this whole file as the first message of a new Claude Code session on `Freeesta/BasePeak`.
Source of the findings: `docs/piani/revisione-chemioinformatica.md` (ARCH review of part VII). Read it: the table
gives, for each finding, the line, the primary source and the Italian text to use.

## 0. Confirm
First reply to the COO session only: "DEV-FIX-02 started - branch `dev/chemi-fix-02`". Then work autonomously.

## 1. Role
You are **DEV-FIX-02** (DEV, Sonnet). You apply the review findings #6, #8, #9, #10, #11 and #12 to chapters 25, 26 and 27 (text only; the figures stay as they are). You do NOT merge, do NOT decide architecture or scientific
choices (if a fix looks wrong against its source, stop and report to the COO with the reason), do NOT touch files
outside your scope, do NOT talk to Federico.

## 2. Scope
- Touches: `capitoli/25-picchi.html`, `capitoli/26-gruppi.html`, `capitoli/27-tabella.html` and their twins in `capitoli/src/`, regenerated `assets/indice-ricerca.js`.
- Does not touch: every figure file (`assets/sim-chemi-*.js`), other chapters, glossary, formulary, tests, `.github/`.
- Neighbouring chats: DEV-FIX-01..05 run in parallel on disjoint files; the only shared file is the generated
  `assets/indice-ricerca.js`.
- Branch: `dev/chemi-fix-02` from the latest `origin/main`.

## 3. Context to read (only these)
- `docs/piani/revisione-chemioinformatica.md` section 1, rows #6, #8-#12.
- The three chapters and twins. Pluskal2010 (MZmine 2) is `verified` in the TSV; copy its «Per approfondire» entry
  from `capitoli/25-picchi.html`.

## 4. Work, in order (one PR)
1. Branch `dev/chemi-fix-02` from the latest `origin/main`.
2. Ch. 25, eq. 25.4: factor 1/√*a* instead of 1/*a*, plus the sentence of finding #6 (the figure keeps 1/*a*).
3. Ch. 26: finding #8 (z = 1 and «meno di circa 90 atomi di C») and finding #9 (1,1 % per C in the table and in
   eq. 26.2, example ≈ 17,2 % with the full value 17,1 %). Keep the `data-f` attributes and ids of the table rows.
4. Ch. 27: finding #10 (PQN sentence), #11 (DTW cost sentence after eq. 27.2), #12 («(Pluskal et al., 2010)» after
   «tipico di MZmine» and the reference added to «Per approfondire»).
5. Check the word limits (<= 90 words per paragraph, <= 350 per h2): `python3 tools/controlla_teoria.py`.
6. `python3 tools/genera_indice_teoria.py`; `python3 -m pytest -q tests`.
7. Commit, push, open the PR ready, wait for `ci` green.

### Acceptance
- `git diff --name-only origin/main` -> only the 7 files listed in Touches.
- `grep -c "√<i>a</i>" capitoli/25-picchi.html` -> at least 1; `grep -c "Pluskal" capitoli/27-tabella.html` -> at least 2.
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
