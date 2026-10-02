# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Soup Quiz: quiz/training apps generated from curated list datasets (first app: world soups
from Wikipedia list articles). Local-first, offline, no backend. See `README.md` for the
full concept and the present-vs-planned table.

**Status: planning phase — no application code exists yet.** The repo contains OpenSpec
planning artifacts, raw source data, and docs. The roadmap (README + `openspec/changes/`)
starts with `bootstrap-monorepo` (proposed, ready to apply).

## How work happens: OpenSpec, always

Features are built through OpenSpec changes, never ad-hoc. The full loop and guardrails
live in `.claude/skills/openspec-*/SKILL.md` (authoritative — read them when running a
workflow). Key rules:

- `/opsx:explore` (thinking, no writes) → `/opsx:propose` (planning artifacts only) →
  `/opsx:apply` (implementation) → `/opsx:archive` (sync specs). Never implement inside
  explore or propose.
- Never hand-create change directories; always `openspec new change "<name>"`.
- `openspec validate "<change-name>"` takes the name positionally (`--change` is only for
  `status`/`instructions`).
- `openspec/config.yaml` → `context:` holds locked project constraints (stack, local-first,
  UTC dailies, 1..n normalization, attribution posture). It applies to every artifact and
  decision — treat it as binding.
- `openspec/specs/` is the durable capability inventory; changes carry deltas until archived.

## Commands

From the repo root:

```bash
pnpm typecheck   # tsc --noEmit in every workspace package (incl. the Expo app)
pnpm lint        # Biome check across the workspace
pnpm format      # Biome format --write
pnpm test        # Vitest in schema, data, engine (52 tests)
```

From `apps/soup-quiz` (or the root, which delegates `pnpm start`):

```bash
pnpm start                                      # expo start — scan the QR with Expo Go
pnpm exec expo export --platform android        # bundle smoke check, no device needed
```

Editing `packages/data/src/soups.v0.json`? Its tests are the gate — a corrupted
dataset fails `pnpm test`.

OpenSpec:

```bash
openspec list                       # in-flight changes
openspec list --specs               # durable capabilities
openspec status --change "<name>"   # artifact/task progress
openspec validate "<name>"          # change validity
git push                            # main tracks origin (github.com:stilkin/soup-quiz)
```

Package manager is pnpm; do not use npm/yarn.

## Architecture

`openspec/changes/bootstrap-monorepo/design.md` documents the decisions; as built:

- `packages/schema` — zod item contract (single source of truth), registries
  (SOUP_TYPES, 249-entry COUNTRIES, flagEmoji), `validateDataset`, exported JSON Schema
- `packages/data` — `soups.v0.json` stub dataset (adversarial by design, D7)
- `packages/engine` — pure, seed-deterministic: mode-as-data configs, `generateRound`,
  `isCorrect`, `scoreRound`; no framework imports
- `apps/soup-quiz` — Expo app, UI only: theme tokens (`src/theme.ts`, "menu card"
  direction), expo-router screens, Reanimated feedback; no quiz logic lives here

Internal-package pattern (design D2): packages export raw TS source (`main: ./src/index.ts`),
no build step — Metro and Vitest consume them directly. Soup images will bundle as
`apps/soup-quiz/assets/soups/<id>.jpg`, mapped in `src/images.ts` (change 2).
A Python/pandas pipeline (change 2) produces datasets validated against the exported
JSON Schema — TS and Python only meet through that contract.

## Data rules

- `data/raw/wikipedia/` holds CC BY-SA wikitext snapshots. They are pipeline **inputs**:
  never shipped as app content, never edited in place (downstream processing copies).
- Dataset scope decisions: porridge lists excluded; redirect-target lists (cheese soups,
  ramen types) included. Measured corpus: ~583 unique soup titles.
- Shipped data keeps facts + our own descriptions + per-item attribution (source URL,
  image credit). Images bundle as app assets with mandatory credit — no external hosting.
- Countries and soup types are normalized 1..n lists (ISO alpha-2; controlled vocabulary
  owned by the schema). Never collapse them to single values.

## Conventions

- Conventional commit prefixes (`chore:`, `docs:`, `data:`, `docs(openspec):` …).
- Planning artifacts change via the update workflow (confirm with the user before
  rewriting artifacts); implementation happens only in apply.
