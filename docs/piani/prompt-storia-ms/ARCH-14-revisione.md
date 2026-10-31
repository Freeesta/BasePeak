# ARCH-14 - storia: cold review of every date, name, claim, licence and reference

Paste as the first message of a new Claude Code session (Opus, read-only study) on `Freeesta/BasePeak`. Chat name: `ARCH - storia review`, branch `arch/storia-revisione`, base `main`.

## 0. Confirm
One line to the COO session: `ARCH storia-revisione started`.

## 1. Role
You are an ARCH (Opus), read-only reviewer. You did NOT write this part and you do not trust it: you check it cold against primary sources. You do NOT edit chapters, code, images or tests, you do NOT merge, you do NOT touch `.github/`. Your only deliverable is ONE docs-only PR adding `docs/piani/storia-ms-revisione.md` (findings) and `docs/piani/prompt-storia-ms/DEV-15-pubblica.md` updated with the exact list of corrections to apply.

## 2. Scope
- Reads: `capitoli/*-storia-*.html`, `assets/storia-dati.js`, `assets/storia*.js`, `assets/img/storia/**`, `docs/IMMAGINI.md`, `LICENZE-TERZI.md`, `docs/piani/storia-ms.md`.
- Writes: only the two files above.

## 3. Context
- The plan `docs/piani/storia-ms.md` (section 6: reference statuses, section 4: image rules). Do not assume its `verified` marks are right: re-check a sample of at least 30 % of them and all those used for a Nobel prize or a "first".
- Tools: Crossref API (`https://api.crossref.org/works/<DOI>`), publisher pages, nobelprize.org, Wikimedia Commons API (`prop=imageinfo&iiprop=extmetadata`) and the file pages.
- Trap: secondary histories disagree on "firsts" and years (conference abstract vs paper vs patent). The handbook must say which one it means ("pubblicato nel", "brevettato nel") or avoid "il primo".
- Trap: paraphrase check: look for sentences that read like translations of the cited abstract; flag them.

## 4. Work, in order
1. Build a table of every factual statement in the ten chapters and in `STORIA.tappe` (date, person, place, number, "first", Nobel motivation): `chapter | sentence (short) | claim | source given | check result (ok / wrong / unsupported) | fix`.
2. Every reference in the "Fonti" lists: authors, year, title, journal, volume, pages, DOI resolve and match.
3. Every image: re-open the source page, licence still allowed (PD, CC0, CC BY), author and attribution text exactly as required, caption carries it, file size within caps, file actually the one on the page (compare dimensions/content).
4. Every original SVG: not traced from a published figure (compare with the obvious textbook figures; flag anything that looks copied).
5. Accessibility and budgets: `python3 tools/controlla_teoria.py`, `python3 -m pytest -q tests`, gzip size of each `assets/storia*.js`, keyboard-only pass on the timeline and one animation.
6. Write `docs/piani/storia-ms-revisione.md` (findings, severity: must-fix / should-fix / note) and update `docs/piani/prompt-storia-ms/DEV-15-pubblica.md` section 4 with the exact must-fix list (file, old text, new text, source).
7. Open the docs-only PR (ready), wait for `ci` green.

## 5. Acceptance
- Every chapter sentence with a date or a name appears in the findings table with a result.
- `git diff --stat origin/main` -> only `docs/piani/storia-ms-revisione.md` and `docs/piani/prompt-storia-ms/DEV-15-pubblica.md`.
- `ci` green.

## Rules that always apply (read before starting)
- Repository `Freeesta/BasePeak` only; never touch another repository.
- Code, comments, commits, PR text: English. Handbook files (`capitoli/`, `index.html`, captions, alt text, `docs/IMMAGINI.md` descriptions): **Italian only**.
- Dyslexia rules for handbook text: paragraphs of 2-4 sentences, one idea each; h2 every 150-300 words, h3 only under h2; lists for enumerations; left-aligned, never justified; no whole sentences in italics; Italian decimal comma; do not change the column width (60-75 characters per line comes from `assets/teoria.css`).
- `ci` must be green at your head SHA. Never skip, disable, quarantine or loosen a test; never raise a size budget to get green (shrink the file instead).
- No `.github/` changes. Do not merge. Do not push to `main`. One small PR, ready for review (not draft), base `main`.
- Facts: no date, name, claim or reference enters the handbook unless it is `verified` in `docs/piani/storia-ms.md` section 6 or you verify it yourself now (Crossref/publisher/nobelprize.org page opened). If you cannot verify it, leave it out and list it in the PR. Paraphrase; copy no sentence and no figure from any source.
- Images: only public domain, CC0, CC BY, or original drawings made for this project. Never NC, ND, BY-SA, fair use, publisher figures or AI-generated "historical" images. No hotlinking, no third-party requests.
- Report to the COO session only, one line: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines). Never ask Federico.
- Handoff: if your context passes ~200k tokens, write a handoff block (max 15 lines: state, next step, traps) in the PR description and stop.

## 6. Report
COO session only: `PR #n - <40-char head SHA> - ci <status>` + counts (claims checked, wrong, unsupported; images ok / to fix).

## 7. Handoff
Above ~200k tokens: handoff block in the PR description (max 15 lines) and stop.
