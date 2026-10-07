# Design

## Context

See proposal.md — Why. Existing plumbing this builds on: seed-deterministic engine
(mulberry32 + FNV-1a, tested for same-seed rounds), `rounds.kind` column already
recording `'free'`, `dayStreaks` UTC machinery in packages/stats, 295 sun-faded images,
249-country registry with `countryName`/`flagEmoji` in packages/schema. Discussion
(2026-10-04) settled every fork: four tiers photo-first, search-select input (not MC —
elimination math), five distance bands (not continents — zero discrimination inside the
dense SE-Asia cluster), haversine (not a neighbors list — islands), notifications in
scope.

## Goals / Non-Goals

**Goals:** one deterministic daily for everyone; honest score gradient; informative
wrong guesses; streak + share + nudge.

**Non-Goals:** no share-card image, no push, no typed soup-name/expert mode, no frozen
day→soup manifest, no changes to free play.

## Decisions

### D1: Day derivation is pure arithmetic on the day number
`dayIndex = floor(utcMillis / 86_400_000)`; pool = items with image + ≥2 ingredients
(291 today) sorted by id; `cycle = dayIndex // pool.length`; order = seeded shuffle of
the pool with `seed = cycle` (existing engine RNG); `soup = order[dayIndex % pool.length]`.
`daySeed = hash('daily-' + dayIndex)` seeds the ingredient-half split. No stored state,
no network, correct across the antimeridian of the calendar by construction (integer
day arithmetic; no timezone anywhere).
*Accepted limitation:* the map is deterministic **per dataset version** — a v1.1 that
changes pool membership may shift a given day's soup across app versions (Wordle had
the same property). Escape hatch if ever needed: freeze a generated day→soup manifest
into the dataset. Documented, not built.

### D2: Tiers advance only on a committed wrong guess
Photo → first half → second half → name. No skip control: the wrong guess is the
price of the next clue, and it always buys heat feedback, so it is never wasted.
Halves split deterministically from `daySeed` (odd counts: first half gets the extra).

### D3: Input is a `SearchSelect` component, not multiple choice
TextInput + filtered suggestion list over the full 249-name registry; selecting a
suggestion commits one guess at the current tier; typing/browsing commits nothing.
Suggestion list limited (e.g. 6 rows), prefix + substring match, case-insensitive.
*Why not MC:* with fixed options, tier 2/3 become 1-in-4 / 1-in-3 elimination — the
ladder would measure patience. Fresh-options-each-tier was rejected too: it kills the
heat feedback (options vanish) and reshuffling feels arbitrary. The component is the
reusable skeleton for future expert modes.

### D4: Heat feedback lives in packages/schema as reference data + pure helpers
Centroids: `ISO → (lat, lon)` for all 249 registry countries, generated from Natural
Earth label points (public domain; LABEL_X/LABEL_Y — the label-placement point, i.e.
sensible for France metropolitan etc.) by a one-off pipeline script, cached, committed
beside COUNTRIES; a conformance test fails on any missing country. Helpers:
`distanceKm(a, b)` (haversine, great-circle — correct across the antimeridian) and
`heatBand(km)` returning one of five bands with icon + label: 🔥 hot < 1500, 🥵 warm
< 3000, 🌡️ lukewarm < 5500, ❄️ cold < 9500, 🥶 ice cold otherwise. Band cut points are
one constants block; tests pin canonical pairs (Athens↔Istanbul hot, Tokyo↔Honolulu
cold, Portugal↔Japan ice cold) so table or band changes are deliberate.
Feedback uses the minimum distance over the item's countries.

### D5: Storage reuses the existing round shape, `kind='daily'`
One round per played day: `kind='daily'`, `mode_id='daily-country'`, `seed=daySeed`,
`length=4`, `correct` = solving tier (1–4), 0 for failed; one answer row per committed
guess. Today's state = query for a daily round with today's dayIndex-derivable seed
(or store dayIndex in the seed string; the seed *is* `'daily-' + dayIndex`-derived, so
lookup is exact). No migration — the column has existed since the stats schema.

### D6: Daily streak is a new pure stat beside `dayStreaks`
`dailyStreaks(rounds)`: consecutive UTC days whose daily round finished with
`correct ≥ 1`. Independent of the any-round streak; both shown. Tests pin the
solved/failed/missed-day boundaries.

### D7: Share is text-only, spoiler-free, anchored
`🥣 Soup Quiz #12 — clue 2/4 · 🔥 5-day streak` via the system share sheet. The day
number = `dayIndex − LAUNCH_ANCHOR_DAY` (a frozen constant committed when we ship;
before launch it is provisional). No soup name, no country, no flag.

### D8: One daily screen, one home card, settings inline
Route `/daily`: clue stack (photo card, ingredient rows as tiers open, name card at
tier 4), heat feedback line under the input, solve/fail states with share + streak +
UTC-midnight countdown. The home screen gains a "Today's soup" card showing
unplayed/solved/failed. Notification toggle + hour picker live on the daily screen's
finished state (no separate settings screen yet — simple).

### D9: Notifications are local-only
expo-notifications, one daily trigger at the user's local hour, rescheduled when the
hour changes; content is generic ("Today's soup is ready 🥣"). Permission declined →
toggle renders disabled, nothing else changes. Works in Expo Go on Android.

## Risks / Trade-offs

- [Keyboard friction on the daily] → accepted: one guess a day, and differentiation
  from casual free play is intended; `SearchSelect` keeps it forgiving (tap, don't spell)
- [Dataset version shifts a day's soup] → accepted + documented (D1); manifest escape
  hatch exists
- [Band thresholds taste-wrong on device] → one constants block, pinned tests, tune
  once with real feedback
- [Notification OS quirks/Doze] → best-effort nudge, never load-bearing; every state
  reachable without it
- [New UI surface is the biggest since bootstrap] → tiered task groups, pure logic
  lands first and tested before any screen

## Migration Plan

Additive: new route, new pure modules, one recorded-round kind. Free play, stats
screen, and storage schema unchanged. Rollback = revert; recorded dailies simply stop
surfacing.

## Open Questions

- Exact band cut points — tuned during implementation against the pinned pairs (does
  not affect structure).
