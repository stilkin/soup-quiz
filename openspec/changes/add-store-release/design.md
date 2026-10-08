# Design

## Context

The app is frozen at 1.0: Android-proven on real hardware (tester APK lineage at
`versionCode` 11, EAS-managed keystore with a user-held backup), never executed on iOS
(`app.json` has `"ios": {}`), `eas.json` has only the internal `preview` profile. Both
store accounts exist; the Play account predates the Nov 2023 closed-testing rule, so no
12-tester/14-day gate applies. No Apple handheld hardware — but a MacBook Pro can run
the iOS simulator. The repo is public on GitHub, which makes GitHub Pages free for a
privacy-policy URL. `.easignore` at the repo root already keeps pipeline data out of
build uploads; new profiles inherit that.

## Goals / Non-Goals

**Goals:**

- Signed store artifacts from committed profiles, with zero local Android/iOS toolchain.
- The tester→store upgrade path preserved on Android (data survives).
- First iOS execution happening on our simulator, never in App Review.
- Every submission asset (copy, graphics, policy) reviewable as a repo diff.

**Non-Goals:**

- `eas submit` or any store API credentials — manual console uploads for 1.0. (Superseded for Apple by D8; Play stays manual.)
- TestFlight external testing as a *required* gate (available as belt-and-braces).
- Exiting the managed workflow (no `ios/` prebuild dir, no local Xcode build).
- Staged percentage rollouts, localized listings, custom domain, in-app policy screen.

## Decisions

### D1 — Enroll the existing keystore as the Play app signing key

The tester APKs are signed with the EAS-managed keystore. On first `.aab` upload, Play's
default offers to *generate* a new app signing key — signing store downloads with a key
different from the tester APKs' would break in-place upgrade (signature mismatch forces
uninstall, stats lost) and violate the upgrade-path requirement. At first upload we
choose "export/upload a key from a Java keystore" and enroll the existing key (the user
holds its backup from the tester-build change). The internal-track
install-over-tester gate exists precisely to verify this before production.

*Alternative:* let Google generate the key and have testers reinstall — rejected: silent
data loss for our most invested players.

### D2 — Two profiles: `production` and an iOS simulator variant

`production` (android `app-bundle`, iOS release with EAS-managed distribution
credentials generated at first build) is the store interface. A second profile
**extends `production`**, overriding only `distribution` and `ios.simulator`, to
produce an unsigned `.app` needing no Apple credentials — the smoke-gate binary that
provably exercises the release configuration. Both inherit `.easignore`.

*Alternative:* one profile plus CLI flags — rejected: the committed profile *is* the
reproducible interface (release-builds spec); flags are tribal memory.

### D3 — Version bookkeeping stays local and manual

`appVersionSource: "local"` already holds; keep it. `production` gets **no**
`autoIncrement`: the store `versionCode` is set by hand at cut time to exceed the
highest distributed build (12 at first cut, since tester builds sit at 11 — note
`preview`'s `autoIncrement` keeps climbing with future tester builds, which the manual
check accounts for). iOS `buildNumber` starts at 1. Store submission steps include
verifying the bump, making lineage deliberate rather than emergent.

*Alternative:* `autoIncrement` on production — rejected: build count is not release
count; a retried/failed build would silently consume a store version number.

### D4 — Privacy policy via GitHub Pages on `/docs`

The repo is public → Pages is free and zero-ops. A `docs/index.md` (rendered by
GitHub's default Jekyll) publishes at `https://stilkin.github.io/soup-quiz/`; enabling
Pages (main branch, `/docs` root) is a one-time repo-settings action. Other `docs/`
files becoming reachable as pages is harmless — they are public in the repo anyway.

*Alternative:* an external static host — rejected: a second service for one page.

### D5 — Feature graphic from the identity generator

`make_app_icon.py` gains a 1024×500 Play feature graphic output: the bowl mark on the
cream token with the app name in the theme type — flat, no alpha (Play's requirement),
generated offline from the vendored SVGs like every other identity PNG, committed as
an output.

*Alternative:* hand-crafted asset in a graphics tool — rejected: breaks the
reproducibility posture of `app-identity`.

### D6 — iOS smoke runs the simulator build, not Expo Go

The smoke gate must exercise the release-configured binary (production bundle, plugins,
no dev tooling). `eas build` with `ios.simulator: true` yields exactly that, unsigned.
Expo Go in the simulator (over LAN, like the Android loop) remains the *iteration* loop
for any fixes the smoke surfaces. No prebuild, no local Xcode project.

### D7 — Keyboard fix scoped inside `SearchSelect`

`SearchSelect` is a plain `View` — on iOS the keyboard can cover the suggestion rows
(Android resizes by default). Minimal fix inside the component: a
`KeyboardAvoidingView` (iOS `padding` behavior) around the existing content; Android
path unchanged. No new dependency, no global manifest change.

*Alternative:* `softwareKeyboardLayoutMode` in the manifest — rejected: global blast
radius for a one-screen problem.

### D8 — Apple submission rides the App Store Connect API

The ASC API (4.5.1, verified against Apple's OpenAPI spec) can register the bundle ID,
create the version record and localizations, upload screenshots, set free pricing and —
since Apple added `buildUploads` — upload the `.ipa` binary itself. With a scoped
App Manager key, the Apple side runs from the repo machine; the console sees exactly:
the one-time Create App (done by the user), the App Privacy labels and age-rating
questionnaire (console-only), and the final Submit click (kept human deliberately).
The key lives at `~/.config/soup-quiz/asc/` (0600), is never committed to this public
repo, never printed, revocable in ASC anytime. Transporter and the MacBook are not
needed. This supersedes the 1.0 "manual uploads" stance for Apple only; Play stays
manual (app creation is console-only there and uploads need a separate service-account
key we deliberately don't have).

## Risks / Trade-offs

- [Play key enrollment done wrong → testers forced to reinstall, data lost] → D1
  enrollment plus the internal-track install-over-tester gate before any production
  rollout.
- [Simulator is not hardware; App Review runs devices] → smoke checklist covers the
  whole core loop; optional TestFlight external check before submit; accepted residual
  risk for an offline first-party-Expo app.
- [First iOS build generates credentials interactively] → EAS dist cert/provisioning
  creation is a user-gated task step (Apple login), kept out of automation.
- [iOS review latency] → the Android ladder proceeds independently; iOS timing never
  blocks Play production.
- [`docs/` Pages serves other docs too] → accepted; they are public in-repo already.

## Migration Plan

Rollout order is the task list (Android first, iOS gated). Rollback before production
is trivial: halt at the internal track / TestFlight stage — no user has the store build.
After production, rollback is a Play Console halt of the release; the tester-APK
lineage remains a parallel escape hatch.
