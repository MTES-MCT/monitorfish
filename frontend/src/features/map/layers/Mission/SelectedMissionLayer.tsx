import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { NEW_MISSION_ID } from './constants'
import { missionZoneStyle } from './MissionLayer/styles'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { getMissionFeatureZone } from '../../../../domain/entities/mission'
import { useGetFilteredMissionsQuery } from '../../../../domain/entities/mission/hooks/useGetFilteredMissionsQuery'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'

import type { VectorLayerWithName } from '../../../../domain/types/layer'

export function UnmemoizedSelectedMissionLayer({ map }) {
  const { missions } = useGetFilteredMissionsQuery()
  const mission = useMainAppSelector(store => store.mission)
  const sideWindow = useMainAppSelector(store => store.sideWindow)

  const selectedMission = useMemo(() => {
    if (!mission.selectedMissionGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(mission.selectedMissionGeoJSON)
  }, [mission.selectedMissionGeoJSON])

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
        className: MonitorFishLayer.MISSION_SELECTED,
        renderBuffer: 7,
        source: getVectorSource(),
        style: missionZoneStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSION_SELECTED.zIndex
      })
    }

    return vectorLayerRef.current as VectorLayerWithName
  }, [getVectorSource])

  useEffect(() => {
    if (map) {
      getVectorLayer().name = MonitorFishLayer.MISSION_SELECTED
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

    if (!selectedMission?.getId()?.toString()?.includes(MonitorFishLayer.MISSION_PIN_POINT)) {
      return
    }

    const hoveredMissionWithActions = missions.find(
      missionWithAction => missionWithAction.id === selectedMission.get('missionId')
    )
    if (!hoveredMissionWithActions) {
      return
    }

    const missionFeature = getMissionFeatureZone(hoveredMissionWithActions)
    getVectorSource().addFeature(missionFeature)
  }, [selectedMission, missions, getVectorSource])

  useEffect(() => {
    getVectorSource().clear(true)

    // When creating a new mission, dummy NEW_MISSION_ID is used
    const missionId = sideWindow.selectedPath.id || NEW_MISSION_ID
    if (!mission.draft) {
      return
    }

    const missionFeature = getMissionFeatureZone({ ...mission.draft.mainFormValues, id: missionId })
    getVectorSource().addFeature(missionFeature)
  }, [getVectorSource, mission.draft, sideWindow.selectedPath.id])

  return null
}

export const SelectedMissionLayer = memo(UnmemoizedSelectedMissionLayer)

SelectedMissionLayer.displayName = 'SelectedMissionLayer'
