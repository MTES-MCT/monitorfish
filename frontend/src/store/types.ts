import type { ThunkAction, AnyAction } from '@reduxjs/toolkit'
import type { BackofficeAppDispatch, BackofficeRootState, MainAppDispatch, MainRootState } from '@store'

// These schemas are used for store-hybrid thunks (use cases)
export type HybridRootState = MainRootState | BackofficeRootState
export type HybridAppDispatch = MainAppDispatch | BackofficeAppDispatch

export type HybridAppThunk<R = void> = ThunkAction<R, HybridRootState, undefined, AnyAction>
