import { VESSELS_ESTIMATED_POSITION_VECTOR_LAYER } from '@features/Vessel/layers/VesselsEstimatedPositionLayer/constants'
import { useEffect } from 'react'

import { monitorfishMap } from '../../../Map/monitorfishMap'

export function VesselEstimatedPositionLayer() {
  useEffect(() => {
    monitorfishMap.getLayers().push(VESSELS_ESTIMATED_POSITION_VECTOR_LAYER)

    return () => {
      monitorfishMap.removeLayer(VESSELS_ESTIMATED_POSITION_VECTOR_LAYER)
    }
  }, [])

  return null
}
