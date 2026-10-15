# Tasks

## 1. Hint row on the stats screen

- [x] 1.1 Import `RANKED_MIN_ANSWERS` from `@soup-quiz/stats` in `apps/soup-quiz/src/app/stats.tsx`; render a hint row — "If you answer a country 3 times, its stats will show up." with the 3 from the constant — when `populated && countries.ranked.length === 0`, styled with the existing quiet link/hint tokens
- [x] 1.2 Verify the hint appears with rounds but no ranked country, disappears once a country reaches the threshold, and never shows on the empty or loading states; `pnpm typecheck && pnpm lint && pnpm test` pass
