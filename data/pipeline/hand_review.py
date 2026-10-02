#!/usr/bin/env python3
"""One-off: merge mining proposals + the hand-review table into overrides.csv.

Hand review (2026-10-02 session): knowledge-based fills for placeable real soups,
include=no for non-dish articles and unplaceable generic preparations.
New canonical ingredient ids introduced here are appended to the lexicon by hand.
"""

import csv
from pathlib import Path

HERE = Path(__file__).parent
BUILD = HERE.parent / 'build'

# id -> fields (hand review; wins over mining proposals)
HAND = {
    '16267026': {'ingredients': 'fish:fish;shrimp:shrimp;crab:crab'},  # Cantonese seafood soup
    '6250637': {'ingredients': 'pumpkin:squash;potato:potato;corn:corn;beef:beef;rice:rice'},  # Cazuela
    '23678942': {'ingredients': 'lentil:split yellow lentils;chili-pepper:chili;garlic:garlic;cumin:cumin'},  # Dalithoy
    '63133991': {'countries': 'GB', 'ingredients': 'almond:almonds;rice:rice;milk:milk'},  # Dillegrout
    '40382513': {'ingredients': 'loach:loach;burdock:burdock;scallion:scallion;egg:egg'},  # Dojo nabe
    '41736894': {'ingredients': 'pufferfish:fugu;napa-cabbage:napa cabbage;scallion:scallion'},  # Fugu chiri
    '43854111': {'ingredients': 'broad-bean:broad beans;pea:peas;asparagus:asparagus;artichoke:artichokes'},  # Garmugia
    '2238207': {'countries': 'AM,GE,AZ', 'region': 'Caucasus',
                'ingredients': 'offal:cow feet;tripe:tripe;garlic:garlic'},  # Khash
    '60631724': {'ingredients': 'broad-bean:broad beans;pasta:kusksu pasta;pea:peas;egg:egg'},  # Kusksu
    '30240271': {'countries': 'ES,US', 'ingredients': 'lobster:lobster;butter:butter;cream:cream'},  # Lobster stew
    '51118076': {'ingredients': 'millet:finger millet (ragi);rice:rice'},  # Mandia peja
    '7674269': {'ingredients': 'seaweed:wakame seaweed;beef:beef;garlic:garlic;sesame-oil:sesame oil'},  # Miyeok-guk
    '45416841': {'ingredients': 'okra:okra;beef:beef;fish:fish'},  # Okra soup
    '71120585': {'ingredients': 'papaya:pawpaw;fish:fish;chili-pepper:chili'},  # Pawpaw soup
    '19396733': {'ingredients': 'fish:fish;potato:potato;carrot:carrot;celery:celery;egg:egg;lime:lemon'},  # Psarosoupa
    '25241404': {'ingredients': 'beef:beef;keluak:keluak nuts;garlic:garlic;galangal:galangal;lemongrass:lemongrass'},  # Rawon
    '64579947': {'ingredients': 'spinach:amaranth (bayam);corn:corn;garlic:garlic'},  # Sayur bayam
    '41806877': {'ingredients': 'offal:tiger penis;ginger:ginger'},  # Tiger penis soup
    '4332959': {'countries': 'CN,US,GB', 'ingredients': 'turtle:turtle meat;egg:egg'},  # Turtle soup
    '51255058': {'countries': 'CN,GB', 'ingredients': 'watercress:watercress;pork:pork bones'},  # Watercress soup
    '4885967': {'ingredients': 'beef:beef;onion:onion;carrot:carrot'},  # Windsor soup
    '2441482': {'ingredients': 'mochi:mochi;chicken:chicken;scallion:scallion'},  # Zoni
    '53278267': {'ingredients': 'editan-leaf:editan leaves;offal:assorted meat;chili-pepper:pepper'},  # Editan
    '74194133': {'ingredients': 'ant-egg:weaver ant eggs;chili-pepper:chili;lime:lime'},  # Ant egg soup
    '46955205': {'ingredients': 'dried-fruit:dried fruits;apple:apples;raisin:raisins'},  # Fruktsoppa
}

# Non-dish articles and unplaceable generic preparations: excluded, reported.
EXCLUDE = {
    '19344654': 'BBC (broadcaster)', '2203702': 'Country Living (magazine)',
    '6535': 'Celery (plant)', '5741239': 'Chicken as food (meat article)',
    '43600': 'Crayfish (species)', '32605036': 'Chinese spoon (utensil)',
    '54176978': 'Coconut soup (generic, unplaceable)', '51112496': 'Cup noodle (product)',
    '47839149': "Edible bird's nest (ingredient)", '48768': 'Georgia (country)',
    '229275': 'Lamb and mutton (meat article)', '47863695': 'Lentil soup (generic)',
    '20457399': 'List of German dishes (list)', '17972814': 'List of sour soups (list)',
    '5013985': 'Lotus seed (ingredient)', '19714': 'Milk (ingredient)',
    '21208368': 'Pumpkin (vegetable)', '29440': 'Slavs (people)',
    '60550218': 'Snails as food (ingredient)', '82001882': 'Penis as food (ingredient)',
    '25980154': 'Apple soup (generic, unplaceable)', '53823862': 'Avocado soup (generic)',
    '46461': 'Chicken soup (generic, universal)', '46316': 'Chowder (generic)',
    '43779728': 'Cream of asparagus soup (generic)', '43777933': 'Cream of broccoli soup (generic)',
    '15959961': 'Cream of mushroom soup (generic)', '61322568': 'Cream soup (generic)',
    '46330': 'Herring soup (unplaceable)', '48195554': 'Melon soup (generic)',
    '28394550': 'Nettle soup (generic)', '360677': 'Purée Mongole (unknown origin)',
    '17966625': 'Spring soup (generic)', '46335': 'Stone Soup (folk tale)',
    '657129': 'Stock (technique)', '53699164': 'Vegetable soup (generic)',
    '29688929': 'Talbina (porridge)', '50580426': 'Tharida (region-only attribution)',
}

FIELDS = ['id', 'countries', 'region', 'types', 'ingredients', 'description', 'include']


def main():
    merged: dict[str, dict] = {}

    with open(BUILD / 'proposed_overrides.csv', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            merged[row['id']] = {k: v for k, v in row.items()
                                 if k not in ('id', 'name') and v}

    for soup_id, fields in HAND.items():
        merged.setdefault(soup_id, {}).update(fields)
    for soup_id in EXCLUDE:
        merged.setdefault(soup_id, {})['include'] = 'no'

    with open(HERE / 'overrides.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        for soup_id in sorted(merged):
            writer.writerow({'id': soup_id, **{k: merged[soup_id].get(k, '') for k in FIELDS[1:]}})

    print(f'overrides: {len(merged)} rows '
          f'(hand fills: {len(HAND)}, excluded: {len(EXCLUDE)}, mined: {len(merged) - len(HAND) - len(EXCLUDE)})')


if __name__ == '__main__':
    main()
