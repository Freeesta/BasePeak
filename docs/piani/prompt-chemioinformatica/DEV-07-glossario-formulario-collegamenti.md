# DEV-CHEMI-07 - chemioinformatica, glossary, formulary, search index, cross-links

Paste this whole file as the first message of a new Claude Code session on `Freeesta/BasePeak`.
Design source: `docs/piani/chemioinformatica.md` (read it; this prompt repeats what you need).

## 0. Confirm
First reply to the COO session only: "DEV-CHEMI-07 started - branch `dev/chemi-riferimenti`". Then work autonomously.

## 1. Role
You are **DEV-CHEMI-07** (DEV, Sonnet). You write the reference part of part VII: full glossary entries, the formulary section, back-links from existing chapters, final index card texts, the search index. You do NOT merge, do NOT decide architecture (if the design is
wrong or impossible, stop and report to the COO with the reason), do NOT touch files outside your scope, do NOT talk
to Federico.

## 2. Scope
- Touches: `docs/piani/riferimenti-chemioinformatica.tsv` (chapters column only), `capitoli/19-glossario.html`, `capitoli/20-formulario.html` (+ `capitoli/src/19-glossario.md`, `capitoli/src/20-formulario.md`), regenerated `assets/glossario-dati.js` and `assets/indice-ricerca.js`, ONE sentence each at the end of the paragraphs listed in design section 2 ("Back-links") in `capitoli/03-gc.html`, `09-risoluzione.html`, `10-dati.html`, `11-formula.html`, `17-hr-dda.html`, `18-disegno.html` and their `.md` twins, the 11 card texts of part VII in `index.html`, `docs/COME-MODIFICARE.md` (final owners column removed).
- Does not touch: chapters 22-32 (report errors you find to the COO instead), any `sim-*.js`, `assets/teoria.js`, `assets/chemi-common.js`, tests (except adding cases to `tests/test_chemi.py` for the formulary/glossary links), `.github/`.
- Neighbouring chats: Runs alone, after DEV-CHEMI-06 is merged; DEV-CHEMI-08 (ARCH review) starts after you.
- Branch: `dev/chemi-riferimenti` from the latest `origin/main`.

## 3. Context to read (only these)
- `docs/piani/chemioinformatica.md` sections 2 and 11; chapters 22-32 as merged (the source of every definition and
  formula: the glossary and formulary must say exactly what the chapters say).
- `capitoli/19-glossario.html` (format of `dt`/`dd`, ids `g-...`), `capitoli/20-formulario.html` (section format),
  `tools/genera_glossario.py`, `tools/genera_indice_teoria.py`, `tests/test_indice_teoria.py`.
- Known traps: glossary ids are unique (tested); an existing entry (e.g. "Accuratezza di massa / errore in ppm",
  "Addotto") is extended with a link to the new chapter, not duplicated; formulary equation numbers follow the file's
  scheme; chapter 20 says "capitoli 11, 13" in titles: add the new section "6. Chemioinformatica (capitoli 22-32)"
  before "Verifica".

## 4. Work, in order (one PR)
1. Branch from the latest `origin/main`; check `grep -c 'Capitolo in costruzione' capitoli/2*.html capitoli/3*.html`
   -> all 0 (every chapter written). If not, stop and report.
2. Glossary: replace the stubs with full entries (1-3 Italian sentences, formula if any, link "Cap. NN"), alphabetical
   order as in the file; every term of design section 11.
3. Formulary: section 6 with every formula of design section 11, each with symbols explained and the chapter link,
   numbers in the same form as in the chapters.
3b. Bibliography: in `capitoli/19-glossario.html` under `<h2>Bibliografia</h2>` add
   `<h3>Chemioinformatica e trattamento dei dati</h3>` with one `<li><span class="tag">articolo|libro|software|norma</span>...`
   per key cited in chapters 22-32 (same format as the existing entries, alphabetical by first author), skipping
   those already present elsewhere in the bibliography (Schymanski 2014, MassBank, Makarov 2000, Kind & Fiehn 2007,
   Murray 2013, Gross 2017 are already there: keep one entry, no duplicate DOI). Mark the TSV rows of these keys with
   chapter 19 (only the `chapters` column; never change a status without checking the DOI).
4. Back-links: one sentence "Approfondimento: capitolo NN (titolo)." at the end of each paragraph listed in design
   section 2, in HTML and `.md` twin. Nothing else changes in those chapters.
5. Index cards: final one-line Italian descriptions for 22-32.
6. `python3 tools/genera_glossario.py && python3 tools/genera_indice_teoria.py`; add to `tests/test_chemi.py` a test
   that every new glossary entry links to an existing chapter 22-32 and every formulary item of section 6 names a
   chapter that contains the same formula symbol (simple string check).
7. Full checks, commit, push, PR ready, `ci` green.

### Acceptance
- `python3 -m pytest -q tests` -> all passed; `python3 tools/controlla_teoria.py` -> exit 0 with no new base entries.
- `python3 tests_e2e/run_all.py` -> all passed.
- `grep -c '<dt' capitoli/19-glossario.html` -> previous count + the number of new terms (state both numbers in the PR).
- `git diff --stat origin/main -- capitoli/03-gc.html capitoli/09-risoluzione.html capitoli/10-dati.html capitoli/11-formula.html capitoli/17-hr-dda.html capitoli/18-disegno.html` -> only a few added lines per file.

## 5. Report (to the COO session only, max 5 lines)
`PR #n - <40-char head SHA> - ci <status> - what remains`, plus open scientific doubts in one line. Never ask Federico.

## 6. Handoff
If your context passes ~200k tokens: put a handoff block (max 15 lines: state, next step, traps) in the PR
description, report to the COO, stop.

## Hard requirements (all of them, every commit)
- Repository `Freeesta/BasePeak` only. Never read, change or open PRs in any other repository (no mzLab repos).
- Code, comments, commits, PR text: English. Handbook files (`capitoli/*.html`, `capitoli/src/*.md`, `index.html`,
  figure labels, readouts, notes): Italian only.
- Dyslexia and a11y rules: left-aligned text (never justified); keep the theme's 60-75 ch line length and
  line-height >= 1.5 (do not override them in chapter HTML or figure code); contrast >= 7:1 for text and essential
  marks on cream, blue and high-contrast backgrounds and in dark mode (use the theme tokens); h1 > h2 > h3 without
  skipping levels; short paragraphs (<= 90 words), ~one screen per h2 (<= 350 words); no animation when
  `TP.reduced()` is true (no autoplay ever); everything usable with the keyboard (native controls, visible focus,
  targets >= 24x24 px); no colour-only encoding (dash, shape, words, ✓/✗); every canvas has a text alternative
  (`CHEMI.table`) and a `div.readout` summary (debounced 150 ms).
- Figures: plain JS, no libraries, no CDN, no `fetch`, no network, no build step, works from `file://`; lazy-loaded
  through `data-sim` (never a `<script src="../assets/sim-chemi-...">` in a chapter); deterministic seeded data
  (`CHEMI.rng`); `init(el, preset)` registered with `CHEMI.register(id, init)`; <= 15 KB gzip per figure file.
- Data: synthetic only, labelled "dati sintetici" / "spettro sintetico"; a real spectrum only from MassBank Europe
  with accession, authors, licence shown under it and a note in `docs/provenance/`; never NIST; no private data,
  no lab method compounds, no photocatalysis / TiO2 / transformation-product storyline (examples: generic
  pesticides, drugs, metabolites, EI library compounds).
- References: only those marked `verified` in section 7 of `docs/piani/chemioinformatica.md`; never invent a DOI or
  an author list. Never write `TODO`, `???` or "da verificare" in a chapter (`tools/controlla_teoria.py` rejects
  them); a doubt goes in your PR description for the ARCH review.
- The `ci` check must be green. Never skip, disable, quarantine or loosen a test; never raise a size budget; never
  add entries to `tools/teoria_base.json` to hide new errors. No `.github/` changes. No new dependencies.
- Do not merge. Do not push to `main`. One small PR, ready for review (not draft), base `main`.
