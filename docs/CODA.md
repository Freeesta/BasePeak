# CODA — COO log (append-only)

Never edit past entries; add new ones at the bottom.

## 2026-10-31
- COO session started. `main` = import of Teoria/Pratica from mzLab (original layout) + COORDINATORE.md. No PRs yet.
- Delegated (one DEV chat = one PR, base `main`):
  - DEV1 `dev/ci-selfcontained`: self-contained repo + `ci.yml` (Python tests, JS syntax, Playwright e2e).
  - DEV2 `dev/masses-plain-js`: replace mzLab chemistry wasm with own plain-JS masses.
  - DEV3 `dev/ei-public-data`: keep only public generated EI data, document provenance.
- Waiting for Federico: enable GitHub Pages (Settings → Pages → Source: GitHub Actions). The Pages workflow is added only after that.
- Next, after the three PRs: reorganise layout (`index.html`, `capitoli/`, `pratica/`, `assets/`, `tools/`, `tests/`), then patRoon-style navigation, speed budget tests, dyslexia audit. Chapter editor (`web/libro`, Rust crates): propose to Federico first.

## 2026-10-31 (2)
- Federico enabled GitHub Pages (Source: GitHub Actions).
- Added `.github/workflows/pages.yml` (publishes `mzlab/web/teoria` as the site root for now; `SITE_DIR` to be changed by the layout PR). Rides on PR #1.

## 2026-10-31 (3)
- Merged: #1 (CODA + pages workflow), #2 (public EI data only, provenance doc), #3 (own `masse.js`, no wasm), #4 (self-contained tests + `ci`), #7 (chapters 1 and 2 removed at Federico's request). Site live: https://freeesta.github.io/BasePeak/
- Open: #5 site icon, #6 chapters 12/20 rewrite (both ci green before #7, now conflicting; owners merge main).
- DEV1, DEV2, DEV3, DEV6 archived.
- Decision: mzLab COO is Federico's coordinator; I follow its advice for BasePeak only. Rules/queue written to `docs/COORDINAMENTO.md`, subagent `.claude/agents/controllo-github.md`, heartbeat GIRO every 12 min (one `send_later`).
- Asked Federico: strip photocatalysis/TP story from ch.18, P8, glossary, games? Copilot policy (proposal in COORDINAMENTO.md)?

## 2026-10-31 (4)
- Merged: #5 icon, #6 chapters 12/20 rewritten, #8 coordination rules, #9 clean root layout + chapters renumbered 1..21, #10 patRoon-style navigation, #11 plan Chemioinformatica (docs), #12 plan Storia (docs). main green, site live with new layout.
- Archived: DEV4, DEV5, DEV6, DEV7, DEV8, ARCH1, ARCH2.
- Decisions: GIRO every 30 min (Federico). Skeleton chapters of new parts are public with a visible "Capitolo in costruzione" box (COO call). CC BY-SA images excluded for now.
- Started DEV-CHEMI-00 (skeleton of part VII). Storia skeleton waits for it.
- Follow-ups noted by DEVs: stale refs to old ch.1-2 (formulario, strategia); `editor/` still writes old mzlab paths; `docs/COORDINATORE.md` mentions old paths.

## 2026-10-31 (5)
- Merged since (4): #13 queue/log, #15 Storia skeleton (hidden), #16/#18/#19/#21/#22 chapters 22-31, #17 and #23 shared CSS/tool fixes, #20 hide drafts for readers, #25 21 original SVG drawings, #26 no "verifica" sections, #27 new nav (no app tabs, full-height sidebar, collapsible index, slow theme fade, download fixes), #28 chapter 32, #29 part VII glossary/formulary/links, #24 easy page editing (no token).
- Chemioinformatica 22-32 complete but hidden from readers until the Opus review fixes land. Opus review running (ARCH-CHEMI-REVIEW).
- Rules from Federico this session: no "in costruzione" text; no verification sections; GIRO every 30 min; slow theme transition; easy editing for the author.
- Open doubts for the review: Schymanski/MSI wording, modified cosine, entropy weighting, ppm sign convention, 1,0034/z, DTW cost.

## 2026-11-01 (6)
- Merged since (5): #30-#51 (Chemioinformatica published #38, Storia chapters 33-42, flake root-cause fixes #46 #50), #53 + #58 photocatalysis/TP removed everywhere, #55 download list clean, #54 linked exports (PDF/MD/Word/HTML, in-file anchors), #59 editor save in 3 steps (copy + open GitHub), #62 + #63 navigation (index open on first visit, header right of sidebar, search field, icon-only gear, "Riduci tutto", header prev/next with titles), #57 Storia published (nothing hidden any more), #67 Storia cold review + #70-#74 its fixes, #52 depth plan + #56 #60 #61 #64 #65 #66 #68 #69 #75 #76 #77 #78 #79 #80 #81 #82 (28 chapters 20 716 -> 48 980 prose words, menu 336 -> 283).
- Federico decisions: publish everything immediately, never hide drafts (review afterwards); Copilot = no; remove photocatalysis/TP everywhere; check every 60 min (token saving); editor must save in a few clicks.
- Lessons: archive a chat only after the merge result is known (never in the same call); `e2e_teoria_transizione` fixed at the root (waits for the smooth scroll to settle) instead of shortening prose.
- Open: nothing blocking. Later queue: delete old `editor/` (Rust chapter editor, superseded by in-page editor), delete `capitoli/src` twins, rename "QqQ lab" in titles/appname, size-budget tests + service worker, dyslexia audit, stale old-path mentions in COORDINAMENTO/COORDINATORE.

## 2026-11-01 (dev/clean)
- Federico approved "1 e 2 sì": deleted the old chapter editor `editor/` (and its tests `test_teoria_editor.py`, `storia_node.mjs`, `teoria_editor_node.mjs`) and the Markdown twins `capitoli/src/*.md`. The HTML pages are the only source. Removed only the html-vs-md twin comparisons from `test_chemi.py`, `test_numerazione.py`, `test_senza_verifica.py`, `test_immagini.py`; `test_controlla_modifica.py` still forbids code that reads `capitoli/src`. `.github/` untouched (`pages.yml` still runs a harmless `rm -rf capitoli/src`).
