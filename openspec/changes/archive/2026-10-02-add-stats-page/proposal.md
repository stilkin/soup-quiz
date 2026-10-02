# Proposal

## Why

The player has no visibility into their own progress: answers are scored and thrown away. Recording them locally unlocks the gamification layer (streaks, mastery) and feeds the future spaced-repetition scheduler — and building it now, on the 10-soup stub, means every stat is checkable by hand before the real 583-soup dataset arrives (roadmap reorder per player feedback).

## What Changes

- New `packages/stats` — pure, framework-free computations: aggregation (accuracy, per-soup seen/correct), UTC day streaks (current + best), mastery heuristic
- On-device storage in the app via `expo-sqlite`: append-only `rounds` + `answers` tables (one migration), no ORM
- Every finished round is recorded (fire-and-forget; stats never block play)
- New stats screen: summary card (rounds, accuracy, soups seen, streaks) + weakest-first per-soup list with mastery chips + a Clear-stats dev tool
- Start screen gains a "Your stats" link

Out of scope (later changes): SRS serving/scheduling (data captured now, scheduler later), dataset pipeline, daily challenge (the `kind` column reserves linkage), round-history UI, per-mode breakdown UI, export/sync.

## Capabilities

### New Capabilities
- `stats`: local recording of play activity and the derived progress views — what gets recorded, how progress and streaks are defined and computed, and what the stats screen shows

### Modified Capabilities

(none — `quiz-gameplay` behavior is unchanged; recording observes finished rounds and does not alter play)

## Impact

- New workspace package `@soup-quiz/stats` (pure TS, vitest)
- App: new `expo-sqlite` dependency, `src/storage/` module, `/stats` route, two components; small edits to the play flow (record hook) and start screen (link)
- No schema/engine changes; no network; all data stays on-device
