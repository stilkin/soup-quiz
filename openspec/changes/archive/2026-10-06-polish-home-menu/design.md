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

- **D1 — Equal weight through treatment, not fixed heights.** The three destinations
  are borderless groups — title, hint, action pill — stacked in the menu area and
  distributed with `space-evenly` plus a minimum gap. The first build used `flex: 1`
  bordered cards (equal *pixel* heights); on smaller devices the content outgrew the
  slot and the bottom-pinned pill escaped the card border (device finding, screenshot
  `screen_1.jpeg`, 2026-10-05). Natural-height groups cannot overflow by construction.
  The card chrome (surface, border) is dropped with it: equal billing reads from
  identical typography and pills.
- **D2 — Whole group is the button; the pill is styling.** Each group holds title
  (`type.menuTitle`), hint (`type.bodySoft`), and the tomato pill (`Play` / `View` for
  the daily by played state, `Play` for the mode, `Open` for stats) as a non-interactive
  `View` under the hint — no bottom-pinning, meaningless at natural height — while the
  `Pressable` group carries `accessibilityRole="button"`.
- **D2b — ScrollView as the cramped-screen net.** The screen body sits in a
  `ScrollView` with `flexGrow: 1`: it fills the viewport on normal phones (identical to
  a plain `View`) and starts scrolling only when content genuinely cannot fit — small
  screens, landscape, or accessibility font scaling. Menu fit stays a design goal; the
  scroll is a fallback, never the primary interaction.
- **D3 — A tiny `MenuTile` component in `index.tsx`.** Three call sites share
  `{title, hint, action}` props plus `onPress`; the daily passes state-derived strings.
  Not a shared component file — it has exactly one consumer.
- **D4 — Round length stays an app constant.** `ROUND_LENGTH = Math.min(5,
  soupsV1.length)`; menu copy becomes "Five bowls a round." Rejected: putting `length`
  into `ModeConfig` — engine API already parameterizes it and no second mode exists to
  share the config.

## Risks / Trade-offs

- [Borderless groups read less obviously tappable than cards] — the pill stays as the
  affordance cue and the pressed state dims the whole group; `space-evenly` keeps the
  grouping legible without chrome.
- [Stats card hint must stay honest] — reuse the stats screen's own vocabulary
  (rounds, streaks, mastery), nothing speculative.

## Migration Plan

Pure UI change, no data or storage impact; recorded rounds keep their own length, so
history and stats remain correct across the 8 → 5 switch. Rollback is a revert.
