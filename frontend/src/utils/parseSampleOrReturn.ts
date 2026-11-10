import { FrontendError } from '@libs/FrontendError'

import type { z } from 'zod'

/**
 * Validate a sample of a large collection (spread over it) against a schema, and return the collection as is.
 *
 * Validating each item of thousands (as the active vessels) freezes the page on slow computers,
 * while a sample is enough to detect a contract mismatch with the API.
 * Only use it with schemas without transformation (as `parse()` results are not returned).
 */
export function parseSampleOrReturn<T>(body: unknown, schema: z.ZodType<any>, sampleSize: number): T[] {
  if (!Array.isArray(body)) {
    // eslint-disable-next-line no-new
    new FrontendError('Failing validating type', new Error('Expected an array for parsing.'))

    return body as T[]
  }

  const step = Math.max(1, Math.floor(body.length / sampleSize))
  try {
    for (let index = 0; index < body.length && index / step < sampleSize; index += step) {
      schema.parse(body[index], { reportInput: true })
    }
  } catch (error) {
    // eslint-disable-next-line no-new
    new FrontendError('Failing validating type', error)
  }

  return body as T[]
}
