/**
 * Utility helpers for locale-aware display in the booking UI.
 * Keeps the OCCASIONS-by-index translation pattern DRY across components.
 */

import { OCCASIONS } from '@/lib/restaurant'

/**
 * Returns the translated display label for an occasion value.
 * Internally, occasions are stored as Vietnamese strings (the stable DB key).
 * The `occasionLabels` array is the translated list at the same index positions.
 *
 * @param occasion   - Raw occasion value (Vietnamese key, e.g. "Sinh nhật")
 * @param labels     - Translated label array from `t('occasions') as unknown as string[]`
 */
export function translateOccasion(occasion: string, labels: string[]): string {
  const idx = OCCASIONS.indexOf(occasion)
  return idx >= 0 && labels[idx] ? labels[idx] : occasion
}
