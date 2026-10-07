# Tasks

## 1. Sources + generator + assets

- [x] 1.1 Vendor the two SVGs under `apps/soup-quiz/assets/images/sources/` with license-header sidecars (Twemoji CC BY 4.0, OpenMoji CC BY-SA 4.0); write `make_app_icon.py` applying the D1 palette map via D4 sizes/transparencies; regenerate `icon.png`, `android-icon-{foreground,background,monochrome}.png`, `splash-icon.png`, `favicon.png`; verify a re-run reproduces the assets and the script fails loudly without `rsvg-convert`
- [x] 1.2 `app.json`: splash plugin `backgroundColor` → `#F7ECD2`, `imageWidth` → 160; `pnpm typecheck` + `pnpm lint` green

## 2. Attribution + integration

- [x] 2.1 README: icon attribution line under "Data sources and licensing" (both families, licenses, links); roadmap row for the change; `pnpm test` green
- [x] 2.2 Rebuild the preview APK (after `polish-home-menu` is applied) and confirm the new icon/splash in the build; on-device: launcher icon in circle and squircle masks, branded splash on cold start, themed-icon mono variant (user confirms)
