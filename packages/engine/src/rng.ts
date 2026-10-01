/**
 * Seeded randomness. mulberry32 — small, fast, fully deterministic. The seed is a
 * replay knob (rounds, later the daily challenge), not a security boundary.
 */

/** FNV-1a 32-bit hash: turns string seeds (e.g. a UTC date) into PRNG seeds. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number
  /** Uniform integer in [0, maxExclusive). */
  int(maxExclusive: number): number
  pick<T>(items: readonly T[]): T
  /** Fisher-Yates; returns a new array, never mutates the input. */
  shuffle<T>(items: readonly T[]): T[]
}

export function createRng(seed: number | string): Rng {
  let state = (typeof seed === 'number' ? seed : hashSeed(seed)) >>> 0

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (maxExclusive: number): number => Math.floor(next() * maxExclusive)

  return {
    next,
    int,
    pick: (items) => items[int(items.length)],
    shuffle: (items) => {
      const copy = [...items]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = int(i + 1)
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    },
  }
}
