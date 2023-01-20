/**
 * Redux Store with Redux Toolkit & RTK Query
 *
 * @see https://redux-toolkit.js.org/tutorials/typescript
 * @see https://redux-toolkit.js.org/tutorials/rtk-query#add-the-service-to-your-store
 */

// TODO We shouldn't have 2 stores, it's better to persist each root slice reducer. This is a bad pattern:
// https://redux.js.org/faq/store-setup#can-or-should-i-create-multiple-stores-can-i-import-my-store-directly-and-use-it-in-components-myself

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
// Common Store

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

export const store = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(missionApi.middleware),
  reducer: rootReducer
})
setupListeners(store.dispatch)

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, undefined, AnyAction>
export type RootState = ReturnType<typeof store.getState>

// =============================================================================
// Persisted Store
// https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist

const persistedReducerConfig: PersistConfig<typeof persistedRootReducer> = {
  key: 'backofficePersistor',
  stateReconciler: autoMergeLevel2,
  storage,
  transforms: [SetTransform],
  whitelist: ['regulation']
}

const persistedReducer = persistReducer(persistedReducerConfig, combineReducers(persistedRootReducer))

export const persistedStore = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        isSerializable: (value: any) => isPlain(value) || value instanceof Date || value instanceof Error
      }
    }),
  reducer: persistedReducer
})

export const persistedStorePersistor = persistStore(persistedStore)

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
export type PersistedAppDispatch = typeof persistedStore.dispatch
export type PersistedAppThunk<ReturnType = void> = ThunkAction<ReturnType, PersistedRootState, unknown, AnyAction>
export type PersistedRootState = ReturnType<typeof persistedStore.getState>
