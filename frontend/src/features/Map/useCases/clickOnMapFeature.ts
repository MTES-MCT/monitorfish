import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { showRegulatoryZoneMetadata } from '@features/Regulation/useCases/showRegulatoryZoneMetadata'
import { reportingActions } from '@features/Reporting/slice'
import { stationActions } from '@features/Station/slice'
import { showVessel } from '@features/Vessel/useCases/showVessel'
import { showVesselTrack } from '@features/Vessel/useCases/showVesselTrack'
import { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'
import { isControl } from 'domain/entities/controls'
import GeoJSON from 'ol/format/GeoJSON'

import { showAISVesselTrack } from '../../Vessel/useCases/showAISVesselTrack'
import { LayerProperties, OPENLAYERS_PROJECTION } from '../constants'
import { MonitorFishMap } from '../Map.types'

import type { AISVessel } from '@features/Vessel/AISVessel.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppDispatch } from '@store'
import type { HybridAppThunk } from '@store/types'
import type { Feature as GeoJSONFeature, Point } from 'geojson'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

const geoJSONParser = new GeoJSON()

export const clickOnMapFeature =
  (mapClick: MonitorFishMap.MapClick): HybridAppThunk =>
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

    if (clickedFeatureId.includes(MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT)) {
      const featureGeoJSON = geoJSONParser.writeFeatureObject(mapClick.feature as Feature<Geometry>, {
        featureProjection: OPENLAYERS_PROJECTION
      })
      dispatch(missionFormActions.setSelectedMissionGeoJSON(featureGeoJSON as GeoJSONFeature<Point>))

      return
    }

    if (clickedFeatureId.includes(LayerProperties.REPORTING.code)) {
      dispatch(reportingActions.toggleSelectedReportingFeatureId(clickedFeatureId))

      return
    }

    if (
      clickedFeatureId.includes(MonitorFishMap.MonitorFishLayer.MISSION_ACTION_SELECTED) &&
      isControl(mapClick.feature.get('actionType'))
    ) {
      const featureGeoJSON = geoJSONParser.writeFeatureObject(mapClick.feature as Feature<Geometry>, {
        featureProjection: OPENLAYERS_PROJECTION
      })
      dispatch(missionFormActions.setSelectedMissionActionGeoJSON(featureGeoJSON as GeoJSONFeature<Point>))

      return
    }

    if (
      mapClick.feature instanceof FeatureWithCodeAndEntityId &&
      mapClick.feature.code === MonitorFishMap.MonitorFishLayer.STATION
    ) {
      dispatch(stationActions.selectStationId(mapClick.feature.entityId))

      return
    }

    if (getState().global.previewFilteredVesselsMode) {
      return
    }

    if (clickedFeatureId.startsWith(MonitorFishMap.MonitorFishLayer.VESSELS)) {
      const clickedVessel = (
        mapClick.feature as Vessel.VesselLastPositionFeature
      ).getProperties() as Vessel.VesselIdentity

      if (mapClick.ctrlKeyPressed) {
        // Vessel dispatches can only be called from the main app (map)
        ;(dispatch as MainAppDispatch)(showVesselTrack(clickedVessel, null))
      } else {
        ;(dispatch as MainAppDispatch)(showVessel(clickedVessel, false))
      }
    }

    if (clickedFeatureId.startsWith(MonitorFishMap.MonitorFishLayer.AIS_VESSELS)) {
      const clickedVessel = (
        mapClick.feature as AISVessel.AISVesselLastPositionFeature
      ).getProperties() as AISVessel.AISVessel

      ;(dispatch as MainAppDispatch)(showAISVesselTrack(clickedVessel))
    }
  }
