#!/usr/bin/env python3
"""Stage 2 — extraction: cached lead sections + list entries -> build/raw_items.json.

Sources per field (fallback order design D3): detail-article infobox first, then the
source-list entry. Relevance heuristics flag non-dish articles (species, places).
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/raw/wikipedia"
CACHE = ROOT / "data/cache/articles"
BUILD = ROOT / "data/build"

LINK = re.compile(r"\[\[([^\]|]+)(?:\|[^\]]*)?\]\]")

NOT_DISH_MARKERS = (
    "{{Taxobox",
    "{{taxobox",
    "{{Automatic taxobox",
    "{{Speciesbox",
    "{{Species box",
    "{{Infobox settlement",
    "{{infobox settlement",
    "{{Infobox lake",
    "{{Infobox river",
    "{{Infobox mountain",
    "{{Infobox animal",
    "{{Infobox dog breed",
)


def strip_wikitext(text: str) -> str:
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    for _ in range(3):  # nested templates
        text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    # Links: file links go whole (their "thumb|…caption" pipe content is not prose),
    # other links reduce to their display text. Looped — captions may nest links.
    for _ in range(3):
        text = re.sub(r"\[\[(?:File|Image):[^\[\]]*\]\]", "", text, flags=re.I)
        text = re.sub(r"\[\[([^\[\]]+)\]\]", lambda m: m.group(1).rsplit("|", 1)[-1], text)
    text = re.sub(r"\[\[|\]\]", "", text)  # strays from unbalanced markup
    text = re.sub(r"<ref[^>]*/>", "", text)
    text = re.sub(r"<ref.*?</ref>", "", text, flags=re.S)
    text = re.sub(r"''+", "", text)
    text = re.sub(r"<br\s*/?>", ", ", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\(\s*[,;.\s]+", "(", text)  # leading junk inside parens
    text = re.sub(r"\(\s*(?:from|literally|lit)\s*\)", "", text)  # function-word husks
    text = re.sub(r"\(\s*[;,.\s]*\)", "", text)  # husks around removed IPA/lang templates
    return re.sub(r"\s+", " ", text).strip()


def template_span(text: str, start: int) -> int:
    """End index of the template opening at `start` ('{{'), brace-depth matched."""
    depth = 0
    i = start
    while i < len(text) - 1:
        if text[i : i + 2] == "{{":
            depth += 1
            i += 2
            continue
        if text[i : i + 2] == "}}":
            depth -= 1
            i += 2
            if depth == 0:
                return i
            continue
        i += 1
    return min(start + 3500, len(text))


def split_params(box: str) -> list[str]:
    """Top-level template parameters: split on '|' outside {{…}} and [[…]] nesting.

    `box` starts with the template's own '{{', which is skipped: parameters live one
    level inside it.
    """
    params, depth, start = [], 0, 0
    i = 2
    while i < len(box):
        two = box[i : i + 2]
        if two in ("{{", "[["):
            depth += 1
            i += 2
            continue
        if two in ("}}", "]]"):
            depth -= 1
            i += 2
            continue
        if box[i] == "|" and depth == 0:
            params.append(box[start:i])
            start = i + 1
        i += 1
    params.append(box[start:])
    return params


def parse_infobox(lead: str):
    # same template family, two invocation names ({{Infobox prepared food}} redirects there)
    m = re.search(r"\{\{[Ii]nfobox (?:[Pp]repared )?[Ff]ood", lead)
    if not m:
        return None
    box = lead[m.start() : template_span(lead, m.start())]
    fields = {}
    # parameters come both as one-per-line and single-line pipe runs — split at depth 0
    for chunk in split_params(box):
        fm = re.match(r"\s*([A-Za-z0-9_ ]+?)\s*=\s*(.*)", chunk, re.S)
        if fm:
            fields[fm.group(1).strip()] = fm.group(2).strip()
    return fields


def split_list_value(value: str):
    if not value:
        return []
    # list-wrapper templates become separators; other templates are noise and vanish
    value = re.sub(r"\{\{(?:ubl|unbulleted list|plainlist|hlist)\s*\|", ";", value, flags=re.I)
    for _ in range(3):
        value = re.sub(r"\{\{[^{}]*\}\}", "", value)
    value = re.sub(r"<!--.*?-->", "", value, flags=re.S)
    value = re.sub(r"<br\s*/?>", ";", value)
    out = []
    for part in re.split(r"[;,]", value):
        # multiple wiki-links in one part: each link display is its own candidate
        links = re.findall(r"\[\[(?:[^\]|]+\|)?([^\]]+)\]\]", part)
        if len(links) > 1:
            out += [re.sub(r"\s+", " ", link).strip() for link in links if link.strip()]
        else:
            text = strip_wikitext(part)
            if text:
                out.append(text)
    return [o for o in out if o]


def list_entries():
    """title -> {'origin': [raw], 'type': [raw], 'desc': str} from the snapshots."""
    entries = {}

    main = (RAW / "list-of-soups.wikitext").read_text(encoding="utf-8")
    table = re.search(r"==Soups==(.*?)==See also==", main, re.S).group(1)
    for chunk in re.split(r"\|-", table)[1:]:
        lines = chunk.split("\n")
        cells = []
        for line in lines:
            if line.startswith("|"):
                cells.append(line[1:].strip())
            elif cells:
                cells[-1] += " " + line.strip()
        if len(cells) < 5:
            continue
        m = LINK.search(cells[0])
        if not m:
            continue
        title = m.group(1).strip()
        e = entries.setdefault(title, {"origin": [], "type": [], "desc": ""})
        e["origin"] += [strip_wikitext(c) for c in split_list_value(cells[2])]
        e["type"] += [strip_wikitext(cells[3])]
        e["desc"] = strip_wikitext(" ".join(cells[4:]))[:600]

    for path in sorted(RAW.glob("List_of_*.wikitext")):
        if path.name == "List_of_porridges.wikitext":
            continue
        for line in path.read_text(encoding="utf-8").split("\n"):
            if not (re.match(r"^\*+\s", line) or line.startswith("|[[")):
                continue
            m = LINK.search(line)
            if not m:
                continue
            title = m.group(1).strip()
            text = strip_wikitext(line)
            text = re.sub(r"^\*+\s*", "", text)
            e = entries.setdefault(title, {"origin": [], "type": [], "desc": ""})
            if not e["desc"]:
                e["desc"] = text[:600]
    return entries


FILE_LINK = re.compile(r"\[\[(?:File|Image):([^\]|]+)", re.I)


def lead_photo(lead: str) -> str:
    """First bare file link in the lead — image fallback for infobox-less articles."""
    m = FILE_LINK.search(lead)
    return m.group(1).strip() if m else ""


def lead_sentence(lead: str, after: int) -> str:
    tail = lead[after:].lstrip()
    tail = re.sub(r"''+", "", tail)
    tail = re.sub(r"<ref[^>]*/>", "", tail)
    tail = re.sub(r"<ref.*?</ref>", "", tail, flags=re.S)
    tail = strip_wikitext(tail)
    if len(tail) > 320:
        cut = tail[:320].rfind(".")
        tail = tail[: cut + 1] if cut > 120 else tail[:320] + "…"
    return tail


def clean_name(title: str) -> str:
    return re.sub(
        r"\s*\((soup|food|dish|stew|noodle soup|beverage)\)", "", title, flags=re.I
    ).strip()


def main():
    corpus = json.loads((BUILD / "corpus.json").read_text())["corpus"]
    entries = list_entries()

    items, not_dish = [], []
    for info in corpus:
        cached = CACHE / f"{info['pageid']}.json"
        lead = json.loads(cached.read_text())["lead"] or "" if cached.exists() else ""
        relevance = "not_dish" if any(m in lead for m in NOT_DISH_MARKERS) else "ok"

        fields = parse_infobox(lead) or {}
        ib_end = template_span(lead, lead.find("{{")) if lead.startswith("{{") else 0
        entry = entries.get(info.get("original", "")) or entries.get(info["title"]) or {}

        if relevance != "ok":
            not_dish.append({"title": info["title"], "pageid": info["pageid"]})
            continue

        items.append(
            {
                "pageid": info["pageid"],
                "title": info["title"],
                "name": clean_name(info["title"]),
                "sources": info["sources"],
                "origin_raw": split_list_value(fields.get("country", "")) + entry.get("origin", []),
                "region_raw": split_list_value(fields.get("region", "")),
                "type_raw": split_list_value(fields.get("type", "")) + entry.get("type", []),
                "ingredients_raw": split_list_value(fields.get("main_ingredient", "")),
                "image_raw": fields.get("image", "").strip(),
                "lead_image_raw": lead_photo(lead),
                "lead_desc": lead_sentence(lead, ib_end),
                "list_desc": entry.get("desc", ""),
            }
        )

    (BUILD / "raw_items.json").write_text(
        json.dumps({"items": items, "not_dish": not_dish}, ensure_ascii=False, indent=1)
    )
    with_infobox = sum(
        1 for i in items if i["ingredients_raw"] or i["origin_raw"] and i["image_raw"]
    )
    print(f"items: {len(items)}  not-dish filtered: {len(not_dish)}")
    print(f"with infobox data: {with_infobox}")
    for n in not_dish[:8]:
        print("  not a dish:", n["title"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
