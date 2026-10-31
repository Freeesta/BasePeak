# DEV-01 - storia: download and license the third-party historical images

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - storia images`, branch `dev/storia-immagini`, base `main`.

## 0. Confirm
One line to the COO session: `DEV storia-immagini started, branch dev/storia-immagini`.

## 1. Role
You are a DEV (Sonnet). You download the approved third-party images of plan section 4.4, re-check each licence on its source page, resize/compress them and register them. You do NOT choose new images outside the list (propose them in the PR instead), do NOT write chapter text, do NOT place images in chapters, do NOT merge.

## 2. Scope
- Touches: `assets/img/storia/foto/*.webp|.jpg` (new), `docs/IMMAGINI.md` (rows of these files), `LICENZE-TERZI.md` (rows of these files in the section "Immagini della Storia").
- Does not touch: chapters, `assets/*.js`, `assets/teoria.css`, tests, `tools/`, `.github/`.
- Neighbours: DEV-00 (skeleton, merged before you start: `docs/IMMAGINI.md` and `tests/test_immagini.py` exist); DEV-02 (original SVG drawings, `assets/img/storia/schemi/`, may run in parallel: you only append rows to the "Foto" table, DEV-02 to the "Schemi" table, so the files do not conflict).

## 3. Context
- `docs/piani/storia-ms.md` sections 4 (rules, 4.1 format, 4.3 test, 4.4 list of approved images).
- `tests/test_immagini.py` (what is checked).
- Use ONLY the rows of 4.4 whose licence is `Pubblico dominio`, `CC0` or `CC BY x.y`. Rows marked `doubtful` or `to verify`: open the page; take the image only if the page states an allowed licence AND, for public domain, a credible reason (author died > 70 years ago, US federal work, published before 1930 in the US, explicit PD dedication by the author). Otherwise skip it and list it in the PR.
- Licence check: use the Commons API for the exact file (`https://commons.wikimedia.org/w/api.php?action=query&titles=File:<name>&prop=imageinfo&iiprop=url|size|extmetadata&format=json`), read `LicenseShortName`, `Artist`, `DateTimeOriginal`, `Credit`, `UsageTerms`, and ALSO open the file page: a licence template on the page wins over the metadata.
- Trap: Commons "own work" uploads of photos of living people or of museum objects can be wrong; if the uploader is plainly not the photographer, skip.
- Trap: a CC BY image must keep its attribution exactly as the author asks; write "ritagliata e ridimensionata" when you change it.

## 4. Work, in order
1. Branch from fresh `origin/main`.
2. For each approved row: download the original from `upload.wikimedia.org` (exact URL from the API), keep the original only in your scratch directory (never commit it).
3. Convert: portraits 240x300 (crop to the face and shoulders, keep the original aspect where possible), instruments/plates max 720 px wide; WebP quality 70-80 (or progressive JPEG 75 for photos that band); strip metadata. Tools: Pillow (`pip install pillow` in a venv, not a repo dependency) or `cwebp` if present. Target <= 60 KB, hard cap 90 KB.
4. Name files `assets/img/storia/foto/<slug>.webp` (slug = plan 4.4 id, lowercase ASCII).
5. Add one `docs/IMMAGINI.md` row per file (all fields; `Stato` = `verificata AAAA-MM-GG`), and one row in `LICENZE-TERZI.md` (file, author, licence, source URL).
6. Run the checks, commit ("Add licensed historical images for the Storia part"), push, open the PR (ready) with a table: file, source URL, licence, bytes, and the list of skipped rows with the reason.

## 5. Acceptance
- `python3 -m pytest -q tests/test_immagini.py tests/test_integrita_sito.py` -> pass.
- `find assets/img/storia/foto -type f -size +90k` -> no output.
- `grep -nE 'NC|ND|BY-SA|fair use' docs/IMMAGINI.md` -> no output (and `tests/test_immagini.py` check 3 passes).
- Every committed image appears in `docs/IMMAGINI.md` and `LICENZE-TERZI.md` (the test checks it).
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
COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (+ count of images added / skipped).

## 7. Handoff
Above ~200k tokens: handoff block in the PR description (max 15 lines) and stop.
