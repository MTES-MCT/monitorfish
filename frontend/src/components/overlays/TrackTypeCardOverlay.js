import React, { useEffect, useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import TrackTypeCard from '../cards/TrackTypeCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'
import { trackTypes } from '../../domain/entities/vesselTrack'

const TrackTypeCardOverlay = ({ map, pointerMoveEventPixel, feature }) => {
  const [trackTypeToShowOnCard, setTrackTypeToShowOnCard] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)

  const overlayCallback = useCallback(
    (ref) => {
      overlayRef.current = ref
      if (ref) {
        overlayObjectRef.current = new Overlay({
          element: ref,
          autoPan: true,
          autoPanAnimation: {
            duration: 400
          },
          className: 'ol-overlay-container ol-selectable'
        })
      } else {
        overlayObjectRef.current = null
      }
    },
    [overlayRef, overlayObjectRef]
  )

  useEffect(() => {
    if (map) {
      map.addOverlay(overlayObjectRef.current)
    }
  }, [map, overlayObjectRef])

  useEffect(() => {
    if (overlayRef.current && overlayObjectRef.current) {
      if (feature && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:line`)) {
        setTrackTypeToShowOnCard(feature.getProperties().trackType)
        overlayRef.current.style.display = 'block'
        overlayObjectRef.current.setPosition(map.getCoordinateFromPixel(pointerMoveEventPixel))
      } else {
        setTrackTypeToShowOnCard(null)
        overlayRef.current.style.display = 'none'
      }
    }
  }, [setTrackTypeToShowOnCard, pointerMoveEventPixel, feature, overlayRef, overlayObjectRef])

  return (
    <TrackTypeCardOverlayComponent ref={overlayCallback}>
    {
      trackTypeToShowOnCard ? <TrackTypeCard trackType={trackTypeToShowOnCard} /> : null
    }
    </TrackTypeCardOverlayComponent>
  )
}

const TrackTypeCardOverlayComponent = styled.div`
  position: absolute;
  top: -39px;
  left: -102px;
  width: 215px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 100;
`

export default TrackTypeCardOverlay
