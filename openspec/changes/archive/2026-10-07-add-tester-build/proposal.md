# Proposal

## Why

The app is only playable through a dev server in Expo Go — testers cannot install it, and
the daily reminder has never fired on a real install because `expo-notifications` cannot
even load inside Expo Go. A signed Android APK gives testers a one-link install and
finally closes the on-device notification gate left open in `add-daily-challenge` (5.2).

## What Changes

- Register the app with EAS (`eas init`) under the existing `pocito` Expo account; the
  project id lands in `app.json` under `extra.eas`. Free tier, cloud builds.
- Give Android a permanent application identity: `android.package = be.pocito.soupquiz`
  (version stays 1.0.0; first build gets `versionCode` 1).
- Add `apps/soup-quiz/eas.json` with a single `preview` profile: internal distribution,
  release build, `buildType: apk` (sideloadable; no store involvement).
- Add `.easignore` next to `eas.json` so the committed pipeline inputs under `data/`
  (wikitext snapshots, caches, ~25 MB) never upload to Expo's build servers — the build
  only needs `apps/`, `packages/`, and the root manifests.
- Freeze `LAUNCH_ANCHOR_DAY` on the eve of the first tester build (20 729 = 2026-10-03)
  so the first daily, 2026-10-04, numbers #1; day numbers in shares are permanent from
  the first external install.
- Document the build + distribution flow (README, CLAUDE.md commands).

Out of scope: Play Store submission (AAB, listings), iOS builds, `expo-updates` OTA,
build CI, icon/splash polish beyond the existing assets.

## Capabilities

### New Capabilities

- `release-builds`: producing and distributing installable release builds of the app —
  build profiles, application identity, tester install links. Owns store-submission
  requirements later if they stay build-shaped.

### Modified Capabilities

- None. Freezing `LAUNCH_ANCHOR_DAY` is a value freeze; the daily-challenge requirement
  already mandates "a frozen launch anchor committed in the code".

## Impact

- `apps/soup-quiz/app.json` (package, `extra.eas.projectId`), new `apps/soup-quiz/eas.json`
  and `apps/soup-quiz/.easignore`.
- `packages/engine/src/daily.ts`: anchor comment changes provisional → frozen (no
  behavioral change beyond day-number permanence).
- First cloud build creates the EAS-managed Android keystore (kept for future store
  builds — nothing to configure now).
- `add-daily-challenge` 5.2 verifies through this build's APK; that change archives
  right after.
