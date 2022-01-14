import { backofficeReducers, homeReducers } from './domain/shared_slices'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage' // localStorage
import thunk from 'redux-thunk'
// import { mapToCurrentRegulation } from './domain/entities/regulatory'

/* const RegulationTransform = createTransform(
  // transform state being rehydrated
  (outboundState) => {
    // convert mySet back to a Set.
    return {
      ...outboundState,
      currentRegulation: mapToCurrentRegulation(outboundState.currentRegulation)
    }
  },
  // define which reducers this transform gets called for.
  { whitelist: ['regulation'] }
) */

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2
  // transforms: [RegulationTransform]
}

const homeStore = configureStore({
  reducer: persistReducer(persistConfig, homeReducers),
  middleware: [thunk]
})

const backofficeStore = configureStore({
  reducer: persistReducer(persistConfig, backofficeReducers),
  middleware: [thunk]
})

const homePersistor = persistStore(homeStore)
const backofficePersistor = persistStore(backofficeStore)

export { homeStore, backofficeStore, homePersistor, backofficePersistor }
