import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Overlay from 'ol/Overlay'
import VesselTrackCard from '../cards/VesselTrackCard'
import { COLORS } from '../../../constants/constants'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from './VesselCardOverlay/position'

const overlayBoxSize = 240
const margins = {
  xRight: -397,
  xMiddle: -175,
  xLeft: 20,
  yTop: 20,
  yMiddle: -85,
  yBottom: -170
}

const VesselTrackCardOverlay = ({ map, feature }) => {
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const overlayRef = useRef(null)
  const overlayObjectRef = useRef(null)
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState([margins.yBottom, margins.xMiddle])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)

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
      // TODO Refactor: clean nullish checks & useEffect usage
      if (feature?.getId()?.toString()?.includes(LayerProperties.VESSEL_TRACK.code) && feature?.getId()?.toString()?.includes('position')) {
        setVesselFeatureToShowOnCard(feature)
        overlayRef.current.style.display = 'block'
        overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

        const nextOverlayPosition = getNextOverlayPosition()
        setOverlayPosition(nextOverlayPosition)
        setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
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

  return (
    <VesselTrackCardOverlayComponent ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {
        vesselFeatureToShowOnCard
          ? <VesselTrackCard feature={vesselFeatureToShowOnCard}
                             overlayPosition={overlayPosition}/>
          : null
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
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  z-index: 300;
`
export default VesselTrackCardOverlay
