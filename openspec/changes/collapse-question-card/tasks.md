# Tasks

## 1. Collapsible question card

- [x] 1.1 `QuestionCard`: `answered` prop, local `expanded` toggle (pressable prompt row with chevron flip + button/expanded accessibility state only post-answer), chips render when `!answered || expanded`; `play.tsx` passes `answered` and keys the card by item id so each question starts collapsed
- [ ] 1.2 `pnpm typecheck`/`lint` green; on-device: answer a round — post-answer stack is collapsed question + tile strip then the reveal; tapping the row expands/collapses the chips; next question starts collapsed (user confirms before archive)
