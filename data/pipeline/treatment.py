#!/usr/bin/env python3
"""Sun-faded color treatment for bundled soup images (design D2, change polish-reveal-ui).

One warm, faded profile — black-point lift, warm tilt, gentle desaturation — applied
at re-encode time so every device sees identical output with zero runtime cost.
Re-tuning = edit STRENGTHS, re-run stage 05; cached 400px originals are never modified.

Running this file directly writes a contact sheet (untreated vs each strength over
four representative photos) to data/build/ for picking SELECTED.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / 'data/cache/commons/thumbs'

PROFILE_VERSION = 'sunfade-1'

# floors: per-channel black-point lift (matte fade, warmer shadows)
# tints: per-channel highlight tilt (blue pulled = warm)
STRENGTHS = {
    'subtle': {'floors': (14, 12, 11), 'tints': (1.000, 0.995, 0.985),
               'sat': 0.93, 'contrast': 1.02},
    'medium': {'floors': (19, 17, 15), 'tints': (1.010, 0.990, 0.970),
               'sat': 0.90, 'contrast': 1.03},
    'warm':   {'floors': (24, 20, 17), 'tints': (1.020, 0.985, 0.955),
               'sat': 0.86, 'contrast': 1.05},
}
SELECTED = 'subtle'  # picked 2026-10-03 from data/build/contact_sheet.jpg

# Goulash (dark stew), Vichyssoise (pale cream), Bouneschlupp (green herbal),
# Borscht (red broth) — the four looks the treatment must survive.
REPRESENTATIVE = ['235662', '2441042', '25124819', '216990']


def _channel_lut(floor: float, tint: float) -> list[int]:
    return [min(255, max(0, round(floor + tint * i))) for i in range(256)]


def apply(img: Image.Image, strength: str = SELECTED) -> Image.Image:
    """One 768-entry LUT (three 256-blocks for R/G/B) then saturation/contrast."""
    s = STRENGTHS[strength]
    r, t = s['floors'], s['tints']
    img = img.point(
        _channel_lut(r[0], t[0]) + _channel_lut(r[1], t[1]) + _channel_lut(r[2], t[2])
    )
    img = ImageEnhance.Color(img).enhance(s['sat'])
    if s['contrast'] != 1.0:
        img = ImageEnhance.Contrast(img).enhance(s['contrast'])
    return img


def contact_sheet(out: Path, cell: int = 200, label_w: int = 110) -> None:
    rows = [('original', None)] + [(name, name) for name in STRENGTHS]
    missing = [i for i in REPRESENTATIVE if not (CACHE / f'{i}_400.jpg').exists()]
    if missing:
        sys.exit(f'missing cached thumbs for: {missing}')

    font = ImageFont.load_default(16)
    sheet = Image.new('RGB', (label_w + cell * len(REPRESENTATIVE),
                              8 + (cell + 8) * len(rows)), 'white')
    draw = ImageDraw.Draw(sheet)
    for row, (name, strength) in enumerate(rows):
        y = 8 + row * (cell + 8)
        draw.text((8, y + cell // 2 - 8), name, fill='black', font=font)
        for col, soup_id in enumerate(REPRESENTATIVE):
            with Image.open(CACHE / f'{soup_id}_400.jpg') as raw:
                img = ImageOps.fit(raw, (cell, cell), Image.LANCZOS)  # tidy-grid crop
                if strength:
                    img = apply(img, strength)
                sheet.paste(img, (label_w + col * cell, y))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, 'JPEG', quality=90)
    print(f'contact sheet: {out}')


if __name__ == '__main__':
    contact_sheet(ROOT / 'data/build/contact_sheet.jpg')
