import { COLORS } from '@constants/constants'
import Overlay from 'ol/Overlay'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import VesselEstimatedPositionCard from './VesselEstimatedPositionCard'
import { getCoordinates } from '../../../../coordinates'
import { LayerProperties, WSG84_PROJECTION } from '../../../MainMap/constants'
import { monitorfishMap } from '../../../map/monitorfishMap'

function VesselEstimatedPositionOverlay({ feature, pointerMoveEventPixel }) {
  const { coordinatesFormat } = useSelector(state => state.map)
  const [coordinates, setCoordinates] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)

  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref
      if (ref) {
        overlayObjectRef.current = new Overlay({
          autoPan: true,
          autoPanAnimation: {
            duration: 400
          },
          className: 'ol-overlay-container ol-selectable',
          element: ref
        })
      } else {
        overlayObjectRef.current = null
      }
    },
    [overlayRef, overlayObjectRef]
  )

  useEffect(() => {
    monitorfishMap.addOverlay(overlayObjectRef.current)
  }, [overlayObjectRef])

  useEffect(() => {
    if (overlayRef.current && overlayObjectRef.current) {
      if (feature?.getId()?.toString()?.includes(`${LayerProperties.VESSEL_ESTIMATED_POSITION.code}:circle`)) {
        overlayRef.current.style.display = 'block'

        const { latitude } = feature.estimatedPosition
        const { longitude } = feature.estimatedPosition
        const coordinates = getCoordinates([longitude, latitude], WSG84_PROJECTION, coordinatesFormat)
        setCoordinates(coordinates)
        if (pointerMoveEventPixel) {
          overlayObjectRef.current.setPosition(monitorfishMap.getCoordinateFromPixel(pointerMoveEventPixel))
        }
      } else {
        overlayRef.current.style.display = 'none'
      }
    }
  }, [setCoordinates, pointerMoveEventPixel, feature, overlayRef, overlayObjectRef])

  return (
    <VesselEstimatedPositionCardOverlayComponent ref={overlayCallback}>
      {coordinates ? <VesselEstimatedPositionCard coordinates={coordinates} /> : null}
    </VesselEstimatedPositionCardOverlayComponent>
  )
}

const VesselEstimatedPositionCardOverlayComponent = styled.div`
  position: absolute;
  top: -39px;
  left: -155px;
  width: 310px;
  text-align: center;
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  z-index: 100;
`

export default VesselEstimatedPositionOverlay
