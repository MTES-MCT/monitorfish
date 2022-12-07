/**
 * Redux Store with Redux Toolkit & RTK Query
 *
 * @see https://redux-toolkit.js.org/tutorials/typescript
 * @see https://redux-toolkit.js.org/tutorials/rtk-query#add-the-service-to-your-store
 */

import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { createTransform, persistReducer, persistStore } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage' // localStorage

import { missionApi } from './api/mission'
import { mapToProcessingRegulation } from './domain/entities/regulatory'
import { backofficeReducers, homeReducers } from './domain/shared_slices'

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
  key: 'backofficePersistor',
  stateReconciler: autoMergeLevel2,
  storage,
  transforms: [SetTransform],
  whitelist: ['regulation']
}

// TODO Why 2 stores?
const homeStore = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(missionApi.middleware),
  reducer: homeReducers
})
setupListeners(homeStore.dispatch)

const backofficeStore = configureStore({
  // TODO Properly type all reducer states.
  reducer: persistReducer(backofficePersistConfig, backofficeReducers as any)
})

// TODO Either use a single persisted store or use another mechanism (like a middleware in a single store).
const backofficePersistor = persistStore(backofficeStore)

export { homeStore, backofficeStore, backofficePersistor }

// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `RootState` and `AppDispatch` types from the store itself
export type HomeRootState = ReturnType<typeof homeStore.getState>
// Inferred type: { global: GlobalState, vessel: VesselState, ... }
export type AppDispatch = typeof homeStore.dispatch
export type AppGetState = typeof homeStore.getState
