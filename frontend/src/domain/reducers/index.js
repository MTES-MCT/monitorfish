import layer from './Layer'
import global from './Global'
import map from './Map'
import vessel from './Vessel'
import gear from './Gear'
import filter from './Filter'
import fleetSegment from './FleetSegment'
import regulatory from './Regulatory'
import { combineReducers } from '@reduxjs/toolkit'

const homeReducers = combineReducers({
  layer: layer.homepage.reducer,
  map,
  global: global,
  vessel: vessel,
  gear: gear,
  filter: filter,
  fleetSegment: fleetSegment,
  regulatory: regulatory
})

const backofficeReducers = combineReducers({
  layer: layer.backoffice.reducer,
  map,
  gear: gear,
  regulatory: regulatory
})

export { homeReducers, backofficeReducers }
