import type { SoupItem } from '../src/item'

/**
 * A valid item covering the "wide" shape: multi-country, multi-type, region.
 * Overrides are deliberately loose: schema tests need to construct *invalid* items
 * the real types would forbid.
 */
export function validItem(overrides: Record<string, unknown> = {}): SoupItem {
  return {
    id: '1234',
    name: 'Ajiaco',
    description: 'Hearty chicken and potato soup from the Bogotá savanna.',
    sourceUrl: 'https://en.wikipedia.org/?curid=1234',
    countries: ['CO', 'CU'],
    region: 'Bogotá savanna',
    types: ['stew', 'potage'],
    ingredients: [
      { id: 'chicken', display: 'chicken' },
      { id: 'potato', display: 'papas criollas' },
      { id: 'guascas', display: 'guascas herb' },
    ],
    ...overrides,
  } as SoupItem
}

export function validItemWithImage(): SoupItem {
  return validItem({
    image: {
      sourceFile: 'File:Ajiaco.jpg',
      credit: {
        author: 'Example Photographer',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      },
    },
  })
}
