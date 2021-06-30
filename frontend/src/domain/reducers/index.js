import layer from './Layer'
import global from './Global'
import map from './Map'
import vessel from './Vessel'
import gear from './Gear'
import filter from './Filter'
import fleetSegment from './FleetSegment'
import regulatory from './Regulatory'
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
  fleetSegment
})

const backofficeReducers = combineReducers({
  ...commonReducerList,
  layer: layer.backoffice.reducer
})

export { homeReducers, backofficeReducers }
