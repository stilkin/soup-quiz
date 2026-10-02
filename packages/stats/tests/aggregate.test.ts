import { describe, expect, it } from 'vitest'
import { aggregateStats, soupsProgress } from '../src/aggregate'
import { answer, round, T } from './fixtures'

const NOW = T('2026-10-02', 18)

describe('aggregateStats — spec scenarios', () => {
  it('Scenario: Aggregates reflect the event log (3 answers, 1 miss)', () => {
    const answers = [
      answer('3160140', 1, T('2026-10-01', 10)),
      answer('3160140', 0, T('2026-10-01', 10, 1)),
      answer('3160140', 1, T('2026-10-02', 11)),
    ]
    const view = aggregateStats([round(T('2026-10-02', 11))], answers, 10, NOW)
    const ajiaco = view.soups.find((s) => s.itemId === '3160140')
    expect(ajiaco).toMatchObject({ seen: 3, correct: 2, accuracy: 2 / 3 })
    expect(view.summary).toMatchObject({
      rounds: 1,
      answers: 3,
      accuracy: 2 / 3,
      soupsSeen: 1,
      soupsTotal: 10,
    })
  })

  it('Scenario: Empty input is a valid input', () => {
    const view = aggregateStats([], [], 10, NOW)
    expect(view.soups).toEqual([])
    expect(view.summary).toMatchObject({
      rounds: 0,
      answers: 0,
      accuracy: 0,
      soupsSeen: 0,
      soupsTotal: 10,
      currentStreak: 0,
      bestStreak: 0,
    })
  })

  it('summary carries the streaks from rounds', () => {
    const rounds = [round(T('2026-10-01')), round(T('2026-10-02'))]
    const view = aggregateStats(rounds, [], 10, NOW)
    expect(view.summary.currentStreak).toBe(2)
  })
})

describe('soupsProgress', () => {
  it('marks mastery when the last three consecutive encounters are correct', () => {
    const answers = [
      answer('a', 0, T('2026-10-01', 1)),
      answer('a', 1, T('2026-10-01', 2)),
      answer('a', 1, T('2026-10-01', 3)),
      answer('a', 1, T('2026-10-02', 1)),
    ]
    expect(soupsProgress(answers)[0].mastered).toBe(true)
  })

  it('loses mastery after a recent miss', () => {
    const answers = [
      answer('a', 1, T('2026-10-01', 1)),
      answer('a', 1, T('2026-10-01', 2)),
      answer('a', 1, T('2026-10-01', 3)),
      answer('a', 0, T('2026-10-02', 1)),
    ]
    expect(soupsProgress(answers)[0].mastered).toBe(false)
  })

  it('does not master with fewer than three encounters even if all correct', () => {
    const answers = [answer('a', 1, T('2026-10-01', 1)), answer('a', 1, T('2026-10-01', 2))]
    expect(soupsProgress(answers)[0].mastered).toBe(false)
  })

  it('orders weakest first, most recently seen as the tie-break', () => {
    const answers = [
      answer('weak', 0, T('2026-10-01', 1)),
      answer('mid', 0, T('2026-10-01', 2)),
      answer('mid', 1, T('2026-10-01', 3)),
      answer('strong', 1, T('2026-10-02', 1)),
      answer('strong', 1, T('2026-10-02', 2)),
      answer('also-mid', 0, T('2026-10-02', 3)),
      answer('also-mid', 1, T('2026-10-02', 4)),
    ]
    const order = soupsProgress(answers).map((s) => s.itemId)
    // weak (0%), mid + also-mid (50%, also-mid seen later so first), strong (100%)
    expect(order).toEqual(['weak', 'also-mid', 'mid', 'strong'])
  })
})
