# Proposal

## Why

The app plays on a 10-soup stub. The real corpus — measured, not estimated: 430 resolvable
soups from the list snapshots (14 drifted entries unresolved), 414 detail articles cached —
is waiting to become the product. Exploration pinned the data quality: ~57% of articles have
a structured food infobox (main_ingredient 56%, country 49%, image 57%), ~43% need fallbacks,
and the lists link a small amount of non-soup noise (species, cities, techniques). The
pipeline's job is to turn that into a validated, credited, image-bundled dataset with the
gaps made visible for a manual pass.

## What Changes

- New Python pipeline under `data/pipeline/` (stdlib + Pillow only — no pandas; the job is
  API fetching, wikitext parsing, and normalization, not dataframes):
  - identity: list snapshots → deduped titles → pageids (reuses `data/cache/corpus-scan.json`)
  - fetch: detail-article lead sections, cached under `data/cache/articles/` (already 414/414)
  - extract: infobox fields with fallback mining from list descriptions and lead prose
  - normalize: country aliases (Türkiye/Russia/Korea/subnational→ISO), 60→10 soup-type
    mapping, ingredient canonicalization seed lexicon, relevance flags
  - review: flagged gaps emitted as `review.csv`; manual answers live in versioned
    `overrides.csv` and always win at compile time
  - compile: `soups.v1.json`, validated against the exported JSON Schema before it ships
- `packages/data` switches from the stub to the real dataset — item ids are pageids in both,
  so existing recorded stats stay valid
- Images: Commons thumbs fetched with credit metadata, re-encoded to ~200px JPEG, bundled in
  the app with a generated manifest; a pairing test guarantees dataset ↔ asset ↔ manifest
  agreement
- Coverage report on every pipeline run

Out of scope: SRS scheduling, more game modes, daily challenge, dataset versioning seasons
(v1 is a single version; seasons arrive with the daily challenge), non-English Wikipedias.

## Capabilities

### New Capabilities
- `dataset-pipeline`: turning the cached Wikipedia snapshots into a validated, image-bundled
  dataset — corpus identity, extraction with fallbacks, review/override workflow, image
  mirroring with credit, and the guarantees the app relies on (idempotent runs, validation
  gating, pairing)

### Modified Capabilities

(none — `dataset-schema` already specifies the contract this pipeline must satisfy; the
schema itself is unchanged)

## Impact

- New: `data/pipeline/` (~6 small scripts + mapping tables), `data/cache/` (committed:
  corpus scan + article leads), `packages/data/src/soups.v1.json`, generated
  `apps/soup-quiz/assets/soups/` + image manifest
- Modified: `packages/data/src/index.ts` (export v1), `apps/soup-quiz/src/images.ts`
  (generated from the manifest), `packages/data` tests (real-dataset pins + pairing)
- One-time network: articles already cached; remaining = Commons metadata + thumbs
  (~2 requests per imaged soup, politely paced)
- Stats compatibility: ids are pageids in stub and real dataset — recorded rounds survive
