import { LayerProperties } from '@features/Map/constants'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export const VESSEL_TRACK_VECTOR_SOURCE = new VectorSource<Feature<Geometry>>()

export const VESSEL_TRACK_VECTOR_LAYER = (function () {
  const layer = new Vector({
    renderBuffer: 4,
    source: VESSEL_TRACK_VECTOR_SOURCE as any,
    updateWhileAnimating: false,
    updateWhileInteracting: false,
    zIndex: LayerProperties.VESSEL_TRACK.zIndex
  })

  layer.setProperties({ code: LayerProperties.VESSEL_TRACK.code, isClickable: true, isHoverable: true })

  return layer
})()
