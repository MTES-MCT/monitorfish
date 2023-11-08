import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { TrackTypeCard } from './TrackTypeCard'
import { COLORS } from '../../../../constants/constants'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { monitorfishMap } from '../../monitorfishMap'

export function TrackTypeOverlay({ feature, pointerMoveEventPixel }) {
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
    if (overlayObjectRef.current) {
      monitorfishMap.addOverlay(overlayObjectRef.current)
    }
  }, [overlayObjectRef])

  useEffect(() => {
    if (!overlayRef.current || !overlayObjectRef.current) {
      return
    }

    if (
      !feature?.getId()?.toString()?.includes(LayerProperties.VESSEL_TRACK.code) ||
      !feature?.getId()?.toString()?.includes('line')
    ) {
      setTrackTypeToShowOnCard(null)
      overlayRef.current.style.display = 'none'

      return
    }

    setTrackTypeToShowOnCard(feature.trackType)
    overlayRef.current.style.display = 'block'
    if (pointerMoveEventPixel) {
      overlayObjectRef.current.setPosition(monitorfishMap.getCoordinateFromPixel(pointerMoveEventPixel))
    }
  }, [setTrackTypeToShowOnCard, pointerMoveEventPixel, feature])

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
