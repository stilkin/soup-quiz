import type { SoupItem } from '@soup-quiz/schema'

/** Minimal valid item factory — tests only need the fields the engine reads. */
function soup(id: string, countries: string[], name = id): SoupItem {
  return {
    id,
    name,
    description: `${name} test fixture.`,
    sourceUrl: `https://en.wikipedia.org/?curid=${id}`,
    countries,
    types: ['broth'],
    ingredients: [
      { id: `${id}-ing`, display: `${name} main ingredient` },
      { id: 'garlic', display: 'garlic' },
    ],
  } as SoupItem
}

/** Diverse dataset: every item buildable; CO+CU item covers multi-origin. */
export const mainDataset: SoupItem[] = [
  soup('1', ['IT'], 'Acquacotta'),
  soup('2', ['FR'], 'Bisque'),
  soup('3', ['ES'], 'Gazpacho'),
  soup('4', ['NG'], 'Abula'),
  soup('5', ['PE'], 'Aguadito'),
  soup('6', ['PT'], 'Açorda'),
  soup('7', ['UA'], 'Borscht'),
  soup('8', ['CO', 'CU'], 'Ajiaco'),
]

/**
 * Starvation fixture: 5 distinct countries total, so each single-country item sees
 * exactly the 4 distractors it needs, while the triple-origin item
 * (own = IT+FR+ES) sees only {PT, NG} — below the 4 needed — and must be skipped.
 */
export const starvedDataset: SoupItem[] = [
  soup('1', ['IT'], 'Acquacotta'),
  soup('2', ['FR'], 'Bisque'),
  soup('3', ['ES'], 'Gazpacho'),
  soup('4', ['PT'], 'Açorda'),
  soup('6', ['NG'], 'Pepper soup'),
  soup('5', ['IT', 'FR', 'ES'], 'Pan-European stew'),
]

/** Daily fixture factory: an image plus a chosen number of ingredients. */
function dailySoup(id: string, countries: string[], ingredientCount: number): SoupItem {
  return {
    ...soup(id, countries),
    image: {
      sourceFile: `File:${id}.jpg`,
      credit: { author: 'Fixture Author', license: 'CC BY-SA 4.0', licenseUrl: 'https://x' },
    },
    ingredients: Array.from({ length: ingredientCount }, (_, i) => ({
      id: `${id}-i${i}`,
      display: `${id} ingredient ${i}`,
    })),
  } as SoupItem
}

/** Five eligible items (d1–d5) plus two ineligible: no image (d6), one ingredient (d7). */
export const dailyDataset: SoupItem[] = [
  dailySoup('d1', ['IT'], 3),
  dailySoup('d2', ['FR'], 4),
  dailySoup('d3', ['ES'], 2),
  dailySoup('d4', ['NG'], 5),
  dailySoup('d5', ['PE'], 3),
  soup('d6', ['PT'], 'No photo'),
  dailySoup('d7', ['UA'], 1),
]
