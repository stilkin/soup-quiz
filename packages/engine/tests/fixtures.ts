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
