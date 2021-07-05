import React, { createRef, useEffect, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

const VesselLabelOverlay = ({ map, coordinates, flagState, text }) => {
  const ref = createRef()

  const [showed, setShowed] = useState(false)
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    offset: [5, -30],
    autoPan: false,
    positioning: 'left-center'
  }))

  useEffect(() => {
    if (map) {
      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)

      map.addOverlay(overlay)
      overlay.setVisible(true)
      setShowed(true)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [overlay, coordinates, map])

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        {
          showed
          ? <VesselLabelOverlayElement>
              {
                flagState
                  ? <>
                    <Flag rel="preload" src={`flags/${flagState.toLowerCase()}.svg`}/>{' '}</>
                  : null
              }
              <ZoneText>
                { text }
              </ZoneText>
            </VesselLabelOverlayElement>
            : null
        }
      </div>

    </WrapperToBeKeptForDOMManagement>
  )
}

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 300;
`

const VesselLabelOverlayElement = styled.div`
 padding: 0 6px 2px 4px;
 box-shadow: 0px 2px 3px #969696BF;
 background: ${COLORS.background};
 line-height: 18px;
`

const Flag = styled.img`
    vertical-align: middle;
    height: 12px;
    margin-top: -2px;
    margin-right: 2px;
`

const ZoneText = styled.span`
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${COLORS.grayDarkerThree};
  line-height: 18.5px;
`

export default VesselLabelOverlay
