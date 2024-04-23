import { drawReducer } from '@features/Draw/slice'
import { interestPointReducer } from '@features/InterestPoint/slice'
import { measurementReducer } from '@features/Measurement/slice'
import createMigrate from 'redux-persist/es/createMigrate'
import persistReducer from 'redux-persist/es/persistReducer'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/es/storage' // LocalStorage

import { MAIN_PERSISTOR_MISSION_MIGRATIONS } from './migrations'
import { monitorenvApi, monitorfishApi, monitorfishLightApi, monitorfishPublicApi } from '../api/api'
import { beaconMalfunctionReducer } from '../domain/shared_slices/BeaconMalfunction'
import { controlReducer } from '../domain/shared_slices/Control'
import { displayedComponentReducer } from '../domain/shared_slices/DisplayedComponent'
import { displayedErrorReducer } from '../domain/shared_slices/DisplayedError'
import { favoriteVesselReducer } from '../domain/shared_slices/FavoriteVessel'
import { filterReducer } from '../domain/shared_slices/Filter'
import { gearReducer } from '../domain/shared_slices/Gear'
import { infractionReducer } from '../domain/shared_slices/Infraction'
import layer from '../domain/shared_slices/Layer'
import { mapReducer } from '../domain/shared_slices/Map'
import { speciesReducer } from '../domain/shared_slices/Species'
import { vesselSliceReducer } from '../domain/shared_slices/Vessel'
import { regulationReducer } from '../features/BackOffice/slice'
import { controlUnitDialogReducer } from '../features/ControlUnit/components/ControlUnitDialog/slice'
import { controlUnitListDialogPersistedReducer } from '../features/ControlUnit/components/ControlUnitListDialog/slice'
import { customZoneReducer, type CustomZoneState } from '../features/CustomZone/slice'
import { logbookReducer } from '../features/Logbook/slice'
import { mainWindowSliceReducer } from '../features/MainWindow/slice'
import { missionFormReducer } from '../features/Mission/components/MissionForm/slice'
import { missionListReducer, type MissionListState } from '../features/Mission/components/MissionList/slice'
import { priorNotificationReducer, type PriorNotificationState } from '../features/PriorNotification/slice'
import { regulatoryLayerSearchReducer } from '../features/Regulation/components/RegulationSearch/slice'
import { regulatoryReducer } from '../features/Regulation/slice'
import { reportingReducer } from '../features/Reporting/slice'
import { alertReducer } from '../features/SideWindow/Alert/slice'
import { sideWindowReducer } from '../features/SideWindow/slice'
import { stationReducer } from '../features/Station/slice'
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
  [monitorfishPublicApi.reducerPath]: monitorfishPublicApi.reducer,
  [monitorfishLightApi.reducerPath]: monitorfishLightApi.reducer,

  gear: gearReducer,
  mainWindow: mainWindowSliceReducer,
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

  controlUnitDialog: controlUnitDialogReducer,
  controlUnitListDialog: controlUnitListDialogPersistedReducer,
  customZone: persistReducerTyped(
    { ...getCommonPersistReducerConfig<CustomZoneState>('mainPersistorCustomZone', ['zones']) },
    customZoneReducer
  ),
  displayedComponent: displayedComponentReducer,
  displayedError: displayedErrorReducer,
  draw: drawReducer,
  favoriteVessel: favoriteVesselReducer,
  filter: filterReducer,
  fishingActivities: logbookReducer,
  infraction: infractionReducer,
  interestPoint: interestPointReducer,
  layer: layer.homepage.reducer,
  measurement: measurementReducer,
  missionForm: missionFormReducer,
  missionList: persistReducerTyped(
    {
      ...getCommonPersistReducerConfig<MissionListState>('mainPersistorMission', [
        'listFilterValues',
        'listSeafrontGroup'
      ]),
      migrate: createMigrate(MAIN_PERSISTOR_MISSION_MIGRATIONS),
      version: 0
    },
    missionListReducer
  ),
  priorNotification: persistReducerTyped(
    { ...getCommonPersistReducerConfig<PriorNotificationState>('mainPersistorPriorNotification', []) },
    priorNotificationReducer
  ),
  regulatoryLayerSearch: regulatoryLayerSearchReducer,
  reporting: reportingReducer,
  sideWindow: sideWindowReducer,
  station: stationReducer,
  vessel: vesselSliceReducer,
  vesselList: vesselListReducer
}

export const backofficeReducer = {
  ...commonReducerList,
  layer: layer.backoffice.reducer,
  regulation: regulationReducer
}
