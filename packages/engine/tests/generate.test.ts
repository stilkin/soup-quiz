import { describe, expect, it } from 'vitest'
import { generateRound } from '../src/generate'
import { ingredientsToCountry } from '../src/mode'
import { mainDataset, starvedDataset } from './fixtures'

describe('generateRound — spec scenarios', () => {
  it('Scenario: Replaying a seed reproduces the round', () => {
    const first = generateRound(mainDataset, ingredientsToCountry, { seed: 'a', length: 6 })
    const replay = generateRound(mainDataset, ingredientsToCountry, { seed: 'a', length: 6 })
    expect(replay).toEqual(first)

    const other = generateRound(mainDataset, ingredientsToCountry, { seed: 'b', length: 6 })
    expect(other.questions.map((q) => q.item.id)).not.toEqual(first.questions.map((q) => q.item.id))
  })

  it('Scenario: Correct answer always present', () => {
    const round = generateRound(mainDataset, ingredientsToCountry, { seed: 1, length: 8 })
    expect(round.questions.length).toBe(8)
    for (const question of round.questions) {
      expect(question.options).toContain(question.answer)
    }
  })

  it('Scenario: Distractors are distinct', () => {
    const round = generateRound(mainDataset, ingredientsToCountry, { seed: 2, length: 8 })
    for (const question of round.questions) {
      expect(new Set(question.options).size).toBe(ingredientsToCountry.optionCount)
    }
  })

  it('Scenario: Item skipped when distractors are insufficient', () => {
    // the triple-origin fixture item sees only {PT, NG} as possible distractors
    const round = generateRound(starvedDataset, ingredientsToCountry, { seed: 3, length: 5 })
    expect(round.questions).toHaveLength(5)
    expect(round.questions.map((q) => q.item.id)).not.toContain('5')
  })

  it('respects the requested length', () => {
    const round = generateRound(mainDataset, ingredientsToCountry, { seed: 4, length: 3 })
    expect(round.questions).toHaveLength(3)
  })

  it('a multi-origin item shows exactly one of its own countries', () => {
    // CO and CU must never both appear; either may be the shown answer
    for (const seed of ['x', 'y', 'z', 1, 2, 3]) {
      const round = generateRound(mainDataset, ingredientsToCountry, { seed, length: 8 })
      const ajiaco = round.questions.find((q) => q.item.id === '8')
      expect(ajiaco).toBeDefined()
      if (ajiaco) {
        const ownShown = ajiaco.options.filter((o) => o === 'CO' || o === 'CU')
        expect(ownShown).toHaveLength(1)
        expect(['CO', 'CU']).toContain(ajiaco.answer)
      }
    }
  })
})
