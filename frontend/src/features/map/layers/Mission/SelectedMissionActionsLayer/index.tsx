import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { selectedMissionActionsStyles } from './styles'
import { LayerProperties, LayerType } from '../../../../../domain/entities/layers/constants'
import { getMissionActionFeature } from '../../../../../domain/entities/mission'
import { useGetMissionsAndActions } from '../../../../../domain/entities/mission/hooks/useGetMissionsAndActions'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

import type { GeoJSON } from '../../../../../domain/types/GeoJSON'
import type { VectorLayerWithName } from '../../../../../domain/types/layer'
import type { Feature } from 'ol'

export function UnmemoizedSelectedMissionActionsLayer({ map }) {
  const missionsAndActions = useGetMissionsAndActions()
  const selectedMissionGeoJSON = useMainAppSelector(store => store.mission.selectedMissionGeoJSON)
  const selectedMissionActions = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return []
    }

    return (
      missionsAndActions
        .find(mission => mission.mission.id === (selectedMissionGeoJSON as GeoJSON.Feature).properties?.missionId)
        ?.actions?.map(action => getMissionActionFeature(action))
        .filter((feature): feature is Feature => Boolean(feature)) || []
    )
  }, [missionsAndActions, selectedMissionGeoJSON])

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
        className: LayerType.MISSION_ACTION_SELECTED,
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
      getVectorLayer().name = LayerType.MISSION_ACTION_SELECTED
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

  return null
}

export const SelectedMissionActionsLayer = React.memo(UnmemoizedSelectedMissionActionsLayer)

SelectedMissionActionsLayer.displayName = 'SelectedMissionActionsLayer'
