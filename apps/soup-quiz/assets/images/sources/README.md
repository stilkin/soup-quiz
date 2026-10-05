# Identity source artwork

Vendored inputs for `../../make_app_icon.py` — the shipped identity PNGs are
regenerated from these, never hand-edited (change `app-icon-splash`).

- `twemoji-1f963.svg` — the 🥣 bowl-with-spoon from
  [Twemoji](https://github.com/jdecked/twemoji) (graphics **CC BY 4.0**), recolored
  to the app palette at generation time.
- `openmoji-1f963.svg` — the 🥣 from
  [OpenMoji](https://github.com/hfg-gmuend/openmoji) (**CC BY-SA 4.0**); only its
  stroke layer is used, as the monochrome Android themed-icon variant.

Upstream colors are untouched here on purpose: the palette mapping lives in the
generator so the sources stay pristine and diffable against upstream.
