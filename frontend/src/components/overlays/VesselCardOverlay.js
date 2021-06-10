import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import VesselCard from '../cards/VesselCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'
import { getOverlayPosition, OverlayPosition } from './position'

const overlayBoxSize = 260

const VesselCardOverlay = ({ feature, map }) => {
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState([-277, -185])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)

  const overlayCallback = useCallback(
    (ref) => {
      overlayRef.current = ref
      if (ref) {
        overlayObjectRef.current = new Overlay({
          element: ref,
          autoPan: false,
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

        const nextOverlayPosition = getNextOverlayPosition()
        setOverlayPosition(nextOverlayPosition)
        setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition))
      } else {
        overlayRef.current.style.display = 'none'
        setVesselFeatureToShowOnCard(null)
      }
    }
  }, [feature, setVesselFeatureToShowOnCard, overlayRef, overlayObjectRef])

  function getNextOverlayPosition () {
    const [x, y] = feature.getGeometry().getCoordinates()
    const extent = map.getView().calculateExtent()
    const boxSize = map.getView().getResolution() * overlayBoxSize

    return getOverlayPosition(boxSize, x, y, extent)
  }

  function getTopLeftMargin(nextOverlayPosition) {
    switch (nextOverlayPosition) {
      case OverlayPosition.TOP_LEFT: return [20, 20]
      case OverlayPosition.TOP_RIGHT: return [20, -407]
      case OverlayPosition.BOTTOM_LEFT: return [-277, 20]
      case OverlayPosition.BOTTOM_RIGHT: return [-277, -407]
      case OverlayPosition.TOP: return [20, -185]
      case OverlayPosition.RIGHT: return [-127, -407]
      case OverlayPosition.BOTTOM: return [-277, -185]
      case OverlayPosition.LEFT: return [-127, 20]
      default: return [-277, -185]
    }
  }

  return (
    <VesselCardOverlayComponent ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {
        vesselFeatureToShowOnCard ? <VesselCard vessel={vesselFeatureToShowOnCard} overlayPosition={overlayPosition} /> : null
      }
    </VesselCardOverlayComponent>
  )
}

const VesselCardOverlayComponent = styled.div`
  position: absolute;
  top: ${props => props.overlayTopLeftMargin[0]}px;
  left: ${props => props.overlayTopLeftMargin[1]}px;
  width: 387px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 1000;
`

export default VesselCardOverlay
