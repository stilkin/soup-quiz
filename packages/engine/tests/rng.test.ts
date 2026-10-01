import { describe, expect, it } from 'vitest'
import { createRng, hashSeed } from '../src/rng'

describe('createRng', () => {
  it('produces identical sequences for the same numeric seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    const seqA = Array.from({ length: 10 }, () => a.next())
    const seqB = Array.from({ length: 10 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = createRng(1)
    const b = createRng(2)
    const seqA = Array.from({ length: 10 }, () => a.next())
    const seqB = Array.from({ length: 10 }, () => b.next())
    expect(seqA).not.toEqual(seqB)
  })

  it('hashes string seeds deterministically (FNV-1a)', () => {
    expect(hashSeed('')).toBe(0x811c9dc5)
    const a = createRng('2026-10-01')
    const b = createRng('2026-10-01')
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(
      Array.from({ length: 5 }, () => b.next()),
    )
  })

  it('shuffles to a permutation without mutating the input', () => {
    const rng = createRng(7)
    const input = [1, 2, 3, 4, 5]
    const shuffled = rng.shuffle(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
    expect([...shuffled].sort((a, b) => a - b)).toEqual(input)
  })

  it('keeps int() within bounds', () => {
    const rng = createRng(99)
    for (let i = 0; i < 100; i++) {
      const value = rng.int(4)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(4)
    }
  })
})
