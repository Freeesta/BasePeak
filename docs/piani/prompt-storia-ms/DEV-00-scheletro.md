# DEV-00 - storia skeleton (the only prompt that touches shared engine files)

Paste as the first message of a new Claude Code session on `Freeesta/BasePeak`. Chat name: `DEV - storia skeleton`, branch `dev/storia-scheletro`, base `main`.

## 0. Confirm
Reply to the COO session with one line: `DEV storia-scheletro started, branch dev/storia-scheletro`.

## 1. Role
You are a DEV (Sonnet). You build the empty skeleton of the new handbook part "VII. Storia" (history of mass spectrometry) designed in `docs/piani/storia-ms.md`. You do NOT write chapter text, do NOT add images, do NOT decide architecture (the plan decides; if the plan is impossible, stop and report), do NOT merge.

## 2. Scope
- Touches: `assets/teoria.js` (10 rows in `CHAPTERS` only), `index.html` (one hidden card group), `tests/test_numerazione.py` (the exact chapter count only), `assets/teoria.css` (only new `.storia-*` rules, max ~40 lines), `LICENZE-TERZI.md` (one new section), and new files: `capitoli/NN-storia-*.html` (10), `capitoli/src/NN-storia-*.md` (10), `assets/storia.js`, `assets/storia-dati.js`, `docs/IMMAGINI.md`, `tests/test_immagini.py`, `assets/img/storia/.gitkeep`.
- Does not touch: any existing chapter text, `pratica/`, `tools/`, `.github/`, the existing `sim-*.js`, `assets/indice-ricerca.js`, `assets/glossario-dati.js`.
- Neighbours: DEV8 navigation (PR #10, `dev/nav-patroon`) must be merged before you start: if it is still open, report and wait. ARCH1 cheminformatics chapters (`docs/piani/chemioinformatica.md`) may add chapters too: take the numbers that are free on `main` when you start, and if they merge first, merge `main` into your branch and renumber (only the 10 history rows/files move).

## 3. Context (read only these)
- `docs/piani/storia-ms.md` sections 1, 2, 4.1, 4.3, 5 (common rules), 7.
- `docs/COME-MODIFICARE.md` ("Aggiungere o togliere un capitolo").
- `assets/teoria.js` top (`CHAPTERS`, the 5th field `true` = chapter listed only in administrator mode), the `TP` helpers it returns (`buttons`, `controls`, `fmt`, `reduced`).
- `tools/nuovo_capitolo.py` (writes a draft chapter skeleton: `data-esteso`, `noindex`, `verification: draft`), `tools/controlla_teoria.py` (rules (a)-(f)), `tests/test_numerazione.py`, `tests/test_integrita_sito.py`.
- Facts: B = number of the last numbered chapter in `CHAPTERS` on `main` now (21 if nothing else merged). History chapter k gets number NN = B+k.
- Trap: ES modules do not load from `file://`; every history script is a classic script.
- Trap: a published chapter (no `data-esteso`) must not contain `TODO`, `???` or "da verificare" (`controlla_teoria.py` rule E). The skeletons are drafts: `data-esteso`, noindex, header `verification: draft`, and the `CHAPTERS` row has the 5th field `true` so the public menu does not show them until DEV-15 publishes the part.

## 4. Work, in order
1. `git fetch origin main && git checkout -b dev/storia-scheletro origin/main`. Read B.
2. For k = 1..10 run `python3 tools/nuovo_capitolo.py NN storia-<name> "<title>" --parte "VII. Storia"` with the names and titles of plan section 1.2 (`storia-mappa` "La storia in una pagina", `storia-origini` "Le origini: raggi catodici, raggi canale, raggi positivi", `storia-aston-dempster` "Aston e Dempster: isotopi e numeri interi", `storia-settori` "Settori magnetici e doppia focalizzazione", `storia-tof` "Il tempo di volo", `storia-rf` "Campi a radiofrequenza: quadrupolo e trappola ionica", `storia-ft` "Ioni che girano: ICR, FT-ICR, Orbitrap", `storia-sorgenti` "Le sorgenti: dall'impatto elettronico alla ionizzazione morbida", `storia-accoppiamenti` "Accoppiamenti, MS/MS e ibridi", `storia-rivelatori-dati` "Rivelatori, dati, applicazioni"). Replace the generic TODO body with: the lead line "Capitolo in preparazione." and the h2 headings of the plan outline (section 3) with empty paragraphs `<p>In preparazione.</p>`; keep `data-esteso`, noindex, `verification: draft`. Write the matching `capitoli/src/NN-storia-<name>.md` (`# <title> {kicker: Capitolo NN}`, same headings). Add before `</main>` the script tags `../assets/appname.js`, `../assets/teoria.js`, `../assets/storia.js`.
3. Add the 10 rows to `CHAPTERS` after the last Teoria chapter, part `"VII. Storia"`, 5th field `true`: `["capitoli/NN-storia-mappa.html", "NN", "La storia in una pagina", "VII. Storia", true],` etc. Follow the row format that DEV8's merged navigation uses (group, if any: Teoria).
4. `tests/test_numerazione.py`: change only the exact count `len(rows) == 21` to the new exact count (B+10). Do not relax it to `>=`. Leave every other assertion as it is.
5. `index.html`: after the last Teoria card group add `<h3 hidden data-storia>VII. Storia</h3><div class="cards" hidden data-storia>` with 10 cards (`<a href="capitoli/NN-storia-x.html"><b>NN · Title</b><span>one line from plan 1.2 "Covers", in Italian</span></a>`). Hidden until DEV-15.
6. `assets/storia.js` (classic script, `"use strict"`, one global `STORIA_UI`, <= 3 KB gzip): `svg(tag, attrs, parent)`; `player(root, {steps: [{label, draw(t)}], fps: 30})` with buttons "Avvia"/"Pausa", "Passo indietro", "Passo avanti", "Ricomincia" (real `<button type="button">`, `aria-pressed` on play), a `<p class="storia-passo" aria-live="polite">Passo i di n: label</p>`, pause when off screen (IntersectionObserver) or `document.hidden`, and under reduced motion (`TP.reduced()` or `matchMedia("(prefers-reduced-motion: reduce)")`) no autoplay: play shows the final frame of the next step; `lazy(host, src)` that injects `<script src>` once when `host` is within 200 px of the viewport (fallback: load on `load` when IntersectionObserver is missing); `live(el, text)` throttled to one update per 300 ms. Add a header comment that says what each helper does.
7. `assets/storia-dati.js` (classic script, one global `STORIA`, data only, <= 8 KB gzip): the schema of plan section 5.1/5.2 (`tappe`, `famiglie`, `archi`) and ONLY the items marked `verified` in plan section 6, written from the "Tappe" table of plan section 5.4. Every `tappa` has `rif` ids that exist in section 6. Italian text in the fields.
8. `docs/IMMAGINI.md` (Italian, the format of plan section 4.1) with the rows of the images that already exist under `assets/`: `assets/favicon.ico` and `assets/icone/*` (original project icon, licence as stated in `LICENZE-TERZI.md`: MIT), and an empty "Storia" table ready for DEV-01/DEV-02. `LICENZE-TERZI.md`: new section "Immagini della Storia" saying that the list is in `docs/IMMAGINI.md` and that only public domain, CC0, CC BY and original drawings (CC BY 4.0, BasePeak) are allowed; fix the sentence "Le figure dei capitoli di Teoria ... non contengono immagini di terzi" to say "tranne le immagini della parte Storia, elencate in docs/IMMAGINI.md".
9. `tests/test_immagini.py` implementing plan section 4.3 exactly (all 9 checks). It must pass on your branch (only icons exist) and must fail on a deliberate bad case: add parametrised unit tests on a `tmp_path` fixture for (a) an unlisted image, (b) an NC licence, (c) a 120 KB WebP, (d) an `<img>` without `loading="lazy"`, (e) an SVG with `<script>`.
10. `assets/teoria.css`: `.storia-chi` (details box), `.storia-passo`, `.storia-fig` (figure host keeps the static image height: no layout shift), `.storia-link`, `.storia-chip[aria-pressed=true]` (border + check mark, not colour only); colours from existing variables; contrast >= 7:1 in all themes.
11. Run all checks (section 5), commit, push, open the PR (ready), wait for `ci`.

## 5. Acceptance (run them, paste the output summary in the PR)
- `python3 -m pytest -q tests` -> all pass, including `tests/test_immagini.py` and `tests/test_numerazione.py` (count B+10).
- `python3 tools/controlla_teoria.py` -> exit 0.
- `git ls-files '*.js' | xargs -n1 node --check` -> no output.
- `python3 tests_e2e/run_all.py` -> all pass.
- `ls capitoli/*-storia-*.html | wc -l` -> 10; `ls capitoli/src/*-storia-*.md | wc -l` -> 10.
- `for f in assets/storia.js assets/storia-dati.js; do gzip -9c $f | wc -c; done` -> <= 3072 and <= 8192.
- `node -e 'global.window={};eval(require("fs").readFileSync("assets/storia-dati.js","utf8")+";console.log(STORIA.tappe.length)")'` -> about 40-50.
- Public menu unchanged: with no administrator flag the 10 history chapters are not listed (check in the browser or with the existing nav e2e).

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
To the COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains`, plus the value of B you used.

## 7. Handoff
Above ~200k tokens: handoff block in the PR description (max 15 lines) and stop.
