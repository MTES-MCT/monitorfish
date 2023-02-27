/* eslint-disable no-null/no-null */

import { fromPairs, map, pipe, toPairs } from 'ramda'

import { isArray } from './isArray'
import { isObject } from './isObject'
import { FrontendError } from '../libs/FrontendError'

import type { NativeAny, NativeArray, NativeObject } from '../types'

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

const undefinedizeArrayValues = <T extends NativeArray>(list: T): Undefinedized<T> =>
  list.map(undefinedize as any) as any

const undefinedizeObjectProps = <T extends NativeObject>(record: T): Undefinedized<T> =>
  pipe(toPairs as any, map(undefinedizeObjectPropPair), fromPairs as any)(record) as any
const undefinedizeObjectPropPair = ([key, value]: [string, NativeAny]) => [key, undefinedize(value as any)]

/**
 * Transform all `null` values into `undefined` ones in any type of value
 *
 * @description
 * The value must be of native type and only contains native types.
 */
export function undefinedize<T extends NativeAny>(value: T): Undefinedized<T> | undefined {
  // console.debug(value)

  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'object') {
    if (isArray<NativeArray>(value)) {
      return undefinedizeArrayValues(value) as any
    }

    if (isObject<NativeObject>(value)) {
      return undefinedizeObjectProps(value) as any
    }

    throw new FrontendError(`Can't handle type \`${(value as Object).constructor.name}\`.`, 'undefinedize()')
  }

  return value as any
}
