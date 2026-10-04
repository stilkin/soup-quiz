# Design

## Context

See proposal.md — Why. `QuestionCard` (`apps/soup-quiz/src/components/QuestionCard.tsx`)
is a plain stateless card: `type.title` prompt + wrapping row of ingredient chips.
`play.tsx` renders it above the (now swapping) options block. House rules: tokens only,
dimming via opacity, Reanimated entering/exiting lives in `play.tsx`, components stay
animation-free unless the motion is intrinsic.

## Goals / Non-Goals

**Goals:** two-row post-answer stack (collapsed question + option strip) before the
reveal; ingredients one tap away.

**Non-Goals:** no pre-answer changes; no persistence of the expanded state across
questions; no new animations beyond what exists.

## Decisions

### D1: State lives in `QuestionCard`; `play.tsx` remounts per question
`QuestionCard` gains an `answered` prop and local `expanded` state (default false).
Render: prompt row always; chips only when `!answered || expanded`. The prompt row
becomes a `Pressable` toggle **only** when `answered` — pre-answer there is nothing to
toggle and the card must not look interactive. `play.tsx` passes `answered` and adds
`key={question.item.id}` so every question starts collapsed (a toggle on question 3
must not leak into question 4).
*Alternative rejected:* lifting `expanded` into the play reducer — a UI-only concern
doesn't belong in round state.

### D2: Chevron, accessibility, and no animation
A `▾` `Text` (inkSoft) sits at the right of the prompt row, rotating via
`transform: [{ rotate: expanded ? '180deg' : '0deg' }]` — an instant flip, no spring:
the answer-moment motion is already carried by the strip fade and the reveal spring;
this toggle is a tool, not a moment. The collapsed row sets `accessibilityRole="button"`,
`accessibilityLabel="Show ingredients"`/`"Hide ingredients"`, and
`accessibilityState={{ expanded }}`. Chips render conditionally (instant), consistent
with D2's no-animation stance.

### D3: Layout of the prompt row
`flexDirection: 'row'` between the prompt `Text` (flex 1) and the chevron; the card's
border, background, padding stay exactly as-is, so the collapsed card reads as the same
menu line — just closed.

## Risks / Trade-offs

- [Frequent togglers re-tap per question] → accepted: per-question reset is the spec'd
  default and the common case (ingredients matter before the answer, rarely after)
- [Chevron glyph availability] → `▾` (U+25BE) is in every system font the app targets;
  fallback would be `▽`

## Migration Plan

Component-level change; rollback = revert the commit. No data, storage, or spec-schema
impact beyond the requirement text.

## Open Questions

(none)
