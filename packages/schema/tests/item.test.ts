import { describe, expect, it } from 'vitest'
import { soupItemSchema } from '../src/item'
import { validItem, validItemWithImage } from './fixtures'

describe('soupItemSchema', () => {
  it('parses a valid multi-country, multi-type item with a region', () => {
    const item = validItem()
    const result = soupItemSchema.safeParse(item)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.countries).toEqual(['CO', 'CU'])
      expect(result.data.types).toEqual(['stew', 'potage'])
    }
  })

  it('parses an item with a credited image', () => {
    expect(soupItemSchema.safeParse(validItemWithImage()).success).toBe(true)
  })

  it('rejects an item with zero origins', () => {
    const result = soupItemSchema.safeParse(validItem({ countries: [] }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('countries')
    }
  })

  it('rejects a type outside the controlled vocabulary, pointing at the offending value', () => {
    const result = soupItemSchema.safeParse(validItem({ types: ['broth', 'not-a-type'] }))
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues[0]
      expect(issue.path).toEqual(['types', 1])
      expect(issue.message).toContain('not-a-type')
    }
  })

  it('rejects a non-ISO country code', () => {
    const result = soupItemSchema.safeParse(validItem({ countries: ['Columbia'] }))
    expect(result.success).toBe(false)
  })

  it('allows the same canonical ingredient id under different display spellings', () => {
    // canonicalization is what makes cross-item ingredient matching work; the schema
    // must accept identical ids with differing display strings
    const result = soupItemSchema.safeParse(
      validItem({
        ingredients: [
          { id: 'chicken', display: 'pulled chicken' },
          { id: 'potato', display: 'potatoes' },
        ],
      }),
    )
    expect(result.success).toBe(true)
  })

  it('rejects an empty ingredient list', () => {
    const result = soupItemSchema.safeParse(validItem({ ingredients: [] }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('ingredients')
    }
  })

  it('rejects duplicated canonical ingredient ids within one item', () => {
    const result = soupItemSchema.safeParse(
      validItem({
        ingredients: [
          { id: 'chicken', display: 'chicken' },
          { id: 'chicken', display: 'shredded chicken' },
        ],
      }),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('ingredients'))).toBe(true)
      expect(result.error.issues.some((issue) => /unique/i.test(issue.message))).toBe(true)
    }
  })

  it('rejects an image without credit', () => {
    const result = soupItemSchema.safeParse(
      validItem({
        image: {
          sourceFile: 'File:Ajiaco.jpg',
          credit: {
            author: '',
            license: 'CC BY-SA 4.0',
            licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
          },
        },
      }),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('credit')
    }
  })

  it('rejects a malformed source URL', () => {
    const result = soupItemSchema.safeParse(validItem({ sourceUrl: 'en.wikipedia.org/?curid=1' }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('sourceUrl')
    }
  })

  it('rejects unknown extra keys so pipeline typos fail loudly', () => {
    const result = soupItemSchema.safeParse({ ...validItem(), country: 'CO' })
    expect(result.success).toBe(false)
  })
})
