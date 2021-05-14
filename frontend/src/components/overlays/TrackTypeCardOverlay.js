import React, { useEffect, useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import TrackTypeCard from '../cards/VesselTrackCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'
import { trackTypes } from '../../domain/entities/vesselTrack'

const TrackTypeCardOverlay = ({ map, pointerMoveEventPixel, feature }) => {
  const [trackTypeToShowOnCard, setTrackTypeToShowOnCard] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)

  const overlayCallback = useCallback(
    (e) => {
      overlayRef.current = e
      if (e) {
        overlayObjectRef.current = new Overlay({
          element: e,
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
  }, [map])

  useEffect(() => {
    if (overlayRef.current && overlayObjectRef.current) {
      if (feature && feature.getId().toString().includes(`${LayersEnum.REGULATORY.code}`)) {
        setTrackTypeToShowOnCard(feature.getProperties().trackType)
        overlayRef.current.style.display = 'block'
        overlayRef.current.setPosition(map.getCoordinateFromPixel(pointerMoveEventPixel))
      } else {
        setTrackTypeToShowOnCard(null)
        overlayRef.current.style.display = 'none'
      }
    }
  // else est-ce qu'on reset ?
  }, [trackTypeToShowOnCard])
  return (
    <trackTypeCardOverlayComponent ref={overlayCallback} isBig={trackTypeToShowOnCard === trackTypes.SEARCHING}>
    {
      trackTypeToShowOnCard ? <TrackTypeCard isBig={trackTypeToShowOnCard === trackTypes.SEARCHING} trackType={trackTypeToShowOnCard} /> : null
    }
    </trackTypeCardOverlayComponent>
  )
}

const trackTypeCardOverlayComponent = styled.div`
  position: absolute;
  top: -39px;
  left: ${props => props.isBig ? '-170px' : '-100px'};
  width: ${props => props.isBig ? '340px' : '200px'};;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 100;
`

export default TrackTypeCardOverlay
