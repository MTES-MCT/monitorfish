import GeoJSON from 'ol/format/GeoJSON'

import { showRegulatoryZoneMetadata } from '../../../features/Regulation/useCases/showRegulatoryZoneMetadata'
import { missionActions } from '../../actions'
import { isControl } from '../../entities/controls'
import { LayerProperties } from '../../entities/layers/constants'
import { MonitorFishLayer } from '../../entities/layers/types'
import { OPENLAYERS_PROJECTION } from '../../entities/map/constants'
import { showVessel } from '../vessel/showVessel'
import { showVesselTrack } from '../vessel/showVesselTrack'

import type { VesselLastPositionFeature } from '../../entities/vessel/types'
import type { MapClick } from '../../types/map'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

const geoJSONParser = new GeoJSON()

export const clickOnMapFeature = (mapClick: MapClick) => (dispatch, getState) => {
  const { previewFilteredVesselsMode } = getState().global
  const { draft } = getState().mission
  if (!mapClick.feature) {
    return
  }

  const clickedFeatureId = mapClick.feature.getId()?.toString()
  if (!clickedFeatureId) {
    return
  }

  if (clickedFeatureId.includes(LayerProperties.REGULATORY.code)) {
    const zone = {
      topic: mapClick.feature.getProperties().topic,
      zone: mapClick.feature.getProperties().zone
    }
    dispatch(showRegulatoryZoneMetadata(zone, false))

    return
  }

  // If a mission is already edited in the side window (draft is not null), do not permit to select another mission
  if (clickedFeatureId.includes(MonitorFishLayer.MISSION_PIN_POINT) && !draft) {
    const featureGeoJSON = geoJSONParser.writeFeatureObject(mapClick.feature as Feature<Geometry>, {
      featureProjection: OPENLAYERS_PROJECTION
    })
    dispatch(missionActions.setSelectedMissionGeoJSON(featureGeoJSON))

    return
  }

  // If a mission is already edited in the side window (draft is not null), do not permit to select another mission action
  if (
    clickedFeatureId.includes(MonitorFishLayer.MISSION_ACTION_SELECTED) &&
    isControl(mapClick.feature.get('actionType')) &&
    !draft
  ) {
    const featureGeoJSON = geoJSONParser.writeFeatureObject(mapClick.feature as Feature<Geometry>, {
      featureProjection: OPENLAYERS_PROJECTION
    })
    dispatch(missionActions.setSelectedMissionActionGeoJSON(featureGeoJSON))

    return
  }

  if (previewFilteredVesselsMode) {
    return
  }

  if (clickedFeatureId.includes(LayerProperties.VESSELS_POINTS.code)) {
    const clickedVessel = (mapClick.feature as VesselLastPositionFeature).vesselProperties

    if (mapClick.ctrlKeyPressed) {
      dispatch(showVesselTrack(clickedVessel, true, null))
    } else {
      dispatch(showVessel(clickedVessel, false, true))
    }
  }
}
