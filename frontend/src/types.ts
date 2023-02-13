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

export type MenuItem<T = string> = {
  code: T
  name: string
}

export type PartialExcept<T extends Record<string, any>, RequiredKeys extends keyof T> = Partial<
  Omit<T, RequiredKeys>
> &
  Pick<T, RequiredKeys>

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
