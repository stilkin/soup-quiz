# release-builds Specification

## Purpose

Produces and distributes installable release builds of the app — the bridge from this
repo to testers' devices (and later the store), without requiring any local Android
toolchain.

## Requirements

### Requirement: Stable Android application identity

Release builds SHALL use the permanent Android application ID `be.pocito.soupquiz`. A
distributed build SHALL carry a `versionCode` higher than any previously distributed
build, so installing a newer tester build upgrades in place instead of failing or
installing alongside.

#### Scenario: Update over a previous tester build

- **WHEN** a tester installs a newer build over an existing installation
- **THEN** Android treats it as an update of the same app and the on-device stats
  (SQLite rounds/answers, streaks) survive

#### Scenario: Identity never changes

- **WHEN** any future build is produced, for testers or the store
- **THEN** the application ID is still `be.pocito.soupquiz`

### Requirement: Reproducible internal build profile

The repo SHALL contain a committed build profile that, from a fresh checkout, produces
a signed release APK for internal distribution via a cloud build service — no local
Android SDK, JDK, or manual signing setup required.

#### Scenario: Build from a clean checkout

- **WHEN** the committed build command runs with the internal profile on a fresh clone
- **THEN** it produces a signed APK built from the current `android` release
  configuration of the app

#### Scenario: Profile yields an installable APK

- **WHEN** the internal profile build finishes
- **THEN** the artifact is an `.apk` that a stock Android device can sideload
  (not a store-only `.aab`)

### Requirement: Tester install link

An internal-profile build SHALL produce a link testers can open on an Android device to
download and install the build without developer tooling or access to the repository.

#### Scenario: Cold install via link

- **WHEN** a tester opens the build link in a mobile browser and confirms the install
- **THEN** the app is installed from the downloaded APK and launches to the menu

### Requirement: Build uploads exclude pipeline data

The build context uploaded to the cloud build service SHALL exclude the dataset
pipeline's raw wikitext snapshots and caches under `data/`; the app build SHALL depend
only on the app, the workspace packages, and the root manifests.

#### Scenario: Pipeline inputs never leave the repo

- **WHEN** a cloud build uploads its context
- **THEN** nothing under `data/raw/` or `data/cache/` is included
