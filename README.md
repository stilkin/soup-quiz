# Soup Quiz

> **Status: planning phase.** This repository currently contains project planning
> (OpenSpec), raw source data, and no application code. The first implementation
> change (`bootstrap-monorepo`) is fully proposed and ready to apply — see
> [Roadmap](#roadmap). Everything below marked *planned* is decided but not yet built.

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
| Raw wikitext snapshots of 16 Wikipedia list articles (`data/raw/wikipedia/`) | pnpm monorepo: `packages/{schema,data,engine}` + `apps/soup-quiz` |
| Dedup measurement: **583 unique soup titles** across sources | Expo (React Native, TypeScript) app, iOS + Android |
| OpenSpec planning artifacts for change 1 (`openspec/changes/bootstrap-monorepo/`) | Python/pandas dataset pipeline validating against an exported JSON Schema |
| Locked product decisions (`openspec/config.yaml` → `context`) | On-device stats, streaks, SRS; UTC daily challenge; share texts |

## Technology

**In the repo today:** Markdown/YAML planning artifacts (OpenSpec, spec-driven schema) and
raw wikitext data. Nothing else — no build, no runtime.

**Planned stack** (per the `bootstrap-monorepo` design; adjusted only via OpenSpec changes):

- **TypeScript** (strict) end-to-end for the app; **Python 3 + pandas** for the dataset pipeline
- **Expo SDK / React Native** (new architecture) with **expo-router**, targeting iOS and Android
- **Reanimated** for animated answer feedback; tokenized theme
- **zod** as the single schema source of truth, exporting **JSON Schema** as the contract
  the Python pipeline validates against
- **pnpm** workspaces (no build orchestrator yet); **Biome** (lint + format); **Vitest**
- **expo-sqlite** for on-device stats (from change 4)
- Seeded PRNG (mulberry32) for deterministic, replayable rounds

## Repository layout

```
openspec/
  config.yaml                  project context + locked decisions
  changes/bootstrap-monorepo/  change 1 artifacts: proposal, specs, design, tasks
data/
  raw/wikipedia/               wikitext snapshots (pipeline inputs, not app content)
.claude/                       OpenSpec slash commands + skills (agent workflow)
```

## Installation and running

Nothing to install or run yet — there is no application code. Clone and read.

Once `bootstrap-monorepo` is applied (`/opsx:apply bootstrap-monorepo`), the repo will
provide, per its task list:

```bash
pnpm install        # workspace deps
pnpm typecheck      # tsc --noEmit across packages
pnpm lint           # Biome lint + format check
pnpm test           # Vitest: schema, engine, dataset validation
npx expo start      # from apps/soup-quiz — run in Expo Go / emulator
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
| 1 | `bootstrap-monorepo` — monorepo, schema, stub data, one playable mode | **proposed, ready to apply** |
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
