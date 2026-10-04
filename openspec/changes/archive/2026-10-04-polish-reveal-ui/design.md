# Design

## Context

See proposal.md — Why. Current state: `play.tsx` renders five `OptionButton` rows in both
pre- and post-answer states (`optionState` maps to idle/correct/wrong/dimmed); the reveal
card (`RevealCard`) animates in below them. Images re-encode in `05_images.py::reencode`
from 400 px cached originals (`data/cache/commons/thumbs`) to 200 px q90 assets. Theme
tokens live in `apps/soup-quiz/src/theme.ts` (basil = success, chili = error, dimmed).

## Goals / Non-Goals

**Goals:**
- Reveal visible without scrolling past the options after answering
- One uniform photo look across all 295 bundled images, reproducible offline

**Non-Goals:**
- No change to pre-answer options (names + touch targets stay)
- No runtime image filtering (no Skia/shader deps); treatment is pipeline-baked
- No image selection or credit changes

## Decisions

### D1: Post-answer options swap to a flag-tile strip
`play.tsx` renders `OptionButton` rows while unanswered; on answer it renders one new
`OptionStrip` component — five tiles in a row, each showing the flag at ~44–48 px with a
2 px ring: basil + a check glyph on the correct tile, chili on the picked-wrong tile,
line-color + reduced opacity on the rest. State mapping reuses the existing
`optionState` helper unchanged. The swap is animated as one moment: rows fade out, strip
and reveal fade in (Reanimated entering/exiting); if layout animation feels janky on
Android, a plain swap with the existing `FadeInDown` on the reveal is the accepted
fallback — the win is the freed vertical space, not the animation.
*Alternative rejected:* a `compact` prop on `OptionButton` — one component serving two
interaction models (input vs feedback) complicates both for no reuse gain.
*Accessibility:* tiles are not pressable post-answer; each carries
`accessibilityLabel` = "country name, correct/wrong pick/not chosen" (spec scenario).

### D2: Sun-faded treatment is a versioned constant, applied at re-encode
A small `treatment.py` module in `data/pipeline/` holds the profile: a per-channel LUT
(warm: red lifted slightly, blue pulled), lifted blacks (output floor ≈ 18/255 for a
matte fade), and a saturation factor just under 1 — pure Pillow point/enhance ops,
deterministic and fast. `reencode` applies it after resize, before save. Originals in
the cache are never modified; changing the profile and re-running stage 05 regenerates
all assets offline (~seconds).
*Alternative rejected:* runtime filtering — RN has no core color-filter support; real
filtering needs Skia (new native dep, per-frame cost, device variance) for zero benefit
over baking.

### D3: Strength is picked from contact sheets before baking
Three strengths (subtle / medium / warm) × four representative photos (dark stew, pale
cream soup, green herbal soup, red broth) composited into one labeled sheet per strength
via Pillow. The user picks; the chosen constants land in `treatment.py` with the date.
Default lean: subtle — recognizability of the dish is the learning payload; the
treatment is seasoning, not the dish.

### D4: Attribution posture
In-app credit lines are unchanged (author · license). README/CLAUDE.md gain the words
"and color-adjusted" next to the existing re-encode note — CC BY-SA 4(b) expects
adaptations to be marked, and we already document the re-encoding.

## Risks / Trade-offs

- [Over-filtering flattens food differences] → contact-sheet gate before baking; subtle default; originals cached for re-tuning
- [Animation jank on low-end devices] → plain-swap fallback accepted (D1)
- [Pillow version drift changes re-encode bytes across environments] → assets are committed; regeneration happens in the pinned venv and a changed blob is reviewable in the diff
- [Flag-only tiles ambiguous for similar flags] → the reveal card names the correct country directly below; tiles are feedback, not the answer

## Migration Plan

Strip ships behind the existing play screen (no routing/storage change). Assets
regenerate in place (`05_images.py` + `06_compile.py`, offline); `images.ts` keeps its
shape. Rollback for either half = revert the commit; recorded stats are untouched.

## Open Questions

- Exact treatment constants — resolved by the contact sheets in task 2 (does not affect
  approach or breakdown).
