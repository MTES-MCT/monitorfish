/**
 * Redux Store with Redux Toolkit & RTK Query
 *
 * @see https://redux-toolkit.js.org/tutorials/typescript
 * @see https://redux-toolkit.js.org/tutorials/rtk-query#add-the-service-to-your-store
 */

// TODO Make a single store with all reducers and apply the `persistReducer()` per reducer in the combined reducer list.

import { combineReducers, configureStore, isPlain } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
  createTransform,
  FLUSH,
  PAUSE,
  PERSIST,
  persistStore,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE
} from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage' // localStorage

import { missionApi } from './api/mission'
import { mapToProcessingRegulation } from './domain/entities/regulatory'
import { backofficeReducers, homeReducers } from './domain/shared_slices'

import type { FleetSegmentState } from './domain/shared_slices/FleetSegment'
import type { GearState } from './domain/shared_slices/Gear'
import type { GlobalState } from './domain/shared_slices/Global'
import type { LayerState } from './domain/shared_slices/Layer'
import type { MapState } from './domain/shared_slices/Map'
import type { RegulatoryState } from './domain/shared_slices/Regulatory'
import type { SpecyState } from './domain/shared_slices/Species'
import type { CombinedState } from '@reduxjs/toolkit'

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

const backofficePersistConfig = {
  blacklist: [missionApi.reducerPath],
  key: 'backofficePersistor',
  stateReconciler: autoMergeLevel2,
  storage,
  transforms: [SetTransform],
  whitelist: ['regulation']
}

const homeStore = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // TODO Create a Redux middleware to properly serialize/deserialize `Date`, `Error` objects into plain objects.
      // https://redux-toolkit.js.org/api/serializabilityMiddleware
      serializableCheck: {
        isSerializable: (value: any) => isPlain(value) || value instanceof Date || value instanceof Error
      }
    }).concat(missionApi.middleware),
  reducer: homeReducers
})
setupListeners(homeStore.dispatch)

// https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
const combinedBackofficeReducers = combineReducers(backofficeReducers)
const persistedReducer = persistReducer<
  CombinedState<{
    fleetSegment: FleetSegmentState
    gear: GearState
    global: GlobalState
    layer: LayerState
    map: MapState
    regulation: any
    regulatory: RegulatoryState
    species: SpecyState
  }>
>(backofficePersistConfig, combinedBackofficeReducers)
const backofficeStore = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        isSerializable: (value: any) => isPlain(value) || value instanceof Date || value instanceof Error
      }
    }),
  reducer: persistedReducer
})

const backofficePersistor = persistStore(backofficeStore)

export { homeStore, backofficeStore, backofficePersistor }

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `RootState` and `AppDispatch` types from the store itself
export type HomeRootState = ReturnType<typeof homeStore.getState>
// Inferred type: { global: GlobalState, vessel: VesselState, ... }
export type AppDispatch = typeof homeStore.dispatch
export type AppGetState = typeof homeStore.getState
