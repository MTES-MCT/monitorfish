import { missionApi } from '../../api/mission'
import regulation from '../../features/backoffice/Regulation.slice'
import { regulatoryLayerSearchReducer } from '../../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import { vesselListReducer } from '../../features/vessel_list/VesselList.slice'
import { alertReducer } from './Alert'
import { beaconMalfunctionReducer } from './BeaconMalfunction'
import { controlReducer } from './Control'
import { displayedComponentReducer } from './DisplayedComponent'
import { drawReducer } from './Draw'
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

export const rootReducer = {
  ...commonReducerList,
  alert: alertReducer,
  beaconMalfunction: beaconMalfunctionReducer,
  //  TODO Pass that to singular.
  controls: controlReducer,
  displayedComponent: displayedComponentReducer,
  draw: drawReducer,
  favoriteVessel: favoriteVesselReducer,
  filter: filterReducer,
  fishingActivities: fishingActivitiesReducer,
  fleetSegment: fleetSegmentReducer,
  infraction: infractionReducer,
  interestPoint: interestPointReducer,
  layer: layer.homepage.reducer,
  measurement: measurementReducer,
  missionApi: missionApi.reducer,
  regulatoryLayerSearch: regulatoryLayerSearchReducer,
  reporting: reportingReducer,
  vessel: vesselSliceReducer,
  vesselList: vesselListReducer
}

export const persistedRootReducer = {
  ...commonReducerList,
  fleetSegment: fleetSegmentReducer,
  layer: layer.backoffice.reducer,
  regulation
}
