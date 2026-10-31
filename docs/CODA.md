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
