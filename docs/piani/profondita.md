# Depth plan: more explaining prose, fewer thin menu entries

Read-only study (ARCH, 2026-11-01, base `main` at `6f80303`). Deliverable: this plan, the measuring script `docs/piani/profondita-misura.py` and the ready-to-run prompts `docs/piani/prompt-profondita/DEV-NN-*.md`. No site file is changed by this PR.

## 1. The problem
Federico: «There are many chapters and subchapters in the menu, but the written text is really little.» He wants more explanation a reader can learn from, not more boxes, figures or lists.

The measurement confirms it. The 30 Teoria chapters (1-18, 21-32) hold **22 323 prose words under 352 sidebar sections: 63 words per menu entry**, about one short paragraph per entry. In 9 of them less than 40% of the words are paragraph text: the rest is in lists, tables and boxes. With the 41 menu rows and the 403 h2/h3 sections the sidebar shows, the reader meets **444 menu entries for 26 374 prose words**.

## 2. Measurement (`python3 docs/piani/profondita-misura.py`)
Rules: every published `CHAPTERS` row of `assets/teoria.js` (Storia drafts 33-42 and the 12-word redirect stubs of the old numbering ignored). **prose** = words of `<p>` text, the lead included, outside boxes, `<details>`, lists, tables, figures, interactive figures, headings, references, script/style/svg. **menu** = h2/h3 the sidebar lists (the rule of `buildSide()` in `assets/teoria.js`: not inside `.box`, `figure`, `.sim`, `details`). **box / list / fig** = words in boxes+details, in lists (references excluded), in tables+figures+interactive figures. **prose%** = prose / (prose + box + list + fig). Sorted by prose words per menu entry.

| file | n | prose | menu | w/menu | box | list | fig | prose% |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| capitoli/19-glossario.html | 19 | 18 | 11 | 2 | 33 | 2928 | 8 | 1 |
| pratica/tp.html | P7 | 67 | 4 | 17 | 78 | 0 | 0 | 46 |
| capitoli/16-strategia.html | 16 | 212 | 10 | 21 | 60 | 564 | 485 | 16 |
| capitoli/18-disegno.html | 18 | 473 | 14 | 34 | 164 | 586 | 216 | 33 |
| capitoli/23-formati.html | 23 | 545 | 15 | 36 | 210 | 72 | 202 | 53 |
| pratica/strumento.html | P5 | 39 | 0 | 39 | 56 | 0 | 0 | 41 |
| capitoli/13-ei-metodo.html | 13 | 956 | 21 | 46 | 552 | 976 | 933 | 28 |
| capitoli/10-dati.html | 10 | 1231 | 27 | 46 | 99 | 1111 | 345 | 44 |
| pratica/isotopi.html | P3 | 48 | 0 | 48 | 57 | 0 | 0 | 46 |
| capitoli/08-qqq.html | 8 | 654 | 13 | 50 | 116 | 215 | 411 | 47 |
| pratica/quadrupolo.html | P6 | 51 | 0 | 51 | 47 | 0 | 0 | 52 |
| capitoli/03-gc.html | 3 | 565 | 11 | 51 | 57 | 378 | 803 | 31 |
| pratica/perdite.html | P2 | 55 | 0 | 55 | 59 | 0 | 0 | 48 |
| capitoli/12-frammentazione-esi.html | 12 | 1270 | 23 | 55 | 97 | 618 | 728 | 47 |
| capitoli/21-tempi.html | 21 | 339 | 6 | 56 | 86 | 327 | 173 | 37 |
| capitoli/27-tabella.html | 27 | 625 | 11 | 57 | 269 | 245 | 77 | 51 |
| capitoli/28-somiglianza.html | 28 | 739 | 12 | 62 | 216 | 151 | 50 | 64 |
| capitoli/31-confidenza.html | 31 | 380 | 6 | 63 | 157 | 27 | 273 | 45 |
| index.html | 0 | 829 | 13 | 64 | 100 | 95 | 316 | 62 |
| capitoli/22-segnale.html | 22 | 1177 | 18 | 65 | 172 | 0 | 54 | 84 |
| capitoli/02-lc.html | 2 | 594 | 9 | 66 | 223 | 295 | 708 | 33 |
| capitoli/05-ei-ci.html | 5 | 599 | 9 | 67 | 190 | 345 | 496 | 37 |
| capitoli/07-quadrupolo.html | 7 | 963 | 14 | 69 | 379 | 398 | 352 | 46 |
| capitoli/24-tracce.html | 24 | 689 | 10 | 69 | 285 | 0 | 95 | 64 |
| capitoli/30-candidati.html | 30 | 624 | 9 | 69 | 235 | 223 | 50 | 55 |
| pratica/index.html | P | 291 | 4 | 73 | 69 | 0 | 0 | 81 |
| capitoli/09-risoluzione.html | 9 | 657 | 9 | 73 | 276 | 273 | 225 | 46 |
| capitoli/14-ei-famiglie.html | 14 | 1244 | 17 | 73 | 104 | 0 | 190 | 81 |
| capitoli/29-librerie.html | 29 | 599 | 8 | 75 | 185 | 56 | 124 | 62 |
| capitoli/25-picchi.html | 25 | 986 | 13 | 76 | 264 | 92 | 60 | 70 |
| pratica/formula.html | P4 | 81 | 0 | 81 | 43 | 0 | 0 | 65 |
| capitoli/06-vuoto.html | 6 | 410 | 5 | 82 | 69 | 40 | 124 | 64 |
| capitoli/15-origine.html | 15 | 748 | 9 | 83 | 125 | 143 | 60 | 70 |
| capitoli/04-esi.html | 4 | 1012 | 12 | 84 | 302 | 139 | 920 | 43 |
| capitoli/26-gruppi.html | 26 | 602 | 7 | 86 | 289 | 129 | 136 | 52 |
| capitoli/11-formula.html | 11 | 698 | 8 | 87 | 252 | 302 | 309 | 45 |
| capitoli/01-cromatografia.html | 1 | 998 | 11 | 91 | 290 | 187 | 609 | 48 |
| capitoli/32-esempio.html | 32 | 875 | 8 | 109 | 182 | 241 | 129 | 61 |
| capitoli/17-hr-dda.html | 17 | 859 | 7 | 123 | 17 | 356 | 57 | 67 |
| capitoli/20-formulario.html | 20 | 2394 | 19 | 126 | 923 | 0 | 145 | 69 |
| pratica/ei.html | P1 | 178 | 0 | 178 | 151 | 0 | 0 | 54 |

Menu: 41 rows (Guida 1, parts II-VII 29 chapters, Pratica 8, Reference 3) + 403 in-page sections = **444 entries**. Out of scope for prose: the glossary (19) and the formulary (20) are reference lists by nature; the Pratica pages are games whose text is in the game.

## 3. Targets per chapter
Acceptance for every planned chapter: prose >= target, menu <= target, **prose/menu >= 130-150**, **prose% >= 55**. Overall: the 28 planned chapters go from **20 716 to >= 43 800 prose words** and from **336 to <= 284 menu entries** (about 155 words per entry, 2,5 times today). "After" is filled in by DEV-16.

| ch | file | prose now | menu now | prose target | menu target | prompt | wave | after |
|---|---|---:|---:|---:|---:|---|---|---|
| 16 | 16-strategia | 212 | 10 | 1500 | 8 | DEV-15 | held | |
| 18 | 18-disegno | 473 | 14 | 1800 | 11 | DEV-01 | 1 | |
| 23 | 23-formati | 545 | 15 | 1300 | 10 | DEV-06 | 1 | |
| 13 | 13-ei-metodo | 956 | 21 | 2600 | 15 | DEV-03 | 1 | |
| 10 | 10-dati | 1231 | 27 | 2800 | 16 | DEV-02 | 1 | |
| 8 | 08-qqq | 654 | 13 | 1800 | 12 | DEV-04 | 1 | |
| 3 | 03-gc | 565 | 11 | 1800 | 10 | DEV-04 | 1 | |
| 12 | 12-frammentazione-esi | 1270 | 23 | 2600 | 16 | DEV-05 | 1 | |
| 21 | 21-tempi | 339 | 6 | 1100 | 6 | DEV-01 | 1 | |
| 27 | 27-tabella | 625 | 11 | 1400 | 9 | DEV-07 | 1 | |
| 28 | 28-somiglianza | 739 | 12 | 1500 | 10 | DEV-07 | 1 | |
| 31 | 31-confidenza | 380 | 6 | 1100 | 7 | DEV-06 | 1 | |
| 22 | 22-segnale | 1177 | 18 | 1600 | 12 | DEV-10 | 2 | |
| 2 | 02-lc | 594 | 9 | 1500 | 9 | DEV-08 | 2 | |
| 5 | 05-ei-ci | 599 | 9 | 1500 | 9 | DEV-08 | 2 | |
| 7 | 07-quadrupolo | 963 | 14 | 1900 | 13 | DEV-09 | 2 | |
| 24 | 24-tracce | 689 | 10 | 1300 | 9 | DEV-10 | 2 | |
| 30 | 30-candidati | 624 | 9 | 1300 | 9 | DEV-11 | 2 | |
| 9 | 09-risoluzione | 657 | 9 | 1400 | 9 | DEV-12 | 2 | |
| 14 | 14-ei-famiglie | 1244 | 17 | 1800 | 14 | DEV-14 | 2 | |
| 29 | 29-librerie | 599 | 8 | 1200 | 8 | DEV-11 | 2 | |
| 25 | 25-picchi | 986 | 13 | 1500 | 11 | DEV-13 | 2 | |
| 6 | 06-vuoto | 410 | 5 | 900 | 6 | DEV-09 | 2 | |
| 4 | 04-esi | 1012 | 12 | 1700 | 12 | DEV-13 | 2 | |
| 26 | 26-gruppi | 602 | 7 | 1100 | 7 | DEV-13 | 2 | |
| 11 | 11-formula | 698 | 8 | 1300 | 8 | DEV-12 | 2 | |
| 1 | 01-cromatografia | 998 | 11 | 1400 | 10 | DEV-08 | 2 | |
| 32 | 32-esempio | 875 | 8 | 1100 | 8 | DEV-14 | 2 | |
| 15 | 15-origine | 748 | 9 | - | - | none (quality bar) | | |
| 17 | 17-hr-dda | 859 | 7 | - | - | none (quality bar) | | |

Part VII (22-32) has a hard limit in `tests/test_chemi.py`: <= 350 words per h2 section counted with everything in it, <= 90 words per paragraph. Its targets are set so they fit; a DEV that hits the cap splits an h2 and merges h3 elsewhere, never loosens the test.

## 4. What is missing (reading of the 13 thinnest chapters + 3 of the best)
Read in full: 16, 18, 23, 31, 08, 03, 21, 02, 10, 13; read by section map (prose and other words under every h2/h3) plus the thin sections: 12, 27, 28, 30, 29, 05, 26, 22, 24, 09, 07, 06, 11, 04, 14, 32, 25; quality bar read in full: 17, 15, 01.

**The quality bar.** 15-origine explains four criteria, one per h3, each with the reason it works and its limit, then a worked example (atrazine 216 -> 174) told as reasoning, then what to do with mixed results. 17-hr-dda gives the definition, then the arithmetic in the sentence (216,1013 vs 216,1010 = +1,4 ppm; 5 ppm = 1,1 mDa at m/z 216) and the consequence for the reader. 01-cromatografia explains each quantity (k, α, N, Rs) in a full paragraph before the equation. That is the bar: why, how, a number worked out, the trap.

**Patterns in the thin chapters.**
1. *Heading plus one line plus a list.* 18-disegno: «Bianchi e controlli» is two sentences and a table; «Repliche», «Controlli di qualità», «Taratura», «Randomizzazione» are one sentence each followed by a list. The why (what each blank detects, what a QC failure means for the samples around it) is missing or squeezed into list items. 16-strategia is 16% prose: five numbered steps written as lists and a table.
2. *Empty h2.* h2 with zero words of their own before their h3: 10 (`Formati dei file`, `Dal dato alla quantità`), 12 (`Dall'energia di collisione alla rottura`, `Dove sta il protone`, `Le reazioni tipiche`, and `Regole generali` as a bare list), 13 (`Fase 2`), 22 (`Accuratezza, precisione e taratura`), 25 (`Tre famiglie di algoritmi`), 28 (`I punteggi di somiglianza`), 7 (`Stabilità`, `Scansione, risoluzione, sensibilità`), 9 (`Gli analizzatori`). Each needs an opening paragraph that says what the section answers.
3. *Menu inflation.* 10-dati has 27 menu entries, many of 20-50 words (`Full scan` 42, `SIM` 40, `Product ion scan` 17 + a list). 12 has 23, 13 has 21, 22 has 18. Merging pairs that answer one question (Full scan + SIM, DDA + DIA, TIC/BPC/XIC + extraction window) shortens the menu and gives room for one fuller explanation.
4. *Knowledge in tables only.* 03-gc: the injector (split/splitless), the detectors and sample preparation are tables with no sentence reading them; 02-lc: the other LC modes and ESI-compatible mobile phases; 05: the comparison of sources; 09: the comparison of analysers. A table without a paragraph that says what to conclude from it does not teach.
5. *Long dense bullets.* 13-ei-metodo and 10-dati put whole paragraphs (40-60 words) in `<li>`. The content is there; it needs to become paragraphs, with the numbers kept.
6. *Worked examples reduced to a table.* 13 (`Esempio svolto: 2-esanone`, 12 prose words), 12 (`Esempio svolto: l'atrazina`, 32), 16 (atrazine, a list). The reasoning is what the reader needs.
7. *Numbers a PhD student needs and does not find.* the split ratio and the mass that reaches the column (03); the Student t factor behind "three replicates" (18); a cosine computed on three peaks (28); a q-value from a short sorted list (29); cycle time from n transitions × (dwell + pause) (08, 21); the phase ratio β of a 30 m × 0,25 mm × 0,25 µm column (03). Each prompt names them.
8. *Repetition.* 31 says the history twice (the `details` and the first h2); 23 repeats in `Gli altri formati` what the history box already said. Prose added must not repeat.

**Other findings (action lines).**
- The Italian phrase «da verificare» appears in 04-esi (line ~103) and twice in 16-strategia (calculator note, enviPath line): DEV-13 and DEV-15 rephrase it.
- 16-strategia cites «ricerca su Google Scholar» as a source: not verifiable, DEV-15 replaces it with a DOI or drops it.
- 15-origine and 17-hr-dda describe «il programma» (windows, menus of the mzLab viewer): no action in this plan because they are the quality bar for prose; the COO may want to check that those features still exist in what readers have.
- The TP / photocatalysis story is in 2, 10, 12, 15, 16 (open question to Federico in `docs/COORDINAMENTO.md`): every prompt says "do not expand, do not remove"; DEV-15 (chapter 16) is held until the answer.
- 7 DOIs in the Storia drafts (37, 38, 40, 41) are not in the TSV in their encoded form (`%3C`): no action here (drafts, owned by the Storia chats; `pytest -k doi` covers published pages only); flag to the Storia DEV-15 publish prompt.
- No published chapter has a Verifica section or «in costruzione» text today (`grep` clean); the rule is repeated in every prompt.

## 5. Rules every prompt carries
Static pages, offline, Italian handbook text, dyslexia rules (2-4 sentences per paragraph, one idea, <= 90 words, an h2 every 150-300 words), prose first (lists only for short real enumerations), no Verifica/quiz, no placeholder text, no new figures/tables/numbered equations, sources only if verifiable (else dropped or flagged with `<!-- to verify against source: ... -->`, never «da verificare»), every DOI a TSV row once, TP text neither expanded nor removed, the `Approfondimento: <a ...>` sentences kept (md twin test), no edits to `capitoli/src/`.

## 6. Prompts, files and parallelism
Every prompt owns its chapter files; no two prompts touch the same hand-edited file. The only file they all write is the generated `assets/indice-ricerca.js` (`tools/genera_indice_teoria.py`, needed after a heading change); each prompt says how to regenerate it after merging `main` (never by hand). `assets/glossario-dati.js` (`tools/genera_glossario.py`) must not change: nobody but DEV-16 touches the glossary. New sources are listed in each PR and added by DEV-16, so the TSV and the glossary bibliography are not shared either.

| prompt | chapters | wave | parallel with |
|---|---|---|---|
| DEV-01-disegno-tempi | 18, 21 | 1 | all of waves 1-2 |
| DEV-02-dati | 10 | 1 | all of waves 1-2 |
| DEV-03-ei-metodo | 13 | 1 | all of waves 1-2 |
| DEV-04-gc-qqq | 3, 8 | 1 | all of waves 1-2 |
| DEV-05-frammentazione-esi | 12 | 1 | all of waves 1-2 |
| DEV-06-formati-confidenza | 23, 31 | 1 | all of waves 1-2 |
| DEV-07-tabella-somiglianza | 27, 28 | 1 | all of waves 1-2 |
| DEV-08-lc-ei-cromatografia | 1, 2, 5 | 2 | all of waves 1-2 |
| DEV-09-quadrupolo-vuoto | 7, 6 | 2 | all of waves 1-2 |
| DEV-10-segnale-tracce | 22, 24 | 2 | all of waves 1-2 |
| DEV-11-librerie-candidati | 29, 30 | 2 | all of waves 1-2 |
| DEV-12-risoluzione-formula | 9, 11 | 2 | all of waves 1-2 |
| DEV-13-esi-picchi-gruppi | 4, 25, 26 | 2 | all of waves 1-2 |
| DEV-14-famiglie-esempio | 14, 32 | 2 | all of waves 1-2 |
| DEV-15-strategia | 16 | held (Federico's TP answer) | all |
| DEV-16-fonti-chiusura | TSV, glossary bibliography, flags, re-measure | 4, alone, last | none |

Waves are a priority order (thinnest first), not a dependency: any wave-1/2 prompts can run together. Recommended: at most 4 chats of this plan at once, so the serial merge and the index regeneration stay cheap. Each DEV is Sonnet, one small PR, ready for review.

## 7. Acceptance of the plan as a whole
`python3 docs/piani/profondita-misura.py` after DEV-16: every row of section 3 at or above target; the 28 chapters >= 43 800 prose words and <= 284 menu entries; `pytest`, `tools/controlla_teoria.py`, node checks and `tests_e2e/run_all.py` green on `main`.
