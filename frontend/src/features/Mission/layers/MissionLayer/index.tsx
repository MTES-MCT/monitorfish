import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { NEW_MISSION_ID } from '@features/Mission/layers/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { missionPointWebGLStyle } from './styles'
import { useGetFilteredMissionsQuery } from '../../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionFeaturePoint } from '../../features'

import type { Feature } from 'ol'
import type { Point } from 'ol/geom'

function UnmemoizedMissionLayer() {
  const dispatch = useMainAppDispatch()
  const draft = useMainAppSelector(store => store.missionForm.draft)
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const { missions } = useGetFilteredMissionsQuery()

  const editedMissionFeaturePoint = useMemo(() => {
    if (!draft?.mainFormValues) {
      return undefined
    }

    return getMissionFeaturePoint({ ...draft?.mainFormValues, id: missionId ?? NEW_MISSION_ID })
  }, [draft?.mainFormValues, missionId])

  const vectorSourceRef = useRef<VectorSource<Feature<Point>>>()
  const layerRef = useRef<MonitorFishMap.WebGLPointsLayerWithName>()

  function getVectorSource() {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource<Feature<Point>>()
    }

    return vectorSourceRef.current
  }

  const getLayer = useCallback(() => {
    if (!layerRef.current) {
      layerRef.current = new WebGLPointsLayer({
        className: MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT,
        source: getVectorSource() as any,
        style: missionPointWebGLStyle,
        zIndex: LayerProperties.MISSION_PIN_POINT.zIndex
      })
    }

    return layerRef.current
  }, [])

  useEffect(() => {
    getVectorSource().clear()

    const features = missions
      .map(getMissionFeaturePoint)
      .filter((feature): feature is Feature<Point> => {
        if (missionId) {
          return feature !== undefined && !feature.getId()?.toString().includes(missionId.toString())
        }

        return feature !== undefined
      })
      .concat(editedMissionFeaturePoint ?? [])
    if (!features?.length) {
      return
    }

    getVectorSource().addFeatures(features)
  }, [dispatch, missions, missionId, editedMissionFeaturePoint])

  useEffect(() => {
    getLayer().name = LayerProperties.MISSION_PIN_POINT.code
    monitorfishMap.getLayers().push(getLayer())
    window.addEventListener('beforeunload', () => {
      monitorfishMap.removeLayer(getLayer())
      getLayer().dispose()
    })

    return () => {
      monitorfishMap.removeLayer(getLayer())
      getLayer().dispose()
    }
  }, [getLayer])

  return <></>
}

export const MissionLayer = memo(UnmemoizedMissionLayer)
MissionLayer.displayName = 'MissionLayer'
