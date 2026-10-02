import type { SoupItem } from '@soup-quiz/schema'
import soups from './soups.v1.json'

/**
 * Dataset v1 — compiled by data/pipeline (change: add-dataset-pipeline) from Wikipedia
 * snapshots with manual overrides. Conformance is enforced by this package's tests;
 * item ids are Wikipedia pageids (stable, and shared with the stub dataset v0 so
 * recorded stats stay valid).
 */
export const soupsV1 = soups as SoupItem[]

export const datasetId = 'soups.v1'
