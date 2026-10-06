# Tasks

## 1. Per-country aggregation (stats, pure)

- [x] 1.1 `countryProgress(answers, items)` in `@soup-quiz/stats`: per-country
  `{ code, asked, correct }` (answer counts toward every country of its item),
  `RANKED_MIN_ANSWERS = 3`, ranked list (accuracy ascending, tiebreak: fewer answers,
  then code) excluding below-threshold countries, plus `discovered` (countries with ≥1
  answer) and the dataset's country total; exported from the package index
- [x] 1.2 Tests: multi-country item feeds both rows; threshold exclusion (no row, but
  discovery counts it); ranking order + tiebreak; empty answers → empty list, zero
  discovered; `pnpm test` green

## 2. Stats screen rework + support link (app)

- [x] 2.1 `stats.tsx`: country breakdown replaces the per-soup list — rows of flag +
  name + accuracy + answer count (existing row idiom and theme tokens); summary gains
  "Countries discovered: X/63"; `SoupMasteryRow` deleted; empty state unchanged
- [x] 2.2 Support link in the stats footer (quiet underlined line above "Clear stats")
  opening `https://ko-fi.com/stilkin` via `Linking.openURL`; `pnpm typecheck`/`lint`
  green, `expo export --platform android` passes
- [x] 2.3 Device check: play a round, open stats — ranked countries only, meter grows,
  footer link opens the browser (user confirms before archive)

## 3. Docs

- [x] 3.1 README present-vs-planned row + roadmap row; `pnpm typecheck`/`lint`/`test`
  all green
