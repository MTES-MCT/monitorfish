import layer from './Layer'
import global from './Global'
import map from './Map'
import vessel from './Vessel'
import gear from './Gear'
import species from './Species'
import filter from './Filter'
import fleetSegment from './FleetSegment'
import measurement from './Measurement'
import regulatory from './Regulatory'
import regulation from '../../features/backoffice/Regulation.slice'
import regulatoryLayerSearch from '../../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import vesselList from '../../features/vessel_list/VesselList.slice'
import interestPoint from './InterestPoint'
import fishingActivities from './FishingActivities'
import controls from './Control'
import alert from './Alert'
import { combineReducers } from '@reduxjs/toolkit'

const commonReducerList = {
  map,
  global,
  gear,
  species,
  regulatory
}

const homeReducers = combineReducers({
  ...commonReducerList,
  layer: layer.homepage.reducer,
  vessel,
  filter,
  fleetSegment,
  interestPoint,
  regulatoryLayerSearch,
  vesselList,
  measurement,
  fishingActivities,
  controls,
  alert
})

const backofficeReducers = combineReducers({
  ...commonReducerList,
  layer: layer.backoffice.reducer,
  regulation,
  fleetSegment
})

export { homeReducers, backofficeReducers }
