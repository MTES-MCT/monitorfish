import Overlay from 'ol/Overlay'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import LayersEnum from '../../../domain/entities/layers'
import VesselCard from '../cards/VesselCard'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from './position'

const overlayHeight = 260
export const marginsWithoutAlert = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -277,
  yMiddle: -127,
  yTop: 20,
}

export const marginsWithOneWarning = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -307,
  yMiddle: -141,
  yTop: 20,
}

export const marginsWithTwoWarning = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -337,
  yMiddle: -155,
  yTop: 20,
}

function VesselCardOverlay({ feature, map }) {
  const { adminRole } = useSelector(state => state.global)
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState([
    marginsWithoutAlert.yBottom,
    marginsWithoutAlert.xMiddle,
  ])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)
  const numberOfWarnings = useRef(0)

  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref
      if (ref) {
        overlayObjectRef.current = new Overlay({
          autoPan: false,
          className: 'ol-overlay-container ol-selectable vessel-card',
          element: ref,
        })
      } else {
        overlayObjectRef.current = null
      }
    },
    [overlayRef, overlayObjectRef],
  )

  useEffect(() => {
    if (map) {
      map.addOverlay(overlayObjectRef.current)
    }
  }, [map, overlayObjectRef])

  useEffect(() => {
    if (overlayRef.current && overlayObjectRef.current) {
      if (feature?.getId()?.toString()?.includes(LayersEnum.VESSELS.code)) {
        setVesselFeatureToShowOnCard(feature)
        numberOfWarnings.current = adminRole
          ? feature?.vesselProperties?.hasAlert +
            !!feature?.vesselProperties?.beaconMalfunctionId +
            feature?.vesselProperties?.hasInfractionSuspicion
          : false
        overlayRef.current.style.display = 'block'
        overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

        const nextOverlayPosition = getNextOverlayPosition(numberOfWarnings.current)
        setOverlayPosition(nextOverlayPosition)

        let margins
        switch (numberOfWarnings.current) {
          case 1:
            margins = marginsWithOneWarning
            break
          case 2:
            margins = marginsWithTwoWarning
            break
          default:
            margins = marginsWithoutAlert
        }

        setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
      } else {
        overlayRef.current.style.display = 'none'
        setVesselFeatureToShowOnCard(null)
      }
    }
  }, [feature, setVesselFeatureToShowOnCard, overlayRef, overlayObjectRef, adminRole])

  function getNextOverlayPosition(numberOfWarnings) {
    const [x, y] = feature.getGeometry().getCoordinates()
    const extent = map.getView().calculateExtent()
    const boxSize = map.getView().getResolution() * overlayHeight + (numberOfWarnings ? 30 * numberOfWarnings : 0)

    return getOverlayPosition(boxSize, x, y, extent)
  }

  return (
    <VesselCardOverlayComponent ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {vesselFeatureToShowOnCard ? (
        <VesselCard
          feature={vesselFeatureToShowOnCard}
          numberOfWarnings={numberOfWarnings.current}
          overlayPosition={overlayPosition}
        />
      ) : null}
    </VesselCardOverlayComponent>
  )
}

const VesselCardOverlayComponent = styled.div`
  position: absolute;
  top: ${props => props.overlayTopLeftMargin[0]}px;
  left: ${props => props.overlayTopLeftMargin[1]}px;
  width: 387px;
  text-align: left;
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  z-index: 1000;
`

export default VesselCardOverlay
