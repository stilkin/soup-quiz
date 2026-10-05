# Tasks

## 1. Python tooling baseline

- [ ] 1.1 `data/pipeline/pyproject.toml` (ruff lint+format line 100 + I, mypy lenient, pytest) + install ruff/mypy/pytest into the venv; `ruff format` the pipeline, `ruff check --fix` safe fixes, review the rest with the user if behavior-relevant; `mypy` baseline run recorded; README venv section updated (tools + versions)
- [ ] 1.2 Root scripts `lint:py`, `typecheck:py`, `test:py`; verify each fails loudly without the venv and passes with it

## 2. Transform unit tests

- [ ] 2.1 Make stage helpers importable (`main()` guards only, no behavior change); one smoke re-run of a stage to prove identical execution
- [ ] 2.2 PyTest units for `strip_wikitext` (nesting, file links, paren husks), `split_params` (depth, own-`{{`), `lead_photo`, title normalization, centroid ISO fallback chain on an inline GeoJSON fixture; `test:py` green

## 3. Coverage + docs

- [ ] 3.1 Add `@vitest/coverage-v8` to the four packages, root `test:coverage` script, run it and record the per-package numbers in this change's summary
- [ ] 3.2 CLAUDE.md commands (`lint:py`/`typecheck:py`/`test:py`, `test:coverage`) + README note; `pnpm typecheck`/`lint`/`test` all green
