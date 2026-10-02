import { validateDataset } from '@soup-quiz/schema'
import { describe, expect, it } from 'vitest'
import { soupsV0 } from '../src'

/** Deep copy via JSON — the dataset is JSON-native, so this is exact. */
const copy = () => JSON.parse(JSON.stringify(soupsV0)) as typeof soupsV0

describe('stub dataset v0', () => {
  it('passes schema validation', () => {
    const result = validateDataset(soupsV0)
    expect(result.issues).toEqual([])
    expect(result.ok).toBe(true)
  })

  it('rejects a corrupted copy with duplicate identifiers', () => {
    const corrupted = copy()
    corrupted[1].id = corrupted[0].id
    const result = validateDataset(corrupted)
    expect(result.ok).toBe(false)
    expect(result.issues[0].field).toBe('id')
  })

  it('rejects a corrupted copy with an empty country list', () => {
    const corrupted = copy()
    corrupted[2].countries = []
    const result = validateDataset(corrupted)
    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.field.includes('countries'))).toBe(true)
  })

  it('rejects a corrupted copy with an unknown country code', () => {
    const corrupted = copy()
    corrupted[3].countries = ['Columbia']
    expect(validateDataset(corrupted).ok).toBe(false)
  })
})

describe('stub dataset v0 is adversarial by design (D7)', () => {
  it('contains a multi-country item', () => {
    expect(soupsV0.some((item) => item.countries.length > 1)).toBe(true)
  })

  it('contains region-not-country origins', () => {
    expect(soupsV0.filter((item) => item.region !== undefined).length).toBeGreaterThanOrEqual(2)
  })

  it('contains multi-type items', () => {
    expect(soupsV0.some((item) => item.types.length > 1)).toBe(true)
  })

  it('has enough distinct countries for five-option questions', () => {
    const distinct = new Set(soupsV0.flatMap((item) => item.countries))
    expect(distinct.size).toBeGreaterThanOrEqual(8)
  })

  it('shares canonical ingredients under different display spellings', () => {
    const displays = new Set(
      soupsV0
        .flatMap((item) => item.ingredients)
        .filter((ingredient) => ingredient.id === 'potato')
        .map((ingredient) => ingredient.display),
    )
    expect(displays.size).toBeGreaterThanOrEqual(3) // potato, papas criollas, aloo

    const chicken = new Set(
      soupsV0
        .flatMap((item) => item.ingredients)
        .filter((ingredient) => ingredient.id === 'chicken')
        .map((ingredient) => ingredient.display),
    )
    expect(chicken.size).toBeGreaterThanOrEqual(2) // chicken, hen
  })

  it('exercises at least five soup types', () => {
    const distinct = new Set(soupsV0.flatMap((item) => item.types))
    expect(distinct.size).toBeGreaterThanOrEqual(5)
  })
})
