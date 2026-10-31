"""Test di sicurezza e funzionalità per tools/server_teoria.py."""
from __future__ import annotations

import json
import threading
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

import pytest

import tools.server_teoria as st


@pytest.fixture(scope="module")
def local_server():
    server = ThreadingHTTPServer(("127.0.0.1", 0), st.EditorHandler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{port}"
    server.shutdown()


def test_allowed_origin_handling(local_server):
    # Origin not allowed
    req = urllib.request.Request(f"{local_server}/stato", headers={"Origin": "https://attacker.com"})
    try:
        urllib.request.urlopen(req)
        pytest.fail("Dovrebbe fallire con 403 per origin non consentita")
    except urllib.error.HTTPError as e:
        assert e.code == 403
        assert "Access-Control-Allow-Origin" not in e.headers

    # Origin allowed from GitHub Pages
    req_gh = urllib.request.Request(f"{local_server}/stato", headers={"Origin": "https://freeesta.github.io"})
    with urllib.request.urlopen(req_gh) as resp:
        assert resp.status == 200
        assert resp.headers.get("Access-Control-Allow-Origin") == "https://freeesta.github.io"
        data = json.loads(resp.read().decode())
        assert data["ok"] is True

    # Local origin allowed
    req_loc = urllib.request.Request(f"{local_server}/stato", headers={"Origin": "http://127.0.0.1:8765"})
    with urllib.request.urlopen(req_loc) as resp:
        assert resp.status == 200
        assert resp.headers.get("Access-Control-Allow-Origin") == "http://127.0.0.1:8765"


def test_cors_options_preflight(local_server):
    # Preflight from an attacker
    req_evil = urllib.request.Request(f"{local_server}/salva", headers={"Origin": "https://evil.org"}, method="OPTIONS")
    try:
        urllib.request.urlopen(req_evil)
        pytest.fail("Preflight da origin non consentita deve restituire 403")
    except urllib.error.HTTPError as e:
        assert e.code == 403

    # Preflight allowed
    req_ok = urllib.request.Request(f"{local_server}/salva", headers={"Origin": "https://freeesta.github.io"}, method="OPTIONS")
    with urllib.request.urlopen(req_ok) as resp:
        assert resp.status == 200
        assert resp.headers.get("Access-Control-Allow-Origin") == "https://freeesta.github.io"
        assert "POST" in resp.headers.get("Access-Control-Allow-Methods", "")
        assert "X-Teoria-Token" in resp.headers.get("Access-Control-Allow-Headers", "")


def test_post_salva_token_required(local_server):
    payload = json.dumps({"file": "capitoli/02-lc.html", "html": "test"}).encode()

    # No token -> 403
    req_no_tok = urllib.request.Request(f"{local_server}/salva", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        urllib.request.urlopen(req_no_tok)
        pytest.fail("POST senza token deve fallire con 403")
    except urllib.error.HTTPError as e:
        assert e.code == 403
        data = json.loads(e.read().decode())
        assert "Token" in data["error"]

    # Wrong token -> 403
    req_bad_tok = urllib.request.Request(
        f"{local_server}/salva",
        data=payload,
        headers={"Content-Type": "application/json", "X-Teoria-Token": "token-sbagliato-1234"},
        method="POST"
    )
    try:
        urllib.request.urlopen(req_bad_tok)
        pytest.fail("POST con token errato deve fallire con 403")
    except urllib.error.HTTPError as e:
        assert e.code == 403

    # Right token in the header
    assert st.verify_token(
        type("Handler", (), {"headers": {"X-Teoria-Token": st.TOKEN}, "path": "/salva"})(),
        {}
    ) is True


def test_path_traversal_blocked(local_server):
    # Try to read a file outside teoria through the /carica API
    req = urllib.request.Request(f"{local_server}/carica?file=../../Cargo.toml")
    try:
        urllib.request.urlopen(req)
        pytest.fail("Deve bloccare file che non finiscono con .html o contengono slash")
    except urllib.error.HTTPError as e:
        assert e.code == 400

    # Try to read a static file outside teoria
    try:
        urllib.request.urlopen(f"{local_server}/../Cargo.toml")
        pytest.fail("Non deve servire file fuori dal sito")
    except urllib.error.HTTPError as e:
        assert e.code in (400, 404)


def test_salva_senza_push_scrive_il_file_e_non_tocca_git(local_server, monkeypatch, tmp_path):
    """«Salva su questo computer» of the editor sends push=false: the page is written and checked, git is never called."""
    site = tmp_path / "sito"
    (site / "capitoli").mkdir(parents=True)
    page = site / "capitoli" / "prova.html"
    page.write_text("<!doctype html><html lang=it><title>x</title><body><main><h1>Uno</h1></main></body></html>", encoding="utf-8")
    monkeypatch.setattr(st, "TEORIA_DIR", site)
    calls = []
    real = st.subprocess.run

    def spy(cmd, *a, **k):
        calls.append(cmd[0:3])
        return real(cmd, *a, **k)

    monkeypatch.setattr(st.subprocess, "run", spy)
    new = "<!doctype html><html lang=it><title>x</title><body><main><h1>Due</h1></main></body></html>"
    req = urllib.request.Request(f"{local_server}/salva", data=json.dumps({"file": "capitoli/prova.html", "html": new, "push": False}).encode(),
                                 headers={"Content-Type": "application/json", "X-Teoria-Token": st.TOKEN}, method="POST")
    data = json.loads(urllib.request.urlopen(req).read())
    assert page.read_text(encoding="utf-8") == new
    assert not [c for c in calls if "git" in c[0:1]], calls
    assert data.get("ok") is True and data.get("commit") == "Non inviato", data
