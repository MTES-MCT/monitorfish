/* eslint-disable no-null/no-null */

import { fromPairs, pipe, toPairs } from 'ramda'

import { FrontendError } from '../libs/FrontendError'

import type { Native } from '../types'

type NativeAny = Native | Native[] | Record<string, Native>

type Undefinedized<T> = T extends null
  ? undefined
  : T extends Array<any>
  ? {
      [K in keyof T]: T[K] extends (infer U)[] ? Undefinedized<U>[] : Undefinedized<T[K]>
    }
  : T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends (infer U)[] ? Undefinedized<U>[] : Undefinedized<T[K]>
    }
  : T

const undefinedizeArrayValues = <T extends Array<NativeAny>>(list: T): Undefinedized<T> => list.map(undefinedize) as any

const undefinedizeObjectProps = <T extends Record<string, Native>>(record: T): Undefinedized<T> =>
  pipe(toPairs as any, undefinedizeObjectPropPair, fromPairs as any)(record) as any
const undefinedizeObjectPropPair = ([key, value]: [string, NativeAny]) => [key, undefinedize(value)]

const isPoja = (record: NativeAny): record is Native[] =>
  typeof record === 'object' && record !== null && Array.isArray(record)
const isPojo = (record: NativeAny): record is Record<string, Native> =>
  typeof record === 'object' && record !== null && !Array.isArray(record) && record.constructor.name === 'Object'

/**
 * Transform all `null` values into `undefined` ones in any type of value
 */
export function undefinedize<T extends NativeAny>(value: T): Undefinedized<T> | undefined {
  if (value === null) {
    return undefined
  }

  if (typeof value === 'object') {
    if (isPoja(value)) {
      return undefinedizeArrayValues(value)
    }

    if (isPojo(value)) {
      return undefinedizeObjectProps(value)
    }

    throw new FrontendError(
      `Can't handle type \`${(value as Object).constructor.name}\`.`,
      'utils/coerceNullToUndefined.ts > coerceNullToUndefined()'
    )
  }

  return value as any
}
