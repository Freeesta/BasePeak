# DEV-FIX-03 - optimal vs greedy matching, weighted cosine, network values (ch. 28, 29)

Paste this whole file as the first message of a new Claude Code session on `Freeesta/BasePeak`.
Source of the findings: `docs/piani/revisione-chemioinformatica.md` (ARCH review of part VII). Read it: the table
gives, for each finding, the line, the primary source and the Italian text to use.

## 0. Confirm
First reply to the COO session only: "DEV-FIX-03 started - branch `dev/chemi-fix-03`". Then work autonomously.

## 1. Role
You are **DEV-FIX-03** (DEV, Sonnet). You apply the review findings #13, #15 and #18 to chapters 28 and 29 (text only). You do NOT merge, do NOT decide architecture or scientific
choices (if a fix looks wrong against its source, stop and report to the COO with the reason), do NOT touch files
outside your scope, do NOT talk to Federico.

## 2. Scope
- Touches: `capitoli/28-somiglianza.html`, `capitoli/29-librerie.html` and their twins in `capitoli/src/`, regenerated `assets/indice-ricerca.js`.
- Does not touch: the figure files (the figure keeps the greedy rule, which the new text names), other chapters, glossary, formulary, tests, `.github/`.
- Neighbouring chats: DEV-FIX-01..05 run in parallel on disjoint files; the only shared file is the generated
  `assets/indice-ricerca.js`.
- Branch: `dev/chemi-fix-03` from the latest `origin/main`.

## 3. Context to read (only these)
- `docs/piani/revisione-chemioinformatica.md` section 1, rows #13-#18, and section 4 (D2, D3, D8).
- The two chapters and twins. Watrous2012, Bittremieux2022 and SteinScott1994 are already cited in ch. 28; Watrous2012
  in ch. 29.

## 4. Work, in order (one PR)
1. Branch `dev/chemi-fix-03` from the latest `origin/main`.
2. Ch. 28, «Accoppiare i picchi»: replace the paragraph of finding #13 with the proposed text.
3. Ch. 28, eq. 28.4: the sentence of finding #15 (Stein & Scott n = 3, m = 0,6; figure n = 1, m = 0,5).
4. Ch. 29, «Le reti molecolari»: the sentence of finding #18 (Watrous values).
5. Do not add the GNPS ±17 Da or GNPS defaults: `GNPS-docs` is not `verified` in the TSV until DEV-FIX-05 merges.
6. `python3 tools/controlla_teoria.py`; `python3 tools/genera_indice_teoria.py`; `python3 -m pytest -q tests`.
7. Commit, push, open the PR ready, wait for `ci` green.

### Acceptance
- `git diff --name-only origin/main` -> only the 5 files listed in Touches.
- `grep -c "ungherese" capitoli/28-somiglianza.html` -> at least 1; `grep -c "0,6" capitoli/28-somiglianza.html` -> at least 1.
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
