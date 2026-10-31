# DEV-02 - storia: original SVG drawings of the instruments

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - storia drawings`, branch `dev/storia-schemi`, base `main`.

## 0. Confirm
One line to the COO session: `DEV storia-schemi started, branch dev/storia-schemi`.

## 1. Role
You are a DEV (Sonnet). You draw by hand (SVG source written by you) the 21 original schematics of plan section 4.2. They are new drawings of physical principles, not copies or traces of any published figure. You do NOT place them in chapters, do NOT write chapter text, do NOT merge.

## 2. Scope
- Touches: `assets/img/storia/schemi/*.svg` (new), `docs/IMMAGINI.md` (the "Schemi" table rows).
- Does not touch: chapters, JS, CSS, tests, `LICENZE-TERZI.md` (original drawings are covered by the section DEV-00 wrote), `.github/`.
- Neighbours: DEV-01 (third-party photos, may run in parallel; it edits only the "Foto" table of `docs/IMMAGINI.md`). The chapter DEVs (DEV-03..DEV-12) use your files as static figures and as the first frame of their animations: keep the geometry described in 4.2 and 5.3.

## 3. Context
- `docs/piani/storia-ms.md` sections 4.2 (list and common spec), 5.3 (the animation that each drawing is the first frame of: same geometry and labels).
- Existing hand-written SVGs in `capitoli/07-quadrupolo.html` (style, colours `#2b5c8a`, `#c2410c`, `#24231f`, fonts `system-ui`).
- Physics to respect (draw it right): Dempster 180° sector refocuses a diverging beam after half a circle; Nier's sector is 60° symmetric (source and collector on lines through the apex); Mattauch-Herzog: electric sector of 31,8° (π/(4√2) rad) then a 90° magnetic sector, focal PLANE; Nier-Johnson: 90° electric then 60° magnetic, focal POINT; the reflectron: faster ions penetrate deeper; Orbitrap: spindle-shaped central electrode, barrel-shaped outer electrode split at the equator, ions rotate around and oscillate along z.
- Trap: dark theme. Do not draw a white background rectangle (`controlla_teoria.py` rejects fixed white backgrounds in inline styles, and on dark backgrounds it glares); use `currentColor` for strokes and text that must follow the theme, and the two accent colours for the ions.

## 4. Work, in order
1. Branch from fresh `origin/main`.
2. Write the 21 SVG files of 4.2, each with `viewBox`, `role="img"`, an Italian `<title>`, Italian labels >= 12 px at 720 px width, <= 25 KB, no scripts/events/external refs/raster.
3. Check each in a browser at 360 px and 720 px wide, light and dark (`python3 -m http.server`, a scratch HTML page that you do not commit), and with high-contrast background.
4. Add the rows to `docs/IMMAGINI.md` ("Schemi" table): `Fonte` = `disegno originale`, `Autore` = `BasePeak`, `Licenza` = `Originale (CC BY 4.0, BasePeak)`, `Stato` = `verificata AAAA-MM-GG`.
5. Checks, commit ("Add original SVG schematics for the Storia part"), push, PR (ready) with a contact sheet screenshot (`docs/img/storia-schemi.png`, <= 300 KB, not under `assets/`).

## 5. Acceptance
- `ls assets/img/storia/schemi/*.svg | wc -l` -> 21.
- `find assets/img/storia/schemi -name '*.svg' -size +25k` -> no output.
- `grep -lE '<script|on[a-z]+=|href="http' assets/img/storia/schemi/*.svg` -> no output.
- `python3 -m pytest -q tests` and `python3 tests_e2e/run_all.py` -> pass.

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
