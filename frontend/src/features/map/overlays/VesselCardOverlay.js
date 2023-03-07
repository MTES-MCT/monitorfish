import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import VesselCard from '../cards/VesselCard'
import { COLORS } from '../../../constants/constants'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from './position'
import { useSelector } from 'react-redux'

const overlayHeight = 260
export const marginsWithoutAlert = {
  xRight: -407,
  xMiddle: -185,
  xLeft: 20,
  yTop: 20,
  yMiddle: -127,
  yBottom: -277
}

export const marginsWithOneWarning = {
  xRight: -407,
  xMiddle: -185,
  xLeft: 20,
  yTop: 20,
  yMiddle: -141,
  yBottom: -307
}

export const marginsWithTwoWarning = {
  xRight: -407,
  xMiddle: -185,
  xLeft: 20,
  yTop: 20,
  yMiddle: -155,
  yBottom: -337
}

const VesselCardOverlay = ({ feature, map }) => {
  const { isAdmin } = useSelector(state => state.global)
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState([marginsWithoutAlert.yBottom, marginsWithoutAlert.xMiddle])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)
  const numberOfWarnings = useRef(0)

  const overlayCallback = useCallback(ref => {
    overlayRef.current = ref
    if (ref) {
      overlayObjectRef.current = new Overlay({
        element: ref,
        autoPan: false,
        className: 'ol-overlay-container ol-selectable vessel-card'
      })
    } else {
      overlayObjectRef.current = null
    }
  }, [overlayRef, overlayObjectRef])

  useEffect(() => {
    if (map) {
      map.addOverlay(overlayObjectRef.current)
    }
  }, [map, overlayObjectRef])

  useEffect(() => {
    if (overlayRef.current && overlayObjectRef.current) {
      if (feature?.getId()?.toString()?.includes(LayerProperties.VESSELS.code)) {
        setVesselFeatureToShowOnCard(feature)
        numberOfWarnings.current = isAdmin
          ? feature?.vesselProperties?.hasAlert + !!feature?.vesselProperties?.beaconMalfunctionId + feature?.vesselProperties?.hasInfractionSuspicion
          : false
        overlayRef.current.style.display = 'block'
        overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

        const nextOverlayPosition = getNextOverlayPosition(numberOfWarnings.current)
        setOverlayPosition(nextOverlayPosition)

        let margins
        switch (numberOfWarnings.current) {
          case 1: margins = marginsWithOneWarning; break
          case 2: margins = marginsWithTwoWarning; break
          default: margins = marginsWithoutAlert
        }

        setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
      } else {
        overlayRef.current.style.display = 'none'
        setVesselFeatureToShowOnCard(null)
      }
    }
  }, [feature, setVesselFeatureToShowOnCard, overlayRef, overlayObjectRef, isAdmin])

  function getNextOverlayPosition (numberOfWarnings) {
    const [x, y] = feature.getGeometry().getCoordinates()
    const extent = map.getView().calculateExtent()
    const boxSize = map.getView().getResolution() * overlayHeight + (numberOfWarnings ? 30 * numberOfWarnings : 0)

    return getOverlayPosition(boxSize, x, y, extent)
  }

  return (
    <VesselCardOverlayComponent ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {
        vesselFeatureToShowOnCard
          ? <VesselCard
            feature={vesselFeatureToShowOnCard}
            overlayPosition={overlayPosition}
            numberOfWarnings={numberOfWarnings.current}
          />
          : null
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
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  z-index: 1000;
`

export default VesselCardOverlay
