import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { missionZoneStyle } from './MissionLayer/styles'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { getMissionFeatureZone } from '../../../../domain/entities/mission'
import { useGetMissionsAndActions } from '../../../../domain/entities/mission/hooks/useGetMissionsAndActions'

import type { VectorLayerWithName } from '../../../../domain/types/layer'

export function UnmemoizedMissionHoveredLayer({ feature, map }) {
  const missionsAndActions = useGetMissionsAndActions()

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
        className: MonitorFishLayer.MISSION_HOVER,
        renderBuffer: 7,
        source: getVectorSource(),
        style: missionZoneStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSION_HOVER.zIndex
      })
    }

    return vectorLayerRef.current
  }, [getVectorSource])

  useEffect(() => {
    if (map) {
      getVectorLayer().name = MonitorFishLayer.MISSION_HOVER
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

    if (!feature?.getId()?.toString()?.includes(MonitorFishLayer.MISSION)) {
      return
    }

    const hoveredMission = missionsAndActions.find(mission => mission.mission.id === feature.get('missionId'))
    if (!hoveredMission) {
      return
    }

    const missionFeature = getMissionFeatureZone(hoveredMission.mission)
    getVectorSource().addFeature(missionFeature)
  }, [missionsAndActions, feature, getVectorSource])

  return null
}

export const MissionHoveredLayer = React.memo(UnmemoizedMissionHoveredLayer)

MissionHoveredLayer.displayName = 'MissionHoveredLayer'
