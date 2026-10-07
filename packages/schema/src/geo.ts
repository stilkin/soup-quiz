import { CENTROIDS } from './centroids'

/**
 * Geography for the daily challenge's heat feedback: great-circle distance between
 * country label points, banded into five temperatures. Pure math on the generated
 * centroid registry — no deps, correct across the antimeridian.
 */

const EARTH_RADIUS_KM = 6371

export interface HeatBand {
  id: 'hot' | 'warm' | 'lukewarm' | 'cold' | 'ice-cold'
  label: string
  icon: string
}

/** One constants block — retuning is deliberate, pinned by tests. */
const BANDS: ReadonlyArray<HeatBand & { below: number }> = [
  { below: 1500, id: 'hot', label: 'next door', icon: '🔥' },
  { below: 3000, id: 'warm', label: 'warm', icon: '🥵' },
  { below: 5500, id: 'lukewarm', label: 'lukewarm', icon: '🌡️' },
  { below: 9500, id: 'cold', label: 'cold', icon: '❄️' },
  { below: Number.POSITIVE_INFINITY, id: 'ice-cold', label: 'ice cold', icon: '🥶' },
]

const toRad = (deg: number): number => (deg * Math.PI) / 180

/** Haversine distance between two registry countries, whole km; undefined if unknown. */
export function distanceKm(from: string, to: string): number | undefined {
  const a = CENTROIDS[from]
  const b = CENTROIDS[to]
  if (a === undefined || b === undefined) return undefined
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h)))
}

export function heatBand(km: number): HeatBand {
  return BANDS.find((band) => km < band.below) ?? BANDS[BANDS.length - 1]
}
