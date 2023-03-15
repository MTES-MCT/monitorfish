import { useEffect, useRef } from 'react'

export function useIsZooming(map, hasMoved) {
  const previousMapZoom = useRef('')
  const isZoomingRef = useRef(false)

  useEffect(() => {
    const currentZoom = map.getView().getZoom().toFixed(2)

    if (currentZoom !== previousMapZoom.current) {
      previousMapZoom.current = currentZoom
      isZoomingRef.current = true

      return
    }

    isZoomingRef.current = false
  }, [map, hasMoved])

  return isZoomingRef.current
}
