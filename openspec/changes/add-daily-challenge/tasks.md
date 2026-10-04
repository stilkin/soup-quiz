# Tasks

## 1. Geography reference data + heat helpers (schema)

- [x] 1.1 One-off pipeline script fetching Natural Earth label-point centroids for all registry countries (polite UA, cached); emit `packages/schema` centroid registry; conformance test: every COUNTRIES key covered, spot-checked coordinates
- [x] 1.2 `distanceKm(a, b)` (haversine) + `heatBand(km)` with the five bands (🔥 <1500, 🥵 <3000, 🌡️ <5500, ❄️ <9500, 🥶 else) as one constants block; tests pin canonical pairs incl. antimeridian correctness (Fiji↔Samoa, Tokyo↔Honolulu)

## 2. Daily derivation (engine, pure)

- [x] 2.1 `daily.ts`: candidate pool (image + ≥2 ingredients, id-sorted), `dayIndex` arithmetic, cycle reshuffle via the existing RNG, `soupForDay(dataset, dayIndex)`; tests: same-day determinism, no repeat within a cycle, reshuffle at cycle boundary, pool exclusion rules
- [x] 2.2 Tier derivation: deterministic ingredient halves from `daySeed`, tier content accessor (1 photo, 2 first half, 3 second half, 4 name); tests pin split stability and odd-count handling

## 3. Daily streak (stats, pure)

- [x] 3.1 `dailyStreaks(rounds)` — current + best, consecutive UTC days with a solved (`correct ≥ 1`) daily round; tests: solved-run, failed-day break, missed-day break, independence from any-round streak

## 4. Daily screen + input + share (app)

- [ ] 4.1 `SearchSelect` component: TextInput + filtered registry list (prefix/substring, capped rows), commit on selection only, a11y labels
- [ ] 4.2 `/daily` screen: four-tier clue reveal, guess-per-tier flow, heat feedback line (min over item's countries), solve/fail states with score, spoiler-free share text (frozen `LAUNCH_ANCHOR_DAY`), UTC-midnight countdown, play-once gate from recorded daily rounds
- [ ] 4.3 Home "Today's soup" card (unplayed/solved/failed) routing to `/daily`; record the daily round on completion (`kind='daily'`, `correct`=tier, one answer row per guess); daily streak surfaced with the any-round streak
- [ ] 4.4 On-device: play a daily across the tiers — wrong guesses show sensible heat, halves split as spec'd, solve at an early tier scores lower-is-better, share text carries no spoilers, returning shows the finished state (user confirms)

## 5. Notification + integration

- [ ] 5.1 Local daily notification at a user-picked hour with toggle on the daily screen; declined permission disables the toggle only; reschedule on hour change
- [ ] 5.2 `pnpm typecheck`/`lint`/`test` green, bundle export passes; README present-vs-planned + roadmap, CLAUDE.md notes; on-device final check incl. a notification (user confirms before archive)
