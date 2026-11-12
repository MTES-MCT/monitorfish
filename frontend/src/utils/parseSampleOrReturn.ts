import { parseOrReturn } from './parseOrReturn'

import type { z } from 'zod'

/**
 * Validating each item of thousands (as the active vessels) freezes the page on slow computers,
 * while a sample is enough to detect a contract mismatch with the API.
 * Only use it with schemas without transformation (as `parse()` results are not returned).
 */
export function parseSampleOrReturn<T>(body: unknown, schema: z.ZodType<any>, sampleSize: number): T[] {
  if (!Array.isArray(body)) {
    // Reports the contract mismatch
    return parseOrReturn<T>(body, schema, true)
  }

  const step = Math.max(1, Math.floor(body.length / sampleSize))
  // A random start, so that the successive calls (e.g. the refreshes) end up validating every item
  const offset = Math.floor(Math.random() * step)
  const sample = body.filter((_, index) => index % step === offset).slice(0, sampleSize)
  parseOrReturn<T>(sample, schema, true)

  return body as T[]
}
