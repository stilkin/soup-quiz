import type { AnswerRow, CountryProgress, CountryView } from './types'

/** A country enters the ranked list once it has this many answers (design D2). */
export const RANKED_MIN_ANSWERS = 3

/**
 * Per-country progress over the answer log: an answer counts toward every country
 * listed on its item (symmetric with guessing, which accepts any of them). Ranked
 * rows exclude small samples entirely — no placeholder rows; the discovery count
 * covers everything with at least one answer.
 */
export function countryProgress(
  answers: readonly AnswerRow[],
  items: ReadonlyArray<{ id: string; countries: readonly string[] }>,
): CountryView {
  const countriesOf = new Map(items.map((item) => [item.id, item.countries]))
  const asked = new Map<string, number>()
  const correct = new Map<string, number>()
  for (const answer of answers) {
    for (const code of countriesOf.get(answer.item_id) ?? []) {
      asked.set(code, (asked.get(code) ?? 0) + 1)
      if (answer.correct === 1) correct.set(code, (correct.get(code) ?? 0) + 1)
    }
  }

  const ranked: CountryProgress[] = [...asked.entries()]
    .filter(([, count]) => count >= RANKED_MIN_ANSWERS)
    .map(([code, count]) => {
      const right = correct.get(code) ?? 0
      return { code, asked: count, correct: right, accuracy: right / count }
    })
    // weakest first: accuracy ascending, then fewer answers, then code for determinism
    .sort((a, b) => a.accuracy - b.accuracy || a.asked - b.asked || (a.code < b.code ? -1 : 1))

  const total = new Set(items.flatMap((item) => [...item.countries])).size
  return { ranked, discovered: asked.size, total }
}
