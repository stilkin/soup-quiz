# Proposal

## Why

The per-country breakdown on the stats screen only renders once a country has three
recorded answers (ranking threshold, stats spec). A new player sees nothing where that
section will appear — no row, no header, no explanation — and assumes it is broken
(this read as a bug report from the app's own developer). The threshold is correct;
its silence is not.

## What Changes

- When rounds have been played but no country has reached the ranking threshold yet,
  the stats screen renders a one-line hint where the breakdown will appear:
  "If you answer a country 3 times, its stats will show up."
- The hint names the threshold via the exported `RANKED_MIN_ANSWERS` constant, so copy
  and behavior cannot drift apart.
- No change to the threshold itself, the ranking rules, or the ranked-list rendering.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `stats`: the "stats screen shows summary and per-country progress" requirement gains
  a scenario — while the summary is populated and no country meets the ranking
  threshold, the screen explains the threshold instead of rendering nothing.

## Impact

- `apps/soup-quiz/src/app/stats.tsx` — one conditional hint row in the populated branch.
- No data, storage, engine, or stats-package changes; the hint reads the existing
  `RANKED_MIN_ANSWERS` export from `@soup-quiz/stats`.
