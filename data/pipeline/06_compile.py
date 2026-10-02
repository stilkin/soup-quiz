#!/usr/bin/env python3
"""Stage 6 — compile: overrides merge -> packages/data/src/soups.v1.json.

Overrides (data/pipeline/overrides.csv, wide format) always win. An item ships only
when every required field is filled after the merge; missing-field items are excluded
and reported. Image ships only with a complete manifest credit. Structural validation
fails loudly (the authoritative gate is @soup-quiz/schema's validateDataset in the
packages/data test suite).
"""

import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from type_map import LIST_DEFAULT_TYPE  # noqa: F401  (documents the vocab source)

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / 'data/build'
OVERRIDES = Path(__file__).parent / 'overrides.csv'
MANIFEST = ROOT / 'apps/soup-quiz/assets/soups/manifest.json'
OUT = ROOT / 'packages/data/src/soups.v1.json'

VOCAB = {
    'broth', 'potage', 'cream-soup', 'bisque', 'chowder', 'noodle-soup', 'stew',
    'cold-soup', 'fruit-soup', 'dessert-soup', 'fish-soup', 'bread-soup', 'bean-soup', 'soup',
}

ISO = set()  # filled lazily from pycountry below


def load_overrides():
    if not OVERRIDES.exists():
        return {}
    out = {}
    with open(OVERRIDES, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            out[str(row['id'])] = {
                k: v.strip() for k, v in row.items() if k != 'id' and v and v.strip()
            }
    return out


def parse_codes(value):
    return [c.strip().upper() for c in value.split(',') if c.strip()]


def parse_ingredients(value):
    """Format: canonical-id:Display;canonical-id:Display"""
    out = []
    for part in value.split(';'):
        if not part.strip():
            continue
        cid, _, display = part.partition(':')
        out.append({'id': cid.strip(), 'display': (display or cid).strip()})
    return out


def main():
    import pycountry
    ISO.update(c.alpha_2 for c in pycountry.countries)

    data = json.loads((BUILD / 'normalized_items.json').read_text())
    overrides = load_overrides()
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}

    shipped, excluded, errors = [], [], []
    for item in data['items']:
        soup_id = str(item['pageid'])
        o = overrides.get(soup_id, {})
        if o.get('include') == 'no':
            excluded.append({'id': soup_id, 'name': item['name'], 'missing': ['include=no']})
            continue

        countries = parse_codes(o['countries']) if 'countries' in o else item['countries']
        region = o.get('region') or item['region']
        types = [t.strip() for t in o['types'].split(',')] if 'types' in o else item['types']
        ingredients = (
            parse_ingredients(o['ingredients']) if 'ingredients' in o else item['ingredients']
        )
        description = o.get('description') or item['description']

        missing = [
            field
            for field, value in (
                ('countries', countries), ('types', types),
                ('ingredients', ingredients), ('description', description),
            )
            if not value
        ]
        if missing:
            excluded.append({'id': soup_id, 'name': item['name'], 'missing': missing})
            continue

        for code in countries:
            if code not in ISO:
                errors.append(f'{item["name"]}: invalid ISO code {code!r}')
        for t in types:
            if t not in VOCAB:
                errors.append(f'{item["name"]}: type {t!r} not in vocabulary')

        entry = manifest.get(soup_id)
        image = None
        if item['image'] and entry and entry.get('credit', {}).get('author') \
                and entry['credit'].get('license') and entry['credit'].get('licenseUrl'):
            image = {
                'sourceFile': item['image'],
                'credit': {
                    'author': entry['credit']['author'],
                    'license': entry['credit']['license'],
                    'licenseUrl': entry['credit']['licenseUrl'],
                },
            }

        shipped.append({
            'id': soup_id,
            'name': item['name'],
            'description': description,
            'sourceUrl': f"https://en.wikipedia.org/?curid={item['pageid']}",
            'countries': countries,
            **({'region': region} if region else {}),
            'types': types,
            'ingredients': [
                {'id': i['id'], 'display': i['display']} for i in ingredients
            ],
            **({'image': image} if image else {}),
        })

    ids = [s['id'] for s in shipped]
    if len(ids) != len(set(ids)):
        errors.append('duplicate ids in output')

    if errors:
        print('COMPILE FAILED:')
        for e in errors[:20]:
            print(' ', e)
        return 1

    shipped.sort(key=lambda s: s['name'].casefold())
    OUT.write_text(json.dumps(shipped, ensure_ascii=False, indent=1) + '\n')

    missing_counts = {}
    for e in excluded:
        for m in e['missing']:
            missing_counts[m] = missing_counts.get(m, 0) + 1
    with_images = sum(1 for s in shipped if s.get('image'))
    print(f'shipped: {len(shipped)}  excluded: {len(excluded)}  '
          f'(overrides applied: {len(overrides)})  images: {with_images}')
    print('excluded by missing field:', missing_counts)
    return 0


if __name__ == '__main__':
    sys.exit(main())
