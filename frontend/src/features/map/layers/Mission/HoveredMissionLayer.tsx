import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useRef } from 'react'

import { missionZoneStyle } from './MissionLayer/styles'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { getMissionFeatureZone } from '../../../../domain/entities/mission'
import { useGetFilteredMissionsQuery } from '../../../Mission/components/MissionList/hooks/useGetFilteredMissionsQuery'
import { monitorfishMap } from '../../monitorfishMap'

import type { VectorLayerWithName } from '../../../../domain/types/layer'

export function UnmemoizedMissionHoveredLayer({ feature }) {
  const { missions } = useGetFilteredMissionsQuery()

  const vectorSourceRef = useRef<VectorSource>()
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource()
    }

    return vectorSourceRef.current as VectorSource
  }, [])

  const vectorLayerRef = useRef<VectorLayerWithName>()
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

    return vectorLayerRef.current as VectorLayerWithName
  }, [getVectorSource])

  useEffect(() => {
    getVectorLayer().name = MonitorFishLayer.MISSION_HOVER
    monitorfishMap.getLayers().push(getVectorLayer())

    return () => {
      monitorfishMap.removeLayer(getVectorLayer())
    }
  }, [getVectorLayer])

  useEffect(() => {
    getVectorSource().clear(true)

    if (!feature?.getId()?.toString()?.includes(MonitorFishLayer.MISSION_PIN_POINT)) {
      return
    }

    const hoveredMissionWithActions = missions.find(
      missionWithActions => missionWithActions.id === feature.get('missionId')
    )
    if (!hoveredMissionWithActions) {
      return
    }

    const missionFeature = getMissionFeatureZone(hoveredMissionWithActions)
    getVectorSource().addFeature(missionFeature)
  }, [feature, getVectorSource, missions])

  return null
}

export const MissionHoveredLayer = memo(UnmemoizedMissionHoveredLayer)

MissionHoveredLayer.displayName = 'MissionHoveredLayer'
