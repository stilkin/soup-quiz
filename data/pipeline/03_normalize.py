#!/usr/bin/env python3
"""Stage 3 — normalization: raw values -> contract-shaped values + review flags.

Nothing is invented: unmappable countries, unmapped types, and unknown ingredients
become flags that stage 4 emits into review.csv and the review pass answers.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from aliases import lookup_country
from ingredient_lexicon import canonical_ingredient
from type_map import LIST_DEFAULT_TYPE, TYPE_MAP

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / 'data/build'

VOCAB = {
    'broth', 'potage', 'cream-soup', 'bisque', 'chowder', 'noodle-soup', 'stew',
    'cold-soup', 'fruit-soup', 'dessert-soup', 'fish-soup', 'bread-soup', 'bean-soup',
}

# Country-specific list membership -> country, applied only when raw values gave
# nothing (design D3 fallback; recorded as an info flag, not a review blocker).
LIST_COUNTRY = {
    'List_of_Azerbaijani_soups_and_stews': 'AZ',
    'List_of_Chinese_soups': 'CN',
    'List_of_French_soups_and_stews': 'FR',
    'List_of_German_soups': 'DE',
    'List_of_Indonesian_soups': 'ID',
    'List_of_Italian_soups': 'IT',
    'List_of_Japanese_soups_and_stews': 'JP',
    'List_of_Pakistani_soups_and_stews': 'PK',
    'List_of_Spanish_soups_and_stews': 'ES',
}

SPLIT_ORIGIN = re.compile(r'[,;/]|\sand\s|<br\s*/?>')


def split_origin(raw: str):
    return [p.strip() for p in SPLIT_ORIGIN.split(raw) if p.strip()]


def normalize_countries(item):
    codes, region, flags = [], None, []
    raw_values = list(dict.fromkeys(item['origin_raw']))
    for raw in raw_values:
        for token in split_origin(raw):
            result = lookup_country(token)
            codes += [c for c in result['codes'] if c not in codes]
            region = result['region'] or region
            if result['needs_review']:
                flags.append({'field': 'countries', 'raw': token, 'reason': result['note'],
                              'kind': 'review'})
    if not codes:
        inferred = {LIST_COUNTRY[s] for s in item['sources'] if s in LIST_COUNTRY}
        if len(inferred) == 1:
            codes.append(inferred.pop())
            flags.append({'field': 'countries', 'raw': item['sources'],
                          'reason': 'country inferred from a single country list',
                          'kind': 'info'})
        else:
            flags.append({'field': 'countries', 'raw': '; '.join(raw_values),
                          'reason': 'no country resolved', 'kind': 'review'})
    # explicit region field wins over region carried by a country alias
    if item['region_raw']:
        region = item['region_raw'][0] or region
    return codes, region, flags


def normalize_types(item):
    types, flags = [], []
    for raw in dict.fromkeys(item['type_raw']):
        mapped = TYPE_MAP.get(raw.strip())
        # values mapped to None are consistency/ingredient noise: not a type
        if mapped and mapped not in types:
            types.append(mapped)
    if not types:
        for source in item['sources']:
            default = LIST_DEFAULT_TYPE.get(source)
            if default and default not in types:
                types.append(default)
    if not types:
        flags.append({'field': 'types', 'raw': '; '.join(item['type_raw']),
                      'reason': 'no soup type resolved', 'kind': 'review'})
    return types, flags


def normalize_ingredients(item):
    resolved, unknown, flags = [], [], []
    for raw in item['ingredients_raw']:
        # main_ingredient values can be multi-word ("rice vermicelli") or lists
        for token in re.split(r'\sand\s|,|;|\+', raw):
            token = token.strip()
            if not token or len(token) > 40:
                continue
            cid = canonical_ingredient(token)
            if cid and cid not in [i['id'] for i in resolved]:
                resolved.append({'id': cid, 'display': token})
            elif cid is None and re.match(r'^[a-zA-Zà-žÀ-Ž\' -]+$', token):
                unknown.append(token)
    if unknown:
        flags.append({'field': 'ingredients', 'raw': ', '.join(unknown[:6]),
                      'reason': f'{len(unknown)} unknown ingredient candidates',
                      'kind': 'review'})
    if not resolved:
        flags.append({'field': 'ingredients', 'raw': '',
                      'reason': 'no known ingredients', 'kind': 'review'})
    return resolved, flags


def normalize_image(item):
    raw = item['image_raw']
    if not raw:
        return None
    filename = LINK_IN_FILE.search(raw)
    name = filename.group(1) if filename else raw.split('|')[0].strip()
    if not name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.tif', '.tiff')):
        return None  # e.g. {{multiple image}} templates — flagged by absence later
    if not name.startswith('File:'):
        name = f'File:{name}'
    return name

LINK_IN_FILE = re.compile(r'(?:File:|Image:)([^\]|]+)')


def main():
    data = json.loads((BUILD / 'raw_items.json').read_text())
    items = []
    for item in data['items']:
        codes, region, country_flags = normalize_countries(item)
        types, type_flags = normalize_types(item)
        ingredients, ingredient_flags = normalize_ingredients(item)
        image = normalize_image(item)

        flags = country_flags + type_flags + ingredient_flags
        description = item['lead_desc'] or item['list_desc']
        if not description:
            flags.append({'field': 'description', 'raw': '',
                          'reason': 'no description found', 'kind': 'review'})

        items.append({
            'pageid': item['pageid'],
            'title': item['title'],
            'name': item['name'],
            'sources': item['sources'],
            'countries': codes,
            'region': region,
            'types': types,
            'ingredients': ingredients,
            'image': image,
            'description': description,
            'flags': flags,
        })

    (BUILD / 'normalized_items.json').write_text(json.dumps(
        {'items': items, 'not_dish': data['not_dish']}, ensure_ascii=False, indent=1))
    flagged = sum(1 for i in items if i['flags'])
    print(f'normalized: {len(items)}  flagged (any): {flagged}')
    per_field = {}
    for i in items:
        for f in i['flags']:
            per_field[f['field']] = per_field.get(f['field'], 0) + 1
    print('flags by field:', per_field)
    return 0


if __name__ == '__main__':
    sys.exit(main())
