import { monitorenvApi, monitorfishApi, monitorfishLightApi, monitorfishPublicApi } from '@api/api'
import { alertReducer } from '@features/Alert/components/SideWindowAlerts/slice'
import { controlUnitDialogReducer } from '@features/ControlUnit/components/ControlUnitDialog/slice'
import { controlUnitListDialogPersistedReducer } from '@features/ControlUnit/components/ControlUnitListDialog/slice'
import { customZoneReducer, type CustomZoneState } from '@features/CustomZone/slice'
import { drawReducer } from '@features/Draw/slice'
import { favoriteVesselReducer } from '@features/FavoriteVessel/slice'
import { interestPointReducer } from '@features/InterestPoint/slice'
import { logbookReducer, type LogbookState } from '@features/Logbook/slice'
import { mainWindowReducer } from '@features/MainWindow/slice'
import { layerReducer, type LayerState } from '@features/Map/layer.slice'
import { backOfficeLayerReducer } from '@features/Map/layer.slice.backoffice'
import { mapReducer } from '@features/Map/slice'
import { measurementReducer, type MeasurementState } from '@features/Measurement/slice'
import { missionFormReducer } from '@features/Mission/components/MissionForm/slice'
import { missionListReducer, type MissionListState } from '@features/Mission/components/MissionList/slice'
import { newFeaturesReducer, type NewFeaturesState } from '@features/NewFeatures/slice'
import { priorNotificationReducer, type PriorNotificationState } from '@features/PriorNotification/slice'
import { backofficePriorNotificationReducer } from '@features/PriorNotification/slice.backoffice'
import { backofficeProducerOrganizationMembershipReducer } from '@features/ProducerOrganizationMembership/slice.backoffice'
import { regulatoryLayerSearchReducer } from '@features/Regulation/components/RegulationSearch/slice'
import { regulationReducer, type RegulationState } from '@features/Regulation/slice'
import { reportingTableFiltersReducer } from '@features/Reporting/components/ReportingTable/Filters/slice'
import { reportingReducer } from '@features/Reporting/slice'
import { sideWindowReducer } from '@features/SideWindow/slice'
import { stationReducer } from '@features/Station/slice'
import { vesselListReducer } from '@features/Vessel/components/VesselList/slice'
import { controlReducer } from '@features/Vessel/components/VesselSidebar/control.slice'
import { vesselReducer } from '@features/Vessel/slice'
import { filterReducer, type VesselFilterState } from '@features/VesselFilter/slice'
import { beaconMalfunctionReducer } from 'domain/shared_slices/BeaconMalfunction'
import { displayedComponentReducer } from 'domain/shared_slices/DisplayedComponent'
import { displayedErrorReducer } from 'domain/shared_slices/DisplayedError'
import { gearReducer } from 'domain/shared_slices/Gear'
import { globalSliceReducer } from 'domain/shared_slices/Global'
import { infractionReducer } from 'domain/shared_slices/Infraction'
import { speciesReducer } from 'domain/shared_slices/Species'
import createMigrate from 'redux-persist/es/createMigrate'
import persistReducer from 'redux-persist/es/persistReducer'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/es/storage' // LocalStorage

import { MAIN_PERSISTOR_MISSION_MIGRATIONS } from './migrations'

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
  [monitorenvApi.reducerPath]: monitorenvApi.reducer,
  [monitorfishApi.reducerPath]: monitorfishApi.reducer,
  [monitorfishPublicApi.reducerPath]: monitorfishPublicApi.reducer,

  displayedError: displayedErrorReducer,
  gear: gearReducer,
  global: globalSliceReducer,
  map: mapReducer,
  regulation: persistReducerTyped(
    { ...getCommonPersistReducerConfig<RegulationState>('backofficePersistorRegulation', ['processingRegulation']) },
    regulationReducer
  ),
  species: speciesReducer
}

export const mainReducer = {
  ...commonReducerList,

  [monitorfishLightApi.reducerPath]: monitorfishLightApi.reducer,

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
  draw: drawReducer,
  favoriteVessel: favoriteVesselReducer,
  filter: persistReducerTyped(
    {
      ...getCommonPersistReducerConfig<VesselFilterState>('mainPersistorFilter', [
        'filters',
        'nonFilteredVesselsAreHidden'
      ])
    },
    filterReducer
  ),
  fishingActivities: persistReducerTyped(
    { ...getCommonPersistReducerConfig<LogbookState>('mainPersistorLogbook', ['areFishingActivitiesShowedOnMap']) },
    logbookReducer
  ),
  infraction: infractionReducer,
  interestPoint: interestPointReducer,
  layer: persistReducerTyped(
    { ...getCommonPersistReducerConfig<LayerState>('mainPersistorLayer', ['isBaseMapCachedLocally']) },
    layerReducer
  ),
  mainWindow: mainWindowReducer,
  measurement: persistReducerTyped(
    { ...getCommonPersistReducerConfig<MeasurementState>('mainPersistorMeasurement', ['measurementsDrawed']) },
    measurementReducer
  ),
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
  newFeatures: persistReducerTyped(
    { ...getCommonPersistReducerConfig<NewFeaturesState>('mainPersistorNewFeatures', ['checkedFeatures']) },
    newFeaturesReducer
  ),
  priorNotification: persistReducerTyped(
    {
      ...getCommonPersistReducerConfig<PriorNotificationState>('mainPersistorPriorNotification', ['listFilterValues'])
    },
    priorNotificationReducer
  ),
  regulatoryLayerSearch: regulatoryLayerSearchReducer,
  reporting: reportingReducer,
  reportingTableFilters: reportingTableFiltersReducer,
  sideWindow: sideWindowReducer,
  station: stationReducer,
  vessel: vesselReducer,
  vesselList: vesselListReducer
}

export const backofficeReducer = {
  ...commonReducerList,

  layer: backOfficeLayerReducer,
  priorNotification: backofficePriorNotificationReducer,
  producerOrganizationMembership: backofficeProducerOrganizationMembershipReducer
}
