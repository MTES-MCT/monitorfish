import { OPENLAYERS_PROJECTION } from '@features/Map/constants'
import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { MonitorFishMap } from '@features/Map/Map.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import GeoJSON from 'ol/format/GeoJSON'
import { memo, useEffect, useMemo } from 'react'

import { NEW_MISSION_ID } from './constants'
import { SELECTED_MISSION_VECTOR_LAYER, SELECTED_MISSION_VECTOR_SOURCE } from './SelectedMissionLayer.constants'
import { useGetFilteredMissionsQuery } from '../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionFeatureZone } from '../features'

export function UnmemoizedSelectedMissionLayer() {
  const { missions } = useGetFilteredMissionsQuery()
  const selectedMissionGeoJSON = useMainAppSelector(store => store.missionForm.selectedMissionGeoJSON)
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const draft = useMainAppSelector(store => store.missionForm.draft)

  const selectedMission = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON)
  }, [selectedMissionGeoJSON])

  useMapLayer(SELECTED_MISSION_VECTOR_LAYER)

  useEffect(() => {
    // If a mission is opened in the form, we can't display another selected mission
    if (draft?.mainFormValues) {
      return
    }

    SELECTED_MISSION_VECTOR_SOURCE.clear(true)

    if (!selectedMission?.getId()?.toString()?.includes(MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT)) {
      return
    }

    const selectedMissionWithActions = missions.find(
      missionWithAction => missionWithAction.id === selectedMission.get('missionId')
    )
    if (!selectedMissionWithActions) {
      return
    }

    const missionFeature = getMissionFeatureZone(
      selectedMissionWithActions,
      MonitorFishMap.MonitorFishLayer.MISSION_SELECTED
    )
    SELECTED_MISSION_VECTOR_SOURCE.addFeature(missionFeature)
  }, [selectedMission, missions, draft?.mainFormValues])

  useEffect(() => {
    SELECTED_MISSION_VECTOR_SOURCE.clear(true)

    if (!draft?.mainFormValues) {
      return
    }

    // When creating a new mission, dummy NEW_MISSION_ID is used
    const missionFeature = getMissionFeatureZone(
      { ...draft.mainFormValues, id: missionId ?? NEW_MISSION_ID },
      MonitorFishMap.MonitorFishLayer.MISSION_SELECTED
    )
    SELECTED_MISSION_VECTOR_SOURCE.addFeature(missionFeature)
  }, [draft?.mainFormValues, missionId])

  return null
}

export const SelectedMissionLayer = memo(UnmemoizedSelectedMissionLayer)

SelectedMissionLayer.displayName = 'SelectedMissionLayer'
