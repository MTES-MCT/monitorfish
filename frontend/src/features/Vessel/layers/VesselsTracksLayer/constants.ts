import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export const VESSEL_TRACK_VECTOR_SOURCE = new VectorSource<Feature<Geometry>>()

export const VESSEL_TRACK_VECTOR_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.VESSEL_TRACK,
  isClickable: true,
  isHoverable: true,
  renderBuffer: 4,
  source: VESSEL_TRACK_VECTOR_SOURCE as any,
  updateWhileAnimating: false,
  updateWhileInteracting: false,
  zIndex: LayerProperties.VESSEL_TRACK.zIndex
})
