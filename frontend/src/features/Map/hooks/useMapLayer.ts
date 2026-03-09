import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useEffect } from 'react'

import type BaseLayer from 'ol/layer/Base'

export function useMapLayer(layer: BaseLayer | undefined, condition = true) {
  useEffect(() => {
    if (!layer || !condition) {
      return undefined
    }

    monitorfishMap.getLayers().push(layer)

    return () => {
      monitorfishMap.removeLayer(layer)
    }
  }, [layer, condition])
}
