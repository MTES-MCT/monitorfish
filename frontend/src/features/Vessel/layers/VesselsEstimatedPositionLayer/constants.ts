import { LayerProperties } from '@features/Map/constants'
import { getEstimatedPositionStyle } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/style'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE = new VectorSource()

export const VESSELS_ESTIMATED_POSITION_VECTOR_LAYER = (function () {
  const layer = new Vector({
    renderBuffer: -3,
    source: VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE as any,
    style: feature => getEstimatedPositionStyle(feature),
    updateWhileAnimating: false,
    updateWhileInteracting: false,
    zIndex: LayerProperties.VESSEL_ESTIMATED_POSITION.zIndex
  })

  layer.setProperties({ code: LayerProperties.VESSEL_ESTIMATED_POSITION.code, isHoverable: true })

  return layer
})()
