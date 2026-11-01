# DEV-FIX-04 - storia ch. 38, 39, 41, 42: grammar, internal comments out of the live pages, TSV chapter column

Paste as the first message of a new Claude Code session (Sonnet) on `Freeesta/BasePeak`. Chat name: `DEV - fix storia 38-42`, branch `dev/fix-storia-38-42`, base `main`.
Findings: `docs/piani/storia-ms-revisione.md` (S11, grammar, note N8). Parallel with DEV-FIX-01, 02, 03, 05 (no shared file).

## 0. Confirm
One line to the COO session: `DEV fix-storia-38-42 started, branch dev/fix-storia-38-42`.

## 1. Role
You are a DEV (Sonnet). You apply the exact edits below. You do NOT rewrite other sentences, do NOT touch other files, do NOT merge.

## 2. Scope
- Touches: `capitoli/38-storia-rf.html`, `capitoli/39-storia-ft.html`, `capitoli/41-storia-accoppiamenti.html`, `capitoli/42-storia-rivelatori-dati.html`, `docs/piani/riferimenti-chemioinformatica.tsv`.
- Does not touch: `capitoli/src/`, other chapters, `assets/`, tests, `.github/`.

## 3. Context
- The pages carry internal author notes `<!-- to verify against source: ... -->` that are published in the page source of the live site. The ARCH checked that none of the sentences they guard states an unverified date or "first"; the notes are not for readers. Delete them; do not change the sentences next to them.
- The "7 DOIs URL-encoded (%3C) missing from the TSV" (`docs/piani/profondita.md`, line 117) are no longer missing: the four distinct SICI DOIs (`Morris1996`, `Guilhaus2000`, `March1997`, `Marshall1998`; seven occurrences in chapters 37, 38, 39, 41) are in the TSV in encoded form and `pytest -k doi` passes. **Do not add rows** (a duplicate DOI fails `test_doi_tsv_is_well_formed`). Only the `chapters` column (4th field, not read by any test) is stale for 13 rows that the Storia also cites.

## 4. Work, in order
1. `capitoli/38-storia-rf.html`: old `instabile lungo l'asse e esce attraverso una calotta` -> new `instabile lungo l'asse ed esce attraverso una calotta`. Delete the 2 `<!-- to verify against source: ... -->` comments.
2. `capitoli/39-storia-ft.html`: delete the 7 `<!-- to verify against source: ... -->` comments.
3. `capitoli/41-storia-accoppiamenti.html`: old `sceglie l'ione.` -> new `sceglie lo ione.` Delete the 5 `<!-- to verify against source: ... -->` comments.
4. `capitoli/42-storia-rivelatori-dati.html`: delete the 10 `<!-- to verify against source: ... -->` comments.
   When a comment sits alone on its line, delete the whole line; when it sits inside a `<p>`, delete only the comment and the space before it.
5. `docs/piani/riferimenti-chemioinformatica.tsv`: change only the 4th field (`chapters`) of these rows (match by the 1st field, `key`; keep tabs, keep every other field byte for byte):

   | key | old chapters | new chapters |
   |---|---|---|
   | Morris1996 | 37 | 37,41 |
   | Tanaka1988 | 37 | 37,40 |
   | KarasHillenkamp1988 | 37 | 37,40 |
   | WileyMcLaren1955 | 19,22 | 19,22,37 |
   | ComisarowMarshall1974 | 19,22 | 19,22,39 |
   | Makarov2000 | 19,22 | 19,22,39 |
   | BlakleyVestal1983 | 41 | 40,41 |
   | Horning1973 | 41 | 40,41 |
   | Griffiths2008 | 33,35 | 33,35,42 |
   | Yates2011 | 33 | 33,42 |
   | Hertz1971 | 19,28,29 | 19,28,29,42 |
   | Sumner2007 | 19,31 | 19,31,42 |
   | Schymanski2014 | 19,31 | 19,31,42 |
6. Run the checks, commit ("Storia ch. 38-42: grammar, drop internal author notes from the live pages; TSV chapter column"), push, open the PR (ready).

## 5. Acceptance
- `grep -c 'to verify against source' capitoli/38-storia-rf.html capitoli/39-storia-ft.html capitoli/41-storia-accoppiamenti.html capitoli/42-storia-rivelatori-dati.html` -> 0 for each.
- `grep -c "e esce attraverso" capitoli/38-storia-rf.html` -> 0; `grep -c "l'ione" capitoli/41-storia-accoppiamenti.html` -> 0.
- `git diff -U0 origin/main -- docs/piani/riferimenti-chemioinformatica.tsv | grep -c '^+[A-Z]'` -> 13 (13 rows changed, no row added or removed).
- `python3 -m pytest -q tests -k doi` -> pass; `python3 tools/controlla_teoria.py` -> 0 new errors; `python3 -m pytest -q tests` -> pass; `ci` green.
- `git diff --stat origin/main` -> only the five files of section 2.

## Rules that always apply
- Repository `Freeesta/BasePeak` only. Code, commits, PR text: English. Handbook text: Italian only.
- Never skip, disable or loosen a test; no `.github/` changes; do not merge; do not push to `main`. One small PR, ready for review.
- Report to the COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines). Never ask Federico.
