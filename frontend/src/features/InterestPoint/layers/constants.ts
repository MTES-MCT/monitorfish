import { getInterestPointStyle } from '@features/InterestPoint/layers/interestPoint.style'
import { LayerProperties } from '@features/Map/constants'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const INTEREST_POINT_VECTOR_SOURCE = new VectorSource()

export const INTEREST_POINT_VECTOR_LAYER = (function () {
  const layer = new Vector({
    renderBuffer: 7,
    source: INTEREST_POINT_VECTOR_SOURCE,
    style: (feature, resolution) => getInterestPointStyle(feature, resolution),
    zIndex: LayerProperties.INTEREST_POINT.zIndex
  })

  layer.setProperties({ code: LayerProperties.INTEREST_POINT.code })

  return layer
})()
