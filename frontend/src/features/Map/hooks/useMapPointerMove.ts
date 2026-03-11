import { HIT_PIXEL_TO_TOLERANCE } from '@constants/constants'
import { hoverOnMapFeature } from '@features/Map/useCases/hoverOnMapFeature'
import { useCallback, useEffect, useRef } from 'react'

import type { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'
import type { Feature, MapBrowserEvent } from 'ol'
import type { FeatureLike } from 'ol/Feature'
import type OpenLayerMap from 'ol/Map'

export function useMapPointerMove(
  map: OpenLayerMap,
  onPointerMove: ((event: MapBrowserEvent<any>) => void) | undefined,
  setCurrentFeature: ((feature: Feature | FeatureWithCodeAndEntityId | undefined) => void) | undefined,
  onCoordinates: ((event: MapBrowserEvent<any>) => void) | undefined
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastEventRef = useRef<MapBrowserEvent<any> | null>(null)

  const handlePointerMove = useCallback(
    (event: MapBrowserEvent<any>) => {
      if (!event) {
        return
      }

      const pixel = map.getEventPixel(event.originalEvent)
      const feature = map.forEachFeatureAtPixel<FeatureLike>(pixel, hoveredFeature => hoveredFeature, {
        hitTolerance: HIT_PIXEL_TO_TOLERANCE,
        layerFilter: layer => layer.get('isHoverable') === true
      })

      if (onPointerMove) {
        onPointerMove(event)
      }

      if (!feature?.getId()) {
        if (setCurrentFeature) {
          setCurrentFeature(undefined)
        }
        hoverOnMapFeature(undefined)
        // eslint-disable-next-line no-param-reassign
        ;(map.getTarget() as HTMLElement).style.cursor = ''

        return
      }

      if (setCurrentFeature) {
        setCurrentFeature(feature as Feature | FeatureWithCodeAndEntityId | undefined)
        hoverOnMapFeature(feature as Feature | FeatureWithCodeAndEntityId | undefined)
      }
      // eslint-disable-next-line no-param-reassign
      ;(map.getTarget() as HTMLElement).style.cursor = 'pointer'
    },
    [map, onPointerMove, setCurrentFeature]
  )

  const throttledPointerMove = useCallback(
    (event: MapBrowserEvent<any>) => {
      if (event.dragging || timeoutRef.current) {
        if (timeoutRef.current) {
          lastEventRef.current = event
        }

        return
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        if (lastEventRef.current) {
          handlePointerMove(lastEventRef.current)
          onCoordinates?.(lastEventRef.current)
        }
      }, 50)
    },
    [handlePointerMove, onCoordinates]
  )

  useEffect(() => {
    const handler = (event: MapBrowserEvent<any>) => throttledPointerMove(event)
    map.on('pointermove', handler)

    return () => {
      map.un('pointermove', handler)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [map, throttledPointerMove])
}
