import { useEffect } from 'react'
import Hammer from 'hammerjs'

const X = 0
const Y = 1

export const useMoveOverlayWhenDragging = (ref, overlay, map, currentOffset, moveLineWithThrottle, showed) => {
  useEffect(() => {
    if (map && overlay) {
      overlay.on('change:offset', ({ target }) => {
        moveLineWithThrottle(target, 50)
      })
    }
  }, [overlay, map])

  useEffect(() => {
    if (showed && overlay && overlay.getElement()) {
      const hammer = new Hammer(overlay.getElement())
      hammer.on('pan', ({ deltaX, deltaY }) => {
        overlay.setOffset([currentOffset.current[X] + deltaX, currentOffset.current[Y] + deltaY])
      })

      hammer.on('panend', ({ deltaX, deltaY }) => {
        currentOffset.current = [currentOffset.current[X] + deltaX, currentOffset.current[Y] + deltaY]
      })
    }
  }, [showed, overlay])
}
