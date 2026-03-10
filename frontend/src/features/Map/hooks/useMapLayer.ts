import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useEffect, useRef } from 'react'

import type BaseLayer from 'ol/layer/Base'

export function useMapLayer(layerOrFactory: BaseLayer | (() => BaseLayer) | undefined, condition = true) {
  const cachedLayerRef = useRef<BaseLayer | undefined>(undefined)

  useEffect(() => {
    if (!layerOrFactory || !condition) {
      return undefined
    }

    if (!cachedLayerRef.current) {
      cachedLayerRef.current = typeof layerOrFactory === 'function' ? layerOrFactory() : layerOrFactory
    }
    const layer = cachedLayerRef.current

    monitorfishMap.getLayers().push(layer)

    return () => {
      monitorfishMap.removeLayer(layer)
    }
  }, [layerOrFactory, condition])
}
