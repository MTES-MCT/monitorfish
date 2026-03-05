import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getEstimatedPositionStyle } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/style'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

export const VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE = new VectorSource()

export const VESSELS_ESTIMATED_POSITION_VECTOR_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.VESSEL_ESTIMATED_POSITION,
  isHoverable: true,
  renderBuffer: -3,
  source: VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE as any,
  style: feature => getEstimatedPositionStyle(feature),
  updateWhileAnimating: false,
  updateWhileInteracting: false,
  zIndex: LayerProperties.VESSEL_ESTIMATED_POSITION.zIndex
})
