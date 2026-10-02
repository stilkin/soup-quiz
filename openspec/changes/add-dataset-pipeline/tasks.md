# Tasks

## 1. Pipeline scaffold + identity stage

- [x] 1.1 Create `data/pipeline/` (venv documented in its README, stdlib + Pillow), move the corpus-resolution logic from the exploration scan into `01_identity.py` reading `data/raw/wikipedia/`; verify it reuses `data/cache/corpus-scan.json` without network and reports 430 resolved / 14 unresolved
- [x] 1.2 Add `aliases.py` (country aliases incl. Türkiye/Russia/Korea/subnationals → ISO + region) with unit checks via plain asserts run by the script; verify Turkey→TR, Scotland→GB+region, and that an unknown value flags rather than guesses

## 2. Extraction + normalization

- [x] 2.1 Write `02_extract.py`: parse cached lead sections (infobox fields; species/place infobox detection for the relevance flag) and source-list entries into `build/raw_items.json`; verify against cached data: infobox match count ≈ 239, species/place flags catch the known noise examples
- [x] 2.2 Write `03_normalize.py` with `type_map.py` (60→10) and `ingredient_lexicon.py` (seeded from exploration frequencies); verify every raw type maps or flags, ingredient canonicalization collapses the known spelling families, and no value is invented silently
- [x] 2.3 Write `04_review.py`: emit `build/review.csv` (one row per flag: id, field, raw value, reason) and `report.json` (corpus, filtered, flagged, per-field coverage); verify the report numbers match the cached corpus

## 3. Compile + dataset swap

- [x] 3.1 Write `06_compile.py` (runs after review resolution): merge `overrides.csv` (winning source), drop unresolved-flag soups, emit `packages/data/src/soups.v1.json`; verify compilation fails loudly on schema violations (item id + field) and that the emitted file passes `validateDataset` via the packages/data test suite
- [x] 3.2 Swap `packages/data` to v1 (delete `soups.v0.json`, export the real dataset), extend its tests: dataset validates, ids unique, every country ISO-valid, types within vocabulary, stats-compat spot check (stub pageids that survive appear); verify `pnpm test` green and the app typecheck/bundle export pass with the real dataset wired in

## 4. Images

- [ ] 4.1 Write `05_images.py`: Commons `imageinfo`+`extmetadata` cached; 400px thumbs fetched politely, Pillow-re-encoded to the measured target size/q90 into `apps/soup-quiz/assets/soups/<pageid>.jpg`; write `images.manifest.json` and regenerate `src/images.ts`; verify per-image credit completeness (incomplete → no image, flag)
- [ ] 4.2 Measure real re-encoded sizes at 200px and 320px, pick per the design open question, and record the decision in the run report; verify total bundle addition stays under ~20 MB
- [ ] 4.3 Add the pairing test in `packages/data` (dataset ↔ assets ↔ manifest agreement); verify it fails when any asset lacks a dataset item or a dataset image lacks credit

## 5. Review pass (the manual/agent workload)

- [ ] 5.1 Work through `build/review.csv` in-session: propose countries/regions/types/ingredients/descriptions from lead prose, write approved answers to `data/pipeline/overrides.csv`; verify a full compile runs with zero unresolved flags and the shipped count meets the ≥ 300 target (or the report explains the shortfall)

## 6. Integration checks

- [ ] 6.1 Full pipeline run end-to-end twice; verify the second run makes no network calls (cache check), the report is stable, `pnpm typecheck`/`lint`/`test` all green, bundle export compiles with images, and an on-device round plays with the real dataset (user confirms: images render, credits visible via the reveal, stats still show history)
