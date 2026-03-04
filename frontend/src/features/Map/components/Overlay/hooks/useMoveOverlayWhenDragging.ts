import Hammer from 'hammerjs'
import { unByKey } from 'ol/Observable'
import { useEffect } from 'react'

import type { EventsKey } from 'ol/events'
import type Overlay from 'ol/Overlay'
import type { MutableRefObject } from 'react'

const X = 0
const Y = 1

/**
 * /!\ DO NOT USE DIRECTLY, use `useMapOverlay`hook
 */
export const useMoveOverlayWhenDragging = (
  overlay: Overlay | undefined,
  currentOffset: MutableRefObject<number[]>,
  moveLineWithThrottle: (target: Overlay, delay: number) => void,
  showed: boolean,
  setIsPanning: (isPanning: boolean) => void
) => {
  useEffect(() => {
    let eventKey: EventsKey | undefined

    if (overlay) {
      eventKey = overlay.on('change:offset', ({ target }) => {
        moveLineWithThrottle(target as Overlay, 50)
      }) as EventsKey
    }

    return () => {
      if (eventKey) {
        unByKey(eventKey)
      }
    }
    // We do not want to trigger the effect on moveLineWithThrottle change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay])

  useEffect(() => {
    let hammer: HammerManager | undefined

    if (showed && overlay && overlay.getElement()) {
      hammer = new Hammer(overlay.getElement() as HTMLElement)
      hammer.on('pan', ({ deltaX, deltaY }: HammerInput) => {
        setIsPanning(true)
        overlay.setOffset([currentOffset.current[X]! + deltaX, currentOffset.current[Y]! + deltaY])
      })

      hammer.on('panend', ({ deltaX, deltaY }: HammerInput) => {
        // eslint-disable-next-line no-param-reassign
        currentOffset.current = [currentOffset.current[X]! + deltaX, currentOffset.current[Y]! + deltaY]
      })
    }

    return () => {
      if (hammer) {
        hammer.off('pan')
        hammer.off('panend')
      }
    }
    // We do not want to trigger the effect on currentOffset or setIsPanning change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showed, overlay])
}
