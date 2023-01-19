import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { Layer } from '../../../domain/entities/layers/constants'
import { TrackTypeCard } from '../cards/TrackTypeCard'

export function TrackTypeCardOverlay({ feature, map, pointerMoveEventPixel }) {
  const [trackTypeToShowOnCard, setTrackTypeToShowOnCard] = useState(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayObjectRef = useRef<Overlay | null>(null)

  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref

      if (!ref) {
        overlayObjectRef.current = null

        return
      }

      overlayObjectRef.current = new Overlay({
        autoPan: true,
        className: 'ol-overlay-container ol-selectable',
        element: ref
      })
    },
    [overlayRef, overlayObjectRef]
  )

  useEffect(() => {
    if (map) {
      map.addOverlay(overlayObjectRef.current)
    }
  }, [map, overlayObjectRef])

  useEffect(() => {
    if (!overlayRef.current || !overlayObjectRef.current) {
      return
    }

    if (
      !feature?.getId()?.toString()?.includes(Layer.VESSEL_TRACK.code) ||
      !feature?.getId()?.toString()?.includes('line')
    ) {
      setTrackTypeToShowOnCard(null)
      overlayRef.current.style.display = 'none'

      return
    }

    setTrackTypeToShowOnCard(feature.trackType)
    overlayRef.current.style.display = 'block'
    if (pointerMoveEventPixel) {
      overlayObjectRef.current.setPosition(map.getCoordinateFromPixel(pointerMoveEventPixel))
    }
  }, [map, setTrackTypeToShowOnCard, pointerMoveEventPixel, feature])

  return (
    <TrackTypeCardOverlayComponent ref={overlayCallback}>
      {trackTypeToShowOnCard && <TrackTypeCard trackType={trackTypeToShowOnCard} />}
    </TrackTypeCardOverlayComponent>
  )
}

const TrackTypeCardOverlayComponent = styled.div`
  position: absolute;
  top: -39px;
  left: -56px;
  width: 100px;
  text-align: left;
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  z-index: 100;
`
