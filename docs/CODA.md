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
