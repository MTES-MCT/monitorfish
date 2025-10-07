import { FrontendError } from '@libs/FrontendError'
import { z } from 'zod'

export function parseResponseOrReturn<T>(body: unknown, schema: z.ZodType<any>, isArray: false): T
export function parseResponseOrReturn<T>(body: unknown, schema: z.ZodType<any>, isArray: true): T[]
export function parseResponseOrReturn<T>(body: unknown, schema: z.ZodType<any>, isArray: boolean): T | T[] {
  try {
    if (!isArray) {
      return schema.parse(body)
    }

    if (!Array.isArray(body)) {
      throw new Error('Expected an array for parsing.')
    }

    return body.map(bodyElement => schema.parse(bodyElement))
  } catch (e) {
    // eslint-disable-next-line no-new
    new FrontendError('Failing validating type', e)

    return body as T | T[]
  }
}
