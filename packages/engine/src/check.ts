import type { Round } from './generate'

/**
 * Correct iff the answer equals any of the item's values for the asked field —
 * picking either country of a multi-origin item counts (spec).
 */
export function isCorrect(
  item: Round['questions'][number]['item'],
  answerField: Round['mode']['answerField'],
  answer: string,
): boolean {
  return item[answerField].includes(answer)
}

/**
 * Scores a round against one answer per question slot. The array shape is the
 * enforcement of "exactly one answer per question": there is no second slot to
 * overwrite, and unanswered questions score as incorrect.
 */
export function scoreRound(
  round: Round,
  answers: readonly (string | undefined)[],
): {
  correct: number
  total: number
} {
  const correct = round.questions.reduce((count, question, index) => {
    const answer = answers[index]
    return answer !== undefined && isCorrect(question.item, round.mode.answerField, answer)
      ? count + 1
      : count
  }, 0)
  return { correct, total: round.questions.length }
}
