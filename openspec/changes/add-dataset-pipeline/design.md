# Design

## Context

Exploration findings baked in (2026-10-02): 430 resolvable titles (14 unresolved), 414 lead
sections cached in `data/cache/articles/`, structured infobox coverage 57% (main_ingredient
56%, country 49%, image 57%), 60 distinct raw soup-type values, 54 ISO-mappable countries in
the main table with ~91 rows needing aliases/regions/manual, and a small amount of non-soup
noise in the lists. Schema and app are unchanged — this change produces data, not contracts.

## Goals / Non-Goals

**Goals:**
- A validated real dataset in `packages/data` (target ≥ 300 shippable soups; stretch 400)
- Every gap visible in a review file; every manual answer versioned in an overrides file
- Bundled, credited images with a hard pairing guarantee
- Idempotent, offline-re-runnable pipeline

**Non-Goals:**
- No pandas/numpy (API fetch + wikitext parse + normalize don't need dataframes)
- No schema changes (v1 ships on the existing contract)
- No dataset seasons/versioning machinery (single v1; seasons come with the daily challenge)
- No ingredient ontology project — a seed lexicon plus review pass, grown on demand

## Decisions

### D1: Pipeline layout — small stdlib scripts, artifact files between stages
`data/pipeline/` with `01_identity.py`, `02_extract.py`, `03_normalize.py`, `04_review.py`,
`05_images.py`, `06_compile.py`, plus committed data tables (`aliases.py`, `type_map.py`,
`ingredient_lexicon.py`, `overrides.csv`). Stages communicate via files in `data/cache/`
and `data/build/` so each is re-runnable and inspectable. Python via a documented venv;
deps: stdlib + Pillow (thumb re-encode). *Alternative rejected:* a single orchestrating
package — harder to re-run one stage, harder to inspect intermediates.

### D2: Cache-first, polite network
Every network result is cached (`corpus-scan.json`, `articles/`, `commons/`). Requests are
paced (≥3 s) with `Retry-After` honored and a descriptive User-Agent. Articles are already
cached; the remaining one-time cost is Commons metadata + thumbs. *Consequence:* offline
re-runs after the first fetch.

### D3: Fallback chain per field, then review — and the review pass is us
infobox → source-list entry → flagged gap. Flags land in `build/review.csv`; answers are
written to `overrides.csv` (committed, human/agent-edited, always win). The heavy lifting
for the ~43% infobox-less tail happens as an in-session pass over `review.csv` (agent
reads lead prose, proposes values, user approves) — the pipeline itself stays deterministic.
*Alternative rejected:* LLM calls inside the pipeline — nondeterministic builds, and the
in-session loop is strictly more controllable.

### D4: Relevance filter before extraction
Heuristic flags for linked articles that are species (taxobox), places (settlement
infobox), or techniques — plus a manual override path to keep surprising real soups
(examples found: *Euthynnus affinis*, *Magelang*). Keeps noise out of review.

### D5: Normalization tables are code-reviewed data
`aliases.py` (Turkey→TR, Russia→RU, Scotland/England/Wales→GB+region, Korea→KR+region
"Korean cuisine", diaspora→manual), `type_map.py` (60 raw values → the 10-value vocabulary;
"Varies"/jokey values → manual; ingredient-as-type values like Chicken/Beef → dropped into
ingredient candidates instead). Consistency (smooth/chunky/brothy) is **dropped for v1** —
one axis is enough for modes; revisit if a mode wants it.

### D6: Ingredients via seed lexicon + candidates
Infobox `main_ingredient` parsed into display names; lexicon maps spellings to canonical
ids (potato/papas/aloo→potato); unknown candidates ship flagged into review where we assign
or drop them. The lexicon starts from exploration's frequency data (garlic, broth, carrot,
coriander, beef, onion, tamarind…) and grows through the review pass — it is a project
asset, not a one-shot.

### D7: Images — Commons metadata, thumb fetch, re-encode, manifest, generated map
Per imaged soup: `imageinfo` + `extmetadata` (author, license, licenseUrl) cached; thumb
requested at 400px, Pillow-re-encoded to 200px q90 into `apps/soup-quiz/assets/soups/
<pageid>.jpg`; `images.manifest.json` (id → credit) written next to the assets;
`apps/soup-quiz/src/images.ts` becomes **generated** from the manifest (script emits it;
committed). Pairing test in `packages/data` asserts dataset ↔ assets ↔ manifest agreement
and rejects any image without complete credit. Soups whose Commons credit is incomplete
ship without an image (flagged), per the dataset-schema spec.

### D8: Dataset swap keeps stats valid
`soups.v1.json` replaces the stub export; ids are pageids in both datasets so existing
recorded rounds reference real items. `soups.v0.json` is deleted (git history keeps it).
Rounds whose items leave the dataset (noise-filtered) simply stop surfacing in stats —
acceptable, and the stats screen already tolerates unknown ids.

### D9: The run report is a first-class artifact
Every full run writes `build/report.json` + prints a summary: corpus, filtered, shipped,
per-field coverage, unresolved flags, image coverage. This is the pipeline's observability —
no flying blind on data quality.

## Risks / Trade-offs

- [Structured coverage is 57%, not 80+] → the review pass is a scheduled, sized workload
  (~180 soups × a few fields), not a surprise; report tracks completion.
- [Ingredient long tail is huge] → seed lexicon + review pragmatism; the quiz needs 3–6
  good ingredients per soup, not a recipe.
- [Commons metadata gaps] → image ships only with complete credit (spec); flagged otherwise.
- [List drift vs snapshots] → snapshots are the fixed source of truth; unresolved titles
  are reported. Re-snapshotting is a deliberate future action.
- [compile excludes flagged soups] → dataset size may land under target; report shows why.

## Migration Plan

Stub dataset replaced wholesale; no consumer changes (same types, same validation, same
ids). Stats DB untouched. Rollback = revert the commit.

## Open Questions

- Target thumb size 200px vs 320px: decided empirically in the images task by measuring
  real re-encoded files (both are bundle-friendly: ~6 MB vs ~15 MB estimated).
- Whether `description` should be mined from the lead paragraph automatically or written
  in the review pass — default: lead-sentence extraction with review polish for flagged ones.
