import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSELS_ESTIMATED_POSITION_VECTOR_LAYER } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/constants'

export function VesselEstimatedPositionLayer() {
  useMapLayer(VESSELS_ESTIMATED_POSITION_VECTOR_LAYER)

  return null
}
