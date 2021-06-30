import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import { COLORS } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'
import VesselEstimatedPositionCard from '../cards/VesselEstimatedPositionCard'
import { getCoordinates } from '../../utils'
import { WSG84_PROJECTION } from '../../domain/entities/map'

const VesselEstimatedPositionCardOverlay = ({ map, pointerMoveEventPixel, feature }) => {
  const [coordinates, setCoordinates] = useState(null)
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
      if (feature && feature.getId().toString().includes(`${LayersEnum.VESSEL_ESTIMATED_POSITION.code}`)) {
        overlayRef.current.style.display = 'block'

        const latitude = feature.getProperties().latitude
        const longitude = feature.getProperties().longitude
        let coordinates = getCoordinates([longitude, latitude], WSG84_PROJECTION)
        setCoordinates(coordinates)
        if (pointerMoveEventPixel) {
          overlayObjectRef.current.setPosition(map.getCoordinateFromPixel(pointerMoveEventPixel))
        }
      } else {
        overlayRef.current.style.display = 'none'
      }
    }
  }, [setCoordinates, pointerMoveEventPixel, feature, overlayRef, overlayObjectRef])

  return (
    <VesselEstimatedPositionCardOverlayComponent ref={overlayCallback}>
      {
        coordinates ? <VesselEstimatedPositionCard coordinates={coordinates}/> : null
      }
    </VesselEstimatedPositionCardOverlayComponent>
  )
}

const VesselEstimatedPositionCardOverlayComponent = styled.div`
  position: absolute;
  top: -39px;
  left: -155px;
  width: 310px;
  text-align: center;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 100;
`

export default VesselEstimatedPositionCardOverlay
