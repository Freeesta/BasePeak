# DEV-FIX-04 - Schymanski and MSI wording (ch. 31)

Paste this whole file as the first message of a new Claude Code session on `Freeesta/BasePeak`.
Source of the findings: `docs/piani/revisione-chemioinformatica.md` (ARCH review of part VII). Read it: the table
gives, for each finding, the line, the primary source and the Italian text to use.

## 0. Confirm
First reply to the COO session only: "DEV-FIX-04 started - branch `dev/chemi-fix-04`". Then work autonomously.

## 1. Role
You are **DEV-FIX-04** (DEV, Sonnet). You apply the review findings #21-#25 to chapter 31: the level table and MSI paragraph are aligned with the sources and the two leftover HTML comments are removed. You do NOT merge, do NOT decide architecture or scientific
choices (if a fix looks wrong against its source, stop and report to the COO with the reason), do NOT touch files
outside your scope, do NOT talk to Federico.

## 2. Scope
- Touches: `capitoli/31-confidenza.html`, `capitoli/src/31-confidenza.md`, regenerated `assets/indice-ricerca.js`.
- Does not touch: `assets/sim-chemi-confidenza.js` (its level logic already matches: 1 needs the standard, 2a library, 2b diagnostic, 3 candidates, 4 formula, 5 mass), other chapters, glossary, tests, `.github/`.
- Neighbouring chats: DEV-FIX-01..05 run in parallel on disjoint files; the only shared file is the generated
  `assets/indice-ricerca.js`.
- Branch: `dev/chemi-fix-04` from the latest `origin/main`.

## 3. Context to read (only these)
- `docs/piani/revisione-chemioinformatica.md` section 1, rows #21-#25, and section 4 (D5).
- Source wording (already checked by the review, do not re-open): Schymanski 2014 Fig. 1 level names and minimum data
  (1: MS, MS2, RT, reference standard; 2a: library spectrum match, unambiguous; 2b: diagnostic evidence, no other
  structure fits; 3: MS, MS2, experimental data; 4: MS isotope/adduct; 5: MS); Sumner 2007: «two independent and
  orthogonal data relative to an authentic compound analyzed under identical experimental conditions», literature
  or external data -> level 2, «Putatively characterized compound classes».

## 4. Work, in order (one PR)
1. Branch `dev/chemi-fix-04` from the latest `origin/main`.
2. Delete the two comments `<!-- to verify against source: ... -->` (HTML lines 16 and 30, and the Markdown twin).
3. Table «Livelli di Schymanski et al. (2014) e prove minime»: rows 1, 2a and 3 as in finding #22.
4. Replace the sentence of finding #23; the MSI level-1 sentence of finding #24; «characterized» (finding #25).
5. Keep the sentence «I nomi sono tradotti dall'inglese; ... La traduzione è nostra.» and the approximate
   correspondence table as they are.
6. `python3 tools/controlla_teoria.py`; `python3 tools/genera_indice_teoria.py`; `python3 -m pytest -q tests`.
7. Commit, push, open the PR ready, wait for `ci` green.

### Acceptance
- `git diff --name-only origin/main` -> only the 3 files listed in Touches.
- `grep -c "to verify" capitoli/31-confidenza.html capitoli/src/31-confidenza.md` -> 0 and 0.
- `grep -c "characterised" capitoli/31-confidenza.html` -> 0.
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
