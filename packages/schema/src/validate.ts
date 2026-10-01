import type { ZodError } from 'zod'
import { soupItemSchema } from './item'

export interface DatasetIssue {
  itemId: string
  field: string
  message: string
}

export interface DatasetValidation {
  ok: boolean
  issues: DatasetIssue[]
}

function itemIdOf(item: unknown, index: number): string {
  if (typeof item === 'object' && item !== null) {
    const id = (item as { id?: unknown }).id
    if (typeof id === 'string' && id.length > 0) return id
  }
  return `<item ${index}>`
}

function toIssues(item: unknown, index: number, error: ZodError): DatasetIssue[] {
  const itemId = itemIdOf(item, index)
  return error.issues.map((issue) => ({
    itemId,
    field: issue.path.map(String).join('.') || '<root>',
    message: issue.message,
  }))
}

/**
 * Validates a whole dataset against the item schema: per-item field errors plus
 * dataset-level identifier uniqueness. Reports the item identifier and the failing
 * field for every issue.
 */
export function validateDataset(items: readonly unknown[]): DatasetValidation {
  const issues: DatasetIssue[] = []
  const seen = new Map<string, number>()

  items.forEach((item, index) => {
    const result = soupItemSchema.safeParse(item)
    if (!result.success) {
      issues.push(...toIssues(item, index, result.error))
      return
    }
    const firstSeen = seen.get(result.data.id)
    if (firstSeen !== undefined) {
      issues.push({
        itemId: result.data.id,
        field: 'id',
        message: `duplicate identifier (also used by item ${firstSeen})`,
      })
    } else {
      seen.set(result.data.id, index)
    }
  })

  return { ok: issues.length === 0, issues }
}
