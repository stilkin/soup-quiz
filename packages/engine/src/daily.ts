import type { Ingredient, SoupItem } from '@soup-quiz/schema'
import { createRng } from './rng'

/**
 * The daily challenge's pure core: one soup per UTC day for everyone, derived from
 * integer day arithmetic — no stored state, no network (design D1). The pool is
 * walked once per cycle in a per-cycle shuffle, so soups never repeat within a cycle
 * and each cycle starts in a fresh order.
 */

export const DAILY_MODE_ID = 'daily-country'
export const DAILY_TIER_COUNT = 4

/**
 * Days-since-epoch anchor for share numbering ("Soup Quiz #N = dayIndex − anchor").
 * Provisional until the app ships; freeze it at launch so posted numbers never shift.
 */
export const LAUNCH_ANCHOR_DAY = 20_639 // 2026-10-04

export interface DailySoup {
  item: SoupItem
  /** Tier 2 reveals the first half, tier 3 the rest; the photo and name are tiers 1 and 4. */
  halves: [Ingredient[], Ingredient[]]
  /** Stable identity of the day — also the storage seed for the recorded round. */
  daySeed: string
}

export function dayIndexFrom(utcMillis: number): number {
  return Math.floor(utcMillis / 86_400_000)
}

/** Items eligible for the daily: a photo to show and enough ingredients to split. */
export function dailyPool(dataset: readonly SoupItem[]): SoupItem[] {
  return dataset
    .filter((item) => item.image !== undefined && item.ingredients.length >= 2)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

export function dailyForDay(dataset: readonly SoupItem[], dayIndex: number): DailySoup {
  const pool = dailyPool(dataset)
  if (pool.length === 0) {
    throw new Error('daily pool is empty — need items with an image and >= 2 ingredients')
  }
  const cycle = Math.floor(dayIndex / pool.length)
  const order = createRng(`daily-cycle-${cycle}`).shuffle(pool)
  const item = order[dayIndex % order.length]
  const daySeed = `daily-${dayIndex}`
  const shuffled = createRng(daySeed).shuffle(item.ingredients)
  const split = Math.ceil(shuffled.length / 2) // odd counts: the extra goes first
  return { item, halves: [shuffled.slice(0, split), shuffled.slice(split)], daySeed }
}
