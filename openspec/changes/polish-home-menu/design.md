# Design

## Context

The home screen (`apps/soup-quiz/src/app/index.tsx`) currently mixes three affordances:
a compact daily card (custom 18/14 pt fonts), a mode block with a tomato Play pill, and
a "Your stats" text link. Round length lives app-side in `play.tsx`
(`ROUND_LENGTH = Math.min(8, soupsV1.length)`) — the engine takes length as a
`generateRound` parameter, so no package below the app changes.

## Goals / Non-Goals

**Goals:**

- One tile component shape, three instances, equal vertical space.
- House type tokens everywhere on the menu (no ad-hoc font sizes).
- Five-question free-play rounds.

**Non-Goals:**

- Moving round length into `ModeConfig` (one mode, one constant — plumbing not earned).
- Changing the daily, play, or stats screens themselves.
- New destinations or reordering.

## Decisions

- **D1 — Equal thirds via `flex: 1` cards.** Header (title, double rule, menu line)
  and footer stay fixed; the middle becomes a column of three `flex: 1` `Pressable`
  cards with the house card treatment (`colors.surface`, `colors.line` border,
  `radius.md`) separated by the standard gap. No measured heights — equal flex adapts
  to any screen.
- **D2 — Whole card is the button; the pill is styling.** Each card holds title
  (`type.menuTitle`), hint (`type.bodySoft`), and the tomato pill (`Play` / `View` for
  the daily by played state, `Play` for the mode, `Open` for stats) as a non-interactive
  `View` — the `Pressable` card carries `accessibilityRole="button"` and the label.
  One tap target the size of the tile beats a pill-sized target on small screens, and
  the pill still reads as the affordance.
- **D3 — A tiny `MenuTile` component in `index.tsx`.** Three call sites share
  `{title, hint, action}` props plus `onPress`; the daily passes state-derived strings.
  Not a shared component file — it has exactly one consumer.
- **D4 — Round length stays an app constant.** `ROUND_LENGTH = Math.min(5,
  soupsV1.length)`; menu copy becomes "Five bowls a round." Rejected: putting `length`
  into `ModeConfig` — engine API already parameterizes it and no second mode exists to
  share the config.

## Risks / Trade-offs

- [Equal thirds cramp on very short screens] — titles/hints are single-line-ish;
  `flex: 1` with the existing gap gives each tile more room than the current layout.
- [Stats card hint must stay honest] — reuse the stats screen's own vocabulary
  (rounds, streaks, mastery), nothing speculative.

## Migration Plan

Pure UI change, no data or storage impact; recorded rounds keep their own length, so
history and stats remain correct across the 8 → 5 switch. Rollback is a revert.
