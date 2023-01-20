/**
 * Redux Store with Redux Toolkit & RTK Query
 *
 * @see https://redux-toolkit.js.org/tutorials/typescript
 * @see https://redux-toolkit.js.org/tutorials/rtk-query#add-the-service-to-your-store
 */

import { combineReducers, configureStore, isPlain } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { createTransform, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import persistReducer from 'redux-persist/es/persistReducer'
import persistStore from 'redux-persist/es/persistStore'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/es/storage' // LocalStorage

import { missionApi } from '../api/mission'
import { mapToProcessingRegulation } from '../domain/entities/regulation'
import { persistedRootReducer, rootReducer } from '../domain/shared_slices'

import type { AnyAction } from '@reduxjs/toolkit'
import type { PersistConfig } from 'redux-persist'
import type { ThunkAction } from 'redux-thunk'

// =============================================================================
// Main Store

export const mainStore = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(missionApi.middleware),
  reducer: rootReducer
})
setupListeners(mainStore.dispatch)

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `MainRootState` and `AppDispatch` types from the store itself
export type MainAppDispatch = typeof mainStore.dispatch
export type MainAppThunk<ReturnType = void> = ThunkAction<ReturnType, MainRootState, undefined, AnyAction>
export type MainRootState = ReturnType<typeof mainStore.getState>

// =============================================================================
// Backoffice Store
// https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist

// TODO Properly type this generic. No any.
const SetTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  inboundState => inboundState,
  // transform state being rehydrated
  (outboundState: any) => ({
    ...outboundState,
    processingRegulation: mapToProcessingRegulation(outboundState.processingRegulation)
  }),
  // define which reducers this transform gets called for.
  { whitelist: ['regulation'] }
)

const persistedReducerConfig: PersistConfig<typeof persistedRootReducer> = {
  key: 'backofficePersistor',
  stateReconciler: autoMergeLevel2,
  storage,
  transforms: [SetTransform],
  whitelist: ['regulation']
}

const persistedReducer = persistReducer(persistedReducerConfig, combineReducers(persistedRootReducer))

export const backofficeStore = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        isSerializable: (value: any) => isPlain(value) || value instanceof Date || value instanceof Error
      }
    }),
  reducer: persistedReducer
})

export const backofficeStorePersistor = persistStore(backofficeStore)

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
export type BackofficeAppDispatch = typeof backofficeStore.dispatch
export type BackofficeAppThunk<ReturnType = void> = ThunkAction<ReturnType, BackofficeRootState, unknown, AnyAction>
export type BackofficeRootState = ReturnType<typeof backofficeStore.getState>
