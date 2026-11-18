import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { useGetNatinfsAsOptions } from '@features/Mission/components/MissionForm/hooks/useGetNatinfsAsOptions'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { memo, useEffect, useMemo } from 'react'

import { SELECTED_MISSION_ACTIONS_VECTOR_LAYER, SELECTED_MISSION_ACTIONS_VECTOR_SOURCE } from './constants'
import { useGetFilteredMissionsQuery } from '../../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionActionFeature, getMissionActionFeatureZone } from '../../features'
import { NEW_MISSION_ID } from '../constants'

import type { Feature } from 'ol'

export function UnmemoizedSelectedMissionActionsLayer() {
  const { missions } = useGetFilteredMissionsQuery()
  const selectedMissionGeoJSON = useMainAppSelector(store => store.missionForm.selectedMissionGeoJSON)
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const draft = useMainAppSelector(store => store.missionForm.draft)
  const draftActionsFormValues = draft?.actionsFormValues
  const isDraftGeometryComputedFromControls = draft?.mainFormValues?.isGeometryComputedFromControls
  // Mounted with the map: the infractions would otherwise be downloaded with the vessels
  const natinfsAsOptions = useGetNatinfsAsOptions({ skip: !selectedMissionGeoJSON && !draftActionsFormValues })

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

  const draftActionsFeatures = useMemo(() => {
    if (!draftActionsFormValues) {
      return undefined
    }

    const actionFeatures = draftActionsFormValues
      .map(action => getMissionActionFeature(natinfsAsOptions, { ...action, missionId: missionId ?? NEW_MISSION_ID }))
      .filter((action): action is Feature => !!action)

    /**
     * If the mission geometry is defined from actions, we create new OpenLayers Features
     * to create and display the zones around the controls.
     */
    const actionZonesFeatures = isDraftGeometryComputedFromControls
      ? draftActionsFormValues
          .map(action => getMissionActionFeatureZone({ ...action }))
          .filter((action): action is Feature => !!action)
      : []

    return actionFeatures.concat(actionZonesFeatures)
  }, [natinfsAsOptions, missionId, draftActionsFormValues, isDraftGeometryComputedFromControls])

  useEffect(() => {
    SELECTED_MISSION_ACTIONS_VECTOR_SOURCE.clear(true)

    if (draftActionsFeatures) {
      SELECTED_MISSION_ACTIONS_VECTOR_SOURCE.addFeatures(draftActionsFeatures)

      return
    }

    // If a mission is opened in the form, we can't display another selected mission
    if (draft?.mainFormValues) {
      return
    }

    SELECTED_MISSION_ACTIONS_VECTOR_SOURCE.addFeatures(selectedMissionActions.concat(selectedMissionActionsZones))
  }, [draftActionsFeatures, selectedMissionActions, selectedMissionActionsZones, draft?.mainFormValues])

  return null
}

export const SelectedMissionActionsLayer = memo(UnmemoizedSelectedMissionActionsLayer)

SelectedMissionActionsLayer.displayName = 'SelectedMissionActionsLayer'
