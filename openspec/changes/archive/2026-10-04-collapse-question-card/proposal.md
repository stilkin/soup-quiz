# Proposal

## Why

After the option strip freed ~3 rows, long ingredient lists (some soups carry 8+ chips)
still push the reveal below the fold. Post-answer the ingredients are reference
material, not the question — they can default to one row and open on demand.

## What Changes

- Once a question is answered, the question card collapses to a single row — the
  "What's in the bowl?" prompt plus a down chevron. Tapping the row expands the
  ingredient chips again (chevron flips); tapping once more collapses. Default for
  every new question is collapsed-after-answer.
- Pre-answer, the card is unchanged and not tappable: the full ingredient list **is**
  the question.
- Post-answer stack before the reveal becomes two rows: collapsed question + option
  strip.

Out of scope: pre-answer layout, the reveal card, option strip, any mode/engine logic.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `quiz-gameplay`: the "Answering reveals item details" requirement's post-answer
  compaction extends to the question's ingredient list — collapsed by default,
  expandable on demand, per question

## Impact

- `apps/soup-quiz/src/components/QuestionCard.tsx` (answered prop, expand toggle,
  chevron, accessibility state) and `apps/soup-quiz/src/app/play.tsx` (pass `answered`,
  remount per question via key)
- No schema/engine/stats/storage/pipeline changes; no new deps
