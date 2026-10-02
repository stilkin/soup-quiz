/**
 * A mode is data, not code: this config drives question generation (design D4).
 * Change 3 adds more modes by adding configs and prompt renderings, not generators.
 */

/** The item field the question asks about. More fields arrive with change 3. */
export type AnswerField = 'countries'

/** The item fields the prompt is built from. */
export type PromptField = 'ingredients'

export interface ModeConfig {
  id: string
  title: string
  promptField: PromptField
  answerField: AnswerField
  /** Total options shown, including the correct one. */
  optionCount: number
}

/** The one mode shipped in the walking skeleton: ingredient list -> pick the country. */
export const ingredientsToCountry: ModeConfig = {
  id: 'ingredients-to-country',
  title: 'Ingredients → Country',
  promptField: 'ingredients',
  answerField: 'countries',
  optionCount: 5,
}
