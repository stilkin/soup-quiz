# Dataset pipeline

Python side of the schema-as-contract: turns the wikitext snapshots in
`data/raw/wikipedia/` into `packages/data/src/soups.v1.json` plus bundled, credited images.

Stdlib + `pycountry` + `Pillow` only. No pandas — the job is fetching, wikitext parsing,
and normalization, not dataframes.

## Setup

```sh
python3 -m venv data/pipeline/.venv
data/pipeline/.venv/bin/pip install pycountry pillow
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
