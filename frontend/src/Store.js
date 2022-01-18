import { backofficeReducers, homeReducers } from './domain/shared_slices'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage' // localStorage
import thunk from 'redux-thunk'

const commonConfig = {
  storage,
  stateReconciler: autoMergeLevel2
}

const backofficePersistConfig = {
  key: 'backofficePersistor',
  ...commonConfig
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
