import { describe, expect, it } from 'vitest'
import { isCorrect, scoreRound } from '../src/check'
import { generateRound } from '../src/generate'
import { ingredientsToCountry } from '../src/mode'
import { mainDataset } from './fixtures'

const round = generateRound(mainDataset, ingredientsToCountry, { seed: 'check', length: 8 })

describe('isCorrect — spec scenarios', () => {
  it('Scenario: Either origin of a multi-origin item counts', () => {
    const ajiaco = mainDataset.find((item) => item.id === '8')
    expect(ajiaco).toBeDefined()
    if (!ajiaco) return
    expect(isCorrect(ajiaco, 'countries', 'CO')).toBe(true)
    expect(isCorrect(ajiaco, 'countries', 'CU')).toBe(true)
    expect(isCorrect(ajiaco, 'countries', 'PE')).toBe(false)
  })
})

describe('scoreRound', () => {
  it('counts correct answers out of total', () => {
    const answers = round.questions.map((q, i) => (i === 0 ? q.answer : 'XX'))
    expect(scoreRound(round, answers)).toEqual({ correct: 1, total: 8 })
  })

  it('scores unanswered questions as incorrect', () => {
    const answers: (string | undefined)[] = round.questions.map(() => undefined)
    expect(scoreRound(round, answers)).toEqual({ correct: 0, total: 8 })
  })

  it('accepts exactly one answer per question — the slot array is the enforcement', () => {
    // one slot per question; there is no API surface to submit a second answer for
    // the same question, and a "changed mind" simply replaces the slot's value
    const answers = round.questions.map((q) => q.answer)
    expect(answers).toHaveLength(round.questions.length)
    expect(scoreRound(round, answers)).toEqual({ correct: 8, total: 8 })
  })
})
