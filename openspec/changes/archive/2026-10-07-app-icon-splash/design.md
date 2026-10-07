# Design

## Context

A contact-sheet round on the tester device compared four mark families (drawn steam
bowl, emoji bowl, tomato-field badge, photo coin). The user picked the emoji bowl,
then chose the house-tuned Twemoji variant (B2): same simple 🥣 shape, every color from
`src/theme.ts`. Current assets are Expo template defaults; the splash plugin paints
`#208AEF`. Concept exploration and the palette mapping live in this change's history;
nothing else in the app changes.

## Goals / Non-Goals

**Goals:**

- One recognizable mark on every identity surface, in theme colors.
- Assets reproducible offline from committed, properly licensed sources.
- Ship inside the next preview build alongside `polish-home-menu`.

**Non-Goals:**

- Dark-mode splash variant (the app ships one light menu identity).
- A drawn-from-scratch logo, store screenshots, an About screen.

## Decisions

- **D1 — Palette mapping (B2, fixed):** Twemoji 🥣 hex swaps — bowl `#A0041E → #C6371E`
  (tomato), rim `#EA596E → #D99A1B` (gold), broth `#662113 → #8C2312` (chili), spoon
  `#99AAB5 → #6F5B44` (inkSoft), spoon-bowl `#CCD6DD → #FCF7EA` (surface). Field:
  `#F7ECD2` (bg token) for the iOS icon, adaptive background layer, splash, favicon.
- **D2 — Mono from OpenMoji's stroke layer.** Twemoji is layered fills; flattened to a
  single color it becomes a blob. OpenMoji's `line` group is a true line drawing of the
  same 🥣, shipped in ink `#2B1B10` on transparency for launcher tinting.
- **D3 — One committed generator, sources vendored.** `apps/soup-quiz/assets/
  make_app_icon.py` (stdlib + Pillow from the dataset-pipeline venv + system
  `rsvg-convert`) reads `assets/images/sources/{twemoji,openmoji}-1f963.svg` — each
  headed with family, license, and source URL — applies the D1 mapping, and writes
  every PNG. Regeneration needs no network; hand-editing shipped PNGs is forbidden by
  convention (mirrors the dataset's "regenerate, never edit" rule). Rejected:
  committing bare PNGs (unreproducible); drawing from scratch (the emoji's charm was
  the point of the pick).
- **D4 — Size and transparency per surface:** iOS `icon.png` 1024 opaque cream; Android
  `android-icon-foreground.png` 1024 with the mark at ~66% center on **transparent**
  (masks crop edges); `android-icon-background.png` solid cream; `monochrome.png` ink
  strokes on transparent; `splash-icon.png` mark on transparent with `imageWidth`
  raised to 160 for presence; `favicon.png` 48 on cream.
- **D5 — Sequencing:** apply after `polish-home-menu`; a single EAS preview build
  (auto-incremented `versionCode`) ships both changes — no separate build per change.

## Risks / Trade-offs

- [`rsvg-convert` is a system dependency the repo doesn't otherwise pin] → documented
  in the script header (`brew install librsvg`); the script fails loudly if missing.
- [Twemoji upstream is unmaintained (archived)] → SVGs are vendored, so upstream
  movement cannot break regeneration; license (CC BY 4.0) is perpetual.
- [Emoji-render drag-and-drop look-alikes] → accepted deliberately: the user picked the
  emoji's simplicity over a bespoke mark; attribution keeps it honest.

## Migration Plan

Replace template PNGs in place (same filenames, same `app.json` references except the
splash color/width), then rebuild. Rollback = revert the asset commit and rebuild.
