# Tasks

## 1. Equal menu tiles

- [x] 1.1 Rework `index.tsx`: `MenuTile` shape (title / hint / action pill), three `flex: 1` cards between header and footer, daily card on house type tokens with played-state wording, stats promoted to a tile; `pnpm typecheck` + `pnpm lint` green
- [ ] 1.2 On-device: three equal cards, whole-card tap navigates, daily card reflects solved/failed/unplayed, nothing cramps in portrait (user confirms)

## 2. Five-bowl rounds

- [x] 2.1 `play.tsx` `ROUND_LENGTH` 8 → 5 and menu hint copy; `pnpm test` green (engine suites unaffected); `expo export --platform android` bundle smoke check passes
- [ ] 2.2 On-device: a fresh free-play round serves five questions and scores after the fifth (user confirms)
