import type { AnswerRow, RoundRow } from '../src/types'

let nextId = 1

export function round(finishedAt: number, overrides: Partial<RoundRow> = {}): RoundRow {
  return {
    id: nextId++,
    kind: 'free',
    mode_id: 'ingredients-to-country',
    seed: 'test',
    length: 8,
    correct: 5,
    finished_at: finishedAt,
    ...overrides,
  }
}

export function answer(itemId: string, correct: 0 | 1, answeredAt: number, roundId = 1): AnswerRow {
  return { id: nextId++, round_id: roundId, item_id: itemId, correct, answered_at: answeredAt }
}

/** UTC helper — unambiguous timestamps in tests. */
export const T = (day: string, hour = 12, minute = 0, second = 0): number => {
  const [y, m, d] = day.split('-').map(Number)
  return Date.UTC(y, m - 1, d, hour, minute, second)
}
