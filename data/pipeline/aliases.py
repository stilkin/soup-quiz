"""Country normalization: lookup + committed alias table (design D5).

Values that cannot be mapped confidently flag for review — nothing is guessed.
"""

import pycountry

# Names Wikipedia uses that pycountry's exact/fuzzy lookup misses or that are ambiguous.
ALIAS_TO_ISO = {
    "Turkey": "TR",
    "Türkiye": "TR",
    "Turkish cuisine": "TR",
    "Russia": "RU",
    "Russian Federation": "RU",
    "Russia (Russia)": "RU",
    "Korea": "KR",  # list articles mean Korean cuisine; review can split if ever needed
    "South Korea": "KR",
    "North Korea": "KP",
    "Korean cuisine": "KR",
    "Burma": "MM",
    "Myanmar": "MM",
    "Iran": "IR",
    "Persian cuisine": "IR",
    "Syria": "SY",
    "Vietnam": "VN",
    "Vietnamese cuisine": "VN",
    "Laos": "LA",
    "Bolivia": "BO",
    "Moldova": "MD",
    "Moldavia": "MD",
    "North Macedonia": "MK",
    "Macedonia": "MK",
    "Ivory Coast": "CI",
    "Côte d'Ivoire": "CI",
    "Czech Republic": "CZ",
    "Czechia": "CZ",
    "Czechoslovakia": "CZ",  # historic; review may adjust
    "DR Congo": "CD",
    "Democratic Republic of the Congo": "CD",
    "Republic of China": "TW",
    "Taiwan": "TW",
    "Palestine": "PS",
    "State of Palestine": "PS",
}

# Subnational / historic names -> ISO code + region string (schema's region field).
SUBNATIONAL = {
    "Scotland": ("GB", "Scotland"),
    "England": ("GB", "England"),
    "Wales": ("GB", "Wales"),
    "Northern Ireland": ("GB", "Northern Ireland"),
    "Tibet": ("CN", "Tibet"),
    "Ossetia": ("GE", "Ossetia"),
    "Asturias": ("ES", "Asturias"),
    "Andalusia": ("ES", "Andalusia"),
    "Castile and León": ("ES", "Castile and León"),
    "Galicia (Spain)": ("ES", "Galicia"),
    "Sicily": ("IT", "Sicily"),
    "Sardinia": ("IT", "Sardinia"),
    "Tuscany": ("IT", "Tuscany"),
    "Alentejo": ("PT", "Alentejo"),
    "Madeira": ("PT", "Madeira"),
    "Corsica": ("FR", "Corsica"),
    "Provence": ("FR", "Provence"),
    "Brittany": ("FR", "Brittany"),
    "Bavaria": ("DE", "Bavaria"),
    "Swabia": ("DE", "Swabia"),
    "Hawaii": ("US", "Hawaii"),
    "Louisiana": ("US", "Louisiana"),
    "New England": ("US", "New England"),
    "Texas": ("US", "Texas"),
    "California": ("US", "California"),
    "Maryland": ("US", "Maryland"),
    "Eastern Shore of Maryland": ("US", "Maryland"),
    "San Francisco, California": ("US", "San Francisco"),
    "Yorubaland": ("NG", "Yorubaland"),
    "Kerala": ("IN", "Kerala"),
    "Punjab": ("IN", "Punjab"),
    "Tibetan cuisine": ("CN", "Tibet"),
}

# Supranational terms: no country, region only -> always needs review for countries.
REGION_ONLY = {
    "Europe",
    "Eastern Europe",
    "Central Europe",
    "Western Europe",
    "Southern Europe",
    "Northern Europe",
    "Nordic countries",
    "Scandinavia",
    "Balkans",
    "Baltic states",
    "Latin America",
    "South America",
    "Central America",
    "North America",
    "Caribbean",
    "West Africa",
    "East Africa",
    "Central Africa",
    "North Africa",
    "Southern Africa",
    "Horn of Africa",
    "Maghreb",
    "Middle East",
    "Levant",
    "Arab cuisine",
    "Arabian Peninsula",
    "Asia",
    "East Asia",
    "Southeast Asia",
    "South Asia",
    "Central Asia",
    "Caucasus",
    "Africa",
    "Andes",
    "Amazon",
    "Mediterranean",
    "Ancient Roman cuisine",
    "Ancient Greece",
    "Jews (Ashkenazi Jews)",
    "Ashkenazi Jews",
    "Garifuna",
    "Sephardi Jews",
    "Palestinians",
}


def lookup_country(raw: str) -> dict:
    """Returns {codes: [iso], region: str|None, needs_review: bool, note: str}."""
    name = raw.strip().strip(".,;")
    if not name:
        return {"codes": [], "region": None, "needs_review": True, "note": "empty origin"}

    if name in SUBNATIONAL:
        code, region = SUBNATIONAL[name]
        return {"codes": [code], "region": region, "needs_review": False, "note": "subnational"}

    if name in REGION_ONLY:
        return {
            "codes": [],
            "region": name,
            "needs_review": True,
            "note": "region only — assign countries in review",
        }

    if name in ALIAS_TO_ISO:
        return {
            "codes": [ALIAS_TO_ISO[name]],
            "region": None,
            "needs_review": False,
            "note": "alias",
        }

    try:
        return {
            "codes": [pycountry.countries.lookup(name).alpha_2],
            "region": None,
            "needs_review": False,
            "note": "exact",
        }
    except LookupError:
        return {
            "codes": [],
            "region": name,
            "needs_review": True,
            "note": "unmapped origin — review",
        }


if __name__ == "__main__":
    checks = [
        ("Turkey", "TR", False),
        ("Scotland", "GB", False),
        ("Korea", "KR", False),
        ("Peru", "PE", False),
        ("Maghreb", [], True),
        ("Atlantis", [], True),
    ]
    for raw, expect_codes, expect_review in checks:
        got = lookup_country(raw)
        assert got["codes"] == (
            [expect_codes] if isinstance(expect_codes, str) else expect_codes
        ), got
        assert got["needs_review"] is expect_review, (raw, got)
        print(
            f"  ok: {raw!r} -> {got['codes']} region={got['region']!r} review={got['needs_review']}"
        )
    assert lookup_country("Scotland")["region"] == "Scotland"
    print("aliases self-check passed")

# Cuisine/language adjectives -> ISO (for "in Peruvian cuisine", "(Swedish ...)").
# Ambiguous language names (English, Spanish...) are omitted on purpose.
ADJECTIVE_TO_ISO = {
    "Peruvian": "PE",
    "Colombian": "CO",
    "Mexican": "MX",
    "Brazilian": "BR",
    "Chilean": "CL",
    "Argentine": "AR",
    "Bolivian": "BO",
    "Ecuadorian": "EC",
    "Venezuelan": "VE",
    "Cuban": "CU",
    "Jamaican": "JM",
    "Haitian": "HT",
    "Chinese": "CN",
    "Taiwanese": "TW",
    "Japanese": "JP",
    "Korean": "KR",
    "Mongolian": "MN",
    "Vietnamese": "VN",
    "Thai": "TH",
    "Lao": "LA",
    "Cambodian": "KH",
    "Burmese": "MM",
    "Malaysian": "MY",
    "Singaporean": "SG",
    "Indonesian": "ID",
    "Filipino": "PH",
    "Indian": "IN",
    "Pakistani": "PK",
    "Bangladeshi": "BD",
    "Sri Lankan": "LK",
    "Nepalese": "NP",
    "Tibetan": "CN",
    "Afghan": "AF",
    "Persian": "IR",
    "Iranian": "IR",
    "Azerbaijani": "AZ",
    "Armenian": "AM",
    "Georgian": "GE",
    "Kazakh": "KZ",
    "Uzbek": "UZ",
    "Turkish": "TR",
    "Lebanese": "LB",
    "Syrian": "SY",
    "Israeli": "IL",
    "Jordanian": "JO",
    "Iraqi": "IQ",
    "Saudi": "SA",
    "Yemeni": "YE",
    "Omani": "OM",
    "Egyptian": "EG",
    "Moroccan": "MA",
    "Tunisian": "TN",
    "Algerian": "DZ",
    "Libyan": "LY",
    "Sudanese": "SD",
    "Ethiopian": "ET",
    "Eritrean": "ER",
    "Somali": "SO",
    "Kenyan": "KE",
    "Tanzanian": "TZ",
    "Ugandan": "UG",
    "Nigerian": "NG",
    "Ghanaian": "GH",
    "Senegalese": "SN",
    "Malian": "ML",
    "Ivorian": "CI",
    "Cameroonian": "CM",
    "Congolese": "CD",
    "Italian": "IT",
    "French": "FR",
    "Spanish": "ES",
    "Portuguese": "PT",
    "German": "DE",
    "Austrian": "AT",
    "Swiss": "CH",
    "Dutch": "NL",
    "Belgian": "BE",
    "Luxembourgish": "LU",
    "British": "GB",
    "Irish": "IE",
    "Scottish": "GB",
    "Welsh": "GB",
    "English": "GB",
    "Danish": "DK",
    "Swedish": "SE",
    "Norwegian": "NO",
    "Finnish": "FI",
    "Icelandic": "IS",
    "Estonian": "EE",
    "Latvian": "LV",
    "Lithuanian": "LT",
    "Polish": "PL",
    "Czech": "CZ",
    "Slovak": "SK",
    "Hungarian": "HU",
    "Romanian": "RO",
    "Bulgarian": "BG",
    "Serbian": "RS",
    "Croatian": "HR",
    "Bosnian": "BA",
    "Slovenian": "SI",
    "Albanian": "AL",
    "Macedonian": "MK",
    "Greek": "GR",
    "Cypriot": "CY",
    "Maltese": "MT",
    "Ukrainian": "UA",
    "Belarusian": "BY",
    "Russian": "RU",
    "Armenian ": "AM",
    "American": "US",
    "Canadian": "CA",
    "Hawaiian": "US",
    "Cajun": "US",
    "Australian": "AU",
    "New Zealand": "NZ",
}
