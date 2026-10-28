import { jumpToMainWorldIfTooFar } from '@features/Map/utils'
import { useEffect } from 'react'

import type OpenLayerMap from 'ol/Map'

export function useWorldCopyJump(map: OpenLayerMap) {
  useEffect(() => {
    const handleMoveEnd = () => jumpToMainWorldIfTooFar(map)
    map.on('moveend', handleMoveEnd)

    return () => {
      map.un('moveend', handleMoveEnd)
    }
  }, [map])
}
