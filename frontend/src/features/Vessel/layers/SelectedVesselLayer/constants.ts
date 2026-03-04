import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

export const SELECTED_VESSEL_VECTOR_SOURCE = new VectorSource()

export const SELECTED_VESSEL_VECTOR_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.SELECTED_VESSEL,
  isClickable: true,
  isHoverable: true,
  renderBuffer: 7,
  source: SELECTED_VESSEL_VECTOR_SOURCE,
  updateWhileAnimating: false,
  updateWhileInteracting: false,
  zIndex: LayerProperties.SELECTED_VESSEL.zIndex
})
