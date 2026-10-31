# DEV-15 - storia: apply the review and publish the part

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - storia publish`, branch `dev/storia-pubblica`, base `main`. Start only after the ARCH-14 review PR is merged (this file is then updated with the exact corrections).

## 0. Confirm
One line to the COO session: `DEV storia-pubblica started, branch dev/storia-pubblica`.

## 1. Role
You are a DEV (Sonnet). You apply the must-fix list of `docs/piani/storia-ms-revisione.md` and make the part public. You do NOT add new content, do NOT merge.

## 2. Scope
- Touches: `capitoli/*-storia-*.html` and `capitoli/src/*-storia-*.md` (corrections; drop `data-esteso`, the noindex meta, header `verification: verified`), `assets/storia-dati.js` (corrections), `assets/teoria.js` (remove the 5th field `true` from the ten history rows only), `index.html` (remove `hidden` from the "VII. Storia" group), `docs/IMMAGINI.md` / `LICENZE-TERZI.md` (corrections only), regenerated `assets/indice-ricerca.js`.
- Does not touch: tests, CSS, other chapters, `.github/`.

## 3. Context
- `docs/piani/storia-ms-revisione.md` (must-fix list) and `docs/piani/storia-ms.md`.
- Trap: a published chapter must contain no `TODO`, `???` or "da verificare" (`tools/controlla_teoria.py` rule E).

## 4. Work, in order
1. Branch from fresh `origin/main`.
2. Apply each must-fix exactly as listed (the list is pasted here by ARCH-14):
   - (to be filled by ARCH-14)
3. Publish: remove the draft markers listed in scope; regenerate the search index (`python3 tools/genera_indice_teoria.py`).
4. Checks, commit, push, PR (ready).

## 5. Acceptance
- `grep -l 'data-esteso' capitoli/*-storia-*.html` -> no output; `grep -c 'VII. Storia", true' assets/teoria.js` -> 0.
- `python3 tools/controlla_teoria.py`, `python3 -m pytest -q tests`, `python3 tests_e2e/run_all.py` -> pass.
- The public menu (no administrator flag) lists the ten history chapters under "VII. Storia"; the index page shows the card group.

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
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains`.

## 7. Handoff
Above ~200k tokens: handoff block in the PR description (max 15 lines) and stop.
