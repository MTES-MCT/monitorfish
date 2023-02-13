import { hasIn } from 'ramda'

import { FormError, FormErrorCode } from '../libs/FormError'
import { FrontendError } from '../libs/FrontendError'

import type { Undefine } from '@mtes-mct/monitor-ui'

const ERROR_PATH = 'utils/validateRequiredFormValues.ts'

export function validateRequiredFormValues<T extends Record<string, any>>(
  requiredProps: Array<keyof T>,
  record: Partial<Undefine<T>>
): [validRecord: T, formError: undefined] | [validRecord: undefined, formError: FormError<T>] {
  try {
    const sortedRequiredProps = requiredProps.sort()

    sortedRequiredProps.forEach(prop => {
      if (!hasIn(String(prop), record)) {
        throw new FormError(record, prop, FormErrorCode.MISSING)
      }

      if (record[prop] === undefined || record[prop] === null) {
        throw new FormError(record, prop, FormErrorCode.UNDEFINED)
      }
    })

    return [record as T, undefined]
  } catch (err: any) {
    if (!(err instanceof FormError)) {
      throw new FrontendError('`err` is not an instance of `FormError`. This should never happen.', ERROR_PATH, err)
    }

    return [undefined, err]
  }
}
