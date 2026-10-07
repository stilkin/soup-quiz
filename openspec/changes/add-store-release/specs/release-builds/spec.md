# Spec Delta

## ADDED Requirements

### Requirement: Store distribution continues the app's identity and upgrade path
Production store builds SHALL use the same permanent application identity as tester builds (`be.pocito.soupquiz`), and the first store-distributed Android build SHALL install over an existing tester installation as an in-place upgrade that preserves on-device data.

#### Scenario: Store build upgrades over the tester app
- **WHEN** a tester with the sideloaded APK installs the store build from Google Play
- **THEN** it replaces the app in place and recorded rounds and streaks survive

#### Scenario: Version codes keep climbing
- **WHEN** a store build is cut
- **THEN** its `versionCode` exceeds the highest previously distributed build and every later build exceeds it

#### Scenario: iOS carries the same identity
- **WHEN** the iOS app is built for the store
- **THEN** its bundle identifier is `be.pocito.soupquiz` and its build number starts at 1 and rises monotonically

### Requirement: A privacy policy is published at a stable public URL
The project SHALL publish a privacy policy stating that the app collects no data, has no accounts, and keeps all progress on the device. Both store listings SHALL reference the same stable URL.

#### Scenario: The page is publicly reachable
- **WHEN** anyone opens the policy URL, including store review tooling
- **THEN** the page loads without authentication and states the no-collection policy

#### Scenario: Claims match the app
- **WHEN** the policy asserts that no data leaves the device
- **THEN** it matches the app, which makes no analytics, tracking, or account network calls

#### Scenario: Both listings point at it
- **WHEN** a store listing is completed
- **THEN** it carries the policy URL

### Requirement: Store listing assets are prepared from committed sources
Listing copy (app name, short and full descriptions) SHALL live in the repo; the Play feature graphic SHALL be an output of the committed identity-asset generator run against the vendored open-licensed sources; screenshots SHALL be captures of real app runs.

#### Scenario: Feature graphic regenerates offline
- **WHEN** the identity generator runs on a fresh clone
- **THEN** the feature graphic is produced alongside the icons, without network access

#### Scenario: Copy changes are reviewable
- **WHEN** listing text changes for a release
- **THEN** the change is a versioned diff in the repo, not a console-only edit

#### Scenario: Screenshots are real screens
- **WHEN** screenshots accompany a store submission
- **THEN** each one depicts the actual app captured on a device or simulator

### Requirement: Releases roll out staged, never review-first
The first store releases SHALL be gated by a prior successful run of the same build: an Android store build SHALL first install cleanly over the tester app via the Play internal track, and an iOS build SHALL first launch and pass a recorded smoke checklist in the iOS simulator before store submission.

#### Scenario: Android internal-track gate
- **WHEN** the production `.aab` is built
- **THEN** it is verified via the Play internal track over the tester installation before any production rollout

#### Scenario: iOS smoke before submission
- **WHEN** the production build is submitted for App Review
- **THEN** the same app revision has already launched in the simulator and passed the smoke checklist covering the menu, a quiz round, the daily challenge with its reminder toggle, stats, and share
