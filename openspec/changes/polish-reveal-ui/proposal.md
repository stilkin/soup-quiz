# Proposal

## Why

On-device feedback (2026-10-02): the reveal sits below five full-size option rows, so
every answer costs a scroll before the learning moment; and the 295 bundled photos —
sourced from many Commons photographers — vary in white balance and saturation, which
reads as inconsistency rather than character.

## What Changes

- **Post-answer option strip**: once a question is answered, the five country options
  collapse from full rows into a single row of flag tiles — the correct tile ringed in
  basil with a check, a wrong pick ringed in chili, the rest dimmed. Pre-answer rows are
  unchanged (readable names, full touch targets). The reveal card moves up by roughly
  three rows, and the collapse is one motion that answers the tap.
- **Sun-faded image treatment**: all bundled soup photos get a light, uniform
  color treatment ("sun-faded menu print": warm shift, lifted blacks, slightly muted
  saturation) baked at pipeline re-encode time, so every device shows identical output
  with zero runtime cost. Strength is picked from sample contact sheets before baking.
  Unfiltered 400 px originals stay in the pipeline cache, so the treatment is re-tunable.
  Docs and attribution posture note that images are re-encoded *and color-adjusted*
  (CC BY-SA adaptation marking).

Out of scope: pre-answer option layout, other screens, image selection/coverage changes,
any new game mode.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `quiz-gameplay`: the "Answering reveals item details" requirement gains the compacted
  post-answer option presentation (flag-tile strip with correct/wrong/dimmed states)
- `dataset-pipeline`: new requirement — bundled images carry a uniform, committed color
  treatment applied at re-encode; originals remain unfiltered in the cache

## Impact

- `apps/soup-quiz/src/app/play.tsx` (post-answer options render), one new component
  (flag-tile strip) alongside `OptionButton`, possibly a small theme token
- `data/pipeline/05_images.py` (treatment constants + application), regenerated
  `apps/soup-quiz/assets/soups/` (295 re-encodes from cache, no network) and
  `src/images.ts` (unchanged shape)
- `README.md` / `CLAUDE.md` image-attribution wording ("re-encoded and color-adjusted")
- No schema, engine, stats, or storage changes; manifest and credits unchanged
