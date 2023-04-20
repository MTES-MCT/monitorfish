import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useRef } from 'react'

import { getMissionPointWebGLStyle } from './styles'
import { LayerProperties } from '../../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../../domain/entities/layers/types'
import { getMissionFeaturePoint } from '../../../../../domain/entities/mission'
import { useGetMissionsWithActions } from '../../../../../domain/entities/mission/hooks/useGetMissionsWithActions'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'

import type { WebGLPointsLayerWithName } from '../../../../../domain/types/layer'
import type { Feature } from 'ol'
import type { Point } from 'ol/geom'
import type { MutableRefObject } from 'react'

export type MissionLayerProps = {
  map?: any
}
function UnmemoizedMissionLayer({ map }: MissionLayerProps) {
  const dispatch = useMainAppDispatch()
  const { missionsWithActions } = useGetMissionsWithActions()

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
        className: MonitorFishLayer.MISSION_PIN_POINT,
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

    const features = missionsWithActions
      .map(getMissionFeaturePoint)
      .filter((feature): feature is Feature<Point> => Boolean(feature))
    if (!features?.length) {
      return
    }

    getVectorSource().addFeatures(features)
  }, [dispatch, map, missionsWithActions])

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

export const MissionLayer = memo(UnmemoizedMissionLayer)
MissionLayer.displayName = 'MissionLayer'
