import { getWebGLVesselStyle } from '@features/Vessel/layers/style'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'

import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'

import type { WebGLPointsLayerWithName } from '../../../../domain/types/layer'

export const VESSELS_VECTOR_SOURCE = new VectorSource()

export const VESSELS_VECTOR_LAYER = new WebGLPointsLayer({
  className: LayerProperties[MonitorFishLayer.VESSELS].code,
  source: VESSELS_VECTOR_SOURCE as any,
  style: getWebGLVesselStyle(),
  zIndex: LayerProperties[MonitorFishLayer.VESSELS].zIndex
}) as WebGLPointsLayerWithName
