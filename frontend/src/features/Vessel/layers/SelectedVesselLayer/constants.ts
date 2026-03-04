import { LayerProperties } from '@features/Map/constants'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const SELECTED_VESSEL_VECTOR_SOURCE = new VectorSource()

export const SELECTED_VESSEL_VECTOR_LAYER = (function () {
  const layer = new Vector({
    renderBuffer: 7,
    source: SELECTED_VESSEL_VECTOR_SOURCE,
    updateWhileAnimating: false,
    updateWhileInteracting: false,
    zIndex: LayerProperties.SELECTED_VESSEL.zIndex
  })

  layer.setProperties({ code: LayerProperties.SELECTED_VESSEL.code, isClickable: true, isHoverable: true })

  return layer
})()
