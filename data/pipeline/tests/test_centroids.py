"""Pins for 07_centroids' ISO fallback chain (Natural Earth's '-99' quirk)."""

from conftest import load_stage

centroids = load_stage("07_centroids")


def test_first_well_formed_field_wins():
    props = {"ISO_A2_EH": "FR", "ADM0_A2": "-99", "SOV_A2": "FR"}
    assert centroids.pick_iso(props) == "FR"


def test_dash_nine_falls_through_to_adm0():
    # NE marks some countries '-99' in ISO_A2_EH (notably FR/NO in older versions)
    props = {"ISO_A2_EH": "-99", "ADM0_A2": "NO", "SOV_A2": "NO"}
    assert centroids.pick_iso(props) == "NO"


def test_sovereign_fallback_is_last_resort():
    props = {"ISO_A2_EH": "-99", "ADM0_A2": "-99", "SOV_A2": "US"}
    assert centroids.pick_iso(props) == "US"


def test_missing_or_malformed_everywhere_yields_none():
    assert centroids.pick_iso({}) is None
    assert centroids.pick_iso({"ISO_A2_EH": "-99", "ADM0_A2": "-99", "SOV_A2": "-99"}) is None
    assert centroids.pick_iso({"ISO_A2_EH": "FRA", "ADM0_A2": ""}) is None


def test_registry_keys_match_the_current_registries_file():
    keys = centroids.registry_keys()
    assert len(keys) == 249
    assert "FR" in keys and "NO" in keys and "JP" in keys
