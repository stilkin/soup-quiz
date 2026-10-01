import { z } from 'zod'
import { soupItemSchema } from './item'

/**
 * JSON Schema (draft 2020-12) equivalent of `soupItemSchema` — the contract the
 * Python pipeline validates its output against. See README.md for the rules that
 * are NOT expressible here and must be checked app-side.
 */
export const soupItemJsonSchema = z.toJSONSchema(soupItemSchema)
