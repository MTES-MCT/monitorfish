import { MainMap } from '@features/MainMap/MainMap.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { NEW_MISSION_ID } from './constants'
import { missionZoneStyle } from './MissionLayer/styles'
import { LayerProperties, OPENLAYERS_PROJECTION } from '../../MainMap/constants'
import { monitorfishMap } from '../../map/monitorfishMap'
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

  const vectorSourceRef = useRef<VectorSource>()
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource()
    }

    return vectorSourceRef.current as VectorSource
  }, [])

  const vectorLayerRef = useRef<MainMap.VectorLayerWithName>()
  const getVectorLayer = useCallback(() => {
    if (!vectorLayerRef.current) {
      vectorLayerRef.current = new VectorLayer({
        className: MainMap.MonitorFishLayer.MISSION_SELECTED,
        renderBuffer: 7,
        source: getVectorSource(),
        style: missionZoneStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSION_SELECTED.zIndex
      })
    }

    return vectorLayerRef.current
  }, [getVectorSource])

  useEffect(() => {
    getVectorLayer().name = MainMap.MonitorFishLayer.MISSION_SELECTED
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

    if (!selectedMission?.getId()?.toString()?.includes(MainMap.MonitorFishLayer.MISSION_PIN_POINT)) {
      return
    }

    const selectedMissionWithActions = missions.find(
      missionWithAction => missionWithAction.id === selectedMission.get('missionId')
    )
    if (!selectedMissionWithActions) {
      return
    }

    const missionFeature = getMissionFeatureZone(selectedMissionWithActions, MainMap.MonitorFishLayer.MISSION_SELECTED)
    getVectorSource().addFeature(missionFeature)
  }, [selectedMission, missions, draft?.mainFormValues, getVectorSource])

  useEffect(() => {
    getVectorSource().clear(true)

    if (!draft?.mainFormValues) {
      return
    }

    // When creating a new mission, dummy NEW_MISSION_ID is used
    const missionFeature = getMissionFeatureZone(
      { ...draft.mainFormValues, id: missionId ?? NEW_MISSION_ID },
      MainMap.MonitorFishLayer.MISSION_SELECTED
    )
    getVectorSource().addFeature(missionFeature)
  }, [getVectorSource, draft?.mainFormValues, missionId])

  return null
}

export const SelectedMissionLayer = memo(UnmemoizedSelectedMissionLayer)

SelectedMissionLayer.displayName = 'SelectedMissionLayer'
