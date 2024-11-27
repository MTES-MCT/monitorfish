import { MainMap } from '@features/MainMap/MainMap.types'
import { getWebGLVesselStyle } from '@features/Vessel/layers/style'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'

import { LayerProperties } from '../../../MainMap/constants'

export const VESSELS_VECTOR_SOURCE = new VectorSource()

export const VESSELS_VECTOR_LAYER = new WebGLPointsLayer({
  className: LayerProperties[MainMap.MonitorFishLayer.VESSELS].code,
  source: VESSELS_VECTOR_SOURCE as any,
  style: getWebGLVesselStyle(),
  zIndex: LayerProperties[MainMap.MonitorFishLayer.VESSELS].zIndex
}) as MainMap.WebGLPointsLayerWithName
