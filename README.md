# BasePeak

Teoria della spettrometria di massa: capitoli, figure interattive e Pratica (giochi ed esercizi).
Sito online: https://freeesta.github.io/BasePeak/

Contenuti: introduzione e parti II-VI (cromatografia, ionizzazione, analizzatori, lettura degli spettri, dal dato al risultato), la parte VII «Chemioinformatica» (capitoli 22-32, pubblicata), Pratica e Reference. La Storia (capitoli 33-42) è ancora in bozza, visibile solo in modalità amministratore.

Pagine statiche, nessuna compilazione, nessuna rete: si apre anche da file (doppio clic su `index.html`).
Accessibile: font Atkinson Hyperlegible e OpenDyslexic, spaziatura WCAG, sfondi crema/azzurro/alto contrasto.

## Com'è fatto il repository

```
index.html        introduzione e mappa del percorso (pagina iniziale del sito)
capitoli/         un file per capitolo (NN-nome.html) e i vecchi nomi come rimandi automatici;
                  capitoli/src/ = i sorgenti Markdown (non pubblicati)
pratica/          index.html (pagina iniziale della Pratica), una pagina per gioco (ei.html, perdite.html, ...)
                  e il codice e i dati dei giochi (motore.js, ei-dati*.js, ...)
assets/           stile (teoria.css), motore JavaScript (teoria.js, cerca.js, sim-*.js, ...), caratteri,
                  icone, indice di ricerca e glossario generati, librerie di terzi in vendor/
tools/            script di servizio (indice di ricerca, glossario, controllo dei capitoli, nuovo capitolo, server locale)
tests/            test Python (pytest) e controlli con node
tests_e2e/        test nel browser (Playwright)
docs/             guide (come modificare i capitoli: docs/COME-MODIFICARE.md), coordinamento, dati
editor/           editor dei capitoli: NON è pubblicato sul sito
```

Il sito pubblicato contiene solo `index.html`, `capitoli/`, `pratica/` e `assets/` (lo assembla `.github/workflows/pages.yml` a ogni push su `main`). Tutti i collegamenti sono relativi, per questo si può aprire anche da disco.

## Per lavorarci
- Modificare i capitoli: `docs/COME-MODIFICARE.md`.
- Controlli: `python -m pip install -r tests/requirements.txt`, poi `python -m pytest tests` e `python tests_e2e/run_all.py`.
- Anteprima locale: `python -m http.server` dalla cartella principale e aprire `http://localhost:8000/index.html`.

## Licenze
- Testi: CC BY 4.0 (© Federico Cristaudo).
- Codice: MIT (`LICENSE`).
- Spettri EI: MassBank Europe, CC BY-NC-SA (fonte sotto ogni spettro). Font: OFL. Altre terze parti: `LICENZE-TERZI.md`.
