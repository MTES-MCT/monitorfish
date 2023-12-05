import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {memo, useCallback, useEffect, useMemo, useRef} from 'react'
import {missionZoneStyle} from './MissionLayer/styles'
import {LayerProperties} from '../../../../domain/entities/layers/constants'
import {MonitorFishLayer} from '../../../../domain/entities/layers/types'
import {OPENLAYERS_PROJECTION} from '../../../../domain/entities/map/constants'
import {getMissionFeatureZone} from '../../../../domain/entities/mission'
import {useGetFilteredMissionsQuery} from '../../../../domain/entities/mission/hooks/useGetFilteredMissionsQuery'
import {useMainAppSelector} from '../../../../hooks/useMainAppSelector'
import {monitorfishMap} from '../../monitorfishMap'

import type {VectorLayerWithName} from '../../../../domain/types/layer'
import {skipToken} from "@reduxjs/toolkit/query";
import {useGetMissionQuery} from "../../../SideWindow/MissionForm/apis";

export function UnmemoizedSelectedMissionLayer() {
  const { missions } = useGetFilteredMissionsQuery()
  const selectedMissionGeoJSON = useMainAppSelector(store => store.mission.selectedMissionGeoJSON)
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const { data: missionData } = useGetMissionQuery(missionId || skipToken)

  const selectedMission = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON)
  }, [selectedMissionGeoJSON])

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
    getVectorLayer().name = MonitorFishLayer.MISSION_SELECTED
    monitorfishMap.getLayers().push(getVectorLayer())

    return () => {
      monitorfishMap.removeLayer(getVectorLayer())
    }
  }, [getVectorLayer])

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
    if (!missionData || !missionId) {
      return
    }

    const missionFeature = getMissionFeatureZone({ ...missionData, id: missionId })
    getVectorSource().addFeature(missionFeature)
  }, [getVectorSource, missionData, missionId])

  return null
}

export const SelectedMissionLayer = memo(UnmemoizedSelectedMissionLayer)

SelectedMissionLayer.displayName = 'SelectedMissionLayer'
