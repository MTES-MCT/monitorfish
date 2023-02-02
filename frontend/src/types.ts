import type { ConditionalKeys, Exact } from 'type-fest'

export type CollectionItem = {
  [key: string]: any
  id: number | string
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export type Native = boolean | null | number | string | undefined
export type NativeAny = boolean | NativeArray | NativeObject | null | number | string | undefined
export type NativeArray = Array<NativeAny>
export type NativeObject = { [x: string]: NativeAny } | {}

export type Option<V = string> = {
  label: string
  value: V
}

export type MenuItem<T = string> = {
  code: T
  name: string
}

export type PickStringKeys<T extends Record<any, any>> = Exact<
  {
    [Key in string]: T[Key]
  },
  T
>

export type PickStringKeysWithNativeValues<T extends Record<any, any>> = Exact<
  {
    [Key in string & ConditionalKeys<T, Native>]: T[Key]
  },
  T
>

export type StringKeyRecord<T> = PickStringKeys<Record<string, T>>

/**
 * Mark all the props type of an interface or a type as `| undefined`
 *
 * @description
 * Since `exactOptionalPropertyTypes` is enabled in tsconfig.json,
 * this is useful to create "partial" objects while keeping their props mandatory.
 */
export type Undefine<T> = {
  [K in keyof T]: T[K] | undefined
}
