import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getEstimatedPositionStyle } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/style'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE = new VectorSource()

export const VESSELS_ESTIMATED_POSITION_VECTOR_LAYER = (function () {
  const layer = new Vector({
    renderBuffer: -3,
    source: VESSELS_ESTIMATED_POSITION_VECTOR_SOURCE as any,
    style: feature => getEstimatedPositionStyle(feature),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    zIndex: LayerProperties.VESSEL_ESTIMATED_POSITION.zIndex
  }) as MonitorFishMap.VectorLayerWithName

  layer.name = LayerProperties.VESSEL_ESTIMATED_POSITION.code

  return layer
})()

export const EstimatedPositionFeatureColorProperty = 'color'
export const EstimatedPositionFeatureOpacityProperty = 'opacity'
export const EstimatedPositionFeatureIsCircleProperty = 'isCircle'
export const EstimatedPositionFeatureIsHiddenProperty = 'isHidden'
