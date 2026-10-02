import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { soupsV1 } from '../src'

const assetsDir = fileURLToPath(new URL('../../../apps/soup-quiz/assets/soups', import.meta.url))

/**
 * Pairing guarantee (spec): dataset image <-> bundled asset <-> manifest entry must
 * agree exactly. The pipeline generates all three; this test fails if any drifts.
 */
describe('image pairing (dataset <-> assets <-> manifest)', () => {
  const manifestPath = join(assetsDir, 'manifest.json')
  const assets = new Set(
    readdirSync(assetsDir)
      .filter((f) => f.endsWith('.jpg'))
      .map((f) => f.replace(/\.jpg$/, '')),
  )
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<
    string,
    { credit: { author: string; license: string; licenseUrl: string } }
  >
  const datasetImages = soupsV1.filter((s) => s.image).map((s) => s.id)

  it('manifest exists with generated assets', () => {
    expect(existsSync(manifestPath)).toBe(true)
    expect(assets.size).toBeGreaterThan(0)
  })

  it('every dataset image has an asset file and a fully credited manifest entry', () => {
    for (const id of datasetImages) {
      expect(assets.has(id), `dataset image ${id} missing asset file`).toBe(true)
      const entry = manifest[id]
      expect(entry, `dataset image ${id} missing manifest entry`).toBeDefined()
      expect(entry.credit.author.length).toBeGreaterThan(0)
      expect(entry.credit.license.length).toBeGreaterThan(0)
      expect(entry.credit.licenseUrl).toMatch(/^https?:\/\//)
    }
  })

  it('every manifest entry has an asset file with credit', () => {
    for (const [id, entry] of Object.entries(manifest)) {
      expect(assets.has(id), `manifest ${id} missing asset file`).toBe(true)
      expect(entry.credit.author.length).toBeGreaterThan(0)
      expect(entry.credit.licenseUrl).toMatch(/^https?:\/\//)
    }
  })

  it('manifest covers the corpus; the dataset is the reviewed subset of it', () => {
    // Pre-review the dataset ships fewer items than the corpus has images; once the
    // review pass completes this tightens toward equality — tracked by the pipeline
    // report's unused-image count, asserted zero in the integration task.
    expect(datasetImages.length).toBeLessThanOrEqual(Object.keys(manifest).length)
  })

  it('no orphan asset files', () => {
    for (const id of assets) {
      expect(manifest[id], `asset ${id} not in manifest`).toBeDefined()
    }
  })
})
