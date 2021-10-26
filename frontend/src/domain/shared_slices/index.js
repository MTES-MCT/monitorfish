/**
 * Est-ce qu'on ne devrait pas mettre de fichier à la racine de /src ?
 */
import layer from './Layer'
import global from './Global'
import map from './Map'
import vessel from './Vessel'
import gear from './Gear'
import filter from './Filter'
import fleetSegment from './FleetSegment'
import measurement from './Measurement'
import regulatory from './Regulatory'
import regulation from '../../features/backoffice/Regulation.slice'
import regulatoryLayerSearch from '../../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import interestPoint from './InterestPoint'
import fishingActivities from './FishingActivities'
import controls from './Controls'
import { combineReducers } from '@reduxjs/toolkit'

const commonReducerList = {
  map,
  global,
  gear,
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
  measurement,
  fishingActivities,
  controls
})

const backofficeReducers = combineReducers({
  ...commonReducerList,
  layer: layer.backoffice.reducer,
  regulation
})

export { homeReducers, backofficeReducers }
