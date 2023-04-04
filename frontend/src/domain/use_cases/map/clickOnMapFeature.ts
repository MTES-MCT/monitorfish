import GeoJSON from 'ol/format/GeoJSON'

import { missionActions } from '../../actions'
import { LayerProperties } from '../../entities/layers/constants'
import { MonitorFishLayer } from '../../entities/layers/types'
import { OPENLAYERS_PROJECTION } from '../../entities/map/constants'
import { MissionAction } from '../../types/missionAction'
import { showRegulatoryZoneMetadata } from '../layer/regulation/showRegulatoryZoneMetadata'
import { getVesselVoyage } from '../vessel/getVesselVoyage'
import { showVessel } from '../vessel/showVessel'
import { showVesselTrack } from '../vessel/showVesselTrack'

import type { VesselLastPositionFeature } from '../../entities/vessel/types'
import type { MapClick } from '../../types/map'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

const geoJSONParser = new GeoJSON()

export const clickOnMapFeature = (mapClick: MapClick) => (dispatch, getState) => {
  const { previewFilteredVesselsMode } = getState().global
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

  if (clickedFeatureId.includes(MonitorFishLayer.MISSION_PIN_POINT)) {
    const featureGeoJSON = geoJSONParser.writeFeatureObject(mapClick.feature as Feature<Geometry>, {
      featureProjection: OPENLAYERS_PROJECTION
    })
    dispatch(missionActions.setSelectedMissionGeoJSON(featureGeoJSON))

    return
  }

  if (
    clickedFeatureId.includes(MonitorFishLayer.MISSION_ACTION_SELECTED) &&
    isControl(mapClick.feature.get('actionType'))
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

  if (clickedFeatureId.includes(LayerProperties.VESSELS.code)) {
    const clickedVessel = (mapClick.feature as VesselLastPositionFeature).vesselProperties

    if (mapClick.ctrlKeyPressed) {
      dispatch(showVesselTrack(clickedVessel, false, null))
    } else {
      dispatch(showVessel(clickedVessel, false, false))
      dispatch(getVesselVoyage(clickedVessel, undefined, false))
    }
  }
}

const isControl = actionType =>
  actionType === MissionAction.MissionActionType.SEA_CONTROL ||
  actionType === MissionAction.MissionActionType.LAND_CONTROL ||
  actionType === MissionAction.MissionActionType.AIR_CONTROL
