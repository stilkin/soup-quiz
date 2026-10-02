# Design

## Context

Follows the proven engine-purity pattern from change 1: logic testable headless in a pure
package, native I/O at the app edge. All product constraints in `openspec/config.yaml`
apply (local-first, UTC, no backend). See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Every finished round + its answers recorded locally, append-only
- One tested implementation of every stat definition (accuracy, streak, mastery)
- Stats screen: summary + weakest-first per-soup list, empty state, clear tool
- Recording never blocks or breaks play

**Non-Goals:**
- No SRS scheduling/serving (later change; the recorded data is its input)
- No round-history or per-mode UI (columns reserved, UI later)
- No ORM, no abstraction over SQLite beyond one repository module

## Decisions

### D1: `packages/stats` is pure; SQLite lives in the app
expo-sqlite is native and cannot run under vitest, so storage stays app-side
(`src/storage/`): `db.ts` opens + migrates, `repo.ts` maps typed rows. The pure package
owns every definition so there is exactly one implementation of "accuracy" or "streak".
*Alternative rejected:* computing aggregates in SQL — two implementations of each
definition (SQL for the screen, TS for tests) drift apart.

### D2: Append-only event log; everything derived
Two tables, no UPDATE/DELETE except the clear tool:

```
rounds:  id PK, kind TEXT DEFAULT 'free', mode_id TEXT, seed TEXT,
         length INT, correct INT, finished_at INT (unix ms UTC)
answers: id PK, round_id FK, item_id TEXT, correct INT (0/1), answered_at INT (unix ms UTC)
```

`kind` reserves daily-challenge linkage; `mode_id` reserves per-mode views — both without
future migrations. Raw rows are fetched and aggregated in the pure package (row counts
are thousands at most; revisit SQL-side GROUP BY only if the real dataset ever makes it
matter). *Alternative rejected:* persisted aggregate tables — state to keep in sync on
every write, for no measurable gain.

### D3: expo-sqlite modern async API, no ORM
`openDatabaseAsync`, `runAsync`, `getAllAsync`, one migration via the documented
migration mechanism. Two tables do not earn Drizzle's weight. *Alternative rejected:*
Drizzle — fine tool, but adds config/codegen for ~60 lines of SQL.

### D4: Recording is fire-and-forget at round finish
The play flow calls `recordRound(...)` in the `Finished` step, `.catch`-logged, never
awaited by navigation. A lost write (app killed mid-write) is acceptable — stats, not
payments. The round row is written only when the round actually finishes.

### D5: Streaks bucket by UTC calendar date
Locked decision (UTC dailies) applied consistently: `new Date(ts).toISOString().slice(0,10)`
is the day bucket. Current streak counts back from today (or yesterday if today is
quiet — a streak isn't lost before the UTC day ends); best streak is the historical max.
Tests pin midnight, month-end, and gap boundaries with constructed timestamps.

### D6: Mastery = last 3 consecutive encounters correct
Cheap, honest heuristic for v1 (with 10 soups it's visibly right); the SRS change will
replace it with recall-state tracking on the same event log.

### D7: Stats screen stays in the menu vernacular
Flat hairline cards, numbers in Fraunces, tokens only. Weakest-first list uses accuracy
ascending, tie-break most-recently-seen. Empty state invites play rather than showing
zeroes. Clear-stats uses a confirmation alert and returns to the empty state.

## Risks / Trade-offs

- [Timezone drift] → everything stored as UTC epoch ms; bucketing is UTC-only, pinned by tests.
- [Unbounded answers table] → fine at v1 scale; the pipeline change re-evaluates if needed.
- [Fire-and-forget hides write failures] → logged; stats are non-critical by design.

## Migration Plan

Greenfield feature — one migration creating both tables; no existing data. Clear-stats is
the escape hatch during development.
