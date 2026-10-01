# Tasks

## 1. Workspace scaffolding

- [x] 1.1 Initialize pnpm workspace (`pnpm-workspace.yaml` with `apps/*`, `packages/*`), root `package.json` with `typecheck`/`lint`/`test` scripts fanning out via `pnpm -r`; verify `pnpm -r run typecheck` succeeds (no-op) at root
- [ ] 1.2 Add base `tsconfig.base.json` (strict, moduleResolution bundler) and per-package tsconfigs extending it; verify `tsc --noEmit` passes in each package
- [x] 1.3 Add Biome config (lint + format rules committed) and root `biome.json`; verify `pnpm lint` and `pnpm format` run clean on the scaffolded tree

## 2. Schema package (`packages/schema`)

- [ ] 2.1 Create internal package (D2 pattern: exports TS source, no build step) with zod; define `SoupItem` shape per design D3 (id, name, description, sourceUrl, `countries` 1..n ISO alpha-2, optional `region`, `types` 1..n from vocabulary, `ingredients` 1..n unique canonical ids, optional `image` = `{ sourceFile, credit }` with credit mandatory when present); verify a typed sample parses in a unit test
- [ ] 2.2 Export shared registries: `SOUP_TYPES` controlled vocabulary and `COUNTRIES` (alpha-2 → display name) plus `flagEmoji(code)` helper; verify `flagEmoji('IT')` returns the Italian flag and unknown codes return a placeholder
- [ ] 2.3 Export JSON Schema document from the zod schema and a `validateDataset()` that reports item id + failing field; verify tests cover: duplicate ids, zero countries, unknown type, empty/duplicated ingredient ids, malformed sourceUrl — each rejected with the offending item named
- [ ] 2.4 Document in `packages/schema/README.md` any validation rules not expressible in JSON Schema (so the Python pipeline can compensate); verify the README lists zero undocumented gaps or names each one

## 3. Stub dataset (`packages/data`)

- [ ] 3.1 Author 10 adversarial stub items per design D7 (multi-country, region-not-country, multi-type, shared canonical ingredients with differing display spellings, one distractor-starved item); use real names/curid URLs from `data/raw/wikipedia/list-of-soups.wikitext` where possible; verify file exists and imports typed as `SoupItem[]`
- [ ] 3.2 Add `validateDataset` test as this package's test suite — the stub dataset must pass; verify `pnpm test` fails if any stub item is corrupted (mutation check by hand once)

## 4. Engine package (`packages/engine`)

- [ ] 4.1 Implement seeded PRNG (mulberry32) and dataset sampler; verify same seed → same item order across repeated calls, different seeds differ
- [ ] 4.2 Implement declarative mode config + the single `ingredients → country` mode instance; generator builds prompt from ingredient display names, correct option from item's countries, distractors from other items' countries; verify options are distinct and the distractor-starved stub item is skipped, per spec scenarios
- [ ] 4.3 Implement answer checking (any of item's countries counts) and round scoring (`generateRound(dataset, mode, {seed, length})` returning ordered questions); verify unit tests mirror the quiz-gameplay spec scenarios: determinism, multi-origin acceptance, one-answer-per-question enforcement at the engine API level

## 5. App shell (`apps/soup-quiz`)

- [ ] 5.1 Scaffold Expo TypeScript app with expo-router, verify it boots in Expo Go on an emulator
- [ ] 5.2 Wire monorepo deps (workspace `packages/schema`, `packages/data`, `packages/engine`) through Metro; verify a log line on the start screen shows the stub dataset size (proves D2 pattern end-to-end)
- [ ] 5.3 Build theme tokens (`theme.ts`: colors, spacing, radius, typography) and the start screen (dataset size, mode name, play button); verify rendering against tokens with no hardcoded colors
- [ ] 5.4 Build the play screen: question card (ingredient chips), 4 country options, Reanimated feedback (correct pulse / wrong shake), post-answer reveal with name, description, learn-more link (opens external browser), and — when the item has one — image with tappable credit line; verify a full round is playable by hand and the image renderer once with a temporary stub image
- [ ] 5.5 Build the result screen (correct/total, replay with new seed); verify replay produces a visibly different round order

## 6. Integration checks

- [ ] 6.1 Verify from repo root: `pnpm typecheck`, `pnpm lint`, `pnpm test` all green; run one manual round end-to-end on Android and iOS emulators and confirm feedback, reveal, learn-more link, and result screen behave per spec
