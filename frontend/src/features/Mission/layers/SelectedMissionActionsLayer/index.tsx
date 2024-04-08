import { useMainAppSelector } from '@hooks/useMainAppSelector'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { selectedMissionActionsStyles } from './styles'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { monitorfishMap } from '../../../map/monitorfishMap'
import { useGetFilteredMissionsQuery } from '../../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionActionFeature, getMissionActionFeatureZone } from '../../index'
import { NEW_MISSION_ID } from '../constants'

import type { GeoJSON } from '../../../../domain/types/GeoJSON'
import type { VectorLayerWithName } from '../../../../domain/types/layer'
import type { Feature } from 'ol'
import type { MutableRefObject } from 'react'

export function UnmemoizedSelectedMissionActionsLayer() {
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
        .find(
          missionsAndAction =>
            missionsAndAction.id === (selectedMissionGeoJSON as GeoJSON.Feature).properties?.missionId
        )
        ?.actions?.map(action => getMissionActionFeature(action))
        .filter((feature): feature is Feature => Boolean(feature)) || []
    )
  }, [selectedMissionGeoJSON, missions])

  const selectedMissionActionsZones = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return []
    }

    return (
      missions
        .find(
          missionsAndAction =>
            missionsAndAction.isGeometryComputedFromControls &&
            missionsAndAction.id === (selectedMissionGeoJSON as GeoJSON.Feature).properties?.missionId
        )
        ?.actions?.map(action => getMissionActionFeatureZone(action))
        .filter((feature): feature is Feature => Boolean(feature)) || []
    )
  }, [selectedMissionGeoJSON, missions])

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
        className: MonitorFishLayer.MISSION_ACTION_SELECTED,
        source: getVectorSource(),
        style: selectedMissionActionsStyles,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSION_ACTION_SELECTED.zIndex
      })
    }

    return vectorLayerRef.current
  }, [getVectorSource])

  useEffect(() => {
    getVectorLayer().name = MonitorFishLayer.MISSION_ACTION_SELECTED
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

    getVectorSource().addFeatures(selectedMissionActions.concat(selectedMissionActionsZones))
  }, [selectedMissionActions, selectedMissionActionsZones, draft?.mainFormValues, getVectorSource])

  useEffect(() => {
    getVectorSource().clear(true)
    if (!draft?.actionsFormValues) {
      return
    }

    const actionFeatures = draft.actionsFormValues
      .map(action => getMissionActionFeature({ ...action, missionId: missionId || NEW_MISSION_ID }))
      .filter((action): action is Feature => !!action)

    const actionZonesFeatures = draft?.mainFormValues?.isGeometryComputedFromControls
      ? draft.actionsFormValues
          .map(action => getMissionActionFeatureZone({ ...action, missionId: missionId || NEW_MISSION_ID }))
          .filter((action): action is Feature => !!action)
      : []

    getVectorSource().addFeatures(actionFeatures.concat(actionZonesFeatures))
  }, [getVectorSource, missionId, draft?.actionsFormValues, draft?.mainFormValues?.isGeometryComputedFromControls])

  return null
}

export const SelectedMissionActionsLayer = memo(UnmemoizedSelectedMissionActionsLayer)

SelectedMissionActionsLayer.displayName = 'SelectedMissionActionsLayer'
