import type { ImageRequireSource } from 'react-native'

/**
 * Bundled soup images, keyed by item id — populated by the dataset pipeline
 * (change 2) as `assets/soups/<id>.jpg` with a pairing test. Until then this
 * map is empty and the reveal renders text-only, which is the v1 default.
 */
export const soupImages: Record<string, ImageRequireSource> = {}
