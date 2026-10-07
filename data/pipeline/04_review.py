#!/usr/bin/env python3
"""Stage 4 — review + report: flags become review.csv rows; the run report lands in
build/report.json. Review-kind flags block compilation until overrides resolve them;
info-kind flags are visible provenance."""

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / "data/build"


def main():
    data = json.loads((BUILD / "normalized_items.json").read_text())
    items, not_dish = data["items"], data["not_dish"]

    rows = []
    for item in items:
        for flag in item["flags"]:
            rows.append(
                {
                    "id": item["pageid"],
                    "name": item["name"],
                    "field": flag["field"],
                    "raw": flag["raw"],
                    "reason": flag["reason"],
                    "kind": flag["kind"],
                }
            )

    with open(BUILD / "review.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "name", "field", "raw", "reason", "kind"])
        writer.writeheader()
        writer.writerows(rows)

    review_by_field: dict[str, int] = {}
    info_flags = 0
    for row in rows:
        if row["kind"] == "review":
            review_by_field[row["field"]] = review_by_field.get(row["field"], 0) + 1
        else:
            info_flags += 1

    def coverage(predicate):
        n = sum(1 for i in items if predicate(i))
        return {"count": n, "percent": round(n * 100 / len(items)) if items else 0}

    report = {
        "corpus": len(items) + len(not_dish),
        "not_dish_filtered": len(not_dish),
        "items": len(items),
        "review_flags_by_field": review_by_field,
        "info_flags": info_flags,
        "items_with_review_flags": sum(
            1 for i in items if any(f["kind"] == "review" for f in i["flags"])
        ),
        "coverage": {
            "countries": coverage(lambda i: len(i["countries"]) > 0),
            "types": coverage(lambda i: len(i["types"]) > 0),
            "ingredients_1plus": coverage(lambda i: len(i["ingredients"]) >= 1),
            "ingredients_3plus": coverage(lambda i: len(i["ingredients"]) >= 3),
            "image": coverage(lambda i: i["image"] is not None),
            "description": coverage(lambda i: bool(i["description"])),
        },
    }
    (BUILD / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
