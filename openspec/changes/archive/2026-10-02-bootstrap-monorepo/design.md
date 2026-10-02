# Design

## Context

Greenfield repo; only `data/raw/wikipedia/` (raw wikitext) and OpenSpec planning exist. See proposal.md for motivation. The skeleton must prove the seams the next four changes depend on: the data contract (change 2 fills it with real data), the engine/app split (change 3 grows modes), and theming (every later change touches it).

## Goals / Non-Goals

**Goals:**
- One mode playable end-to-end on a device/emulator with stub data
- A data contract whose shape already survives real Wikipedia data (1..n origins, 1..n types, canonical ingredients, stable IDs)
- Engine as pure, seed-deterministic, framework-free TS — testable without a device
- `typecheck` / `lint` / `test` each runnable from the repo root in one command

**Non-Goals:**
- No real dataset, Python, or scraping (change 2)
- No persistence, stats, streaks, SRS (change 4)
- No daily challenge, sharing, notifications (change 5+)
- No shared `packages/ui` yet — theme tokens live in the app until a second app exists
- No external storage or CDN: images bundle as app assets (~583 soups × ~10 KB ≈ 6 MB at 200px q90). If asset size ever becomes a problem, the feature gets dropped rather than re-platformed — `image` is optional everywhere so removal is non-breaking

## Decisions

### D1: pnpm workspaces, no build orchestrator yet
`apps/*` + `packages/*` via pnpm workspaces; root `package.json` scripts fan out with `pnpm -r`. Turborepo/Nx added only when orchestration actually hurts (task graph caching). *Alternative rejected:* Nx from day one — scaffolding weight buys nothing at 4 packages.

### D2: Internal packages pattern — no compile step for packages
Workspace packages declare `"main": "./src/index.ts"` and export TS source directly. Metro (app) and Vitest (packages) consume TS natively; no `tsc -b` watch loop, no `dist/`. *Alternative rejected:* per-package build + project references — correct but slow to iterate and a common monorepo foot-gun; we can introduce it if a non-Metro consumer appears (it won't — the Python side consumes JSON Schema, not TS).

### D3: zod is the single source of truth; JSON Schema is exported from it
`packages/schema` defines the item shape in zod and exports a JSON Schema document (zod's `toJSONSchema`). Cross-field rules stay in JSON-Schema-expressible constructs wherever possible; anything not expressible is documented as app-side-only so the Python pipeline knows the difference. Item shape:

```
id            string  (stable; real data = enwiki pageid, stub uses same format)
name          string
description   string  (ours, short)
sourceUrl     string  (https://en.wikipedia.org/?curid=<pageid>)
countries     ISO-3166-1 alpha-2[]   1..n
region        string | undefined     (e.g. "Yorubaland" when finer than a country)
types         SoupType[]             1..n, controlled vocabulary exported as const
ingredients   { id, display }[]      1..n, id = canonical tag, unique per item
image         { sourceFile, credit } | undefined
              # sourceFile = Commons file (provenance); credit = { author, license,
              #   licenseUrl }, mandatory when image is present. No external hosting:
              #   the app resolves a bundled asset by convention (assets/soups/<id>.jpg);
              #   a pairing test (change 2) asserts every dataset image has its file
              #   in the bundle and vice versa
```

`packages/schema` also exports registries the whole stack shares: `SOUP_TYPES` vocabulary, `COUNTRIES` (code → display name). Flag emoji are computed from the alpha-2 code, never stored. *Alternative rejected:* defining JSON Schema by hand and deriving zod from it — weaker TS inference, two-artifact drift.

### D4: Engine = pure functions; mode = data, not code
A mode is a declarative config: which fields build the prompt, which field is the answer, option count, distractor source. The engine ships exactly one mode instance (`ingredients → country`) but the generator walks the config, so change 3 adds modes without new generator code. Rounds are produced by `generateRound(dataset, mode, { seed, length })` using a small seeded PRNG (mulberry32); the seed surface is designed so a date-derived seed (daily challenge) drops in later. *Alternatives rejected:* `Math.random()` (breaks determinism requirement and daily replay); mode-as-component (logic trapped in UI, untestable).

### D5: Expo app shell with expo-router, three screens
`app/` routes: index (start screen with dataset size + play), `play/[roundId]` (question flow), result. No tab navigation yet — the stats tab arrives with change 4. Answer feedback uses Reanimated (scale/color pulse on correct, shake on wrong). The post-answer reveal renders the item's image with a tappable credit line when the item has one (the skeleton's stub dataset ships no images; the renderer is verified once with a temporary stub image). Theme tokens (color/spacings/radius/typography) live in one `theme.ts`; dark scheme deferred until tokens exist, but tokens are structured to allow it.

### D6: Biome for lint + format; Vitest for packages
One tool, one config, fast enough to run on save. Vitest covers schema (validation cases ≙ spec scenarios), engine (determinism, distractor distinctness, multi-origin correctness), and data (the stub dataset itself is a test — this is how "datasets validate before use" is enforced pre-app). No app e2e in bootstrap.

### D7: Stub dataset is adversarial by design
10 hand-written items that deliberately exercise the contract: a multi-country soup, a region-not-country origin, multi-type items, shared canonical ingredients across items with different display spellings, one item whose country can't form enough distractors (tests the skip rule). Real names/URLs from the fetched wikitext where possible so change 2's diff against real data is honest.

## Risks / Trade-offs

- [Expo SDK churn breaks a fresh scaffold eventually] → Pin the SDK in the lockfile; upgrades are their own small change, never mixed with features.
- [zod → JSON Schema gap for exotic refinements] → Keep the schema JSON-Schema-shaped (D3); document any app-only rules in `packages/schema/README` so the Python side compensates.
- [Internal-packages pattern surprises Metro] → Expo's monorepo support is first-class; verified in task list before any UI work.
- [Theme tokens in-app duplicates later into `packages/ui`] → Accepted; extraction is mechanical and waits for a second consumer.
- [Seeded PRNG is not cryptographic] → Fine; seed is a replay knob, not a security boundary.
- [200px thumbnails may look soft on high-DPI screens] → Pipeline keeps originals; final size/DPI choice is measured against real files in change 2 (320px q80 ≈ 12–17 MB total remains bundle-friendly).
- [Bundled images grow the binary as the dataset grows] → Size budget is tracked in change 2; images stay optional per-item so the feature is droppable.

## Migration Plan

Greenfield — nothing to migrate or roll back. Rollout = scaffolding commits in task order; the repo has no consumers.

## Open Questions

- Final soup-type vocabulary breadth (broth/potage/stew/cold/noodle/…) — extend during change 2 when real data shows the actual distribution; adding values is non-breaking.

Resolved during planning (recorded for change 2): images are in, bundled as app assets with self-contained credit; porridges excluded; the two redirect targets (cheese-soups section, Ramen#Types) included by default; measured corpus is ~583 unique soups.
