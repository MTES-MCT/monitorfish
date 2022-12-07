import { combineReducers } from '@reduxjs/toolkit'

import { missionApi } from '../../api/mission'
import regulation from '../../features/backoffice/Regulation.slice'
import regulatoryLayerSearch from '../../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import vesselList from '../../features/vessel_list/VesselList.slice'
import { alertReducer } from './Alert'
import { beaconMalfunctionReducer } from './BeaconMalfunction'
import { controlReducer } from './Control'
import { favoriteVesselReducer } from './FavoriteVessel'
import { filterReducer } from './Filter'
import { fishingActivitiesReducer } from './FishingActivities'
import { fleetSegmentReducer } from './FleetSegment'
import { gearReducer } from './Gear'
import { globalSliceReducer } from './Global'
import { infractionReducer } from './Infraction'
import { interestPointReducer } from './InterestPoint'
import layer from './Layer'
import { mapReducer } from './Map'
import { measurementReducer } from './Measurement'
import { regulatoryReducer } from './Regulatory'
import { reportingReducer } from './Reporting'
import { speciesReducer } from './Species'
import { vesselSliceReducer } from './Vessel'

const commonReducerList = {
  gear: gearReducer,
  global: globalSliceReducer,
  map: mapReducer,
  regulatory: regulatoryReducer,
  species: speciesReducer
}

const homeReducers = combineReducers({
  ...commonReducerList,
  alert: alertReducer,
  beaconMalfunction: beaconMalfunctionReducer,
  //  TODO Pass that to singular.
  controls: controlReducer,
  favoriteVessel: favoriteVesselReducer,
  filter: filterReducer,
  fishingActivities: fishingActivitiesReducer,
  fleetSegment: fleetSegmentReducer,
  infraction: infractionReducer,
  interestPoint: interestPointReducer,
  layer: layer.homepage.reducer,
  measurement: measurementReducer,
  missionApi: missionApi.reducer,
  regulatoryLayerSearch,
  reporting: reportingReducer,
  vessel: vesselSliceReducer,
  vesselList
})

const backofficeReducers = combineReducers({
  ...commonReducerList,
  fleetSegment: fleetSegmentReducer,
  layer: layer.backoffice.reducer,
  regulation
})

export { homeReducers, backofficeReducers }
