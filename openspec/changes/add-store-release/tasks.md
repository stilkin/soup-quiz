# Tasks

## 1. Store build profiles & app identity

- [x] 1.1 Add `ios.bundleIdentifier` (`be.pocito.soupquiz`) and `ios.buildNumber` (1) to `app.json`; verify with `pnpm exec expo config --type public` showing both values
- [x] 1.2 Add `production` (android `app-bundle`, no autoIncrement) and `ios-sim` (`ios.simulator: true`, internal) profiles to `eas.json`; verify `pnpm exec eas config --profile production --platform android` resolves with the expected build type and no autoIncrement
- [x] 1.3 Wrap `SearchSelect` content in a `KeyboardAvoidingView` (iOS `padding` behavior, Android unchanged); verify `pnpm typecheck && pnpm lint` pass — on-iOS behavior is confirmed by the 4.2 smoke checklist

## 2. Privacy policy & listing kit

- [x] 2.1 Write `docs/index.md` privacy page (no data collected, no accounts, all progress on-device, support contact); verify the page states the no-collection policy and `pnpm ls --depth 0`-style dependency audit shows no analytics/telemetry packages
- [ ] 2.2 Enable GitHub Pages (main branch, `/docs` root) in repo settings — user gate; verify `curl -s https://stilkin.github.io/soup-quiz/` returns the rendered policy
- [x] 2.3 Write `docs/store-listing.md` with Play + App Store copy (title, short and full descriptions, keywords, what's new); verify every field is within its store's character limits
- [x] 2.4 Extend `make_app_icon.py` to emit the 1024×500 Play feature graphic (flat, no alpha) and a 512×512 Play icon; verify regeneration runs offline and PIL reports the exact sizes/modes

## 3. Android store build (Google Play)

- [x] 3.1 Set `versionCode` to 12 (exceeds distributed 11) and run `eas build --profile production --platform android`; verify the EAS build finishes and the artifact is an `.aab`
- [ ] 3.2 Play Console — user gate: create the app record, and on first `.aab` upload enroll the **existing** keystore as the app signing key (design D1), upload to the internal track; verify the console shows the uploaded key as the app signing key
- [ ] 3.3 Play Console listing — user gate: paste copy from `docs/store-listing.md`, upload icon + feature graphic, device screenshots (≥2, captured on the Android tester device), complete content-rating and data-safety (no collection) forms; verify the console's listing-completeness check is green
- [ ] 3.4 Install-over-tester gate — user gate: install the internal-track build from Play over the sideloaded APK; verify it upgrades in place with rounds and streaks intact (the spec scenario)
- [ ] 3.5 Promote to production — user gate: roll the internal release to production; verify the listing is live on Google Play

## 4. iOS build & simulator smoke

- [ ] 4.1 Run `eas build --profile ios-sim --platform ios` (can start any time after 1.2); verify the artifact unpacks to an `.app` that opens in the MacBook's iPhone simulator
- [ ] 4.2 Smoke checklist — user gate, on the simulator: launch, menu, a full quiz round, the daily (tiered clues, guess commit, reminder toggle + permission prompt), stats screen, share sheet, and the country search usable with the keyboard open; capture the App Store screenshot set (6.7") while there; verify every checklist item passes and screenshots are saved
- [ ] 4.3 Fix anything the smoke surfaces (iterate via Expo Go in the simulator over LAN); if the binary changed, rebuild 4.1 and re-run the checklist; verify the final revision passes clean
- [ ] 4.4 Run `eas build --profile production --platform ios` with the ASC API key as EAS' credentials source (distribution cert + profile minted through it); verify the build finishes and the artifact is an `.ipa`
- [ ] 4.5 Upload the `.ipa` through the ASC API `buildUploads` flow (or `eas submit` if it implements that flow); verify the build appears and processes in App Store Connect
- [ ] 4.6 Fill the ASC listing from `docs/store-listing.md` via the API — version 1.0.0 (copyright `© 2026 pocito.fyi`, releaseType automatic), localizations (description, keywords, support + marketing URLs, what's new), Games → Trivia category, free pricing, screenshots from 4.2 — then the user completes the console-only App Privacy and age-rating questionnaires; verify the submission checklist is green
- [ ] 4.7 Submit for review — user gate: the user clicks Submit in App Store Connect with review contact info; verify approval and automatic release (respond to any rejection, then resubmit)

## 5. Wrap-up

- [ ] 5.1 Full local gates on the release-candidate tree — run before the 3.5 promotion and the 4.7 submission, and again whenever a release candidate changes: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm exec expo export --platform android`; verify all pass
- [ ] 5.2 Update the README present-vs-planned table and CLAUDE.md status line for the shipped 1.0 store release; verify both mention both stores

## Workflow follow-up

- Archive the change with `/opsx:archive` once both stores are live and gates 3.4/4.2 attestations are in.
- Record the Play app signing key enrollment result (which key, upload date) in the tester-build notes for future reference.
