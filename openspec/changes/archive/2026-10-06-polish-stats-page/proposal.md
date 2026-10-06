# Proposal

## Why

The stats screen lists all 347 soups weakest-first. Early on nearly every row reads 0% or
100%, so the list is noise before it is signal — a small-sample problem at the wrong
grain. The game's actual question is "which country?", so a per-country breakdown
(63 rows max) is meaningful from the first session and names the skill being trained.
Separately, the app has no surface for a support link (no settings screen) — the stats
footer is the established quiet spot for tertiary actions.

## What Changes

- **Per-country breakdown replaces the per-soup list**: flag, country name, accuracy,
  and answer count per country, sorted weakest-first. Only countries with at least
  three answers are ranked and rendered; below-threshold countries appear nowhere in
  the list (no repeated placeholder rows) — the discovery meter already accounts for
  them.
- **Summary gains a discovery meter**: "Countries discovered: X/63" (any country with
  at least one recorded answer counts as discovered).
- **Per-soup mastery stays computed** in `@soup-quiz/stats` (groundwork for the planned
  SRS scheduling) — this is a display change only; recording and storage are untouched.
- **Support link**: a quiet Ko-fi link in the stats footer next to the existing
  "Clear stats" idiom, opening `ko-fi.com/stilkin` externally. Nothing in the home
  menu, play flow, or daily screen.

## Capabilities

### New Capabilities
- `support-link`: a single, non-intrusive external support link surfaced in the app,
  placed where it never interrupts gameplay.

### Modified Capabilities
- `stats`: the stats-screen requirement changes from a per-soup list to a per-country
  breakdown with a discovery meter; the derived-aggregates requirement gains
  per-country aggregation alongside the existing per-item one.

## Impact

- `packages/stats`: new pure per-country aggregation (+ tests); existing per-item
  mastery untouched.
- `apps/soup-quiz/src/app/stats.tsx`: country rows instead of soup rows (reuses the
  existing row idiom and theme tokens), summary meter, footer support link;
  `SoupMasteryRow` becomes unused and is removed.
- No schema, storage, or pipeline changes; no migrations; dataset untouched.
