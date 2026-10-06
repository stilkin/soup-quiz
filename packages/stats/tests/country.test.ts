import { describe, expect, it } from 'vitest'
import { countryProgress, RANKED_MIN_ANSWERS } from '../src/country'
import { answer, T } from './fixtures'

const items = [
  { id: 'miso', countries: ['JP'] },
  { id: 'pho', countries: ['VN'] },
  { id: 'laksa', countries: ['MY', 'SG'] },
  { id: 'goulash', countries: ['HU'] },
]

describe('countryProgress', () => {
  it('counts an answer toward every country of its item', () => {
    const view = countryProgress([answer('laksa', 1, T('2026-10-02'))], items)
    expect(view.discovered).toBe(2)
    expect(view.ranked).toEqual([])
  })

  it('ranks only countries with enough answers, weakest first', () => {
    const answers = [
      // JP: 3 asked, 1 correct (33%)
      answer('miso', 0, T('2026-10-01')),
      answer('miso', 1, T('2026-10-02')),
      answer('miso', 0, T('2026-10-03')),
      // VN: 3 asked, 3 correct (100%)
      answer('pho', 1, T('2026-10-01')),
      answer('pho', 1, T('2026-10-02')),
      answer('pho', 1, T('2026-10-03')),
      // HU: 2 asked — below the threshold
      answer('goulash', 0, T('2026-10-01')),
      answer('goulash', 0, T('2026-10-02')),
    ]
    const view = countryProgress(answers, items)
    expect(view.ranked.map((row) => row.code)).toEqual(['JP', 'VN'])
    expect(view.ranked[0]).toMatchObject({ asked: 3, correct: 1, accuracy: 1 / 3 })
    expect(view.discovered).toBe(3)
  })

  it('breaks accuracy ties by fewer answers, then by code', () => {
    const answers = [
      // MY and SG both 3/3 via laksa; JP also 3/3
      answer('laksa', 1, T('2026-10-01')),
      answer('laksa', 1, T('2026-10-02')),
      answer('laksa', 1, T('2026-10-03')),
      answer('miso', 1, T('2026-10-01')),
      answer('miso', 1, T('2026-10-02')),
      answer('miso', 0, T('2026-10-03')),
    ]
    const view = countryProgress(answers, items)
    expect(view.ranked.map((row) => row.code)).toEqual(['JP', 'MY', 'SG'])
  })

  it('treats no answers as empty but keeps the dataset total', () => {
    const view = countryProgress([], items)
    expect(view.ranked).toEqual([])
    expect(view.discovered).toBe(0)
    expect(view.total).toBe(5)
  })

  it('exposes the threshold the spec pins', () => {
    expect(RANKED_MIN_ANSWERS).toBe(3)
  })
})
