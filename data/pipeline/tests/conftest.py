"""Loader for the numbered stage modules (identifiers can't start with a digit)."""

import importlib.util
from pathlib import Path

PIPELINE = Path(__file__).resolve().parents[1]


def load_stage(stem: str):
    path = PIPELINE / f"{stem}.py"
    spec = importlib.util.spec_from_file_location(stem, path)
    assert spec is not None and spec.loader is not None, f"cannot load {path}"
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
