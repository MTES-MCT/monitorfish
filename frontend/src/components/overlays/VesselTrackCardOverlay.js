import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import VesselTrackCard from '../cards/VesselTrackCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'

const VesselTrackCardOverlay = ({ feature }) => {
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const vesselTrackCardID = 'vessel-track-card'
  // memo ?
  const documentElement = document.getElementById(vesselTrackCardID)
  const overlay = new Overlay({
    element: documentElement,
    autoPan: true,
    autoPanAnimation: {
      duration: 400
    },
    className: 'ol-overlay-container ol-selectable'
  })
  const showOverlay = (documentElement) => {
    documentElement.style.display = 'block'
    overlay.setPosition(feature.getGeometry().getCoordinates())
  }
  useEffect(() => {
    if (documentElement) {
      if (feature && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:line`)) {
        showOverlay()
        setVesselFeatureToShowOnCard(feature.getProperties().trackType)
      } else if (feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:position`)) {
        showOverlay(documentElement)
        setVesselFeatureToShowOnCard(feature)
      } else {
        setVesselFeatureToShowOnCard(null)
        documentElement.style.display = 'none'
      }
    }
  }, [feature])
  return (
    <VesselTrackCardOverlayComponent id={vesselTrackCardID}>
      {
        vesselFeatureToShowOnCard ? <VesselTrackCard vessel={vesselFeatureToShowOnCard} /> : null
      }
    </VesselTrackCardOverlayComponent>
  )
}

const VesselTrackCardOverlayComponent = styled.div`
  position: absolute;
  top: -170px;
  left: -175px;
  width: 350px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 300;
`
export default VesselTrackCardOverlay
