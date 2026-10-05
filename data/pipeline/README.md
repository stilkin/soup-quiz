# Dataset pipeline

Python side of the schema-as-contract: turns the wikitext snapshots in
`data/raw/wikipedia/` into `packages/data/src/soups.v1.json` plus bundled, credited
images, and the country centroids in `packages/schema/src/centroids.ts`.

Stdlib + `pycountry` + `Pillow` only. No pandas — the job is fetching, wikitext parsing,
and normalization, not dataframes.

## Setup

```sh
python3 -m venv data/pipeline/.venv
data/pipeline/.venv/bin/pip install pycountry pillow
data/pipeline/.venv/bin/pip install ruff mypy pytest   # dev tooling (lint/typecheck/tests)
```

Tooling versions in use (2026-10-05): ruff 0.16, mypy 2.4, pytest 9.1. Config lives in
`pyproject.toml` (ruff line-length 100 matching Biome, lenient mypy, pytest testpaths).
Run from the repo root via `pnpm lint:py` / `typecheck:py` / `test:py` — or directly:

```sh
data/pipeline/.venv/bin/ruff check data/pipeline
data/pipeline/.venv/bin/mypy data/pipeline
data/pipeline/.venv/bin/pytest data/pipeline
```

## Stages (run in order; each is independently re-runnable)

```sh
V=data/pipeline/.venv/bin/python
$V data/pipeline/01_identity.py    # snapshots -> corpus.json (pageids, sources); cache-first
$V data/pipeline/02_extract.py     # cached lead sections -> build/raw_items.json
$V data/pipeline/03_normalize.py   # aliases + type map + ingredient lexicon -> flags
$V data/pipeline/04_review.py      # build/review.csv + build/report.json
$V data/pipeline/05_images.py      # Commons credit + thumbs -> assets + manifest (network, cached)
$V data/pipeline/06_compile.py     # overrides merge -> packages/data/src/soups.v1.json
$V data/pipeline/07_centroids.py   # Natural Earth label points -> packages/schema/src/centroids.ts (network, cached)
```

## Committed data tables

- `aliases.py` — country aliases and subnational → ISO + region mappings
- `type_map.py` — raw Wikipedia type values → schema vocabulary
- `ingredient_lexicon.py` — display spellings → canonical ingredient ids
- `overrides.csv` — manual review answers; **always win** at compile time

## Caching

`data/cache/` holds the corpus scan, article lead sections, and Commons metadata.
Everything except a first run works offline. Requests are paced ≥3 s with
`Retry-After` honored; the User-Agent names this repo.
