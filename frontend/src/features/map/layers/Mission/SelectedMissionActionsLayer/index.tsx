import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { selectedMissionActionsStyles } from './styles'
import { LayerProperties } from '../../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../../domain/entities/layers/types'
import { getMissionActionFeature, getMissionActionFeatures } from '../../../../../domain/entities/mission'
import { useGetFilteredMissionsQuery } from '../../../../../domain/entities/mission/hooks/useGetFilteredMissionsQuery'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { NEW_MISSION_ID } from '../constants'

import type { GeoJSON } from '../../../../../domain/types/GeoJSON'
import type { VectorLayerWithName } from '../../../../../domain/types/layer'
import type { Feature } from 'ol'
import type { MutableRefObject } from 'react'

export function UnmemoizedSelectedMissionActionsLayer({ map }) {
  const { missions } = useGetFilteredMissionsQuery()
  const { mission, sideWindow } = useMainAppSelector(store => store)

  const selectedMissionActions = useMemo(() => {
    if (!mission.selectedMissionGeoJSON) {
      return []
    }

    return (
      missions
        .find(
          missionsAndAction =>
            missionsAndAction.id === (mission.selectedMissionGeoJSON as GeoJSON.Feature).properties?.missionId
        )
        ?.actions?.map(action => getMissionActionFeature(action))
        .filter((feature): feature is Feature => Boolean(feature)) || []
    )
  }, [mission.selectedMissionGeoJSON, missions])

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
    if (map) {
      getVectorLayer().name = MonitorFishLayer.MISSION_ACTION_SELECTED
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

    getVectorSource().addFeatures(selectedMissionActions)
  }, [selectedMissionActions, getVectorSource])

  useEffect(() => {
    getVectorSource().clear(true)
    const missionId = sideWindow.selectedPath.id || NEW_MISSION_ID
    if (!mission.draft) {
      return
    }

    const actionFeatures = getMissionActionFeatures({ ...mission.draft, id: missionId })
    getVectorSource().addFeatures(actionFeatures)
  }, [getVectorSource, mission.draft, sideWindow.selectedPath.id])

  return null
}

export const SelectedMissionActionsLayer = memo(UnmemoizedSelectedMissionActionsLayer)

SelectedMissionActionsLayer.displayName = 'SelectedMissionActionsLayer'
