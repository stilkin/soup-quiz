# Soup Quiz

> **Status: real dataset shipped.** 347 soups compiled from Wikipedia with the
> dataset pipeline (change `add-dataset-pipeline`), 295 with credited bundled images;
> local stats record every round; the daily challenge serves one four-clue soup a
> day. Next up: more game modes and SRS scheduling (see
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
| Zod item contract with JSON Schema export; 249-country registry; flag emoji; country centroids + distance heat bands | |
| Seed-deterministic engine: mode-as-data, `generateRound`, scoring | Share-card page, store submission |
| Real dataset: 347 soups via the Python pipeline, review pass + overrides; one playable mode | More game modes over the same data (declarative configs) |
| Local stats: every round recorded (SQLite), stats screen with UTC day streaks, accuracy, mastery | |
| Daily challenge: one UTC soup a day — photo → ingredients → name ladder, search-select guessing, distance heat, streak, share, optional reminder | |
| 295 credited Commons images bundled as ~200px sun-faded JPEG (3.8 MB) | |
| Post-answer option strip (five flag tiles) + collapsible question card | |
| Tester APKs via EAS (`preview` profile, internal install links) | |
| Raw wikitext snapshots + cached article leads feeding the pipeline (`data/`) | |

## Technology

**In the repo today:** TypeScript (strict) across `packages/` and the Expo app
(SDK 57, React Native 0.86, expo-router, Reanimated, expo-image, expo-sqlite,
Fraunces via @expo-google-fonts), zod 4 (with native JSON Schema export), Vitest,
Biome; Python pipeline (stdlib + pycountry + Pillow) under `data/pipeline/`.

**Planned additions** (adjusted only via OpenSpec changes): an SRS scheduler and more
game modes on top of the existing SQLite stats.

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

## Tester builds (Android)

Internal APKs are built in the cloud with EAS (account `pocito`, project `soup-quiz`):

```bash
cd apps/soup-quiz
eas build --profile preview --platform android
```

The `preview` profile produces a signed release APK (`distribution: internal`) and
auto-bumps `android.versionCode` in `app.json` — commit that bump with whatever change
ships in the build. The finished build page carries the install link testers open on
their device; Android asks them to allow installs from that source once. The repo-root
`.easignore` keeps `data/`, `openspec/`, and tooling dotfiles out of the ~5 MB upload —
eas-cli resolves `.easignore` at the **git root**, not next to `eas.json`. The signing
keystore is generated and stored by EAS; back it up outside the repo with
`eas credentials -p android`.

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
| 2 | `add-dataset-pipeline` — scrape/enrich/review/compile, image bundling + attribution | **archived 2026-10-03** (16/16 tasks) |
| 3 | `add-quiz-modes` — declarative mode configs over the real dataset | planned |
| 4 | `add-stats-page` — local recording, streaks, mastery, stats screen | **archived 2026-10-02** (10/10 tasks) |
| 5 | `add-srs-scheduling` — spaced-repetition serving from recorded data | planned |
| 6 | `add-daily-challenge` — UTC daily: clue ladder, heat feedback, streak, share, reminder | applying 2026-10-04 |
| 7 | later — share-card page, photo mode, store submission | backlog |
| 8 | `polish-reveal-ui` — post-answer option strip + sun-faded images | **archived 2026-10-04** (8/8 tasks) |
| 9 | `collapse-question-card` — collapsible ingredients after answering | **archived 2026-10-04** (2/2 tasks) |
| 10 | `add-tester-build` — EAS preview APKs + tester install links | applying 2026-10-04 |
| 11 | `polish-home-menu` — equal home tiles, five-bowl rounds | applying 2026-10-05 |
| 12 | `app-icon-splash` — house-tuned emoji mark, branded splash | applying 2026-10-05 |

## Data sources and licensing

- Source snapshots in `data/raw/wikipedia/` are Wikipedia content (**CC BY-SA**); they are
  pipeline *inputs*, never shipped app content.
- The shipped dataset keeps facts (country, ingredients, types), uses our own short
  descriptions, and carries per-item source attribution + learn-more links.
- Item images: Commons originals re-encoded to ~200px JPEG thumbs and color-adjusted
  (uniform sun-faded treatment) and bundled as app assets (3.8 MB for 295 images) with
  mandatory per-image credit (author, license, deed link). No external image hosting;
  incomplete credit means no image.
- Scope decisions: porridge lists excluded; the two redirect-target lists (cheese soups,
  ramen types) included.
- App icon and splash: the 🥣 mark is [Twemoji](https://github.com/jdecked/twemoji)
  (graphics CC BY 4.0) recolored to the app palette, with
  [OpenMoji](https://github.com/hfg-gmuend/openmoji) (CC BY-SA 4.0) strokes as the
  monochrome themed-icon variant. Vendored sources and the generator live in
  `apps/soup-quiz/assets/` — assets are regenerated, never hand-edited.

## API and database

- **REST API: none.** The app is local-first and offline; no backend is planned. (A tiny
  share-card web renderer is a possible later addition and would be documented then.)
- **Database: on-device only.** `apps/soup-quiz/src/storage/` holds two append-only
  SQLite tables (`rounds`, `answers`) via expo-sqlite; every stat is derived from them
  in `packages/stats`. Schema: `rounds(id, kind, mode_id, seed, length, correct,
  finished_at)`, `answers(id, round_id→rounds, item_id, correct, answered_at)` —
  timestamps are Unix ms UTC.
