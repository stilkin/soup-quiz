#!/usr/bin/env python
"""Regenerates the app's identity assets (icon, adaptive layers, mono, splash, favicon).

Change `app-icon-splash` design D1/D4: the Twemoji bowl-with-spoon recolored to the
theme palette, plus OpenMoji's stroke layer as the monochrome themed-icon variant.

Run from anywhere:  ../../data/pipeline/.venv/bin/python make_app_icon.py
Requires Pillow and `rsvg-convert` (brew install librsvg) on PATH. No network —
sources are vendored in images/sources/.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "images" / "sources"
OUT = HERE / "images"

# theme.ts tokens (apps/soup-quiz/src/theme.ts) — keep in sync deliberately.
CREAM = "#F7ECD2"  # colors.bg
INK = "#2B1B10"  # colors.ink

# design D1: upstream hex -> theme token. Twemoji ships uppercase hex.
PALETTE_MAP = {
    "#A0041E": "#C6371E",  # bowl    -> tomato
    "#EA596E": "#D99A1B",  # rim     -> gold
    "#662113": "#8C2312",  # broth   -> chili
    "#99AAB5": "#6F5B44",  # spoon   -> inkSoft
    "#CCD6DD": "#FCF7EA",  # spoon bowl -> surface
}

FOREGROUND_FRACTION = 0.66  # Android adaptive safe zone


def render(svg: str, size: int, background: str | None = None) -> Image.Image:
    rsvg = shutil.which("rsvg-convert")
    if rsvg is None:
        sys.exit("make_app_icon: rsvg-convert not found — brew install librsvg")
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as handle:
        handle.write(svg)
        svg_path = handle.name
    cmd = [rsvg, "-w", str(size), "-h", str(size)]
    if background is not None:
        cmd += ["--background-color", background]
    out_path = svg_path.replace(".svg", ".png")
    subprocess.run(cmd + [svg_path, "-o", out_path], check=True)
    image = Image.open(out_path).convert("RGBA")
    Path(svg_path).unlink(missing_ok=True)
    Path(out_path).unlink(missing_ok=True)
    return image


def recolor(svg: str) -> str:
    for upstream, token in PALETTE_MAP.items():
        svg = svg.replace(upstream, token)
    return svg


def strip_to_line(svg: str) -> str:
    """OpenMoji file -> stroke layer only (the 'black' variant), in ink."""
    start = svg.index('<g id="line">')
    end = svg.index("</svg>")
    line = svg[start:svg.index("</g>", start) + len("</g>")]
    return svg[:start] + line + "\n" + svg[end:]


def centered(art: Image.Image, canvas_size: int, fraction: float) -> Image.Image:
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    inner = int(canvas_size * fraction)
    canvas.alpha_composite(art.resize((inner, inner), Image.LANCZOS),
                           ((canvas_size - inner) // 2, (canvas_size - inner) // 2))
    return canvas


def main() -> None:
    twemoji = (SRC / "twemoji-1f963.svg").read_text()
    openmoji = (SRC / "openmoji-1f963.svg").read_text()
    mark = recolor(twemoji)
    mono = strip_to_line(openmoji).replace('stroke="#000"', f'stroke="{INK}"')

    outputs = {
        # iOS + web: full-bleed mark on the cream field, opaque.
        "icon.png": render(mark, 1024, background=CREAM).convert("RGB"),
        "favicon.png": render(mark, 48, background=CREAM).convert("RGB"),
        # Android adaptive: transparent foreground at the safe zone, solid cream layer.
        "android-icon-foreground.png": centered(render(mark, 1024), 1024, FOREGROUND_FRACTION),
        "android-icon-background.png": Image.new("RGB", (1024, 1024), CREAM),
        # Themed icons: OpenMoji strokes in ink, same optical size as the foreground.
        "android-icon-monochrome.png": centered(render(mono, 1024), 1024, FOREGROUND_FRACTION),
        # Splash: mark on transparency; app.json sizes it over the cream background.
        "splash-icon.png": render(mark, 1024),
    }
    for name, image in outputs.items():
        image.save(OUT / name)
        print(f"wrote {(OUT / name).relative_to(HERE.parent)} {image.size}")


if __name__ == "__main__":
    main()
