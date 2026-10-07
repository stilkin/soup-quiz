/**
 * Raw storage rows, mirroring the SQLite columns (snake_case kept on purpose so the
 * app-side repository maps them 1:1). Timestamps are Unix epoch milliseconds, UTC.
 */

export interface RoundRow {
  id: number
  kind: string
  mode_id: string
  seed: string
  length: number
  correct: number
  finished_at: number
}

export interface AnswerRow {
  id: number
  round_id: number
  item_id: string
  correct: 0 | 1
  answered_at: number
}

/** Derived per-soup progress (spec: computed from events, never stored). */
export interface SoupProgress {
  itemId: string
  seen: number
  correct: number
  accuracy: number
  lastSeen: number
  /** Last N consecutive encounters all correct (design D6: N = 3). */
  mastered: boolean
}

export interface StatsSummary {
  rounds: number
  answers: number
  accuracy: number
  soupsSeen: number
  soupsTotal: number
  currentStreak: number
  bestStreak: number
}

export interface StatsView {
  summary: StatsSummary
  /** Weakest first: accuracy ascending, most recently seen as tie-break. */
  soups: SoupProgress[]
}

/** Derived per-country progress: an answer counts toward every country of its item. */
export interface CountryProgress {
  code: string
  asked: number
  correct: number
  accuracy: number
}

export interface CountryView {
  /** Only countries with at least RANKED_MIN_ANSWERS answers, weakest first. */
  ranked: CountryProgress[]
  /** Countries with at least one answer. */
  discovered: number
  /** Distinct countries across the dataset. */
  total: number
}
