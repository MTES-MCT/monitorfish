import { combineReducers } from '@reduxjs/toolkit'

import regulation from '../../features/backoffice/Regulation.slice'
import regulatoryLayerSearch from '../../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import vesselList from '../../features/vessel_list/VesselList.slice'
import alert from './Alert'
import beaconMalfunction from './BeaconMalfunction'
import controls from './Control'
import filter from './Filter'
import gear from './Gear'
import global from './Global'
import layer from './Layer'
import map from './Map'
import species from './Species'
import vessel from './Vessel'
import fleetSegment from './FleetSegment'
import measurement from './Measurement'
import regulatory from './Regulatory'
import interestPoint from './InterestPoint'
import fishingActivities from './FishingActivities'
import favoriteVessel from './FavoriteVessel'
import reporting from './Reporting'
import infraction from './Infraction'

const commonReducerList = {
  gear,
  global,
  map,
  regulatory,
  species,
}

const homeReducers = combineReducers({
  ...commonReducerList,
  controls,
  filter,
  alert,
  fleetSegment,
  beaconMalfunction,
  interestPoint,
  favoriteVessel,
  layer: layer.homepage.reducer,
  fishingActivities,
  measurement,
  infraction,
  vessel,
  regulatoryLayerSearch,
  reporting,
  vesselList,
})

const backofficeReducers = combineReducers({
  ...commonReducerList,
  fleetSegment,
  layer: layer.backoffice.reducer,
  regulation,
})

export { homeReducers, backofficeReducers }
