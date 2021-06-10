import React, { useCallback, useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import VesselTrackCard from '../cards/VesselTrackCard'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'
import { getOverlayPosition, OverlayPosition } from './position'

const overlayBoxSize = 240

const VesselTrackCardOverlay = ({ map, feature }) => {
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState([-170, -175])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)

  const overlayCallback = useCallback(
    (ref) => {
      overlayRef.current = ref
      if (ref) {
        overlayObjectRef.current = new Overlay({
          element: ref,
          autoPan: false,
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
      if (feature && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:position`)) {
        setVesselFeatureToShowOnCard(feature)
        overlayRef.current.style.display = 'block'
        overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

        const nextOverlayPosition = getNextOverlayPosition()
        setOverlayPosition(nextOverlayPosition)
        setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition))
      } else {
        setVesselFeatureToShowOnCard(null)
        overlayRef.current.style.display = 'none'
      }
    }
  }, [setVesselFeatureToShowOnCard, feature, overlayRef, overlayObjectRef])

  function getNextOverlayPosition () {
    const [x, y] = feature.getGeometry().getCoordinates()
    const extent = map.getView().calculateExtent()
    const boxSize = map.getView().getResolution() * overlayBoxSize

    return getOverlayPosition(boxSize, x, y, extent)
  }

  function getTopLeftMargin(nextOverlayPosition) {
    switch (nextOverlayPosition) {
      case OverlayPosition.TOP_LEFT: return [20, 20]
      case OverlayPosition.TOP_RIGHT: return [20, -397]
      case OverlayPosition.BOTTOM_LEFT: return [-170, 20]
      case OverlayPosition.BOTTOM_RIGHT: return [-170, -397]
      case OverlayPosition.TOP: return [20, -175]
      case OverlayPosition.RIGHT: return [-127, -397]
      case OverlayPosition.BOTTOM: return [-170, -175]
      case OverlayPosition.LEFT: return [-85, 20]
      default: return [-170, -175]
    }
  }

  return (
    <VesselTrackCardOverlayComponent ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {
        vesselFeatureToShowOnCard ? <VesselTrackCard vessel={vesselFeatureToShowOnCard} overlayPosition={overlayPosition} /> : null
      }
    </VesselTrackCardOverlayComponent>
  )
}

const VesselTrackCardOverlayComponent = styled.div`
  position: absolute;
  top: ${props => props.overlayTopLeftMargin[0]}px;
  left: ${props => props.overlayTopLeftMargin[1]}px;
  width: 350px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 300;
`
export default VesselTrackCardOverlay
