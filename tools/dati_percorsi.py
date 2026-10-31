"""Where the private data repository of the author is (it is NOT part of this repository): the env var MZLAB_DATI, a folder. Without it (CI, other people) `radice()` and
`percorso()` return None and the checks that need private data skip themselves with a warning."""
import os
from pathlib import Path


def radice():
    """The data repository folder, or None."""
    p = os.environ.get("MZLAB_DATI")
    return Path(p) if p and Path(p).is_dir() else None


def percorso(rel: str):
    """`rel` inside the data repository, or None if the repository or the path is missing."""
    d = radice()
    return d / rel if d and (d / rel).exists() else None
