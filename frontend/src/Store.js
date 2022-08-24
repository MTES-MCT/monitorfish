import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage' // localStorage
import thunk from 'redux-thunk'

import { mapToProcessingRegulation } from './domain/entities/regulatory'
import { backofficeReducers, homeReducers } from './domain/shared_slices'

const SetTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  inboundState => inboundState,
  // transform state being rehydrated
  outboundState => ({
    ...outboundState,
    processingRegulation: mapToProcessingRegulation(outboundState.processingRegulation),
  }),
  // define which reducers this transform gets called for.
  { whitelist: ['regulation'] },
)

const backofficePersistConfig = {
  key: 'backofficePersistor',
  stateReconciler: autoMergeLevel2,
  storage,
  transforms: [SetTransform],
  whitelist: ['regulation'],
}

const homeStore = configureStore({
  middleware: [thunk],
  reducer: homeReducers,
})

const backofficeStore = configureStore({
  middleware: [thunk],
  reducer: persistReducer(backofficePersistConfig, backofficeReducers),
})

const backofficePersistor = persistStore(backofficeStore)

export { homeStore, backofficeStore, backofficePersistor }
