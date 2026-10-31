"""Screenshots of the navigation layout (not a test: run by hand, `python3 tests_e2e/shots_teoria_nav.py`): the home page and one chapter at 1280 and 390 px, light and dark,
saved as docs/img/nav2-<page>-<width>-<theme>.png (390 px: also with the drawer open)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
OUT = ROOT / "docs" / "img"
r = Run(port=8979)
with sync_playwright() as p:
    r.page(p)
    for name, page in (("home", "index.html"), ("cap07", "capitoli/07-quadrupolo.html")):
        for w, h, mob in ((1280, 800, False), (390, 844, True)):
            for th in ("light", "dark"):
                c = r.b.new_context(viewport={"width": w, "height": h}, color_scheme=th, is_mobile=mob, has_touch=mob, reduced_motion="reduce"); q = c.new_page()
                q.goto(f"http://127.0.0.1:{r.port}/static/{page}"); q.wait_for_selector("#side a.on", state="attached"); q.wait_for_selector("#tbar", state="attached"); q.wait_for_timeout(700)
                q.screenshot(path=str(OUT / f"nav2-{name}-{w}-{th}.png"))
                if mob:
                    q.click("#menu"); q.wait_for_timeout(500); q.evaluate("document.querySelector('#side').scrollTop = 0"); q.wait_for_timeout(200)
                    q.screenshot(path=str(OUT / f"nav2-{name}-{w}-{th}-drawer.png"))
                c.close()
r.close()
print("saved in", OUT)
