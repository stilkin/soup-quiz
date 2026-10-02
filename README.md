# Soup Quiz

> **Status: real dataset shipped.** 347 soups compiled from Wikipedia with the
> dataset pipeline (change `add-dataset-pipeline`), 295 with credited bundled images;
> local stats record every round. Next up: SRS scheduling and the daily challenge (see
> [Roadmap](#roadmap)). Everything below marked *planned* is decided but not yet built.

## What is this project?

A family of quiz/training apps built from curated list-style datasets. Each app takes
a dataset (for the first app: the soups of the world, sourced from Wikipedia list
articles), and turns it into multiple game modes over the same data — e.g. *guess the
country from the ingredients*, *guess an ingredient from name + country*, later also
photo-based modes.

The concept, in priorities:

- **Train, don't just test** — every answer feeds local statistics and a spaced-repetition
  scheduler, so the app targets your weakest items.
- **Local-first** — all stats live on-device (SQLite); no accounts, no backend, no tracking.
- **A daily challenge** — one deterministic soup per UTC day for everyone, shareable as
  Wordle-style emoji results with streaks.
- **Look and feel matter** — tokenized theming, animated feedback; the content is the
  moat, the feel is the hook.

## What exists today vs. what's planned

| Present in this repo | Planned (decided in OpenSpec changes) |
|---|---|
| pnpm monorepo: `packages/{schema,data,engine,stats}` + `apps/soup-quiz` (Expo, iOS + Android) | SRS scheduling (serving weak soups more often) |
| Zod item contract with JSON Schema export; 249-country registry; flag emoji | UTC daily challenge; share texts |
| Seed-deterministic engine: mode-as-data, `generateRound`, scoring | Share-card page, notifications, store submission |
| Real dataset: 347 soups via the Python pipeline, review pass + overrides; one playable mode | More game modes over the same data (declarative configs) |
| Local stats: every round recorded (SQLite), stats screen with UTC day streaks, accuracy, mastery | |
| 295 credited Commons images bundled as ~200px JPEG (3.8 MB) | |
| Raw wikitext snapshots + cached article leads feeding the pipeline (`data/`) | |

## Technology

**In the repo today:** TypeScript (strict) across `packages/` and the Expo app
(SDK 57, React Native 0.86, expo-router, Reanimated, expo-image, expo-sqlite,
Fraunces via @expo-google-fonts), zod 4 (with native JSON Schema export), Vitest,
Biome; Python pipeline (stdlib + pycountry + Pillow) under `data/pipeline/`.

**Planned additions** (adjusted only via OpenSpec changes): an SRS scheduler and the
daily challenge on top of the existing SQLite stats.

## Repository layout

```
apps/soup-quiz/        Expo app (UI only): expo-router screens, theme tokens, feedback
packages/schema/       zod item contract, registries, validateDataset, JSON Schema
packages/data/         dataset v1 (347 soups) + validation and pairing tests
packages/engine/       pure, seed-deterministic quiz logic (no framework imports)
packages/stats/        pure progress computations: aggregation, UTC streaks, mastery
data/pipeline/         Python pipeline: identity, extract, normalize, review, images, compile
data/raw/wikipedia/    wikitext snapshots (pipeline inputs, not app content)
data/cache/            cached corpus scan + article leads (offline re-runs)
openspec/              config (locked decisions), changes, durable specs
.claude/               OpenSpec slash commands + skills (agent workflow)
```

## Installation and running

Requires Node 20+ and pnpm 10.

```bash
pnpm install        # workspace deps
pnpm typecheck      # tsc --noEmit across packages
pnpm lint           # Biome lint + format check
pnpm test           # Vitest: schema, engine, dataset validation
```

To play:

```bash
pnpm start          # expo start — scan the QR code with Expo Go (works from root or apps/soup-quiz)
```

The dataset pipeline lives under `data/pipeline/` — see its README for the venv
setup and the stage order.

## Development workflow

This repo uses [OpenSpec](https://github.com/openspec-dev/openspec) for spec-driven
development. Discussion becomes a change (proposal → specs → design → tasks), the change
is implemented by working the task list, and archiving folds its spec deltas into the
durable capability specs under `openspec/specs/`.

- `/opsx:explore` — think out loud (no writes)
- `/opsx:propose` — create/complete planning artifacts for a change
- `/opsx:apply` — implement a change's tasks
- `/opsx:update` — revise a change's artifacts
- `/opsx:archive` — archive an applied change and sync specs

Project-wide constraints (stack, local-first, UTC dailies, attribution posture) live in
`openspec/config.yaml` under `context:` and apply to every change.

## Roadmap

| # | Change | Status |
|---|---|---|
| 1 | `bootstrap-monorepo` — monorepo, schema, stub data, one playable mode | **archived 2026-10-02** (18/18 tasks) |
| 2 | `add-dataset-pipeline` — scrape/enrich/review/compile, image bundling + attribution | **implemented 2026-10-02** (device check pending) |
| 3 | `add-quiz-modes` — declarative mode configs over the real dataset | planned |
| 4 | `add-stats-page` — local recording, streaks, mastery, stats screen | **archived 2026-10-02** (10/10 tasks) |
| 5 | `add-srs-scheduling` — spaced-repetition serving from recorded data | planned |
| 6 | `add-daily-challenge` — UTC daily + emoji share texts | planned |
| 7 | later — share-card page, notifications, photo mode, store submission | backlog |

## Data sources and licensing

- Source snapshots in `data/raw/wikipedia/` are Wikipedia content (**CC BY-SA**); they are
  pipeline *inputs*, never shipped app content.
- The shipped dataset keeps facts (country, ingredients, types), uses our own short
  descriptions, and carries per-item source attribution + learn-more links.
- Item images: Commons originals re-encoded to ~200px JPEG thumbs and bundled as app
  assets (3.8 MB for 295 images) with mandatory per-image credit (author, license,
  deed link). No external image hosting; incomplete credit means no image.
- Scope decisions: porridge lists excluded; the two redirect-target lists (cheese soups,
  ramen types) included.

## API and database

- **REST API: none.** The app is local-first and offline; no backend is planned. (A tiny
  share-card web renderer is a possible later addition and would be documented then.)
- **Database: on-device only.** `apps/soup-quiz/src/storage/` holds two append-only
  SQLite tables (`rounds`, `answers`) via expo-sqlite; every stat is derived from them
  in `packages/stats`. Schema: `rounds(id, kind, mode_id, seed, length, correct,
  finished_at)`, `answers(id, round_id→rounds, item_id, correct, answered_at)` —
  timestamps are Unix ms UTC.
