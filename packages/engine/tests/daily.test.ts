import { describe, expect, it } from 'vitest'
import {
  DAILY_TIER_COUNT,
  dailyForDay,
  dailyPool,
  dayIndexFrom,
  LAUNCH_ANCHOR_DAY,
} from '../src/daily'
import { dailyDataset } from './fixtures'

const POOL_IDS = ['d1', 'd2', 'd3', 'd4', 'd5']

describe('dayIndexFrom', () => {
  it('counts whole UTC days since the epoch', () => {
    expect(dayIndexFrom(0)).toBe(0)
    expect(dayIndexFrom(86_399_999)).toBe(0)
    expect(dayIndexFrom(86_400_000)).toBe(1)
  })
})

describe('dailyPool', () => {
  it('admits only items with an image and at least two ingredients', () => {
    expect(dailyPool(dailyDataset).map((item) => item.id)).toEqual(POOL_IDS)
  })

  it('is sorted by id for a stable order', () => {
    const shuffledInput = [...dailyDataset].reverse()
    expect(dailyPool(shuffledInput).map((item) => item.id)).toEqual(POOL_IDS)
  })
})

describe('dailyForDay', () => {
  it('is deterministic for a given day', () => {
    expect(dailyForDay(dailyDataset, 100)).toEqual(dailyForDay(dailyDataset, 100))
  })

  it('visits every eligible soup exactly once per cycle', () => {
    const ids = POOL_IDS.map((_, day) => dailyForDay(dailyDataset, day).item.id)
    expect(new Set(ids).size).toBe(POOL_IDS.length)
  })

  it('reshuffles the order in the next cycle', () => {
    const cycleOne = POOL_IDS.map((_, day) => dailyForDay(dailyDataset, day).item.id)
    const cycleTwo = POOL_IDS.map(
      (_, day) => dailyForDay(dailyDataset, POOL_IDS.length + day).item.id,
    )
    expect(cycleTwo).not.toEqual(cycleOne)
    expect(new Set(cycleTwo)).toEqual(new Set(POOL_IDS))
  })

  it('never selects ineligible items', () => {
    const ids = new Set(
      Array.from(
        { length: POOL_IDS.length * 3 },
        (_, day) => dailyForDay(dailyDataset, day).item.id,
      ),
    )
    expect(ids).toEqual(new Set(POOL_IDS))
  })

  it('splits ingredients into deterministic halves, extra first', () => {
    for (const day of [0, 1, 2, 3, 4]) {
      const first = dailyForDay(dailyDataset, day)
      const replay = dailyForDay(dailyDataset, day)
      expect(first.halves).toEqual(replay.halves)

      const count = first.item.ingredients.length
      expect(first.halves[0]).toHaveLength(Math.ceil(count / 2))
      expect(first.halves[1]).toHaveLength(Math.floor(count / 2))
      expect([...first.halves[0], ...first.halves[1]].map((i) => i.id).sort()).toEqual(
        first.item.ingredients.map((i) => i.id).sort(),
      )
    }
  })

  it('identifies the day by a stable seed and four tiers', () => {
    const daily = dailyForDay(dailyDataset, 42)
    expect(daily.daySeed).toBe('daily-42')
    expect(DAILY_TIER_COUNT).toBe(4)
    expect(LAUNCH_ANCHOR_DAY).toBeGreaterThan(0)
  })
})
