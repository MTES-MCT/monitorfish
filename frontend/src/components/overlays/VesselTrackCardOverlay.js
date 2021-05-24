import React, { useCallback, useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import VesselTrackCard from '../cards/VesselTrackCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'

const VesselTrackCardOverlay = ({ map, feature }) => {
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
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

  const showOverlay = () => {
    overlayRef.current.style.display = 'block'
    overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())
  }
  useEffect(() => {
    if (overlayRef.current && overlayObjectRef.current) {
      if (feature && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:line`)) {
        showOverlay()
        setVesselFeatureToShowOnCard(feature.getProperties().trackType)
      } else if (feature && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:position`)) {
        showOverlay()
        setVesselFeatureToShowOnCard(feature)
      } else {
        setVesselFeatureToShowOnCard(null)
        overlayRef.current.style.display = 'none'
      }
    }
  }, [setVesselFeatureToShowOnCard, feature, overlayRef, overlayObjectRef])
  return (
    <VesselTrackCardOverlayComponent ref={overlayCallback}>
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
