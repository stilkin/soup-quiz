import type { SoupItem } from '@soup-quiz/schema'
import type { ModeConfig } from './mode'
import { createRng } from './rng'

export interface Question {
  item: SoupItem
  /** Answer values (e.g. alpha-2 codes) in display order; UI maps them to labels/flags. */
  options: string[]
  /** The value highlighted as correct — one of the item's own values. */
  answer: string
}

export interface Round {
  mode: ModeConfig
  seed: string
  questions: Question[]
}

export interface RoundOptions {
  /** Number/string seeds are hashed deterministically (dates drop in here later). */
  seed: number | string
  length: number
}

/**
 * Distinct values for the mode's answer field across the dataset, excluding all of
 * `own` — the distractor pool. Excluding *all* of the item's own values means a
 * multi-origin item shows exactly one of its countries (the others never appear as
 * distractors), while `isCorrect` still accepts any of them.
 */
function distractorPool(
  dataset: readonly SoupItem[],
  answerField: 'countries',
  own: Set<string>,
): string[] {
  const values = new Set<string>()
  for (const item of dataset) {
    for (const value of item[answerField]) {
      if (!own.has(value)) values.add(value)
    }
  }
  return [...values]
}

function canBuildQuestion(item: SoupItem, dataset: readonly SoupItem[], mode: ModeConfig): boolean {
  const own = new Set(item[mode.answerField])
  return distractorPool(dataset, mode.answerField, own).length >= mode.optionCount - 1
}

function buildQuestion(
  item: SoupItem,
  dataset: readonly SoupItem[],
  mode: ModeConfig,
  nextInt: (max: number) => number,
): Question {
  const own = [...item[mode.answerField]]
  const answer = own[nextInt(own.length)]
  const pool = distractorPool(dataset, mode.answerField, new Set(own))
  const distractors: string[] = []
  while (distractors.length < mode.optionCount - 1 && pool.length > 0) {
    distractors.push(...pool.splice(nextInt(pool.length), 1))
  }
  const options = [answer, ...distractors]
  return {
    item,
    answer,
    options: shuffleInPlace(options, nextInt),
  }
}

function shuffleInPlace<T>(items: T[], nextInt: (max: number) => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = nextInt(i + 1)
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

/**
 * Deterministic round: same dataset + same seed -> same items, same order, same
 * option order. Items that cannot be surrounded by enough distinct distractors are
 * skipped (spec: starved items are not used), so a round may come back shorter than
 * requested.
 */
export function generateRound(
  dataset: readonly SoupItem[],
  mode: ModeConfig,
  options: RoundOptions,
): Round {
  const rng = createRng(options.seed)
  const order = rng.shuffle(dataset)
  const questions: Question[] = []
  for (const item of order) {
    if (questions.length >= options.length) break
    if (!canBuildQuestion(item, dataset, mode)) continue
    questions.push(buildQuestion(item, dataset, mode, rng.int.bind(rng)))
  }
  return { mode, seed: String(options.seed), questions }
}
