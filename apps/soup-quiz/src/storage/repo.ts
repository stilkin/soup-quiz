import type { AnswerRow, RoundRow } from '@soup-quiz/stats'
import { getStatsDb } from './db'

export interface RecordedAnswer {
  itemId: string
  correct: boolean
  answeredAt: number
}

export interface RecordedRound {
  kind: string
  modeId: string
  seed: string
  length: number
  correct: number
  finishedAt: number
  answers: RecordedAnswer[]
}

/**
 * Appends a finished round and its answers in one transaction. Rows mirror the
 * `RoundRow`/`AnswerRow` types of @soup-quiz/stats, which owns every derived stat.
 */
export async function recordRound(recorded: RecordedRound): Promise<void> {
  const db = await getStatsDb()
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO rounds (kind, mode_id, seed, length, correct, finished_at) VALUES (?, ?, ?, ?, ?, ?);',
      recorded.kind,
      recorded.modeId,
      recorded.seed,
      recorded.length,
      recorded.correct,
      recorded.finishedAt,
    )
    for (const answer of recorded.answers) {
      await db.runAsync(
        'INSERT INTO answers (round_id, item_id, correct, answered_at) VALUES (?, ?, ?, ?);',
        result.lastInsertRowId,
        answer.itemId,
        answer.correct ? 1 : 0,
        answer.answeredAt,
      )
    }
  })
}

/** Raw rows for the pure aggregation in @soup-quiz/stats. */
export async function fetchRounds(): Promise<RoundRow[]> {
  const db = await getStatsDb()
  return db.getAllAsync<RoundRow>(
    'SELECT id, kind, mode_id, seed, length, correct, finished_at FROM rounds ORDER BY finished_at;',
  )
}

/** The day's daily round, if it was played — kind + seed identify a day exactly. */
export async function fetchDailyRound(daySeed: string): Promise<RoundRow | null> {
  const db = await getStatsDb()
  return db.getFirstAsync<RoundRow>(
    "SELECT id, kind, mode_id, seed, length, correct, finished_at FROM rounds WHERE kind = 'daily' AND seed = ?;",
    daySeed,
  )
}

export async function fetchAnswers(): Promise<AnswerRow[]> {
  const db = await getStatsDb()
  return db.getAllAsync<AnswerRow>(
    'SELECT id, round_id, item_id, correct, answered_at FROM answers ORDER BY answered_at;',
  )
}

/** Clear-stats tool (spec: confirmed action → empty state). */
export async function clearAllStats(): Promise<void> {
  const db = await getStatsDb()
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM answers; DELETE FROM rounds;')
  })
}
