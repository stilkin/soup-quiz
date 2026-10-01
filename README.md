# Soup Quiz

> **Status: change 1 (`bootstrap-monorepo`) implemented** — monorepo, schema, engine,
> stub dataset, and a playable quiz round. The real dataset pipeline, stats, and the
> daily challenge are the next changes (see [Roadmap](#roadmap)). Everything below
> marked *planned* is decided but not yet built.

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
| pnpm monorepo: `packages/{schema,data,engine}` + `apps/soup-quiz` (Expo, iOS + Android) | Python/pandas dataset pipeline validating against the exported JSON Schema |
| Zod item contract with JSON Schema export; 249-country registry; flag emoji | Real dataset (~583 soups), credited bundled images |
| Seed-deterministic engine: mode-as-data, `generateRound`, scoring (52 tests) | More game modes over the same data (declarative configs) |
| Stub dataset: 10 adversarial soups; one playable mode (ingredients → country) | On-device stats, streaks, SRS; UTC daily challenge; share texts |
| Raw wikitext snapshots of 16 Wikipedia list articles (`data/raw/wikipedia/`) | Share-card page, notifications, photo mode, store submission |

## Technology

**In the repo today:** TypeScript (strict) across `packages/` and the Expo app
(SDK 57, React Native 0.86, expo-router, Reanimated, expo-image, Fraunces via
@expo-google-fonts), zod 4 (with native JSON Schema export), Vitest, Biome; raw
wikitext data for the future pipeline.

**Planned additions** (adjusted only via OpenSpec changes):

- **Python 3 + pandas** dataset pipeline (change 2), validating against the JSON Schema
  exported from `packages/schema`
- **expo-sqlite** for on-device stats, streaks, and spaced repetition (change 4)

## Repository layout

```
apps/soup-quiz/        Expo app (UI only): expo-router screens, theme tokens, feedback
packages/schema/       zod item contract, registries, validateDataset, JSON Schema
packages/data/         stub dataset v0 (adversarial by design) + validation tests
packages/engine/       pure, seed-deterministic quiz logic (no framework imports)
data/raw/wikipedia/    wikitext snapshots (pipeline inputs, not app content)
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

To play (from `apps/soup-quiz`):

```bash
pnpm start          # expo start — scan the QR code with Expo Go
```

The dataset pipeline (change 2) adds a Python side under `data/` with its own
virtualenv instructions at that point.

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
| 1 | `bootstrap-monorepo` — monorepo, schema, stub data, one playable mode | **implemented** (17/18 tasks; on-device round pending) |
| 2 | `add-dataset-pipeline` — scrape/enrich/review/compile, image bundling + attribution | planned |
| 3 | `add-quiz-modes` — declarative mode configs over the real dataset | planned |
| 4 | `add-stats-streaks-srs` — SQLite stats, streaks, spaced repetition | planned |
| 5 | `add-daily-challenge` — UTC daily + emoji share texts | planned |
| 6 | later — share-card page, notifications, photo mode, store submission | backlog |

## Data sources and licensing

- Source snapshots in `data/raw/wikipedia/` are Wikipedia content (**CC BY-SA**); they are
  pipeline *inputs*, never shipped app content.
- The shipped dataset keeps facts (country, ingredients, types), uses our own short
  descriptions, and carries per-item source attribution + learn-more links.
- Item images (planned, change 2): Commons originals re-encoded to ~200px JPEG thumbs and
  **bundled as app assets** (~6 MB for ~583 soups) with mandatory per-image credit
  (author, license, deed link). No external image hosting.
- Scope decisions: porridge lists excluded; the two redirect-target lists (cheese soups,
  ramen types) included.

## API and database

- **REST API: none.** The app is local-first and offline; no backend is planned. (A tiny
  share-card web renderer is a possible later addition and would be documented then.)
- **Database: none yet.** On-device SQLite (stats/streaks/SRS) arrives with change 4;
  a Mermaid ER diagram plus per-table column reference will live in `docs/database.md`
  at that point.
