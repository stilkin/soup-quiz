import { z } from 'zod'
import { COUNTRIES, SOUP_TYPES } from './registries'

const countryCode = z.enum(Object.keys(COUNTRIES) as [string, ...string[]], {
  error: (issue) =>
    `invalid country code '${String(issue.input)}' — expected an ISO-3166-1 alpha-2 code`,
})

const soupType = z.enum(SOUP_TYPES, {
  error: (issue) =>
    `invalid soup type '${String(issue.input)}' — expected one of ${SOUP_TYPES.join(', ')}`,
})

export const creditSchema = z.object({
  author: z.string().min(1),
  license: z.string().min(1),
  licenseUrl: z.url(),
})

export const imageSchema = z.object({
  /** Commons file name for provenance, e.g. 'File:Ajiaco.jpg'. */
  sourceFile: z.string().min(1),
  credit: creditSchema,
})

export const ingredientSchema = z.object({
  /** Canonical tag used for matching across items ('chicken', not 'pulled chicken'). */
  id: z.string().min(1),
  display: z.string().min(1),
})

/**
 * A single quiz item. The authoritative shape (design D3): countries and types are
 * normalized 1..n lists; image is optional but always credited; extra keys are rejected
 * so pipeline typos fail loudly instead of shipping.
 */
export const soupItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    sourceUrl: z.url(),
    countries: z.array(countryCode).min(1),
    region: z.string().min(1).optional(),
    types: z.array(soupType).min(1),
    ingredients: z.array(ingredientSchema).min(1),
    image: imageSchema.optional(),
  })
  .strict()
  .check((ctx) => {
    const ids = ctx.value.ingredients.map((ingredient) => ingredient.id)
    if (new Set(ids).size !== ids.length) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        path: ['ingredients'],
        message: 'canonical ingredient ids must be unique within an item',
      })
    }
  })

export type SoupItem = z.infer<typeof soupItemSchema>
export type Ingredient = z.infer<typeof ingredientSchema>
export type ItemImage = z.infer<typeof imageSchema>
