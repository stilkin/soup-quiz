import { dayStreaks } from './streak'
import type { AnswerRow, RoundRow, SoupProgress, StatsView } from './types'

/** Mastery threshold (design D6): this many consecutive correct encounters, most recent last. */
const MASTERY_RUN = 3

export function soupsProgress(answers: readonly AnswerRow[]): SoupProgress[] {
  const byItem = new Map<string, AnswerRow[]>()
  for (const answer of [...answers].sort((a, b) => a.answered_at - b.answered_at)) {
    const list = byItem.get(answer.item_id) ?? []
    list.push(answer)
    byItem.set(answer.item_id, list)
  }

  const progress: SoupProgress[] = []
  for (const [itemId, encounters] of byItem) {
    const seen = encounters.length
    const correct = encounters.filter((e) => e.correct === 1).length
    const lastN = encounters.slice(-MASTERY_RUN)
    progress.push({
      itemId,
      seen,
      correct,
      accuracy: seen === 0 ? 0 : correct / seen,
      lastSeen: encounters[encounters.length - 1].answered_at,
      mastered: seen >= MASTERY_RUN && lastN.every((e) => e.correct === 1),
    })
  }

  // weakest first: accuracy ascending, most recently seen as the tie-break
  return progress.sort((a, b) => a.accuracy - b.accuracy || b.lastSeen - a.lastSeen)
}

/**
 * The single implementation of every stat definition (design D1): derives the whole
 * stats view from the raw event rows. `now` is injectable for deterministic tests.
 */
export function aggregateStats(
  rounds: readonly RoundRow[],
  answers: readonly AnswerRow[],
  soupsTotal: number,
  now: number = Date.now(),
): StatsView {
  const soups = soupsProgress(answers)
  const totalAnswers = answers.length
  const totalCorrect = answers.filter((a) => a.correct === 1).length
  const { current, best } = dayStreaks(rounds, now)

  return {
    summary: {
      rounds: rounds.length,
      answers: totalAnswers,
      accuracy: totalAnswers === 0 ? 0 : totalCorrect / totalAnswers,
      soupsSeen: soups.length,
      soupsTotal,
      currentStreak: current,
      bestStreak: best,
    },
    soups,
  }
}
