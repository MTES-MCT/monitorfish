import { LayerProperties } from '@features/Map/constants'
import { getLabelLineStyle } from '@features/Vessel/layers/VesselsLabelsLayer/style'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const VESSELS_LABEL_VECTOR_SOURCE = new VectorSource()

export const VESSELS_LABEL_VECTOR_LAYER = (function () {
  const layer = new Vector({
    renderBuffer: 7,
    source: VESSELS_LABEL_VECTOR_SOURCE,
    style: getLabelLineStyle,
    updateWhileAnimating: false,
    updateWhileInteracting: false,
    zIndex: LayerProperties.VESSELS_LABEL.zIndex
  })

  layer.setProperties({ code: LayerProperties.VESSELS_LABEL.code })

  return layer
})()
