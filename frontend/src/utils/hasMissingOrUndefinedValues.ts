import { filter, hasIn, pick, pipe, values } from 'ramda'
import { isUndefined } from 'ramda-adjunct'

import type { Undefine } from '../types'

const hasAllIn = <T extends Record<string, any>>(props: Array<keyof T>, record: T) =>
  !props.map(prop => hasIn(String(prop), record)).includes(false)
const listRecordUndefinedValues: (record: Record<string, any>) => undefined[] = pipe(values, filter<any>(isUndefined))

export function hasMissingOrUndefinedValues<T extends Record<string, any>>(
  requiredProps: Array<keyof T>,
  record: Partial<Undefine<T>>
): record is Required<T> {
  const sortedRequiredProps = requiredProps.sort()

  if (!hasAllIn<Partial<Undefine<T>>>(sortedRequiredProps, record)) {
    return true
  }

  const requiredPropsRecord = pick(requiredProps, record)

  const undefinedValues = listRecordUndefinedValues(requiredPropsRecord)

  return undefinedValues.length > 0
}
