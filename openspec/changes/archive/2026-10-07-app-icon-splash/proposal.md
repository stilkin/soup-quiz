# Proposal

## Why

The tester APK ships Expo template branding: a blueprint-grid chevron icon and an
Expo-blue (`#208AEF`) splash — the only cool-blue surfaces in an otherwise cream/tomato
app. Icon and splash are the first things a tester (and later a store visitor) sees;
they should carry the app's own identity. A concept round on device rendered four mark
families; the user chose the emoji bowl, house-tuned: Twemoji's 🥣 recolored to theme
tokens (contact-sheet pick, variant B2).

## What Changes

- One app mark everywhere: Twemoji 🥣 recolored to house tokens (tomato bowl, gold rim,
  chili broth, ink-soft spoon) on the cream field — iOS icon, Android adaptive icon
  (cream background layer + mark foreground), and the splash (replacing Expo blue).
- Android themed-icon (monochrome) variant from OpenMoji's 🥣 stroke layer in ink —
  flattening Twemoji's layered fills to one color collapses into a blob; OpenMoji is a
  true line drawing.
- Sources vendored with license headers (`Twemoji` CC BY 4.0, `OpenMoji` CC BY-SA 4.0)
  and a committed one-off generator script; shipped PNGs are regenerated, never
  hand-edited. Attribution noted in the README.
- `app.json`: splash `backgroundColor` → the app background token; splash `imageWidth`
  sized up so the mark has presence.
- One rebuild of the preview APK after `polish-home-menu` lands, shipping both changes.

Out of scope: dark-mode splash variant, store screenshot generation, in-app About page.

## Capabilities

### New Capabilities

- `app-identity`: the app's visual mark across launcher icons, themed icons, and the
  splash — one mark, theme palette, reproducible sources.

### Modified Capabilities

- None.

## Impact

- `apps/soup-quiz/assets/images/`: regenerated `icon.png`, `android-icon-foreground/
  background/monochrome.png`, `splash-icon.png`, `favicon.png`; new `sources/` with
  the two SVGs + license notes; new generator script.
- `apps/soup-quiz/app.json`: splash plugin color/size.
- `README.md`: icon attribution line; roadmap note.
- One EAS preview rebuild (auto-bumped `versionCode`).
