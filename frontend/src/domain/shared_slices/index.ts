import { combineReducers } from '@reduxjs/toolkit'

import regulation from '../../features/backoffice/Regulation.slice'
import regulatoryLayerSearch from '../../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import vesselList from '../../features/vessel_list/VesselList.slice'
import { alertReducer } from './Alert'
import beaconMalfunction from './BeaconMalfunction'
import controls from './Control'
import favoriteVessel from './FavoriteVessel'
import filter from './Filter'
import { fishingActivitiesReducer } from './FishingActivities'
import fleetSegment from './FleetSegment'
import gear from './Gear'
import { globalSliceReducer } from './Global'
import infraction from './Infraction'
import interestPoint from './InterestPoint'
import layer from './Layer'
import map from './Map'
import measurement from './Measurement'
import regulatory from './Regulatory'
import reporting from './Reporting'
import species from './Species'
import { vesselSliceReducer } from './Vessel'

const commonReducerList = {
  gear,
  global: globalSliceReducer,
  map,
  regulatory,
  species
}

const homeReducers = combineReducers({
  ...commonReducerList,
  alert: alertReducer,
  beaconMalfunction,
  controls,
  favoriteVessel,
  filter,
  fishingActivities: fishingActivitiesReducer,
  fleetSegment,
  infraction,
  interestPoint,
  layer: layer.homepage.reducer,
  measurement,
  regulatoryLayerSearch,
  reporting,
  vessel: vesselSliceReducer,
  vesselList
})

const backofficeReducers = combineReducers({
  ...commonReducerList,
  fleetSegment,
  layer: layer.backoffice.reducer,
  regulation
})

export { homeReducers, backofficeReducers }
