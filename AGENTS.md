# AGENTS.md

Soup Quiz: quiz/training apps from curated list datasets (first app: world soups from
Wikipedia list articles). Local-first, offline, no backend. `CLAUDE.md` carries the
longer version of this guidance; `README.md` has the concept and present-vs-planned table.

## Non-negotiable workflow rules

- Features go through OpenSpec changes, never ad-hoc. Loop: explore (thinking, no writes)
  → propose (planning artifacts only) → apply (implementation) → archive. Never implement
  inside explore or propose. Authoritative guardrails: `.claude/skills/openspec-*/SKILL.md`.
- Never hand-create change directories; always `openspec new change "<name>"`.
- `openspec validate "<name>"` takes the change name positionally (`--change` is only for
  `status`/`instructions`).
- `openspec/config.yaml` → `context:` holds locked project constraints (stack, local-first,
  UTC dailies, 1..n normalization, attribution posture). Binding for every artifact and decision.
- Planning artifacts change only via the update workflow (confirm with the user first);
  implementation happens only in apply.

## Commands (repo root)

```bash
pnpm typecheck    # tsc --noEmit in every workspace package (incl. the Expo app)
pnpm lint         # Biome check
pnpm format       # Biome format --write
pnpm test         # Vitest in schema, data, engine, stats (app has no tests)
pnpm lint:py      # ruff — needs the pipeline venv (below)
pnpm typecheck:py # mypy
pnpm test:py      # pytest transform units
```

Single test (tests live in `packages/<pkg>/tests/*.test.ts`):

```bash
pnpm --filter @soup-quiz/engine exec vitest run tests/daily.test.ts
pnpm --filter @soup-quiz/engine exec vitest run -t "<test name substring>"
```

There is no CI — local `pnpm typecheck && pnpm lint && pnpm test` is the verification gate.

App (from `apps/soup-quiz`, or root `pnpm start`):

```bash
pnpm start                                      # expo start — scan QR with Expo Go
pnpm exec expo export --platform android        # bundle smoke check, no device needed
eas build --profile preview --platform android  # tester APK (EAS cloud)
```

Run `eas` **only from `apps/soup-quiz`** — the real config is `apps/soup-quiz/app.json` +
`eas.json` (owner `pocito-be`). Running it from the root drops a stray root `app.json` /
`eas.json` bound to the wrong project (gitignored — delete, don't commit). The tester
build's `.easignore` lives at the **repo root**: eas-cli resolves it from the git root and
it replaces `.gitignore` for uploads. `apps/soup-quiz/README.md` is create-expo-app
boilerplate (npm instructions) — ignore it.

Python pipeline venv prerequisite:

```sh
python3 -m venv data/pipeline/.venv
data/pipeline/.venv/bin/pip install pycountry pillow ruff mypy pytest
```

## Generated files — never hand-edit

- `packages/data/src/soups.v1.json` — compiled by `data/pipeline/06_compile.py`; tests gate
  conformance and image pairing. Regenerate, don't edit.
- `apps/soup-quiz/src/images.ts` and `apps/soup-quiz/assets/soups/manifest.json` — generated.
- `packages/schema/src/centroids.ts` — from `data/pipeline/07_centroids.py`.
- All three are excluded from Biome in `biome.json`; don't "fix" them by hand.

## Architecture

- `packages/schema` — zod item contract (single source of truth), registries (SOUP_TYPES,
  COUNTRIES, flagEmoji), `validateDataset`, exported JSON Schema.
- `packages/data` — the compiled dataset + validation/pairing tests.
- `packages/engine` — pure, seed-deterministic: mode-as-data configs, `generateRound`,
  `isCorrect`, `scoreRound`. No framework imports.
- `packages/stats` — pure progress computations (aggregateStats, UTC dayStreaks, mastery).
  Every stat definition lives here exactly once; storage never computes.
- `apps/soup-quiz` — Expo app, UI only (theme tokens, expo-router, Reanimated). No quiz
  logic here. `src/storage/` is the native edge: expo-sqlite, append-only `rounds`/`answers`,
  `PRAGMA user_version` migrations, maps rows to `@soup-quiz/stats` types.
- Internal packages export raw TS source (`main: ./src/index.ts`), no build step — Metro and
  Vitest consume them directly.
- `data/pipeline/` (Python 3.12, stdlib + pycountry + Pillow — **no pandas**; the
  `openspec/config.yaml` prose saying pandas is stale) compiles the dataset from
  `data/raw/wikipedia/` + caches in `data/cache/`. Run stages in numeric order
  (`01_identity.py` … `07_centroids.py`; see `data/pipeline/README.md`). TS and Python meet
  only through the schema contract.

## Data rules

- `data/raw/wikipedia/` holds CC BY-SA wikitext snapshots — pipeline **inputs**: never
  shipped as app content, never edited in place.
- `data/pipeline/overrides.csv` (manual review answers) always wins at compile time.
- Countries and soup types are normalized 1..n lists (ISO alpha-2; vocabulary owned by the
  schema). Never collapse them to single values.
- Images bundle as app assets (`apps/soup-quiz/assets/soups/<id>.jpg`) with mandatory
  credit — no external hosting. Bundled assets are re-encoded/color-adjusted (CC BY-SA
  adaptation marking); cached originals stay unfiltered.

## Conventions

- pnpm only — never npm/yarn.
- Conventional commit prefixes (`chore:`, `docs:`, `data:`, `docs(openspec):` …).
- Biome style: single quotes, no semicolons, 2-space indent, line width 100 (ruff matches
  at 100).
- `openspec/changes/bootstrap-monorepo/design.md` documents the monorepo decisions.
