# DEV-FIX-05 - storia images: remove the unused calutron photo

Paste as the first message of a new Claude Code session (Sonnet) on `Freeesta/BasePeak`. Chat name: `DEV - fix storia foto`, branch `dev/fix-storia-foto`, base `main`.
Finding: `docs/piani/storia-ms-revisione.md` (S12). Parallel with DEV-FIX-01..04 (no shared file; DEV-FIX-03 places the other unused photo, `aston-spettrografo-1919.webp`, in chapter 35 and does not touch the files below).

## 0. Confirm
One line to the COO session: `DEV fix-storia-foto started, branch dev/fix-storia-foto`.

## 1. Role
You are a DEV (Sonnet). You delete one unused image and its two register rows. You do NOT touch chapters, other images or tests, do NOT merge.

## 2. Scope
- Touches: `assets/img/storia/foto/calutron-racetrack.webp` (delete), `docs/IMMAGINI.md` (its row), `LICENZE-TERZI.md` (its row).
- Does not touch: `capitoli/`, `assets/*.js`, `tests/`, `docs/piani/storia-ms.md` (plan history stays as is), `.github/`.

## 3. Context
- `calutron-racetrack.webp` (58 KB) is deployed but used by no page: `grep -rn calutron capitoli index.html assets/*.js pratica` -> no output. No chapter text talks about calutrons, and the ARCH could not re-read its Commons page (API rate limit). An unused third-party file is only weight and licence surface.
- `tests/test_immagini.py` checks that every file under `assets/img/storia/` has a row in `docs/IMMAGINI.md` and in `LICENZE-TERZI.md`, and that every row points to an existing file: delete all three together.
- If the permission classifier blocks the deletion, do not work around it: report the exact rule to the COO.

## 4. Work, in order
1. `git rm assets/img/storia/foto/calutron-racetrack.webp`.
2. `docs/IMMAGINI.md`: delete the one line that starts with ``| `assets/img/storia/foto/calutron-racetrack.webp` |``.
3. `LICENZE-TERZI.md`: delete the one line that starts with ``| `calutron-racetrack.webp` |``.
4. Run the checks, commit ("Storia: remove the unused calutron photo"), push, open the PR (ready).

## 5. Acceptance
- `grep -rn calutron docs/IMMAGINI.md LICENZE-TERZI.md assets capitoli` -> no output.
- `python3 -m pytest -q tests/test_immagini.py tests/test_integrita_sito.py` -> pass; `python3 -m pytest -q tests` -> pass; `ci` green.
- `git diff --stat origin/main` -> the three files of section 2 only.

## Rules that always apply
- Repository `Freeesta/BasePeak` only. Code, commits, PR text: English. `docs/IMMAGINI.md` descriptions: Italian.
- Never skip, disable or loosen a test; no `.github/` changes; do not merge; do not push to `main`. One small PR, ready for review.
- Report to the COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines). Never ask Federico.
