import { hasIn } from 'ramda'

import { FormError, FormErrorCode } from '../libs/FormError'
import { FrontendError } from '../libs/FrontendError'

import type { Undefine } from '@mtes-mct/monitor-ui'

export function validateNonEmptyFormValues<T extends Record<string, any>>(
  requiredProps: Array<keyof T>,
  record: Partial<Undefine<T>>
): [validRecord: T, formError: undefined] | [validRecord: undefined, formError: FormError<T>] {
  try {
    const sortedRequiredProps = requiredProps.sort()

    sortedRequiredProps.forEach(prop => {
      if (!hasIn(String(prop), record)) {
        throw new FormError(record, prop, FormErrorCode.MISSING)
      }

      const value = record[prop]

      if (value === undefined || value === null) {
        throw new FormError(record, prop, FormErrorCode.UNDEFINED)
      }

      if (!Array.isArray(value)) {
        throw new FormError(record, prop, FormErrorCode.TYPE_ARRAY)
      }

      if (value.length === 0) {
        throw new FormError(record, prop, FormErrorCode.EMPTY_ARRAY)
      }
    })

    return [record as T, undefined]
  } catch (err: any) {
    if (!(err instanceof FormError)) {
      throw new FrontendError('`err` is not an instance of `FormError`', err)
    }

    return [undefined, err]
  }
}
