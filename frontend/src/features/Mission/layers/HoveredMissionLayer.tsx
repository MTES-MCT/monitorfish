import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useRef } from 'react'

import { missionZoneStyle } from './MissionLayer/styles'
import { useGetFilteredMissionsQuery } from '../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionFeatureZone } from '../features'

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

  const vectorLayerRef = useRef<MonitorFishMap.VectorLayerWithName>()
  const getVectorLayer = useCallback(() => {
    if (vectorLayerRef.current === undefined) {
      vectorLayerRef.current = new VectorLayer({
        className: MonitorFishMap.MonitorFishLayer.MISSION_HOVER,
        renderBuffer: 7,
        source: getVectorSource(),
        style: missionZoneStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSION_HOVER.zIndex
      })
    }

    return vectorLayerRef.current as MonitorFishMap.VectorLayerWithName
  }, [getVectorSource])

  useEffect(() => {
    getVectorLayer().name = MonitorFishMap.MonitorFishLayer.MISSION_HOVER
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

    if (!feature?.getId()?.toString()?.includes(MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT)) {
      return
    }

    const hoveredMissionWithActions = missions.find(
      missionWithActions => missionWithActions.id === feature.get('missionId')
    )
    if (!hoveredMissionWithActions) {
      return
    }

    const missionFeature = getMissionFeatureZone(
      hoveredMissionWithActions,
      MonitorFishMap.MonitorFishLayer.MISSION_HOVER
    )
    getVectorSource().addFeature(missionFeature)
  }, [feature, getVectorSource, draft?.mainFormValues, missions])

  return null
}

export const MissionHoveredLayer = memo(UnmemoizedMissionHoveredLayer)

MissionHoveredLayer.displayName = 'MissionHoveredLayer'
