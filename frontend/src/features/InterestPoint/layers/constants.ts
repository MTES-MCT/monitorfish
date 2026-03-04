import { getInterestPointStyle } from '@features/InterestPoint/layers/interestPoint.style'
import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

export const INTEREST_POINT_VECTOR_SOURCE = new VectorSource()

export const INTEREST_POINT_VECTOR_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.INTEREST_POINT,
  renderBuffer: 7,
  source: INTEREST_POINT_VECTOR_SOURCE,
  style: (feature, resolution) => getInterestPointStyle(feature, resolution),
  zIndex: LayerProperties.INTEREST_POINT.zIndex
})
