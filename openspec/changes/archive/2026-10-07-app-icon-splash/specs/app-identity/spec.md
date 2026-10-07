# Spec Delta

## Purpose

The app's visual identity — one bowl mark carried across launcher icons, themed icons,
and the splash screen, drawn from the theme palette and reproducible from committed
open-licensed sources.

## ADDED Requirements

### Requirement: One mark across every identity surface

The launcher icons (iOS and Android, including the Android adaptive foreground) and the
splash screen SHALL all present the same bowl mark in the theme palette — tomato bowl,
gold rim, chili broth, ink-soft spoon on the cream background token. The splash
background SHALL be the app's background color, with no foreign default color.

#### Scenario: Launcher shows the mark

- **WHEN** the installed app appears on the device launcher, in any mask shape
- **THEN** the icon is the house-colored bowl mark on cream

#### Scenario: Cold start shows the branded splash

- **WHEN** the app cold-starts
- **THEN** the splash shows the same mark on the app background color, with no
  system-template blue anywhere in the launch sequence

#### Scenario: Themed icons keep the identity

- **WHEN** Android themed icons are enabled on the device
- **THEN** the monochrome variant still reads as a bowl with a spoon

### Requirement: Identity assets are reproducible from committed sources

All shipped identity PNGs SHALL be outputs of a committed generator script run against
open-licensed SVG sources vendored in the repo; regenerating SHALL require no network.
The SVG sources and the README SHALL carry attribution for both source families
(Twemoji CC BY 4.0, OpenMoji CC BY-SA 4.0).

#### Scenario: Regeneration works offline

- **WHEN** the generator script runs on a fresh clone
- **THEN** it regenerates every identity asset from the vendored sources without any
  network access

#### Scenario: Sources are credited

- **WHEN** a reader inspects the vendored sources or the README
- **THEN** both emoji families are named with their licenses and links
