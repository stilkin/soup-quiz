# Proposal

## Why

The project has agreed architecture (Expo monorepo, schema-as-contract data pipeline, engine/app split) and raw source data on disk (`data/raw/wikipedia/`), but no code. A walking skeleton with stub data de-risks the architecture before the real dataset work starts, and gives us an early surface to iterate on the look and feel — the app's key differentiator — while the content pipeline is still being built.

## What Changes

- New pnpm monorepo at the repo root:
  - `packages/schema` — zod schema for quiz items, the single source of truth shared by app and (via exported JSON Schema) the future Python pipeline; includes optional per-item images with mandatory self-contained credit, bundled as app assets (no external storage)
  - `packages/data` — stub dataset: ~10 hand-written soup items that deliberately exercise normalization edge cases
  - `packages/engine` — pure-TS quiz logic, seeded with one question generator and scoring
  - `apps/soup-quiz` — Expo (TypeScript) app shell with expo-router
- One game mode playable end-to-end: **ingredients → country** (show a soup's ingredients, pick the country from 4 options, distractors drawn from other items, immediate feedback, final score)
- Tokenized theme and animated answer feedback (Reanimated) so the skeleton already looks and feels like the product
- Workspace tooling: strict TypeScript, Biome (lint + format), Vitest for packages, root scripts for typecheck/lint/test

Out of scope (later changes): real Wikipedia scraping/enrichment pipeline, image pipeline (fetch Commons originals, re-encode ~200px thumbs, bundle + pairing test — change 2), stats/streaks/SRS persistence, daily challenge and share texts, additional and photo-based game modes, notifications.

## Capabilities

### New Capabilities
- `dataset-schema`: the validated contract for quiz items — field shapes, 1..n normalized countries/regions and types, stable IDs, source attribution — and what conformance means for any dataset (stub or real)
- `quiz-gameplay`: playable quiz rounds generated from a dataset — question generation with plausible distractors, answer checking, feedback, and scoring

### Modified Capabilities

(none — greenfield, no existing specs)

## Impact

- All new code; no existing code or specs affected
- New dependencies: expo + expo-router (pinned SDK), zod, typescript, biome, vitest; React Native new architecture
- `data/raw/wikipedia/` is untouched (input for the later dataset-pipeline change)
- The zod → JSON Schema export is the seam the Python pipeline (change 2) will validate against
