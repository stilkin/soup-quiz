#!/usr/bin/env python3
"""Stage 5 — images: Commons credit metadata + thumbs -> bundled, credited assets.

Metadata is fetched via batched Commons API calls (rate-sensitive; cached per file).
Thumbs are downloaded from the CDN paced at 0.5 s, re-encoded with Pillow to the
target size, and bundled with a manifest. Incomplete credit => no image (spec).
"""

import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / 'data/build'
CACHE = ROOT / 'data/cache/commons'
ASSETS = ROOT / 'apps/soup-quiz/assets/soups'

UA = {
    'User-Agent': (
        'soup-quiz-dataset-pipeline/0.1 '
        '(https://github.com/stilkin/soup-quiz; dev contact via repo)'
    )
}
COMMONS_API = 'https://commons.wikimedia.org/w/api.php'

TARGET_WIDTH = 200      # user decision; 320 measured for the report
FETCH_WIDTH = 400       # retina headroom kept in cache for future re-encodes
JPEG_QUALITY = 90

# Canonical deed URLs for licenses Commons emits without one.
LICENSE_URL_FALLBACK = {
    'public domain': 'https://commons.wikimedia.org/wiki/Public_domain',
    'cc0': 'https://creativecommons.org/publicdomain/zero/1.0/',
}


def api_batched(titles, meta_cache):
    """Fetch imageinfo (url@400px + extmetadata) for uncached titles, 50 per call."""
    todo = [t for t in titles if t not in meta_cache]
    for i in range(0, len(todo), 50):
        batch = todo[i:i + 50]
        params = urllib.parse.urlencode({
            'action': 'query', 'format': 'json', 'prop': 'imageinfo',
            'iiprop': 'url|extmetadata', 'iiurlwidth': FETCH_WIDTH,
            'titles': '|'.join(batch),
        }).encode()
        for attempt in range(5):
            try:
                data = json.loads(urllib.request.urlopen(
                    urllib.request.Request(COMMONS_API, data=params, headers=UA),
                    timeout=90).read())
                break
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < 4:
                    time.sleep(int(e.headers.get('Retry-After', '15')))
                    continue
                raise
            except Exception:
                if attempt == 4:
                    raise
                time.sleep(5)
        for page in data['query']['pages'].values():
            if 'imageinfo' not in page:
                if 'missing' not in page:
                    continue
                meta_cache[page['title']] = {'missing': True}
                continue
            info = page['imageinfo'][0]
            ext = info.get('extmetadata', {})
            meta_cache[page['title']] = {
                'thumburl': info.get('thumburl'),
                'artist': strip_html(ext.get('Artist', {}).get('value', '')),
                'license': strip_html(ext.get('LicenseShortName', {}).get('value', '')),
                'licenseUrl': ext.get('LicenseUrl', {}).get('value', ''),
            }
        time.sleep(3)
    return meta_cache


def strip_html(value: str) -> str:
    text = re.sub(r'<[^>]+>', '', value or '')
    text = html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()


def complete_credit(meta):
    """Credit fields the app needs; license-url fallbacks for deed-less names."""
    if not meta or meta.get('missing') or not meta.get('thumburl'):
        return None
    author = meta.get('artist', '')
    license_name = meta.get('license', '')
    license_url = meta.get('licenseUrl', '') or LICENSE_URL_FALLBACK.get(
        license_name.lower(), '')
    if author and license_name and license_url:
        return {
            'author': author[:120],
            'license': license_name,
            'licenseUrl': license_url,
        }
    return None


def download(url: str, dest: Path):
    if dest.exists():
        return
    request = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(request, timeout=60) as response, open(dest, 'wb') as f:
        f.write(response.read())


def reencode(source: Path, dest: Path, width: int, quality: int):
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as img:
        img = img.convert('RGB')
        if img.width > width:
            height = round(img.height * width / img.width)
            img = img.resize((width, height), Image.LANCZOS)
        img.save(dest, 'JPEG', quality=quality, optimize=True)


def main():
    data = json.loads((BUILD / 'normalized_items.json').read_text())
    imaged = [i for i in data['items'] if i['image']]
    CACHE.mkdir(parents=True, exist_ok=True)

    meta_cache_path = CACHE / 'metadata.json'
    meta_cache = json.loads(meta_cache_path.read_text()) if meta_cache_path.exists() else {}
    meta_cache = api_batched([i['image'] for i in imaged], meta_cache)
    meta_cache_path.write_text(json.dumps(meta_cache, ensure_ascii=False, indent=1))

    manifest, incomplete, downloaded = {}, [], 0
    thumbs = CACHE / 'thumbs'
    thumbs.mkdir(parents=True, exist_ok=True)
    for item in imaged:
        soup_id = str(item['pageid'])
        meta = meta_cache.get(item['image'], {})
        credit = complete_credit(meta)
        if credit is None:
            incomplete.append({'id': soup_id, 'name': item['name'],
                               'file': item['image'],
                               'why': 'missing on Commons' if meta.get('missing')
                               else 'incomplete credit'})
            continue
        raw_thumb = thumbs / f'{soup_id}_400.jpg'
        try:
            download(meta['thumburl'], raw_thumb)
            downloaded += 1
        except Exception as e:  # noqa: BLE001 — a failed download flags, not crashes
            incomplete.append({'id': soup_id, 'name': item['name'], 'file': item['image'],
                               'why': f'download failed: {e}'})
            continue
        reencode(raw_thumb, ASSETS / f'{soup_id}.jpg', TARGET_WIDTH, JPEG_QUALITY)
        manifest[soup_id] = {'sourceFile': item['image'], 'credit': credit}
        time.sleep(0.5)

    ASSETS.mkdir(parents=True, exist_ok=True)
    (ASSETS / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1))

    # generated images.ts (imported by the app's reveal card)
    lines = '\n'.join(
        f"  '{soup_id}': require('../assets/soups/{soup_id}.jpg'),"
        for soup_id in sorted(manifest)
    )
    (ROOT / 'apps/soup-quiz/src/images.ts').write_text(
        '// GENERATED by data/pipeline/05_images.py — do not edit by hand.\n'
        '// Regenerate by re-running the images stage; pairing is enforced by tests.\n'
        "import type { ImageRequireSource } from 'react-native'\n\n"
        'export const soupImages: Record<string, ImageRequireSource> = {\n'
        f'{lines}\n'
        '}\n'
    )

    # size report: current target vs the 320px alternative
    total = sum(f.stat().st_size for f in ASSETS.glob('*.jpg'))
    sample = list(ASSETS.glob('*.jpg'))[:5]
    alt = 0
    for f in sample:
        with Image.open(CACHE / 'thumbs' / f.name.replace('.jpg', '_400.jpg')) as img:
            tmp = ASSETS / '_measure.jpg'
            reencode(CACHE / 'thumbs' / f.name.replace('.jpg', '_400.jpg'), tmp, 320, JPEG_QUALITY)
            alt += tmp.stat().st_size
            tmp.unlink()
    alt_estimate = round(alt / max(len(sample), 1) * len(list(ASSETS.glob('*.jpg'))))

    report = {
        'items_with_image_field': len(imaged),
        'bundled': len(manifest),
        'incomplete_credit': len(incomplete),
        'bytes_total': total,
        'mb_total': round(total / 1e6, 1),
        'mb_estimate_at_320px': round(alt_estimate / 1e6, 1),
    }
    (BUILD / 'images_report.json').write_text(
        json.dumps({'report': report, 'incomplete': incomplete[:80]},
                   ensure_ascii=False, indent=1))
    print(json.dumps(report, indent=2))
    if incomplete:
        print('incomplete sample:', [i['name'] for i in incomplete[:8]])
    return 0


if __name__ == '__main__':
    sys.exit(main())
