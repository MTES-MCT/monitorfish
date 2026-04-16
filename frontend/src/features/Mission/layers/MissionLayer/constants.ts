import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'

import { missionPointWebGLStyle } from './styles'

import type { Feature } from 'ol'
import type { Point } from 'ol/geom'

export const MISSIONS_VECTOR_SOURCE = new VectorSource<Feature<Point>>()

export const MISSIONS_VECTOR_LAYER = new WebGLPointsLayer({
  className: MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT,
  source: MISSIONS_VECTOR_SOURCE as any,
  style: missionPointWebGLStyle,
  zIndex: LayerProperties.MISSION_PIN_POINT.zIndex
})
MISSIONS_VECTOR_LAYER.setProperties({
  code: LayerProperties.MISSION_PIN_POINT.code,
  isClickable: true,
  isHoverable: true
})
