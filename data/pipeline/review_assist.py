#!/usr/bin/env python3
"""Review assistant — mines the cached prose for honest proposals (design D3).

Proposes only what the committed tables support: type keywords, ingredient-lexicon
substring matches, and 'from/in X' country mentions. Writes
build/proposed_overrides.csv plus build/leftovers.json for the manual pass.
"""

import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from aliases import ADJECTIVE_TO_ISO, lookup_country
from ingredient_lexicon import CANONICAL_FAMILIES

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / "data/build"
CACHE = ROOT / "data/cache/articles"

TYPE_KEYWORDS = [
    (r"\bchowder", "chowder"),
    (r"\bbisque", "bisque"),
    (r"\bgazpacho|chilled|served cold|cold soup", "cold-soup"),
    (
        r"\bramen\b|\bpho\b|\budon\b|\bsoba\b|noodle|vermicelli|glass noodle|mee\b|laksa",
        "noodle-soup",
    ),
    (r"\bstew|goulash|gumbo|pottage\b|hearty", "stew"),
    (r"\bvichyssoise|cream(?:y| soup)|bisque", "cream-soup"),
    (r"\bbroth|consomm", "broth"),
    (r"\bbread|ribollita|panzanella", "bread-soup"),
    (r"\bfruit soup|fruit and", "fruit-soup"),
    (r"\bdessert soup|sweet soup", "dessert-soup"),
    (r"\bfish|seafood|shark fin|mussel|clam|oyster|prawn|shrimp|crab|squid", "fish-soup"),
    (r"\bbean|lentil|split pea|legume|mung", "bean-soup"),
    (r"\bpotage|pur[eé]e|blended|smooth soup", "potage"),
]

COUNTRY_HINT = re.compile(
    r"(?:national dish of|originated in|originating in|from|popular in|common in|"
    r"cuisine of|dish of|traditional in)\s+((?:[A-ZÀ-Ž][a-zà-ž]+\s?){1,3})"
)

# skip country-hint captures that are cuisine terms, not places
COUNTRY_SKIP = re.compile(r"cuisine|dish|soup|kitchen|people|style|region", re.I)

INGREDIENT_PATTERNS = [
    (re.compile(rf"\b{re.escape(display)}s?\b", re.I), canonical)
    for canonical, displays in CANONICAL_FAMILIES.items()
    for display in sorted(displays, key=len, reverse=True)
]


def mine_types(text):
    for pattern, soup_type in TYPE_KEYWORDS:
        if re.search(pattern, text, re.I):
            return [soup_type]
    return []


def mine_countries(text):
    codes, region = [], None
    for match in COUNTRY_HINT.finditer(text):
        candidate = match.group(1).strip()
        if COUNTRY_SKIP.search(candidate):
            continue
        result = lookup_country(candidate)
        if result["codes"]:
            codes += [c for c in result["codes"] if c not in codes]
        elif result["region"] and not region:
            region = result["region"]
    if not codes:
        # cuisine adjectives: "in Peruvian cuisine", "a Swedish fruit soup"
        for adjective, code in ADJECTIVE_TO_ISO.items():
            if re.search(rf"\b{re.escape(adjective)}\b", text) and code not in codes:
                codes.append(code)
                break
    return codes, region


def mine_ingredients(text):
    found = {}
    for pattern, canonical in INGREDIENT_PATTERNS:
        match = pattern.search(text)
        if match:
            found.setdefault(canonical, match.group(0).lower())
    return [{"id": cid, "display": display} for cid, display in found.items()]


def main():
    items = json.loads((BUILD / "normalized_items.json").read_text())["items"]
    proposals, leftovers = [], []

    for item in items:
        soup_id = str(item["pageid"])
        text = item["description"]
        cached = CACHE / f"{item['pageid']}.json"
        if cached.exists():
            lead = json.loads(cached.read_text())["lead"] or ""
            # lead minus infobox gives the prose to mine
            text = f"{item['description']} {re.sub(r'\\{\\{.*?\\}\\}', '', lead, flags=re.S)}"

        row = {"id": soup_id, "name": item["name"]}
        gained = []

        if not item["countries"]:
            codes, region = mine_countries(text)
            if codes:
                row["countries"] = ",".join(codes)
                gained.append("countries")
        if not item["types"]:
            types = mine_types(text)
            if not types:
                types = ["soup"]  # generic fallback — item is a soup, kind unspecified
            row["types"] = ",".join(types)
            gained.append("types")
        if len(item["ingredients"]) < 2:
            mined = mine_ingredients(text)
            merged = {i["id"]: i["display"] for i in item["ingredients"]}
            for m in mined:
                merged.setdefault(m["id"], m["display"])
            if len(merged) >= 2 and len(merged) > len(item["ingredients"]):
                row["ingredients"] = ";".join(f"{cid}:{disp}" for cid, disp in merged.items())
                gained.append("ingredients")

        if gained:
            proposals.append(row)
        resolved = set(gained)
        needs = [
            f
            for f, v in (
                ("countries", item["countries"]),
                ("types", item["types"]),
                ("ingredients", item["ingredients"]),
            )
            if not v and f not in resolved
        ]
        if needs:
            leftovers.append({"id": soup_id, "name": item["name"], "missing": needs})

    fields = ["id", "name", "countries", "region", "types", "ingredients", "description", "include"]
    with open(BUILD / "proposed_overrides.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(proposals)
    (BUILD / "leftovers.json").write_text(json.dumps(leftovers, ensure_ascii=False, indent=1))

    per_field = {}
    for p in proposals:
        for k in ("countries", "types", "ingredients"):
            per_field[k] = per_field.get(k, 0) + (1 if k in p else 0)
    still = {}
    for item in leftovers:
        for m in item["missing"]:
            still[m] = still.get(m, 0) + 1
    print(f"proposals for {len(proposals)} items: {per_field}")
    print(f"still missing after mining: {still} (items: {len(leftovers)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
