import type { HomeRootState } from './store'
import type { AnyAction } from 'redux'
import type { ThunkAction } from 'redux-thunk'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, HomeRootState, unknown, AnyAction>

export type DateRange = [Date, Date]

export type Option<V = string> = {
  label: string
  value: V
}
