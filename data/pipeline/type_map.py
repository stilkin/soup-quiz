"""Raw Wikipedia type values -> schema vocabulary (design D5).

None means "not a soup type" (consistency value, ingredient-as-type, or noise):
those items fall back to list-derived defaults or review. Never invented.
"""

# Vocab additions this change makes to packages/schema SOUP_TYPES (non-breaking):
# 'fish-soup', 'bread-soup', 'bean-soup' — all observed as real kind values.

TYPE_MAP = {
    # kind values -> vocabulary
    "Fish": "fish-soup",
    "Seafood": "fish-soup",
    "Fish/seafood": "fish-soup",
    "Chunky/Seafood": "fish-soup",
    "Noodle": "noodle-soup",
    "Noodle soup": "noodle-soup",
    "Bean / Noodle": "noodle-soup",
    "Potage": "potage",
    "Cold (chilled)": "cold-soup",
    "Cold": "cold-soup",
    "Chowder": "chowder",
    "Chowders": "chowder",
    "Chunky<br/>chowder": "chowder",
    "Cream": "cream-soup",
    "Brothy": "broth",
    "Broth with chunks": "broth",
    "Brothy to stewlike": "stew",
    "Smooth or brothy": "broth",
    "Clear or Stock": "broth",
    "Clear or stock": "broth",
    "Clear": "broth",
    "Stock": "broth",
    "Bisque": "bisque",
    "Bisque (food)": "bisque",
    "Dessert": "dessert-soup",
    "Dessert soup": "dessert-soup",
    "Bread": "bread-soup",
    "Bread soup": "bread-soup",
    "Bean": "bean-soup",
    "Beans": "bean-soup",
    "Stew": "stew",
    # consistency / noise / ingredient-as-type -> not a type
    "Chunky": None,
    "Smooth": None,
    "Typically smooth": None,
    "Smooth or chunky": None,
    "Gelatinous": None,
    "Chunky, gelatinous": None,
    "Watery": None,
    "Varies": None,
    "Fermented": None,
    "Herbal": None,
    "Beverage soup": None,
    "Vegetable soup": None,
    "Chunky vegetable soup": None,
    "Hot, Vegetable": None,
    "Chunky (Medicine)": None,
    "Chunky (aphrodisiac)": None,
    "Chicken": None,
    "Beef": None,
    "Pork": None,
    "Eel": None,
    "Snake": None,
    "Cheese": None,
    "Chunky beef": None,
    "Chunky meat": None,
    "Meatballs soup": None,
    "Assorted meat/fish": None,
    "Broth- or cream-based": None,
    "Brothy<br/>Creamy": None,
    "": None,
}

# Cross-regional lists whose membership itself implies a type (applied only when
# the row's own value gives nothing).
LIST_DEFAULT_TYPE = {
    "List_of_cold_soups": "cold-soup",
    "List_of_cheese_soups": "cream-soup",
    "List_of_fish_and_seafood_soups": "fish-soup",
    "List_of_ramen_dishes": "noodle-soup",
}
