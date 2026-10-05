"""Pins for 03_normalize's Commons title canonicalization (the underscore-cache bug)."""

from conftest import load_stage

normalize = load_stage("03_normalize")


def test_underscores_become_spaces():
    # the Commons API echoes normalized titles back, which broke cache lookups
    item = {"image_raw": "[[File:Borscht_(soup).jpg|thumb|200px]]"}
    assert normalize.normalize_image(item) == {
        "file": "File:Borscht (soup).jpg",
        "from_lead": False,
    }


def test_bare_infobox_value_gets_file_prefix():
    assert normalize.normalize_image({"image_raw": "Sinigang.jpg"}) == {
        "file": "File:Sinigang.jpg",
        "from_lead": False,
    }


def test_lead_image_fallback_is_flagged():
    item = {"image_raw": "", "lead_image_raw": "[[File:Tinola.jpg]]"}
    assert normalize.normalize_image(item) == {"file": "File:Tinola.jpg", "from_lead": True}


def test_non_image_templates_are_rejected():
    # callers always pass image_raw (02_extract output) — absent means empty, not {}
    assert normalize.normalize_image({"image_raw": "{{multiple image|1=A.jpg}}"}) is None
    assert normalize.normalize_image({"image_raw": ""}) is None
