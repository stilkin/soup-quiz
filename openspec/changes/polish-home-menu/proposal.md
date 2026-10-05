# Proposal

## Why

First device feedback on the tester APK: the home screen presents its three
destinations as unequal citizens — the daily is a compact card with ad-hoc font
sizes, the free-play mode is a block with a button, and stats is a small text
link. All three are equally important doors into the app. Separately, a
free-play round of 8 bowls runs long on a phone; 5 feels right.

## What Changes

- Home screen becomes three vertically equal tiles — Today's soup, Ingredients →
  Country, Your stats — sharing one card style, each with a title, a one-line
  hint, and an action pill; the whole tile is tappable.
- Today's-soup card drops its ad-hoc font sizes for the house type tokens, and
  its action pill keeps the Play/View state wording.
- Stats is promoted from a text link to the third tile.
- Standard free-play rounds shrink from 8 to 5 questions (app-side constant +
  menu copy). No engine, schema, or stats changes — round length is already a
  `generateRound` parameter, and recorded rounds store their own length.

Out of scope: new menu entries, reordering destinations, changing the daily or
stats screens themselves, moving round length into mode config.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `quiz-gameplay`: adds menu-presentation requirements (three equal tiles) and
  pins the standard free-play round length at five questions.

## Impact

- `apps/soup-quiz/src/app/index.tsx` — layout rework, shared tile styles.
- `apps/soup-quiz/src/app/play.tsx` — `ROUND_LENGTH` 8 → 5.
- Menu copy ("Eight bowls a round." → "Five bowls a round.").
