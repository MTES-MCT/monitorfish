import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getWebGLVesselStyle } from '@features/Vessel/layers/style'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'

export const VESSELS_VECTOR_SOURCE = new VectorSource()

export const VESSELS_VECTOR_LAYER = new WebGLPointsLayer({
  className: LayerProperties[MonitorFishMap.MonitorFishLayer.VESSELS].code,
  source: VESSELS_VECTOR_SOURCE as any,
  style: getWebGLVesselStyle(),
  zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.VESSELS].zIndex
}) as MonitorFishMap.WebGLPointsLayerWithName
