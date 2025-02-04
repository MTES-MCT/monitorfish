/**
 * Redux Store with Redux Toolkit & RTK Query
 *
 * @see https://redux-toolkit.js.org/tutorials/typescript
 * @see https://redux-toolkit.js.org/tutorials/rtk-query#add-the-service-to-your-store
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { createTransform, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import persistReducer from 'redux-persist/es/persistReducer'
import persistStore from 'redux-persist/es/persistStore'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/es/storage' // LocalStorage

import { backofficeReducer, mainReducer } from './reducers'
import { monitorenvApi, monitorfishApi, monitorfishLightApi, monitorfishPublicApi } from '../api/api'
import { mapToProcessingRegulation } from '../features/Regulation/utils'

import type { RegulationState } from '../features/Regulation/slice'
import type { AnyAction } from '@reduxjs/toolkit'
import type { PersistConfig } from 'redux-persist'
import type { ThunkAction } from 'redux-thunk'

// =============================================================================
// Main Store

const persistedMainReducerConfig: PersistConfig<typeof backofficeReducer> = {
  key: 'mainPersistor',
  stateReconciler: autoMergeLevel2,
  storage,
  whitelist: []
}
const persistedMainReducer = persistReducer(
  persistedMainReducerConfig,
  combineReducers(mainReducer) as any
) as unknown as typeof mainReducer

export const mainStore = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      // TODO Replace all Redux state Dates by strings & Error by a strict-typed POJO.
      serializableCheck: false
    }).concat(
      monitorenvApi.middleware,
      monitorfishApi.middleware,
      monitorfishPublicApi.middleware,
      monitorfishLightApi.middleware
    ),
  reducer: persistedMainReducer
})
setupListeners(mainStore.dispatch)

export const mainStorePersistor = persistStore(mainStore)

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `MainRootState` and `AppDispatch` types from the store itself
export type MainAppDispatch = typeof mainStore.dispatch
export type MainAppGetState = () => MainRootState
export type MainAppThunk<ReturnType = void> = ThunkAction<ReturnType, MainRootState, undefined, AnyAction>
export type MainRootState = ReturnType<typeof mainStore.getState>
export type MainAppUseCase = () => MainAppThunk
export type MainAppAsyncThunk<ReturnType = void> = MainAppThunk<Promise<ReturnType>>

// =============================================================================
// Backoffice Store
// https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist

const SetRegulationStateTransform = createTransform<RegulationState, RegulationState>(
  // Transform state on its way to being serialized and persisted.
  inboundState => inboundState,
  // Transform state being rehydrated
  outboundState => ({
    ...outboundState,
    processingRegulation: mapToProcessingRegulation(outboundState.processingRegulation)
  }),
  // Define which reducers this transform gets called for.
  { whitelist: ['regulation'] }
)

const persistedBackofficeReducerConfig: PersistConfig<typeof backofficeReducer> = {
  key: 'backofficePersistor',
  stateReconciler: autoMergeLevel2,
  storage,
  transforms: [SetRegulationStateTransform],
  whitelist: []
}
const persistedBackofficeReducer = persistReducer(
  persistedBackofficeReducerConfig,
  combineReducers(backofficeReducer) as any
) as unknown as typeof backofficeReducer

export const backofficeStore = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        immutableCheck: false,
        // TODO Replace all Redux state Dates by strings & Error by a strict-typed POJO.
        serializableCheck: false
      }
    }).concat(monitorenvApi.middleware, monitorfishApi.middleware),
  reducer: persistedBackofficeReducer
})

export const backofficeStorePersistor = persistStore(backofficeStore)

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
export type BackofficeAppDispatch = typeof backofficeStore.dispatch
export type BackofficeAppGetState = () => BackofficeRootState
export type BackofficeAppThunk<ReturnType = void> = ThunkAction<ReturnType, BackofficeRootState, unknown, AnyAction>
export type BackofficeRootState = ReturnType<typeof backofficeStore.getState>
export type BackofficeAppPromiseThunk<ReturnType = void> = BackofficeAppThunk<Promise<ReturnType>>
