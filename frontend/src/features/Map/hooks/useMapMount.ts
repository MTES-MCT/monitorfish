import { useEffect } from 'react'

import type OpenLayerMap from 'ol/Map'
import type { RefObject } from 'react'

export function useMapMount(map: OpenLayerMap, mapRef: RefObject<HTMLElement | undefined>) {
  useEffect(() => {
    map.setTarget(mapRef.current ?? undefined)

    return () => {
      map.setTarget(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
