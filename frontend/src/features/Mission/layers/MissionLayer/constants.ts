import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'

import { missionPointWebGLStyle } from './styles'

import type { Feature } from 'ol'
import type { Point } from 'ol/geom'

export const MISSIONS_VECTOR_SOURCE = new VectorSource<Feature<Point>>()

let missionsVectorLayer: WebGLPointsLayer<any> | undefined

/**
 * Created on first use: creating a WebGL layer downloads the icons sprite of its style,
 * while this layer is only displayed to super-users.
 */
export function getMissionsVectorLayer(): WebGLPointsLayer<any> {
  if (!missionsVectorLayer) {
    missionsVectorLayer = new WebGLPointsLayer({
      className: MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT,
      source: MISSIONS_VECTOR_SOURCE as any,
      style: missionPointWebGLStyle,
      zIndex: LayerProperties.MISSION_PIN_POINT.zIndex
    })
    missionsVectorLayer.setProperties({
      code: LayerProperties.MISSION_PIN_POINT.code,
      isClickable: true,
      isHoverable: true
    })
  }

  return missionsVectorLayer
}
