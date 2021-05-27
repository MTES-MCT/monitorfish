import React, { useEffect, useState, useRef, useCallback } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import VesselCard from '../cards/VesselCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'

const VesselCardOverlay = ({ feature, map }) => {
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
  useEffect(() => {
    if (overlayRef.current && overlayObjectRef.current) {
      if (feature && feature.getId().toString().includes(LayersEnum.VESSELS.code)) {
        setVesselFeatureToShowOnCard(feature)
        overlayRef.current.style.display = 'block'
        overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())
      } else {
        overlayRef.current.style.display = 'none'
        setVesselFeatureToShowOnCard(null)
      }
    }
  }, [feature, setVesselFeatureToShowOnCard, overlayRef, overlayObjectRef])

  return (
    <VesselCardOverlayComponent ref={overlayCallback}>
      {
        vesselFeatureToShowOnCard ? <VesselCard vessel={vesselFeatureToShowOnCard} /> : null
      }
    </VesselCardOverlayComponent>
  )
}

const VesselCardOverlayComponent = styled.div`
  position: absolute;
  top: -277px;
  left: -185px;
  width: 387px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 200;
`

export default VesselCardOverlay
