import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import TrackTypeCard from '../cards/VesselTrackCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'
import { trackTypes } from '../../domain/entities/vesselTrack'

const TrackTypeCardOverlay = ({ map, pointerMoveEvent, feature }) => {
  const [trackTypeToShowOnCard, setTrackTypeToShowOnCard] = useState(null)
  const trackTypeCardID = 'track-line-card'
  // memo ?
  const documentElement = document.getElementById(trackTypeCardID)
  const overlay = new Overlay({
    element: documentElement,
    autoPan: true,
    autoPanAnimation: {
      duration: 400
    },
    className: 'ol-overlay-container ol-selectable'
  })

  useEffect(() => {
    if (documentElement) {
      if (documentElement && feature && feature.getId().toString().includes(`${LayersEnum.REGULATORY.code}`)) {
        setTrackTypeToShowOnCard(feature.getProperties().trackType)
        documentElement.style.display = 'block'
        overlay.setPosition(map.getCoordinateFromPixel(pointerMoveEvent.pixel))
        // Comment avoir la position qui est liée à un evetn du coup ?!
      } else {
        setTrackTypeToShowOnCard(null)
        documentElement.style.display = 'none'
      }
    }
  // else est-ce qu'on reset ?
  }, [trackTypeToShowOnCard])
  return (
    <trackTypeCardOverlayComponent id={trackTypeCardID} isBig={trackTypeToShowOnCard === trackTypes.SEARCHING}>
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
