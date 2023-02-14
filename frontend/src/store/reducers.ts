import { monitorenvApi, monitorfishApi } from '../api'
import { alertReducer } from '../domain/shared_slices/Alert'
import { beaconMalfunctionReducer } from '../domain/shared_slices/BeaconMalfunction'
import { controlReducer } from '../domain/shared_slices/Control'
import { displayedComponentReducer } from '../domain/shared_slices/DisplayedComponent'
import { drawReducer } from '../domain/shared_slices/Draw'
import { favoriteVesselReducer } from '../domain/shared_slices/FavoriteVessel'
import { filterReducer } from '../domain/shared_slices/Filter'
import { fishingActivitiesReducer } from '../domain/shared_slices/FishingActivities'
import { fleetSegmentReducer } from '../domain/shared_slices/FleetSegment'
import { gearReducer } from '../domain/shared_slices/Gear'
import { globalSliceReducer } from '../domain/shared_slices/Global'
import { infractionReducer } from '../domain/shared_slices/Infraction'
import { interestPointReducer } from '../domain/shared_slices/InterestPoint'
import layer from '../domain/shared_slices/Layer'
import { mapReducer } from '../domain/shared_slices/Map'
import { measurementReducer } from '../domain/shared_slices/Measurement'
import { missionReducer } from '../domain/shared_slices/Mission'
import { regulatoryReducer } from '../domain/shared_slices/Regulatory'
import { reportingReducer } from '../domain/shared_slices/Reporting'
import { speciesReducer } from '../domain/shared_slices/Species'
import { vesselSliceReducer } from '../domain/shared_slices/Vessel'
import { regulationReducer } from '../features/backoffice/Regulation.slice'
import { regulatoryLayerSearchReducer } from '../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import { vesselListReducer } from '../features/VesselList/VesselList.slice'

const commonReducerList = {
  gear: gearReducer,
  global: globalSliceReducer,
  map: mapReducer,
  regulatory: regulatoryReducer,
  species: speciesReducer
}

export const mainReducer = {
  [monitorenvApi.reducerPath]: monitorenvApi.reducer,
  [monitorfishApi.reducerPath]: monitorfishApi.reducer,

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
  mission: missionReducer,
  regulatoryLayerSearch: regulatoryLayerSearchReducer,
  reporting: reportingReducer,
  vessel: vesselSliceReducer,
  vesselList: vesselListReducer
}

export const backofficeReducer = {
  ...commonReducerList,
  fleetSegment: fleetSegmentReducer,
  layer: layer.backoffice.reducer,
  regulation: regulationReducer
}
