/* eslint-disable no-null/no-null */

import { fromPairs, map, pipe, toPairs } from 'ramda'

import { isArray } from './isArray'
import { isObject } from './isObject'
import { FrontendError } from '../libs/FrontendError'

import type { NativeAny, NativeArray, NativeObject } from '@mtes-mct/monitor-ui'

type Nullify<T> = T extends undefined
  ? null
  : T extends Array<any>
    ? {
        [K in keyof T]: T[K] extends (infer U)[] ? Nullify<U>[] : Nullify<T[K]>
      }
    : T extends Record<string, any>
      ? {
          [K in keyof T]: T[K] extends (infer U)[] ? Nullify<U>[] : Nullify<T[K]>
        }
      : T

const nullifyArrayValues = <T extends NativeArray>(list: T): Nullify<T> => list.map(nullify as any) as any

const nullifyObjectProps = <T extends NativeObject>(record: T): Nullify<T> =>
  pipe(toPairs as any, map(nullifyObjectPropPair), fromPairs as any)(record) as any
const nullifyObjectPropPair = ([key, value]: [string, NativeAny]) => [key, nullify(value as any)]

/**
 * Transform all `undefined` values into `null` ones in any type of value
 *
 * @description
 * The value must be of native type and only contains native types.
 */
export function nullify<T extends NativeAny>(value: T): Nullify<T> | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'object') {
    if (isArray<NativeArray>(value)) {
      return nullifyArrayValues(value) as any
    }

    if (isObject<NativeObject>(value)) {
      return nullifyObjectProps(value) as any
    }

    throw new FrontendError(`Can't handle type \`${(value as Object).constructor.name}\`.`)
  }

  return value as any
}
