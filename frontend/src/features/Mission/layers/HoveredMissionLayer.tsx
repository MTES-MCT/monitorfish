import { useMainAppSelector } from '@hooks/useMainAppSelector'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useRef } from 'react'

import { missionZoneStyle } from './MissionLayer/styles'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../domain/entities/layers/types'
import { monitorfishMap } from '../../map/monitorfishMap'
import { useGetFilteredMissionsQuery } from '../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionFeatureZone } from '../features'

import type { VectorLayerWithName } from '../../../domain/types/layer'

export function UnmemoizedMissionHoveredLayer({ feature }) {
  const { missions } = useGetFilteredMissionsQuery()
  const draft = useMainAppSelector(store => store.missionForm.draft)

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
    // If a mission is opened in the form, we can't display another selected mission
    if (draft?.mainFormValues) {
      return
    }

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

    const missionFeature = getMissionFeatureZone(hoveredMissionWithActions, MonitorFishLayer.MISSION_HOVER)
    getVectorSource().addFeature(missionFeature)
  }, [feature, getVectorSource, draft?.mainFormValues, missions])

  return null
}

export const MissionHoveredLayer = memo(UnmemoizedMissionHoveredLayer)

MissionHoveredLayer.displayName = 'MissionHoveredLayer'
