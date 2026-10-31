# DEV prompts for part VII "Chemioinformatica"

Design: `docs/piani/chemioinformatica.md`. Each file is a ready-to-paste first message for one chat = one small PR.

| Order | File | Chat | Starts when | Shared files |
|---|---|---|---|---|
| 1 | `DEV-00-scheletro.md` | DEV-CHEMI-00 | PR #10 (DEV8 navigation) merged | CHAPTERS, index.html, glossary stubs, search index, COME-MODIFICARE, tests |
| 2 | `DEV-01-segnale-formati.md` | DEV-CHEMI-01 | DEV-00 merged | search index (regenerate) |
| 2 | `DEV-02-tracce-picchi.md` | DEV-CHEMI-02 | DEV-00 merged | search index (regenerate) |
| 2 | `DEV-03-gruppi-tabella.md` | DEV-CHEMI-03 | DEV-00 merged | search index (regenerate) |
| 2 | `DEV-04-somiglianza-librerie.md` | DEV-CHEMI-04 | DEV-00 merged | search index (regenerate) |
| 2 | `DEV-05-candidati-confidenza.md` | DEV-CHEMI-05 | DEV-00 merged | search index (regenerate) |
| 3 | `DEV-06-esempio.md` | DEV-CHEMI-06 | DEV-01..05 merged | search index (regenerate) |
| 4 | `DEV-07-glossario-formulario-collegamenti.md` | DEV-CHEMI-07 | DEV-06 merged | glossary, formulary, search index, 6 existing chapters (one sentence each), index cards |
| 5 | `DEV-08-revisione-arch.md` | ARCH-CHEMI-REVIEW (Opus) | DEV-07 merged | none (docs-only) |

Order 2 runs in parallel (disjoint chapter and figure files). The COO merges one PR at a time; a conflict on the
generated `assets/indice-ricerca.js` is solved by merging `main` and re-running `python3 tools/genera_indice_teoria.py`.
