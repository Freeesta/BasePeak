"""Runs every tests_e2e/e2e_*.py one after the other, prints the tail of the output of the failed ones and exits 1 if any failed. A script fails if it exits non-zero, OR prints
FAIL (some report a failed step only in their output) OR prints SKIP (a skipped check is not a green one: in CI everything they need is installed). `python3 tests_e2e/run_all.py [name-substring ...]` runs only the matching ones."""
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
TIMEOUT = 600
names = sys.argv[1:]
tests = [p for p in sorted(HERE.glob("e2e_*.py")) if not names or any(n in p.name for n in names)]
failed = []
for p in tests:
    t0 = time.time()
    try:
        r = subprocess.run([sys.executable, str(p)], capture_output=True, encoding="utf-8", timeout=TIMEOUT)
        out = r.stdout + r.stderr
        ok = r.returncode == 0 and not re.search(r"\b(FAIL|SKIP)\b", out)
    except subprocess.TimeoutExpired as e:
        ok, out = False, f"TIMEOUT after {TIMEOUT} s\n{(e.stdout or b'').decode('utf-8', 'replace') if isinstance(e.stdout, bytes) else (e.stdout or '')}"
    print(f"{'ok  ' if ok else 'FAIL'} {p.name} ({time.time() - t0:.0f} s)", flush=True)
    if not ok:
        failed.append(p.name)
        print("\n".join("    " + line for line in out.splitlines()[-40:]), flush=True)
print(f"\n{len(tests) - len(failed)}/{len(tests)} e2e scripts passed" + (f"; failed: {', '.join(failed)}" if failed else ""))
sys.exit(1 if failed else 0)
