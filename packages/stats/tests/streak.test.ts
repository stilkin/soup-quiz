import { describe, expect, it } from 'vitest'
import { dayStreaks, utcDay } from '../src/streak'
import { round, T } from './fixtures'

const NOW = T('2026-10-02', 18)

describe('dayStreaks — spec scenarios', () => {
  it('Scenario: Consecutive UTC days extend the streak (each day counted once)', () => {
    const rounds = [
      round(T('2026-10-01')),
      round(T('2026-10-01', 20)), // same day, counted once
      round(T('2026-10-02')),
    ]
    expect(dayStreaks(rounds, NOW)).toEqual({ current: 2, best: 2 })
  })

  it('Scenario: A missed UTC day breaks the streak', () => {
    const rounds = [round(T('2026-09-28')), round(T('2026-09-30')), round(T('2026-10-02'))]
    // 28 and 30 are separated by a gap: runs are [1], then 30+... no — 30 -> 02 has a gap
    // runs: {28}=1, {30, 01? no} -> 30 and 02 are not consecutive. runs: 1, 1, 1
    expect(dayStreaks(rounds, NOW)).toEqual({ current: 1, best: 1 })
  })

  it('Scenario: Streaks cross midnight boundaries correctly (23:59 then 00:01)', () => {
    const rounds = [round(T('2026-10-01', 23, 59)), round(T('2026-10-02', 0, 1))]
    expect(dayStreaks(rounds, NOW)).toEqual({ current: 2, best: 2 })
  })

  it('counts a streak alive when the last activity was yesterday', () => {
    const rounds = [round(T('2026-09-30', 9)), round(T('2026-10-01', 9))]
    expect(dayStreaks(rounds, NOW)).toEqual({ current: 2, best: 2 })
  })

  it('keeps best streak as the historical maximum after a break', () => {
    const rounds = [
      round(T('2026-09-20')),
      round(T('2026-09-21')),
      round(T('2026-09-22')),
      round(T('2026-10-02')),
    ]
    expect(dayStreaks(rounds, NOW)).toEqual({ current: 1, best: 3 })
  })

  it('handles month-end boundaries', () => {
    const rounds = [round(T('2026-01-31', 23)), round(T('2026-02-01', 1))]
    expect(dayStreaks(rounds, T('2026-02-01', 12))).toEqual({ current: 2, best: 2 })
  })

  it('returns zeros with no rounds', () => {
    expect(dayStreaks([], NOW)).toEqual({ current: 0, best: 0 })
  })
})

describe('utcDay', () => {
  it('buckets by UTC calendar date regardless of hour', () => {
    expect(utcDay(T('2026-10-02', 23, 59))).toBe('2026-10-02')
    expect(utcDay(T('2026-10-03', 0, 1))).toBe('2026-10-03')
  })
})
