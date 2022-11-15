import type { HomeRootState } from './store'
import type { AnyAction } from 'redux'
import type { ThunkAction } from 'redux-thunk'
import type { ConditionalKeys, Exact } from 'type-fest'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, HomeRootState, unknown, AnyAction>

export type CollectionItem = {
  [key: string]: any
  id: number | string
}

export type DateRange = [Date, Date]

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
