import layer from './Layer'
import global from './Global'
import map from './Map'
import vessel from './Vessel'
import gear from './Gear'
import filter from './Filter'
import fleetSegment from './FleetSegment'
import regulatory from './Regulatory'
import { combineReducers } from '@reduxjs/toolkit'

export default combineReducers({
  layer: layer,
  map: map,
  global: global,
  vessel: vessel,
  gear: gear,
  filter: filter,
  fleetSegment: fleetSegment,
  regulatory: regulatory
})
