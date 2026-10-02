# Tasks

## 1. Pure stats package (`packages/stats`)

- [x] 1.1 Create internal package `@soup-quiz/stats` (D2 pattern from change 1: exports TS source, no build step) with vitest + tsconfig; verify `pnpm --filter @soup-quiz/stats typecheck` and `test` pass with a placeholder suite
- [x] 1.2 Define row/view types (`RoundRow`, `AnswerRow`, `StatsView`, `SoupProgress`) and implement aggregation (`aggregateStats`): summary (rounds, answers, accuracy, soups seen) + per-soup seen/correct/last-seen; verify tests cover the spec scenario (3 answers, 1 miss → seen=3, correct=2) and the empty input
- [x] 1.3 Implement `dayStreaks(rounds)` (UTC buckets, current + best, today-or-yesterday anchoring); verify tests pin the three spec scenarios: consecutive days, a gap restarting the streak, and the 23:59/00:01 midnight pair
- [x] 1.4 Implement mastery (last 3 consecutive encounters correct, per spec) and weakest-first ordering (accuracy ascending, most-recently-seen tie-break); verify tests cover the mastery threshold crossing and the sort contract

## 2. App storage (`apps/soup-quiz/src/storage`)

- [x] 2.1 Add `expo-sqlite` and `@soup-quiz/stats` workspace dep to the app; write `db.ts` (open + run the v1 migration creating `rounds`/`answers` per design D2) and verify the bundle export still compiles
- [x] 2.2 Write `repo.ts`: typed `recordRound(round, answers)` (single transaction) and `fetchAll()` returning rows for the pure package, plus `clearAll()`; verify typecheck passes and record/fetch round-trip is exercised in group 3's screen wiring

## 3. Record hook + stats screen

- [ ] 3.1 Hook recording into the play flow (`Finished` step: fire-and-forget `recordRound`, `.catch`-logged) per spec "recording failure does not break play"; verify a played round writes rows (adb/Expo Go console or on-device follow-up in 4.1)
- [ ] 3.2 Build `StatSummary` and `SoupMasteryRow` components (theme tokens, Fraunces numerals, flat hairline cards) and the `/stats` route: summary + streaks + weakest-first list + inviting empty state; verify rendering against tokens with no hardcoded colors
- [ ] 3.3 Add the Clear-stats action (confirmation alert → `clearAll()` → empty state) and the "Your stats" link on the start screen; verify clear returns exactly to the empty state

## 4. Integration checks

- [ ] 4.1 Verify from repo root: `pnpm typecheck`, `pnpm lint`, `pnpm test` all green (incl. new stats suite) and `expo export --platform android` compiles; on-device: play a round, open stats — summary, streak, weakest-first list and mastery reflect it; clear works. User confirms before archive.
