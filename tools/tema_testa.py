"""The theme snippet that sits at the top of every Teoria page (`<!--tema-->...<!--/tema-->`, right after `<meta charset>`): theme first, synchronous, before any stylesheet,
so there is no flash of the wrong colour. `inject(html)` puts it in (or replaces it in) a page; tests/test_controlla_teoria.py builds chapters with it."""
import re

SNIPPET = '<!--tema--><meta name="color-scheme" content="light dark"><style>html{background:#fbfbf9}@media(prefers-color-scheme:dark){html:not([data-theme=light]){background:#14171b}}html[data-theme=dark]{background:#14171b}html[data-theme=light]{background:#fbfbf9}html.no-tr *,html.no-tr *::before,html.no-tr *::after{transition:none!important}</style><script>(function(){var R=document.documentElement,t=null;try{if(parent!==window)t=parent.document.documentElement.getAttribute("data-theme")}catch(e){}if(!t)try{t=JSON.parse(localStorage.getItem("mzlab.prefs")||localStorage.getItem("qqq.prefs")||"{}").theme}catch(e){}if(t==="dark"||t==="light"){R.setAttribute("data-theme",t);R.style.colorScheme=t}R.classList.add("no-tr");addEventListener("load",function(){requestAnimationFrame(function(){requestAnimationFrame(function(){R.classList.remove("no-tr")})})})})()</script><!--/tema-->'


def inject(text: str) -> str:
    """Page with exactly one up-to-date snippet."""
    if "<!--tema-->" in text:
        return re.sub(r"<!--tema-->.*?<!--/tema-->", lambda _: SNIPPET, text, count=1, flags=re.S)
    return text.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + SNIPPET, 1)
