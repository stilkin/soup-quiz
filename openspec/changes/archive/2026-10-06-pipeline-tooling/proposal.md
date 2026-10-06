# Proposal

## Why

The TypeScript side has the full toolchain (Biome lint/format, strict tsc, Vitest — 92
tests). The Python dataset pipeline — source of the shipped dataset and of this
project's nastiest bugs (`split_params` depth, `strip_wikitext` nesting, underscore
titles, `-99` ISO fallbacks) — has no linter, formatter, type-checker, or tests; its
only safety net is downstream TS conformance tests that gate the *output*, not the
transforms. And no coverage has ever been measured anywhere: the provider isn't wired.

## What Changes

- **Ruff** for `data/pipeline/` — lint and format in one tool (Black-compatible
  formatter), `line-length = 100` matching Biome; config in
  `data/pipeline/pyproject.toml`.
- **MyPy** baseline — default rules, `ignore-missing-imports` (pycountry has no stubs).
- **PyTest** unit tests for the bug-dense transforms: `strip_wikitext` (nested file
  links, template nesting, paren husks), `split_params` depth handling, `lead_photo`,
  image-title underscore normalization, and the centroid ISO fallback chain against a
  fixture GeoJSON. Small inline fixtures; no end-to-end compile runs (already gated by
  the TS data tests).
- **Vitest coverage** wired: `@vitest/coverage-v8` + `pnpm test:coverage`
  (report-only, no thresholds yet — read the number first).
- **Root scripts** `lint:py`, `typecheck:py`, `test:py` shelling into the pipeline
  venv, so `pnpm` stays the single entry point; `data/pipeline/README.md` documents
  the extra venv packages.

Out of scope: app component tests (no RN test infra; the app is thin UI), CI, coverage
thresholds, rewriting pipeline code beyond what ruff format and obvious lint fixes
touch.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- None — tooling and tests only; no pipeline behavior changes (`skip_specs: true`).
  Existing behavior is *pinned* by the new unit tests, not changed; the output
  contract stays gated by the `packages/data` suite.

## Impact

- `data/pipeline/pyproject.toml` (new config), venv gains ruff/mypy/pytest.
- `data/pipeline/tests/` (new), possible minimal importability refactor of stage
  scripts (move top-level code into functions/`main()` guards where tests need to
  import helpers).
- Root `package.json` scripts; per-package vitest coverage dep; README/CLAUDE.md
  command docs.
