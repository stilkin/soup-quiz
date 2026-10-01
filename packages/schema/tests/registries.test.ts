import { describe, expect, it } from 'vitest'
import { COUNTRIES, countryName, flagEmoji, soupTypeLabel } from '../src/registries'

describe('registries', () => {
  it('computes flag emoji from alpha-2 codes', () => {
    expect(flagEmoji('IT')).toBe('🇮🇹')
    expect(flagEmoji('PE')).toBe('🇵🇪')
  })

  it('returns a placeholder for malformed codes', () => {
    expect(flagEmoji('it')).toBe('🏳️')
    expect(flagEmoji('ITA')).toBe('🏳️')
    expect(flagEmoji('')).toBe('🏳️')
  })

  it('resolves country names and falls back to the raw code', () => {
    expect(countryName('IT')).toBe('Italy')
    expect(countryName('ZZ')).toBe('ZZ')
  })

  it('labels soup types', () => {
    expect(soupTypeLabel('noodle-soup')).toBe('Noodle soup')
  })

  it('ships a complete ISO registry', () => {
    expect(Object.keys(COUNTRIES)).toHaveLength(249)
  })
})
