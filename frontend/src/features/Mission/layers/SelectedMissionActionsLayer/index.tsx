import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { useGetNatinfsAsOptions } from '@features/Mission/components/MissionForm/hooks/useGetNatinfsAsOptions'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { memo, useEffect, useMemo } from 'react'

import {
  SELECTED_MISSION_ACTIONS_VECTOR_LAYER,
  SELECTED_MISSION_ACTIONS_VECTOR_SOURCE
} from './constants'
import { useGetFilteredMissionsQuery } from '../../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionActionFeature, getMissionActionFeatureZone } from '../../features'
import { NEW_MISSION_ID } from '../constants'

import type { Feature } from 'ol'

export function UnmemoizedSelectedMissionActionsLayer() {
  const natinfsAsOptions = useGetNatinfsAsOptions()
  const { missions } = useGetFilteredMissionsQuery()
  const selectedMissionGeoJSON = useMainAppSelector(store => store.missionForm.selectedMissionGeoJSON)
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const draft = useMainAppSelector(store => store.missionForm.draft)

  const selectedMissionActions = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return []
    }

    return (
      missions
        .find(missionsAndAction => missionsAndAction.id === selectedMissionGeoJSON.properties?.missionId)
        ?.actions?.map(action => getMissionActionFeature(natinfsAsOptions, action))
        .filter((feature): feature is Feature => Boolean(feature)) ?? []
    )
  }, [selectedMissionGeoJSON, missions, natinfsAsOptions])

  /**
   * If the mission geometry is defined from actions, we create new OpenLayers Features
   * to create and display the zones around the controls.
   */
  const selectedMissionActionsZones = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return []
    }

    return (
      missions
        .find(
          missionsAndAction =>
            missionsAndAction.isGeometryComputedFromControls &&
            missionsAndAction.id === selectedMissionGeoJSON.properties?.missionId
        )
        ?.actions?.map(action => getMissionActionFeatureZone(action))
        .filter((feature): feature is Feature => Boolean(feature)) ?? []
    )
  }, [selectedMissionGeoJSON, missions])

  useMapLayer(SELECTED_MISSION_ACTIONS_VECTOR_LAYER)

  useEffect(() => {
    // If a mission is opened in the form, we can't display another selected mission
    if (draft?.mainFormValues) {
      return
    }

    SELECTED_MISSION_ACTIONS_VECTOR_SOURCE.clear(true)

    SELECTED_MISSION_ACTIONS_VECTOR_SOURCE.addFeatures(selectedMissionActions.concat(selectedMissionActionsZones))
  }, [selectedMissionActions, selectedMissionActionsZones, draft?.mainFormValues])

  useEffect(() => {
    SELECTED_MISSION_ACTIONS_VECTOR_SOURCE.clear(true)
    if (!draft?.actionsFormValues) {
      return
    }

    const actionFeatures = draft.actionsFormValues
      .map(action => getMissionActionFeature(natinfsAsOptions, { ...action, missionId: missionId ?? NEW_MISSION_ID }))
      .filter((action): action is Feature => !!action)

    /**
     * If the mission geometry is defined from actions, we create new OpenLayers Features
     * to create and display the zones around the controls.
     */
    const actionZonesFeatures = draft?.mainFormValues?.isGeometryComputedFromControls
      ? draft.actionsFormValues
          .map(action => getMissionActionFeatureZone({ ...action }))
          .filter((action): action is Feature => !!action)
      : []

    SELECTED_MISSION_ACTIONS_VECTOR_SOURCE.addFeatures(actionFeatures.concat(actionZonesFeatures))
  }, [
    natinfsAsOptions,
    missionId,
    draft?.actionsFormValues,
    draft?.mainFormValues?.isGeometryComputedFromControls
  ])

  return null
}

export const SelectedMissionActionsLayer = memo(UnmemoizedSelectedMissionActionsLayer)

SelectedMissionActionsLayer.displayName = 'SelectedMissionActionsLayer'
