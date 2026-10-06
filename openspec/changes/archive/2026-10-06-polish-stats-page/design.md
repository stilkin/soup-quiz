# Design

## Context

The stats screen is display-only: rows derive from the recorded event log
(`aggregateStats` in `@soup-quiz/stats`), storage never computes. This change re-grains
the display from per-soup (347 rows, mostly small-sample noise) to per-country
(63 rows max), and adds the app's first support surface. The dataset spans 63
countries; median 2 soups per country, top Indonesia 53, China 39, Japan 31; 20 soups
list more than one country.

## Decisions

- **D1 — Aggregate at answer grain, attribute to every listed country.** A per-country
  row counts `asked`/`correct` over answers; an answer about an item counts toward each
  of the item's countries — symmetric with `isCorrect`, which accepts any listed
  country. Denominators are answers, never soups, so no country row can read "of 2
  soups" after one round.
- **D2 — Ranking threshold, not placeholder rows.** `RANKED_MIN_ANSWERS = 3` (one
  constant, exported next to the aggregation): only countries meeting it render, sorted
  accuracy-ascending with a deterministic tiebreak (fewer answers first, then country
  code). Countries below the threshold are simply absent — the user explicitly rejected
  repeated "not enough data" rows. The discovery meter covers them: discovered = any
  recorded answer.
- **D3 — Display change only; mastery stays item-level.** `aggregateStats` keeps its
  per-item output untouched (the planned SRS scheduler consumes item-level history).
  The country view is a new pure export (`countryProgress`) rather than a rewrite, and
  the app stops rendering the per-soup list. `SoupMasteryRow` is deleted, not parked.
- **D4 — Support link in the stats footer, house idiom.** Reuse the quiet underlined
  footer style of "Clear stats": one line, `inkSoft`, above the clear action.
  `Linking.openURL('https://ko-fi.com/stilkin')` — expo-linking is already a
  dependency; no in-app route, no browser view. Deliberately not on the daily finished
  card (already dense: outcome, streak, share, reminder toggle, hour stepper) and not
  in the play flow; the stats screen is the one meta surface, visited voluntarily.
  Moving it later is cheap; un-nagging is not.
- **D5 — Country identity from the schema registries.** Flag emoji and display name
  come from the existing `COUNTRIES` registry (`flagEmoji`, `countryName`) — no new
  data, no dataset involvement, pipeline untouched.

## Risks / trade-offs

- [Country rows blend soups of different difficulty] → accepted: the trained skill is
  country recognition; per-item drill-down can return later if missed (backlog).
- [Top-heavy distribution (ID 53 soups vs 16 singletons) makes some rows slow to reach
  the threshold] → fine: those countries surface via the discovery meter until they
  have three answers.
- [Support link invisible to players who never open stats] → accepted by design
  ("inobtrusive" was the requirement); revisit after launch if desired.
