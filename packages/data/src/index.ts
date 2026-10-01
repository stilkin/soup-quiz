import type { SoupItem } from '@soup-quiz/schema'
import soups from './soups.v0.json'

/**
 * Stub dataset v0 — adversarial by design (design D7): multi-country, region-not-country,
 * multi-type, and canonical ingredients shared under different display spellings.
 * Replaced by the real pipeline output in the dataset-pipeline change; conformance is
 * enforced by this package's test suite.
 */
export const soupsV0 = soups as SoupItem[]

export const datasetId = 'soups.v0'
