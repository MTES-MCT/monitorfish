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

export type Option<V = string> = {
  label: string
  value: V
}

export type MenuItem<T = string> = {
  code: T
  name: string
}

export type PickStringKeysWithNativeValues<T extends Record<any, any>> = Exact<
  {
    [Key in string & ConditionalKeys<T, Native>]: T[Key]
  },
  T
>
