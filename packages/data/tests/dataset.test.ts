import { validateDataset } from '@soup-quiz/schema'
import { describe, expect, it } from 'vitest'
import { soupsV1 } from '../src'

const copy = () => JSON.parse(JSON.stringify(soupsV1)) as typeof soupsV1

describe('dataset v1', () => {
  it('passes schema validation', () => {
    const result = validateDataset(soupsV1)
    expect(result.issues).toEqual([])
    expect(result.ok).toBe(true)
  })

  it('rejects corrupted copies', () => {
    const corrupted = copy()
    corrupted[0].countries = []
    expect(validateDataset(corrupted).ok).toBe(false)

    const dup = copy()
    dup[1].id = dup[0].id
    expect(validateDataset(dup).ok).toBe(false)
  })

  it('uses stable pageid identifiers', () => {
    for (const soup of soupsV1) {
      expect(soup.id).toMatch(/^\d+$/)
      expect(soup.sourceUrl).toBe(`https://en.wikipedia.org/?curid=${soup.id}`)
    }
  })

  it('keeps the contract shapes the app relies on', () => {
    expect(soupsV1.some((s) => s.countries.length > 1)).toBe(true) // multi-country
    expect(soupsV1.some((s) => s.region !== undefined)).toBe(true) // region-not-country
    expect(soupsV1.some((s) => s.types.length > 1)).toBe(true) // multi-type
    expect(soupsV1.every((s) => s.ingredients.length >= 1)).toBe(true)
  })

  it('stats compatibility: stub-dataset pageids survive (grows as review completes)', () => {
    const stubIds = [
      '58434256',
      '60897711',
      '3160140',
      '11555461',
      '43805440',
      '53673578',
      '216990',
      '12357',
      '2211090',
      '47770304',
    ]
    const survived = stubIds.filter((id) => soupsV1.some((s) => s.id === id))
    expect(survived.length).toBeGreaterThanOrEqual(3)
  })
})
