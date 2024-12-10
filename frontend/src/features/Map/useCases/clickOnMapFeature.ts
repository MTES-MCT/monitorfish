import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { showRegulatoryZoneMetadata } from '@features/Regulation/useCases/showRegulatoryZoneMetadata'
import { stationActions } from '@features/Station/slice'
import { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'
import { isControl } from 'domain/entities/controls'
import { showVessel } from 'domain/use_cases/vessel/showVessel'
import { showVesselTrack } from 'domain/use_cases/vessel/showVesselTrack'
import GeoJSON from 'ol/format/GeoJSON'

import { LayerProperties, OPENLAYERS_PROJECTION } from '../constants'
import { MonitorFishMap } from '../Map.types'

import type { MainAppDispatch } from '@store'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { VesselIdentity, VesselLastPositionFeature } from 'domain/entities/vessel/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

const geoJSONParser = new GeoJSON()

export const clickOnMapFeature =
  <T extends HybridAppDispatch>(mapClick: MonitorFishMap.MapClick): HybridAppThunk<T> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
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
      dispatch(missionFormActions.setSelectedMissionGeoJSON(featureGeoJSON))

      return
    }

    if (
      clickedFeatureId.includes(MonitorFishMap.MonitorFishLayer.MISSION_ACTION_SELECTED) &&
      isControl(mapClick.feature.get('actionType'))
    ) {
      const featureGeoJSON = geoJSONParser.writeFeatureObject(mapClick.feature as Feature<Geometry>, {
        featureProjection: OPENLAYERS_PROJECTION
      })
      dispatch(missionFormActions.setSelectedMissionActionGeoJSON(featureGeoJSON))

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

    if (clickedFeatureId.includes(MonitorFishMap.MonitorFishLayer.VESSELS)) {
      const clickedVessel = (mapClick.feature as VesselLastPositionFeature).getProperties() as VesselIdentity

      if (mapClick.ctrlKeyPressed) {
        // Vessel dispatches can only be called from the main app (FronteOffice)
        ;(dispatch as MainAppDispatch)(showVesselTrack(clickedVessel, true, null))
      } else {
        ;(dispatch as MainAppDispatch)(showVessel(clickedVessel, false, true))
      }
    }
  }
