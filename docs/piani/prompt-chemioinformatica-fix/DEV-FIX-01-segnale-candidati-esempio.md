# DEV-FIX-01 - ppm sign, dead time, isotope score, level 4 evidence (ch. 22, 30, 32)

Paste this whole file as the first message of a new Claude Code session on `Freeesta/BasePeak`.
Source of the findings: `docs/piani/revisione-chemioinformatica.md` (ARCH review of part VII). Read it: the table
gives, for each finding, the line, the primary source and the Italian text to use.

## 0. Confirm
First reply to the COO session only: "DEV-FIX-01 started - branch `dev/chemi-fix-01`". Then work autonomously.

## 1. Role
You are **DEV-FIX-01** (DEV, Sonnet). You apply the review findings #1, #2, #3, #4, #26 and #27 to chapters 22, 30 and 32 and one line of the ch. 30 figure. You do NOT merge, do NOT decide architecture or scientific
choices (if a fix looks wrong against its source, stop and report to the COO with the reason), do NOT touch files
outside your scope, do NOT talk to Federico.

## 2. Scope
- Touches: `capitoli/22-segnale.html`, `capitoli/30-candidati.html`, `capitoli/32-esempio.html` and their twins in `capitoli/src/`, `assets/sim-chemi-candidati.js` (line 32 only), regenerated `assets/indice-ricerca.js`.
- Does not touch: every other chapter and figure, `assets/chemi-common.js`, glossary and formulary (already use the right convention), tests, `.github/`.
- Neighbouring chats: DEV-FIX-01..05 run in parallel on disjoint files; the only shared file is the generated
  `assets/indice-ricerca.js`.
- Branch: `dev/chemi-fix-01` from the latest `origin/main`.

## 3. Context to read (only these)
- `docs/piani/revisione-chemioinformatica.md` sections 1 (rows #1-#4, #26, #27) and 3 (ppm convention table).
- The three chapters and their twins; `assets/sim-chemi-candidati.js` lines 1-60.
- Decision (do not re-open): ppm = (m_mis − m_teo) / m_teo × 10^6 everywhere (Brenton & Godfrey 2010, p. 1823).

## 4. Work, in order (one PR)
1. Branch `dev/chemi-fix-01` from the latest `origin/main`.
2. Ch. 30, eq. 30.1: numerator `m_mis − m_teo`, denominator `m_teo` (same markup as eq. 22.9). In
   `assets/sim-chemi-candidati.js` line 32 change `ppmOf(calc, mz)` to `ppmOf(mz, calc)`; leave line 115 as it is.
   Check with `grep -n "ppmOf\|CHEMI.ppm" assets/sim-chemi-*.js` that every call is (measured, theoretical).
3. Ch. 30, isotope paragraph: «Se M+2 e M+3 spariscono sotto la soglia, *S* scende a 0,21.» (finding #3).
4. Ch. 32, eq. 32.1: m_calc -> m_teo, and «Il valore teorico calcolato con masse.js per [M+H]+ è 237,1022» (finding #2).
5. Ch. 22, «Saturazione e tempo morto»: replace the sentence of finding #4 with the proposed text.
6. Ch. 32, compound C (finding #26): add the isotope sentence after «l'unica formula è C13H18N4O3» and change the
   level-4 sentence; check in the figure (step 4/5 table of `sim-chemi-esempio.js`) that the M+1 value it shows is
   about 16 % and adapt «circa 16 %» to the figure's value if different.
7. Ch. 32, before eq. 32.3: the sentence of finding #27.
8. `python3 tools/genera_indice_teoria.py`; `python3 tools/controlla_teoria.py`; `python3 -m pytest -q tests`.
9. Commit, push, open the PR ready, wait for `ci` green.

### Acceptance
- `git diff --name-only origin/main` -> only the 7 files listed in Touches.
- `grep -c "calc</sub> − <i>m</i><sub>mis" capitoli/30-candidati.html capitoli/src/30-candidati.md` -> 0 and 0.
- `grep -n "ppmOf(calc" assets/sim-chemi-candidati.js` -> nothing.
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
