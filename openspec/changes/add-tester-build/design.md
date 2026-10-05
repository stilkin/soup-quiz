# Design

## Context

The app runs today only through a dev server in Expo Go (SDK 57, pure managed workflow —
no `android/` folder has ever been generated, and we want to keep it that way).
`eas-cli` is installed and logged in as `pocito`. The repo carries ~25 MB of committed
pipeline inputs under `data/` (raw wikitext snapshots, caches) that a cloud build has no
use for. `add-daily-challenge` task 5.2 is blocked on receiving a real notification,
which Expo Go cannot deliver (`expo-notifications` throws there); a release build is the
only place the reminder path can be verified.

## Goals / Non-Goals

**Goals:**

- One committed command that turns the repo into a signed, sideloadable Android APK.
- A link testers can install from with zero developer tooling.
- Upload hygiene: pipeline data never leaves the repo.
- Close `add-daily-challenge` 5.2 (notification received on-device).

**Non-Goals:**

- Play Store submission (AAB, listings, release tracks) — later change.
- iOS builds; `expo-updates` OTA; build CI; icon/splash redesign.
- Any change to app runtime behavior beyond the anchor freeze.

## Decisions

- **D1 — EAS cloud build, not local.** A single `preview` profile in `eas.json`; Expo's
  servers compile it. Keeps the managed workflow pure (no `android/` folder to maintain,
  no local SDK/JDK coupling) and yields a hosted build page whose link is the
  distribution vehicle. Alternatives: `eas build --local` (toolchain is present —
  Java 21, `~/Android/Sdk` — but it ties up this machine and changes nothing else);
  raw Gradle `assembleRelease` after `expo prebuild` (rejected: forces a permanent
  native folder and manual signing). Both remain possible later without artifact
  changes — only the `--local` flag differs.
- **D2 — Application ID `be.pocito.soupquiz`** (user-owned domain). Permanent identity
  for tester installs and the eventual store listing. `version` stays 1.0.0.
- **D3 — Exactly one profile: `preview`.** `distribution: internal`,
  `android.buildType: apk`, `android.autoIncrement: true` (EAS tracks and bumps
  `versionCode` per build, satisfying the update-in-place requirement without repo
  bookkeeping). A `production`/AAB profile is deliberately absent until store work —
  one way to do it right, defined when needed.
- **D4 — `apps/soup-quiz/.easignore` with an explicit exclusion list.** By default EAS
  uploads everything not covered by `.gitignore` — which would include all committed
  `data/`. An `.easignore` **replaces** (not extends) the gitignore-based filtering, so
  it must itself enumerate the usual build noise (`node_modules/`, `dist/`, `.expo/`,
  `.venv/`, `.git/`, …) plus `data/`, `openspec/`, `.claude/`. It lives next to
  `eas.json` (the app dir is the EAS project root; the monorepo root above it is still
  archived and uploaded so workspace packages resolve).
- **D5 — Monorepo wiring.** Root `package.json` pins `packageManager: pnpm@10.33.2`, so
  EAS installs workspace deps with pnpm correctly; `eas init` run from `apps/soup-quiz`
  registers the project and writes `extra.eas.projectId` into `app.json`.
- **D6 — Freeze `LAUNCH_ANCHOR_DAY` at the ship-day eve.** Day numbers in shares are
  `dayIndex − LAUNCH_ANCHOR_DAY`, so the anchor is the eve of the first tester build
  (20 729 = 2026-10-03) and the first daily, 2026-10-04, numbers #1. (The value first
  frozen as 20 639 was actually 2026-07-05 — 91 days early, caught in PR #1 review
  before any external install.) Never negative on day one, never re-based after
  distribution.
- **D7 — Notifications need no build config.** Local-only scheduling: the library's
  manifest contributes `POST_NOTIFICATIONS` (Android 13+), our existing
  `requestPermissionsAsync` call requests it at toggle time. No `google-services.json`:
  the build warns about push setup and proceeds — push is unused. No app.json plugin
  entry is required.
- **D8 — EAS-generated keystore, backed up.** The first Android build generates and
  stores one; right after, export it (`eas credentials -p android`) so update continuity
  never depends on the Expo account alone.

## Risks / Trade-offs

- [`.easignore` semantics differ from assumption → oversized upload or missing files] →
  check the archive/upload size in the first build log before distributing; adjusting
  and rebuilding is cheap.
- [EAS free tier queues/slower builds] → acceptable for a one-off; `--local` is the
  documented fallback (D1).
- [Keystore loss blocks future updates] → export backup immediately (D8).
- [Anchor/ship-date mismatch → day numbers off by one] → pre-build task gate asserts the
  anchor equals the ship date.
- [Source (incl. CC BY-SA images) uploaded to Expo's build servers] → accepted: build
  processing, not publication; distribution stays the APK with in-app attribution.

## Migration Plan

Additive only — `eas.json`, `.easignore`, `app.json` fields, one frozen constant, docs.
Rollback is "don't distribute the link"; nothing deployed or migrated.
