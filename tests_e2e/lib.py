"""Shared helpers of the Playwright e2e tests: a static server for the published site (index.html, capitoli/, pratica/, assets/ of the repository, served under /static/, the URL the tests use), one Chromium, the JS errors seen
by the first page, and a report. Run one test with `python3 tests_e2e/e2e_teoria_nav.py`; no test needs anything but this repository."""
import atexit
import functools
import hashlib
import http.server
import os
import sys
import threading
from pathlib import Path
from urllib.parse import parse_qs, urlparse  # noqa: F401  (the editor test reaches them as lib.parse)

from playwright.sync_api import Page, sync_playwright  # noqa: F401

sha256 = hashlib.sha256
ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT                                                    # the site root
PUBLISHED = ("index.html", "capitoli", "pratica", "assets")  # what GitHub Pages serves: nothing else is reachable in the tests
SH = os.environ.get("E2E_SHOTS", "/tmp/e2e_shots/")
os.makedirs(SH, exist_ok=True)
_real_wft = Page.wait_for_timeout


def axe_path():
    """axe-core of the axe-playwright-python package (or $AXE_JS); None if neither exists, then the axe steps print SKIP."""
    p = os.environ.get("AXE_JS")
    if p and os.path.exists(p):
        return p
    try:
        import axe_playwright_python
    except ImportError:
        return None
    q = os.path.join(os.path.dirname(axe_playwright_python.__file__), "axe.min.js")
    return q if os.path.exists(q) else None


def frames(pg, n=2):
    """Wait for n animation frames of the page."""
    pg.evaluate("n => new Promise(res => { const f = () => (--n <= 0 ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); })", n)


def attendi(pg, js, timeout=15000):
    """Wait until the JS expression is truthy."""
    pg.wait_for_function(js, timeout=timeout)


class _Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(WEB), **k)

    def translate_path(self, path):
        path = urlparse(path).path
        rel = path[len("/static"):] if path.startswith("/static/") else "/__none__"
        return super().translate_path(rel if rel.lstrip("/").split("/")[0] in PUBLISHED else "/__none__")

    def log_message(self, *a):
        pass


class Run:
    """`r = Run(port=...)`: static server on 127.0.0.1:port, `r.page(p)` launches Chromium (the browser Playwright already has) and returns a page whose JS errors go to r.errs."""

    def __init__(self, port, wd=None):
        self.errs, self.b = [], None
        try:
            self.srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), _Handler)
        except OSError:                # port taken (tests run in parallel): any free one, the tests read r.port
            self.srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), _Handler)
        self.port = self.srv.server_address[1]
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()

    def page(self, p, **kw):
        self.b = p.chromium.launch(**kw)
        pg = self.b.new_context(viewport={"width": 1280, "height": 800}).new_page()
        pg.on("pageerror", lambda e: self.errs.append(("pageerror", str(e))))
        pg.on("console", lambda m: self.errs.append(("console." + m.type, m.text)) if m.type == "error" else None)
        return pg

    def close(self):
        try:
            if self.b:
                self.b.close()
        except Exception:
            pass                       # the test already left `with sync_playwright()`: the browser is gone with it
        self.srv.shutdown()

    def report(self):
        """Print the JS errors; the process exit code becomes 1 if there are any (the test prints its steps after this call)."""
        print("JS errors:", self.errs if self.errs else "none")
        if self.errs:
            atexit.register(lambda: (sys.stdout.flush(), os._exit(1)))


# Solver of the quadrupole game (pratica/quadrupolo.html) for a target m/z t and neighbour spacing sp. The old test took the FIRST U/V whose window excludes the
# neighbours, i.e. the narrowest one, and typed V and U/V rounded to 3 and 5 decimals: for some targets (level 3, m/z 89) the rounding let a neighbour in, and the page
# rightly answered "Passa anche un vicino". Now: take the middle of the feasible U/V range, centre V in the window, and verify the ROUNDED values with the page's own check.
QUAD_SOLVE_JS = """([t, sp]) => {
  const K = GIOCHI.KQ, okAt = (V, lam) => [t - sp, t, t + sp].map(m => GIOCHI.stable(2 * lam * K * V / m, K * V / m)), good = o => o[1] && !o[0] && !o[2], feas = [];
  for (let lam = 0.1; lam < 0.1684; lam += 0.0002) { const w = GIOCHI.windowQ(lam); if (!w) continue;
    const V = +((w[0] + w[1]) / 2 * t / K).toFixed(3), l = +lam.toFixed(5); if (good(okAt(V, l))) feas.push([V, l]); }
  return feas.length ? feas[feas.length >> 1] : null;
}"""
