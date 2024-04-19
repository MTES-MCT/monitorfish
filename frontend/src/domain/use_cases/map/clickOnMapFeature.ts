import GeoJSON from 'ol/format/GeoJSON'

import { missionFormActions } from '../../../features/Mission/components/MissionForm/slice'
import { showRegulatoryZoneMetadata } from '../../../features/Regulation/useCases/showRegulatoryZoneMetadata'
import { stationActions } from '../../../features/Station/slice'
import { FeatureWithCodeAndEntityId } from '../../../libs/FeatureWithCodeAndEntityId'
import { isControl } from '../../entities/controls'
import { LayerProperties } from '../../entities/layers/constants'
import { MonitorFishLayer } from '../../entities/layers/types'
import { OPENLAYERS_PROJECTION } from '../../entities/map/constants'
import { showVessel } from '../vessel/showVessel'
import { showVesselTrack } from '../vessel/showVesselTrack'

import type { MainAppThunk } from '../../../store'
import type { VesselLastPositionFeature } from '../../entities/vessel/types'
import type { MapClick } from '../../types/map'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

const geoJSONParser = new GeoJSON()

export const clickOnMapFeature =
  (mapClick: MapClick): MainAppThunk =>
  (dispatch, getState) => {
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
      dispatch(missionFormActions.setSelectedMissionGeoJSON(featureGeoJSON))

      return
    }

    if (
      clickedFeatureId.includes(MonitorFishLayer.MISSION_ACTION_SELECTED) &&
      isControl(mapClick.feature.get('actionType'))
    ) {
      const featureGeoJSON = geoJSONParser.writeFeatureObject(mapClick.feature as Feature<Geometry>, {
        featureProjection: OPENLAYERS_PROJECTION
      })
      dispatch(missionFormActions.setSelectedMissionActionGeoJSON(featureGeoJSON))

      return
    }

    if (mapClick.feature instanceof FeatureWithCodeAndEntityId && mapClick.feature.code === MonitorFishLayer.STATION) {
      dispatch(stationActions.selectStationId(mapClick.feature.entityId))

      return
    }

    if (getState().global.previewFilteredVesselsMode) {
      return
    }

    if (clickedFeatureId.includes(MonitorFishLayer.VESSELS)) {
      const clickedVessel = (mapClick.feature as VesselLastPositionFeature).vesselProperties

      if (mapClick.ctrlKeyPressed) {
        dispatch(showVesselTrack(clickedVessel, true, null))
      } else {
        dispatch(showVessel(clickedVessel, false, true))
      }
    }
  }
