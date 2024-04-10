import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useRef } from 'react'

import { missionPointWebGLStyle } from './styles'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { monitorfishMap } from '../../../map/monitorfishMap'
import { useGetFilteredMissionsQuery } from '../../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionFeaturePoint } from '../../index'

import type { WebGLPointsLayerWithName } from '../../../../domain/types/layer'
import type { Feature } from 'ol'
import type { Point } from 'ol/geom'

function UnmemoizedMissionLayer() {
  const dispatch = useMainAppDispatch()
  const { missions } = useGetFilteredMissionsQuery()

  const vectorSourceRef = useRef<VectorSource<Feature<Point>>>()
  const layerRef = useRef<WebGLPointsLayerWithName>()

  function getVectorSource() {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource<Feature<Point>>()
    }

    return vectorSourceRef.current
  }

  const getLayer = useCallback(() => {
    if (!layerRef.current) {
      layerRef.current = new WebGLPointsLayer({
        className: MonitorFishLayer.MISSION_PIN_POINT,
        source: getVectorSource(),
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
      .filter((feature): feature is Feature<Point> => feature !== undefined)
    if (!features?.length) {
      return
    }

    getVectorSource().addFeatures(features)
  }, [dispatch, missions])

  useEffect(() => {
    getLayer().name = LayerProperties.MISSION_PIN_POINT.code
    monitorfishMap.getLayers().push(getLayer())

    return () => {
      monitorfishMap.removeLayer(getLayer())
      getLayer().dispose()
    }
  }, [getLayer])

  return <></>
}

export const MissionLayer = memo(UnmemoizedMissionLayer)
MissionLayer.displayName = 'MissionLayer'
