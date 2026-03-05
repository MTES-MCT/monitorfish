import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { MonitorFishMap } from '@features/Map/Map.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { memo, useEffect } from 'react'

import { HOVERED_MISSION_VECTOR_LAYER, HOVERED_MISSION_VECTOR_SOURCE } from './HoveredMissionLayer.constants'
import { useGetFilteredMissionsQuery } from '../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionFeatureZone } from '../features'

export function UnmemoizedMissionHoveredLayer({ feature }) {
  const { missions } = useGetFilteredMissionsQuery()
  const draft = useMainAppSelector(store => store.missionForm.draft)

  useMapLayer(HOVERED_MISSION_VECTOR_LAYER)

  useEffect(() => {
    // If a mission is opened in the form, we can't display another selected mission
    if (draft?.mainFormValues) {
      return
    }

    HOVERED_MISSION_VECTOR_SOURCE.clear(true)

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
    HOVERED_MISSION_VECTOR_SOURCE.addFeature(missionFeature)
  }, [feature, draft?.mainFormValues, missions])

  return null
}

export const MissionHoveredLayer = memo(UnmemoizedMissionHoveredLayer)

MissionHoveredLayer.displayName = 'MissionHoveredLayer'
