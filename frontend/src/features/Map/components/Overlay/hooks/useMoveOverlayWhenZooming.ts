import { useEffect } from 'react'

import type Overlay from 'ol/Overlay'
import type { MutableRefObject } from 'react'

/**
 * /!\ DO NOT USE DIRECTLY, use `useMapOverlay`hook
 */
export const useMoveOverlayWhenZooming = (
  overlay: Overlay,
  initialOffsetValue: number[],
  zoomHasChanged: number | undefined,
  currentOffset: MutableRefObject<number[]>,
  moveWithThrottle: (target: Overlay, delay: number) => void
) => {
  useEffect(() => {
    if (currentOffset && currentOffset.current !== initialOffsetValue) {
      moveWithThrottle(overlay, 50)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomHasChanged])
}
