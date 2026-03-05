import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getLabelLineStyle } from '@features/Vessel/layers/VesselsLabelsLayer/style'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

export const VESSELS_LABEL_VECTOR_SOURCE = new VectorSource()

export const VESSELS_LABEL_VECTOR_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.VESSELS_LABEL,
  renderBuffer: 7,
  source: VESSELS_LABEL_VECTOR_SOURCE,
  style: getLabelLineStyle,
  updateWhileAnimating: false,
  updateWhileInteracting: false,
  zIndex: LayerProperties.VESSELS_LABEL.zIndex
})
