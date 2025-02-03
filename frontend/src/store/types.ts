import type { BackofficeAppDispatch, BackofficeAppThunk, MainAppDispatch, MainAppThunk } from '@store'

// These schemas are used for store-hybrid thunks (use cases)
export type HybridAppDispatch = BackofficeAppDispatch | MainAppDispatch
export type HybridAppThunk<T extends HybridAppDispatch, R = void> = T extends BackofficeAppDispatch
  ? BackofficeAppThunk<R>
  : MainAppThunk<R>
