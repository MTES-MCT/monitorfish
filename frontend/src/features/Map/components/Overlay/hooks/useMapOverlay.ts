import { useMoveOverlayWhenDragging } from '@features/Map/components/Overlay/hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '@features/Map/components/Overlay/hooks/useMoveOverlayWhenZooming'
import { type OverlayCardMargins, OverlayPosition } from '@features/Map/components/Overlay/types'
import { computeSmartPositionAndOffset } from '@features/Map/components/Overlay/utils'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { getMapResolution } from '@features/Map/utils'
import { noop } from 'lodash-es'
import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type OverlayPositioning = ConstructorParameters<typeof Overlay>[0]['positioning']

type UseMapOverlayResult = {
  overlayElementRef: React.RefObject<HTMLDivElement>
  overlayPosition: OverlayPosition | undefined
  /** Resets the overlay offset to `initialOffset` (e.g. when the feature jumps far away). */
  resetOffset: () => void
}

type UseMapOverlayParams = {
  /**
   * Coordinates in OPENLAYERS_PROJECTION. Pass `undefined` to hide the overlay
   * (e.g. when no feature is hovered).
   * For WSG84 input, project before passing.
   */
  coordinates: number[] | undefined
  initialOffset?: number[]
  margins?: OverlayCardMargins
  /**
   * Called after each drag or zoom-with-offset move.
   * Receives the anchor coordinates (OPENLAYERS_PROJECTION), the new
   * dragged-to coordinates, and the current offset array.
   */
  onDrag?: ((anchorCoordinates: number[], nextCoordinates: number[], offset: number[]) => void) | undefined
  overlayHeight?: number
  positioning?: OverlayPositioning
  zoomHasChanged?: number | undefined
}
export function useMapOverlay({
  coordinates,
  initialOffset = [0, 0],
  margins,
  onDrag,
  overlayHeight,
  positioning = 'center-left',
  zoomHasChanged
}: UseMapOverlayParams): UseMapOverlayResult {
  const overlayElementRef = useRef<HTMLDivElement>(null)
  const currentOffset = useRef(initialOffset)
  const coordinatesRef = useRef(coordinates)
  coordinatesRef.current = coordinates
  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag
  const isThrottled = useRef(false)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition | undefined>(
    margins ? OverlayPosition.BOTTOM : undefined
  )
  const overlay = useMemo(
    () => new Overlay({ autoPan: false, offset: initialOffset, positioning }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Mount: attach element, add to map, signal ready after 50 ms
  useEffect(() => {
    if (!overlayElementRef.current) {
      return noop
    }

    overlay.setElement(overlayElementRef.current)
    monitorfishMap.addOverlay(overlay)

    const timer = setTimeout(() => setIsDisplayed(true), 50)

    return () => {
      clearTimeout(timer)
      setIsDisplayed(false)
      monitorfishMap.removeOverlay(overlay)
    }
    // overlayElementRef intentionally excluded to avoid infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay])

  // Sync position — undefined hides the overlay
  useEffect(() => {
    overlay.setPosition(coordinates)
  }, [coordinates, overlay])

  // Smart positioning: recompute overlay quadrant when coordinates, margins, or overlayHeight change.
  useEffect(() => {
    if (!margins || overlayHeight === undefined || !coordinates) {
      return
    }

    const [x, y] = coordinates
    if (x === undefined || y === undefined) {
      return
    }

    const extent = monitorfishMap.getView().calculateExtent()
    const boxSize = getMapResolution() * overlayHeight
    const { offset, position } = computeSmartPositionAndOffset(x, y, extent, boxSize, margins, overlayHeight)
    setOverlayPosition(position)
    currentOffset.current = offset
    overlay.setOffset(offset)
  }, [coordinates, margins, overlay, overlayHeight])

  // Throttled drag/move handler — reads all mutable state via refs so the
  // closure captured by useMoveOverlayWhenDragging (registered once) stays valid.
  const moveWithThrottle = (target: Overlay, delay: number) => {
    if (isThrottled.current || target.getOffset() === initialOffset) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      const anchorCoordinates = coordinatesRef.current
      if (!anchorCoordinates) {
        isThrottled.current = false

        return
      }

      const offset = target.getOffset()
      const [offsetX = 0, offsetY = 0] = offset
      const pixel = monitorfishMap.getPixelFromCoordinate(anchorCoordinates)
      if (!pixel) {
        isThrottled.current = false

        return
      }

      const [pixelX = 0, pixelY = 0] = pixel
      const { width } = target.getElement()!.getBoundingClientRect()
      const nextCoordinates = monitorfishMap.getCoordinateFromPixel([pixelX + offsetX + width / 2, pixelY + offsetY])
      if (!nextCoordinates) {
        isThrottled.current = false

        return
      }

      onDragRef.current?.(anchorCoordinates, nextCoordinates, offset)
      isThrottled.current = false
    }, delay)
  }

  useMoveOverlayWhenDragging(overlay, currentOffset, moveWithThrottle, isDisplayed, noop)
  useMoveOverlayWhenZooming(overlay, initialOffset, zoomHasChanged, currentOffset, moveWithThrottle)

  const resetOffset = useCallback(() => {
    currentOffset.current = initialOffset
    overlay.setOffset(initialOffset)
  }, [initialOffset, overlay])

  return { overlayElementRef, overlayPosition, resetOffset }
}
