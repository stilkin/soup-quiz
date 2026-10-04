import { describe, expect, it } from 'vitest'
import { dailyStreaks } from '../src/streak'
import { round, T } from './fixtures'

const NOW = T('2026-10-04', 18)

describe('dailyStreaks', () => {
  it('counts consecutive solved dailies', () => {
    const rounds = [
      round(T('2026-10-02'), { kind: 'daily', correct: 3 }),
      round(T('2026-10-03'), { kind: 'daily', correct: 1 }),
      round(T('2026-10-04'), { kind: 'daily', correct: 4 }),
    ]
    expect(dailyStreaks(rounds, NOW)).toEqual({ current: 3, best: 3 })
  })

  it('counts a solved day once regardless of extra rounds', () => {
    const rounds = [
      round(T('2026-10-03'), { kind: 'daily', correct: 2 }),
      round(T('2026-10-03'), { kind: 'free', correct: 5 }),
      round(T('2026-10-04'), { kind: 'daily', correct: 1 }),
    ]
    expect(dailyStreaks(rounds, NOW)).toEqual({ current: 2, best: 2 })
  })

  it('breaks on a failed day', () => {
    const rounds = [
      round(T('2026-10-02'), { kind: 'daily', correct: 2 }),
      round(T('2026-10-03'), { kind: 'daily', correct: 0 }),
      round(T('2026-10-04'), { kind: 'daily', correct: 1 }),
    ]
    expect(dailyStreaks(rounds, NOW)).toEqual({ current: 1, best: 1 })
  })

  it('breaks on a missed day', () => {
    const rounds = [
      round(T('2026-10-01'), { kind: 'daily', correct: 1 }),
      round(T('2026-10-03'), { kind: 'daily', correct: 1 }),
      round(T('2026-10-04'), { kind: 'daily', correct: 1 }),
    ]
    expect(dailyStreaks(rounds, NOW)).toEqual({ current: 2, best: 2 })
  })

  it('ignores free rounds entirely', () => {
    const rounds = [round(T('2026-10-02')), round(T('2026-10-03')), round(T('2026-10-04'))]
    expect(dailyStreaks(rounds, NOW)).toEqual({ current: 0, best: 0 })
  })

  it('keeps the best streak across a break', () => {
    const rounds = [
      round(T('2026-09-28'), { kind: 'daily', correct: 2 }),
      round(T('2026-09-29'), { kind: 'daily', correct: 2 }),
      round(T('2026-09-30'), { kind: 'daily', correct: 2 }),
      round(T('2026-10-04'), { kind: 'daily', correct: 2 }),
    ]
    expect(dailyStreaks(rounds, NOW)).toEqual({ current: 1, best: 3 })
  })

  it('keeps an alive streak through yesterday', () => {
    const rounds = [
      round(T('2026-10-02'), { kind: 'daily', correct: 1 }),
      round(T('2026-10-03'), { kind: 'daily', correct: 1 }),
    ]
    expect(dailyStreaks(rounds, NOW)).toEqual({ current: 2, best: 2 })
  })
})
