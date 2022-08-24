import Hammer from 'hammerjs'
import { unByKey } from 'ol/Observable'
import { useEffect } from 'react'

const X = 0
const Y = 1

export const useMoveOverlayWhenDragging = (overlay, map, currentOffset, moveLineWithThrottle, showed, setIsPanning) => {
  useEffect(() => {
    let eventKey

    if (map && overlay) {
      eventKey = overlay.on('change:offset', ({ target }) => {
        moveLineWithThrottle(target, 50)
      })
    }

    return () => {
      if (eventKey) {
        unByKey(eventKey)
      }
    }
  }, [overlay, map])

  useEffect(() => {
    let hammer
    if (showed && overlay && overlay.getElement()) {
      hammer = new Hammer(overlay.getElement())
      hammer.on('pan', ({ deltaX, deltaY }) => {
        setIsPanning(true)
        overlay.setOffset([currentOffset.current[X] + deltaX, currentOffset.current[Y] + deltaY])
      })

      hammer.on('panend', ({ deltaX, deltaY }) => {
        currentOffset.current = [currentOffset.current[X] + deltaX, currentOffset.current[Y] + deltaY]
      })
    }

    return () => {
      if (hammer) {
        hammer.off('pan')
        hammer.off('panend')
      }
    }
  }, [showed, overlay])
}
