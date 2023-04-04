import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { missionZoneStyle } from './MissionLayer/styles'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { getMissionFeatureZone } from '../../../../domain/entities/mission'
import { useGetMissionsAndActions } from '../../../../domain/entities/mission/hooks/useGetMissionsAndActions'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'

import type { VectorLayerWithName } from '../../../../domain/types/layer'

export function UnmemoizedSelectedMissionLayer({ map }) {
  const missionsAndActions = useGetMissionsAndActions()
  const selectedMissionGeoJSON = useMainAppSelector(store => store.mission.selectedMissionGeoJSON)
  const selectedMission = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON)
  }, [selectedMissionGeoJSON])

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource()
    }

    return vectorSourceRef.current
  }, [])

  const vectorLayerRef = useRef() as MutableRefObject<VectorLayerWithName>
  const getVectorLayer = useCallback(() => {
    if (vectorLayerRef.current === undefined) {
      vectorLayerRef.current = new VectorLayer({
        className: MonitorFishLayer.MISSION_SELECTED,
        renderBuffer: 7,
        source: getVectorSource(),
        style: missionZoneStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSION_SELECTED.zIndex
      })
    }

    return vectorLayerRef.current
  }, [getVectorSource])

  useEffect(() => {
    if (map) {
      getVectorLayer().name = MonitorFishLayer.MISSION_SELECTED
      map.getLayers().push(getVectorLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getVectorLayer())
      }
    }
  }, [map, getVectorLayer])

  useEffect(() => {
    getVectorSource().clear(true)

    if (!selectedMission?.getId()?.toString()?.includes(MonitorFishLayer.MISSION)) {
      return
    }

    const hoveredMission = missionsAndActions.find(mission => mission.mission.id === selectedMission.get('missionId'))
    if (!hoveredMission) {
      return
    }

    const missionFeature = getMissionFeatureZone(hoveredMission.mission)
    getVectorSource().addFeature(missionFeature)
  }, [selectedMission, missionsAndActions, getVectorSource])

  return null
}

export const SelectedMissionLayer = React.memo(UnmemoizedSelectedMissionLayer)

SelectedMissionLayer.displayName = 'SelectedMissionLayer'
