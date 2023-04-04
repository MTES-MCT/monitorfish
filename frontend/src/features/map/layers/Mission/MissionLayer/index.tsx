import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'
import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { getMissionPointWebGLStyle } from './styles'
import { LayerProperties } from '../../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../../domain/entities/layers/types'
import { getMissionFeaturePoint } from '../../../../../domain/entities/mission'
import { useGetMissionsAndActions } from '../../../../../domain/entities/mission/hooks/useGetMissionsAndActions'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'

import type { WebGLPointsLayerWithName } from '../../../../../domain/types/layer'
import type { Feature } from 'ol'
import type { Point } from 'ol/geom'

export type MissionLayerProps = {
  map?: any
}
function UnmemoizedMissionLayer({ map }: MissionLayerProps) {
  const dispatch = useMainAppDispatch()
  const missionsAndActions = useGetMissionsAndActions()

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource<Point>>
  const layerRef = useRef() as MutableRefObject<WebGLPointsLayerWithName>

  function getVectorSource() {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource<Point>()
    }

    return vectorSourceRef.current
  }

  const getLayer = useCallback(() => {
    if (!layerRef.current) {
      layerRef.current = new WebGLPointsLayer({
        className: MonitorFishLayer.MISSION,
        source: getVectorSource(),
        style: getMissionPointWebGLStyle(),
        zIndex: LayerProperties.MISSION_PIN_POINT.zIndex
      })
    }

    return layerRef.current
  }, [])

  useEffect(() => {
    if (!map) {
      return
    }
    getVectorSource().clear()

    const features = missionsAndActions
      .map(missionAndActions => getMissionFeaturePoint(missionAndActions.mission, missionAndActions.actions))
      .filter((feature): feature is Feature<Point> => Boolean(feature))
    if (!features?.length) {
      return
    }

    getVectorSource().addFeatures(features)
  }, [dispatch, map, missionsAndActions])

  useEffect(() => {
    if (!map) {
      return undefined
    }

    getLayer().name = LayerProperties.MISSION_PIN_POINT.code
    map.getLayers().push(getLayer())

    return () => {
      map.removeLayer(getLayer())
    }
  }, [getLayer, map])

  return <></>
}

export const MissionLayer = React.memo(UnmemoizedMissionLayer)
MissionLayer.displayName = 'MissionLayer'
