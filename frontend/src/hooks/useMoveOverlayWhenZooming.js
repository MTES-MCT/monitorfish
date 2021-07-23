import { useEffect } from 'react'

export const useMoveOverlayWhenZooming = (overlay, initialOffsetValue, zoomHasChanged, currentOffset, moveWithThrottle) => {
  useEffect(() => {
    if (currentOffset && currentOffset.current !== initialOffsetValue) {
      moveWithThrottle(overlay, 50)
    }
  }, [zoomHasChanged])
}
