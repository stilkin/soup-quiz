import { describe, expect, it } from 'vitest'
import { CENTROIDS } from '../src/centroids'
import { distanceKm, heatBand } from '../src/geo'
import { COUNTRIES } from '../src/registries'

describe('centroid registry', () => {
  it('covers every registry country exactly', () => {
    expect(Object.keys(CENTROIDS).sort()).toEqual(Object.keys(COUNTRIES).sort())
  })

  it('keeps coordinates in range', () => {
    for (const { lat, lon } of Object.values(CENTROIDS)) {
      expect(Math.abs(lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(lon)).toBeLessThanOrEqual(180)
    }
  })
})

describe('distanceKm', () => {
  it('is zero to itself and symmetric', () => {
    expect(distanceKm('IT', 'IT')).toBe(0)
    expect(distanceKm('IT', 'FR')).toBe(distanceKm('FR', 'IT'))
  })

  it('returns undefined for unknown codes', () => {
    expect(distanceKm('ZZ', 'IT')).toBeUndefined()
  })

  it('puts neighbours in the same neighborhood', () => {
    expect(distanceKm('GR', 'TR')).toBeLessThan(1500) // the pair that broke continent bands
    expect(distanceKm('JP', 'KR')).toBeLessThan(1500) // no land border, still next door
  })

  it('takes the short arc across the antimeridian', () => {
    // Fiji and Samoa straddle the date line ~7.6° apart; the long way is ~39,000 km
    expect(distanceKm('FJ', 'WS')).toBeLessThan(2000)
  })

  it('separates the far sides of the planet', () => {
    expect(distanceKm('PT', 'JP')).toBeGreaterThan(9500)
    expect(distanceKm('US', 'FR')).toBeGreaterThan(5500)
    expect(distanceKm('US', 'FR')).toBeLessThan(9500)
  })
})

describe('heatBand', () => {
  it('bands at the committed thresholds', () => {
    expect(heatBand(0).id).toBe('hot')
    expect(heatBand(1499).id).toBe('hot')
    expect(heatBand(1500).id).toBe('warm')
    expect(heatBand(2999).id).toBe('warm')
    expect(heatBand(3000).id).toBe('lukewarm')
    expect(heatBand(5500).id).toBe('cold')
    expect(heatBand(9499).id).toBe('cold')
    expect(heatBand(9500).id).toBe('ice-cold')
    expect(heatBand(20015).id).toBe('ice-cold') // antipode maximum
  })

  it('carries an icon and label for every band', () => {
    for (const km of [100, 2000, 4000, 7000, 12000]) {
      const band = heatBand(km)
      expect(band.icon).toBeTruthy()
      expect(band.label).toBeTruthy()
    }
  })
})
