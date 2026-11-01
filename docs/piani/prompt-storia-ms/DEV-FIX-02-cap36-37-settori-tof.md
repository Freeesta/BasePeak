# DEV-FIX-02 - storia ch. 36-37: Bainbridge at Bartol, Wiley-McLaren wording, Mamyrin second order

Paste as the first message of a new Claude Code session (Sonnet) on `Freeesta/BasePeak`. Chat name: `DEV - fix storia 36-37`, branch `dev/fix-storia-36-37`, base `main`.
Findings: `docs/piani/storia-ms-revisione.md` (S3, S4, S5, S6, S11). Parallel with DEV-FIX-01, 03, 04, 05 (no shared file).

## 0. Confirm
One line to the COO session: `DEV fix-storia-36-37 started, branch dev/fix-storia-36-37`.

## 1. Role
You are a DEV (Sonnet). You apply the exact replacements below. You do NOT rewrite other sentences, do NOT touch other files, do NOT merge.

## 2. Scope
- Touches: `capitoli/36-storia-settori.html`, `capitoli/37-storia-tof.html`.
- Does not touch: `capitoli/src/`, other chapters, `assets/`, tests, `.github/`.

## 3. Context (verified by the ARCH)
- Bainbridge worked at the Bartol Research Foundation of the Franklin Institute, on the Swarthmore College campus, 1929-1933 (where the 1933 mass-energy measurements were made), and at Harvard from 1934 (Wikipedia "Kenneth Bainbridge", already cited in the chapter's Fonti, citing Pound & Ramsey, NAS Biographical Memoir, 1999, p. 6).
- Wiley & McLaren 1955: all ions are accelerated at the same instant; those born farther from the detector cover a longer accelerating path, gain more energy and catch up (space focusing).
- Mamyrin et al. 1973 (JETP 37, 45, PDF on jetp.ras.ru, p. 46): the reflector has two regions of different field "in order to accomplish second-order focusing" in energy.

## 4. Work, in order
Each old text must match exactly once.

`capitoli/36-storia-settori.html`
1. **S3.** Old:
   ```
   <p>Kenneth Bainbridge, a Harvard, costruì negli anni '30 uno spettrografo di massa per misurare le masse con grande precisione. Per togliere il difetto di energia usò un selettore di velocità: un campo elettrico e uno magnetico incrociati lasciano passare solo gli ioni con una data velocità. <!-- to verify against source: Bainbridge 1933 and Bainbridge-Jordan 1936, velocity selector and 180 degree magnetic deflection in his spectrograph --></p>
   ```
   New:
   ```
   <p>Kenneth Bainbridge, alla Bartol Research Foundation di Swarthmore, in Pennsylvania, costruì all'inizio degli anni '30 uno spettrografo di massa per misurare le masse con grande precisione. Per togliere il difetto di energia usò un selettore di velocità: un campo elettrico e uno magnetico incrociati lasciano passare solo gli ioni con una data velocità.</p>
   ```
2. Old: `<p>Nel 1936, con E. B. Jordan, descrisse lo spettrografo`
   New: `<p>Nel 1936, ormai a Harvard e con E. B. Jordan, descrisse lo spettrografo`
3. Old: `Lavorò all'Università di Harvard, dove studiò il ciclotrone e misurò con precisione le masse degli isotopi.`
   New: `Dal 1929 al 1933 lavorò alla Bartol Research Foundation, dove misurò con precisione le masse degli isotopi, e dal 1934 all'Università di Harvard, dove studiò il ciclotrone.`
4. **S11.** Delete every remaining `<!-- to verify against source: ... -->` comment in this file (3 more). `grep -c 'to verify against source' capitoli/36-storia-settori.html` -> 0.

`capitoli/37-storia-tof.html`
5. **S4.** Old: `Quelli nati più indietro percorrono un tratto accelerante più lungo e prendono più energia; partono più tardi, ma poi vanno più veloci e possono raggiungere gli altri.`
   New: `Partono tutti nello stesso istante, ma quelli nati più indietro percorrono un tratto accelerante più lungo e prendono più energia: all'inizio sono dietro, poi vanno più veloci e raggiungono gli altri.`
6. **S5.** Old: `<p>La correzione vale al primo ordine, cioè per piccole differenze di energia. Resta il tempo di inversione degli ioni lanciati all'indietro, che lo specchio non corregge.</p>`
   New: `<p>Nel reflectron di Mamyrin lo specchio ha due zone con campi diversi, e la correzione arriva fino al secondo ordine: funziona bene per differenze di energia piccole, non per quelle grandi. Resta il tempo di inversione degli ioni lanciati all'indietro, che lo specchio non corregge.</p>`
7. **S6.** Replace `a accelerazione ortogonale` with `ad accelerazione ortogonale` (2 occurrences: "Lo strumento a accelerazione ortogonale", "un TOF a accelerazione ortogonale").
8. **S11.** Delete the 3 `<!-- to verify against source: ... -->` comments in this file. `grep -c 'to verify against source' capitoli/37-storia-tof.html` -> 0.
9. Run the checks, commit ("Storia ch. 36-37: Bainbridge at Bartol, Wiley-McLaren timing, Mamyrin second-order focusing"), push, open the PR (ready).

## 5. Acceptance
- `grep -c 'a Harvard, costruì' capitoli/36-storia-settori.html` -> 0; `grep -c 'Bartol' capitoli/36-storia-settori.html` -> 2.
- `grep -c 'partono più tardi' capitoli/37-storia-tof.html` -> 0; `grep -c 'al primo ordine' capitoli/37-storia-tof.html` -> 0; `grep -c ' a accelerazione' capitoli/37-storia-tof.html` -> 0.
- `git diff --stat origin/main` -> only the two chapter files.
- `python3 tools/controlla_teoria.py` -> 0 new errors; `python3 -m pytest -q tests` -> pass; `ci` green.

## Rules that always apply
- Repository `Freeesta/BasePeak` only. Code, commits, PR text: English. Handbook text: Italian only.
- Dyslexia rules: paragraphs of 2-4 sentences, one idea each; no justified text; no whole sentences in italics; Italian decimal comma.
- Never skip, disable or loosen a test; no `.github/` changes; do not merge; do not push to `main`. One small PR, ready for review.
- Report to the COO session only: `PR #n - <40-char head SHA> - ci <status> - what remains` (max 5 lines). Never ask Federico.
