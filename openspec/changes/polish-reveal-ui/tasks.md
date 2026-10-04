# Tasks

## 1. Post-answer option strip

- [x] 1.1 Add `OptionStrip` (five flag tiles: basil ring + check on correct, chili ring on wrong pick, dimmed others) with per-tile accessibility labels (name + state); reuse the existing state mapping in `play.tsx`
- [x] 1.2 Wire the swap in `play.tsx`: full rows pre-answer, strip post-answer, one animated moment (rows out, strip + reveal in); fall back to a plain swap if layout animation janks on Android
- [ ] 1.3 On-device: answer a round — reveal reachable without scrolling past options; wrong answers still show the red ring; screen-reader labels spot-checked (user confirms)

## 2. Sun-faded treatment

- [x] 2.1 Add `data/pipeline/treatment.py`: versioned warm/faded profile (per-channel LUT, black-point lift, saturation factor) applied via Pillow point/enhance ops
- [x] 2.2 Generate contact sheets: 3 strengths × 4 representative photos (dark stew, pale cream, green herbal, red broth), labeled; user picks the strength, constants recorded in `treatment.py`
- [x] 2.3 Apply in `05_images.py::reencode` (after resize, before save); re-run stages 05–06 offline; verify 295 assets regenerate byte-stably and pairing/manifest tests stay green

## 3. Docs + integration

- [x] 3.1 README + CLAUDE.md: images are "re-encoded and color-adjusted" (CC BY-SA adaptation marking); present-vs-planned row for the strip
- [ ] 3.2 `pnpm typecheck`/`lint`/`test` green, bundle export passes; on-device round confirms strip + treated photos (user confirms before archive)
