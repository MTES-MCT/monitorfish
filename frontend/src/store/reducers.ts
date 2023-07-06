import persistReducer from 'redux-persist/es/persistReducer'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/es/storage' // LocalStorage

import { monitorenvApi, monitorfishApi } from '../api'
import { alertReducer } from '../domain/shared_slices/Alert'
import { beaconMalfunctionReducer } from '../domain/shared_slices/BeaconMalfunction'
import { controlReducer } from '../domain/shared_slices/Control'
import { displayedComponentReducer } from '../domain/shared_slices/DisplayedComponent'
import { displayedErrorReducer } from '../domain/shared_slices/DisplayedError'
import { drawReducer } from '../domain/shared_slices/Draw'
import { favoriteVesselReducer } from '../domain/shared_slices/FavoriteVessel'
import { filterReducer } from '../domain/shared_slices/Filter'
import { fishingActivitiesReducer } from '../domain/shared_slices/FishingActivities'
import { fleetSegmentReducer } from '../domain/shared_slices/FleetSegment'
import { gearReducer } from '../domain/shared_slices/Gear'
import { globalSliceReducer } from '../domain/shared_slices/Global'
import { infractionReducer } from '../domain/shared_slices/Infraction'
import { interestPointReducer } from '../domain/shared_slices/InterestPoint'
import layer from '../domain/shared_slices/Layer'
import { mapReducer } from '../domain/shared_slices/Map'
import { measurementReducer } from '../domain/shared_slices/Measurement'
import { missionReducer, type MissionState } from '../domain/shared_slices/Mission'
import { regulatoryReducer } from '../domain/shared_slices/Regulatory'
import { reportingReducer } from '../domain/shared_slices/Reporting'
import { sideWindowReducer } from '../domain/shared_slices/SideWindow'
import { speciesReducer } from '../domain/shared_slices/Species'
import { vesselSliceReducer } from '../domain/shared_slices/Vessel'
import { regulationReducer } from '../features/Backoffice/slice'
import { regulatoryLayerSearchReducer } from '../features/MapButtons/LayersSidebar/RegulatoryZones/search/slice'
import { vesselListReducer } from '../features/VesselList/slice'

import type { Reducer } from 'redux'
import type { PersistConfig } from 'redux-persist'

const persistReducerTyped: <S>(config: PersistConfig<S>, baseReducer: Reducer<S>) => Reducer<S> = persistReducer as any

// We do that to "type" the persisted reducer
const getCommonPersistReducerConfig = <S>(key: string, whitelist?: Array<keyof S>): PersistConfig<S> => ({
  key,
  stateReconciler: autoMergeLevel2,
  storage,
  ...(whitelist ? ({ whitelist } as any) : {})
})

const commonReducerList = {
  [monitorfishApi.reducerPath]: monitorfishApi.reducer,

  gear: gearReducer,
  global: globalSliceReducer,
  map: mapReducer,
  regulatory: regulatoryReducer,
  species: speciesReducer
}

export const mainReducer = {
  [monitorenvApi.reducerPath]: monitorenvApi.reducer,

  ...commonReducerList,
  alert: alertReducer,
  beaconMalfunction: beaconMalfunctionReducer,
  //  TODO Pass that to singular.
  controls: controlReducer,
  displayedComponent: displayedComponentReducer,
  displayedError: displayedErrorReducer,
  draw: drawReducer,
  favoriteVessel: favoriteVesselReducer,
  filter: filterReducer,
  fishingActivities: fishingActivitiesReducer,
  fleetSegment: fleetSegmentReducer,
  infraction: infractionReducer,
  interestPoint: interestPointReducer,
  layer: layer.homepage.reducer,
  measurement: measurementReducer,
  mission: persistReducerTyped(
    { ...getCommonPersistReducerConfig<MissionState>('mainPersistorMission', ['listFilterValues', 'listSeaFront']) },
    missionReducer
  ),
  regulatoryLayerSearch: regulatoryLayerSearchReducer,
  reporting: reportingReducer,
  sideWindow: sideWindowReducer,
  vessel: vesselSliceReducer,
  vesselList: vesselListReducer
}

export const backofficeReducer = {
  ...commonReducerList,
  fleetSegment: fleetSegmentReducer,
  layer: layer.backoffice.reducer,
  regulation: regulationReducer
}
