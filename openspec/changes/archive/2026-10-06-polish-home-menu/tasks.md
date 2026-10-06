# Tasks

## 1. Equal menu tiles

- [x] 1.1 Rework `index.tsx`: `MenuTile` shape (title / hint / action pill), three `flex: 1` cards between header and footer, daily card on house type tokens with played-state wording, stats promoted to a tile; `pnpm typecheck` + `pnpm lint` green
- [x] 1.3 Device-feedback fix: borderless equal-weight groups (natural heights, pill under the hint) + ScrollView fallback — no element can escape its slot; artifacts updated to match (code + `pnpm typecheck`/`lint` green)
- [x] 1.2 On-device: three equal groups, whole-group tap navigates, daily group reflects solved/failed/unplayed, nothing overlaps in portrait, scrolling only when genuinely cramped (user confirms)

## 2. Five-bowl rounds

- [x] 2.1 `play.tsx` `ROUND_LENGTH` 8 → 5 and menu hint copy; `pnpm test` green (engine suites unaffected); `expo export --platform android` bundle smoke check passes
- [x] 2.2 On-device: a fresh free-play round serves five questions and scores after the fifth (user confirms)
