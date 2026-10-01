import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { soupItemSchema } from '../src/item'
import { soupItemJsonSchema } from '../src/json-schema'
import { validateDataset } from '../src/validate'
import { validItem, validItemWithImage } from './fixtures'

describe('validateDataset', () => {
  it('accepts a valid dataset', () => {
    const result = validateDataset([validItem(), validItem({ id: '5678', name: 'Açorda' })])
    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('rejects duplicate identifiers and names the duplicated identifier', () => {
    const result = validateDataset([validItem(), validItem()])
    expect(result.ok).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({ itemId: '1234', field: 'id' })
    expect(result.issues[0].message).toContain('duplicate')
  })

  it('reports the item identifier and the failing field for an invalid item', () => {
    const result = validateDataset([validItem({ countries: [] })])
    expect(result.ok).toBe(false)
    expect(result.issues[0].itemId).toBe('1234')
    expect(result.issues[0].field).toContain('countries')
  })

  it('falls back to a positional label when the item has no readable id', () => {
    const result = validateDataset([{ name: 'no id at all' }])
    expect(result.issues.some((issue) => issue.itemId === '<item 0>')).toBe(true)
  })
})

describe('JSON Schema contract (soupItemJsonSchema)', () => {
  const roundtrip = z.fromJSONSchema(soupItemJsonSchema)

  const valid: unknown[] = [validItem(), validItemWithImage()]
  const invalid: unknown[] = [
    validItem({ countries: [] }),
    validItem({ types: ['not-a-type'] }),
    validItem({ ingredients: [] }),
    validItem({ sourceUrl: 'not-a-url' }),
  ]

  it.each(valid.map((item, i) => [`valid fixture ${i}`, item]))(
    'accepts %s identically in zod and JSON Schema',
    (_name, item) => {
      expect(soupItemSchema.safeParse(item).success).toBe(true)
      expect(roundtrip.safeParse(item).success).toBe(true)
    },
  )

  it.each(invalid.map((item, i) => [`invalid fixture ${i}`, item]))(
    'rejects %s identically in zod and JSON Schema',
    (_name, item) => {
      expect(soupItemSchema.safeParse(item).success).toBe(false)
      expect(roundtrip.safeParse(item).success).toBe(false)
    },
  )

  it('is a self-contained JSON document', () => {
    expect(JSON.parse(JSON.stringify(soupItemJsonSchema))).toBeDefined()
  })
})
