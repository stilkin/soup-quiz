# Proposal

## Why

The app has free play and local stats, but no reason to come back tomorrow. The daily
challenge — locked as a project decision since bootstrap — is the engagement loop:
one deterministic soup per UTC day for everyone, a Wordle-style score, a streak, a
share line, and a nudge. The dataset now supports it well: 291 soups have both an
image and ≥2 ingredients (~9.5-month cycle), and the sun-faded photos make the
photo-first tier the app's best asset.

## What Changes

- **Soup of the day**: derived purely from the UTC day number (stable pool sorted by
  id, reshuffled each ~291-day cycle) — same soup for everyone on the same dataset
  version, no backend, no stored state.
- **Four clue tiers**: photo → first half of ingredients → remaining ingredients →
  the soup's name. A tier advances **only** on a committed wrong guess — no skip
  button; even a blind guess buys heat feedback.
- **Search-select country guessing** over the full 249-country registry (not multiple
  choice — fixed options would degrade into elimination). One committed selection per
  tier; any of a multi-country soup's countries counts.
- **Five-band heat feedback** on wrong guesses by great-circle distance between
  country centroids (🔥 hot / 🥵 warm / 🌡️ lukewarm / ❄️ cold / 🥶 ice cold), minimum
  over the soup's countries. A committed centroid table covers the whole registry.
- **Score 1–4** = tier solved on; wrong at tier 4 fails the day. Outcome recorded as
  a `kind='daily'` round (column already exists).
- **Daily streak**: consecutive solved dailies, a new pure stat beside the any-round
  streak.
- **Share text** with no spoilers: day number (frozen launch anchor), tier, streak.
- **Optional local notification** "today's soup is ready" at a user-picked hour,
  toggleable; works offline, Expo Go compatible.

Out of scope: share-card images, push notifications, typed soup-name guessing /
expert variants, freezing a day→soup manifest across dataset versions (documented
escape hatch, not needed for v1).

## Capabilities

### New Capabilities

- `daily-challenge`: the one-a-day ritual — deterministic day selection, the four-tier
  clue ladder, search-select guessing, distance heat feedback, outcome recording,
  spoiler-free sharing, and the optional daily notification

### Modified Capabilities

- `stats`: new requirement — the daily streak (consecutive solved dailies in UTC),
  reported alongside the existing any-round streak

## Impact

- `packages/schema`: committed country-centroid registry (generated, pipeline-fetched
  from Natural Earth label points) + pure `distanceKm`/heat-band helpers + tests
- `packages/engine`: pure daily derivation (pool, day indexing, cycle reshuffle,
  ingredient halves) + tests
- `packages/stats`: daily streak computation + tests
- `apps/soup-quiz`: new `SearchSelect` component, daily screen (`/daily`), home card
  with today's state + UTC-midnight countdown, share, notification scheduling + toggle
- `data/pipeline`: one-off centroid fetch script (cached like the corpus)
- No item-schema, storage-schema, or free-play changes; no new runtime deps
