import { backofficeReducers, homeReducers } from './domain/shared_slices'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage' // localStorage
import thunk from 'redux-thunk'
import { mapToProcessingRegulation } from './domain/entities/regulatory'

const SetTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState) => inboundState,
  // transform state being rehydrated
  (outboundState) => {
    return { ...outboundState, processingRegulation: mapToProcessingRegulation(outboundState.processingRegulation) }
  },
  // define which reducers this transform gets called for.
  { whitelist: ['regulation'] }
)

const backofficePersistConfig = {
  key: 'backofficePersistor',
  storage,
  stateReconciler: autoMergeLevel2,
  transforms: [SetTransform],
  whitelist: ['regulation']
}

const homeStore = configureStore({
  reducer: homeReducers,
  middleware: [thunk]
})

const backofficeStore = configureStore({
  reducer: persistReducer(backofficePersistConfig, backofficeReducers),
  middleware: [thunk]
})

const backofficePersistor = persistStore(backofficeStore)

export { homeStore, backofficeStore, backofficePersistor }
