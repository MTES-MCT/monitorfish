import React, { createRef, useEffect, useRef, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import Hammer from 'hammerjs'

import { ReactComponent as DeleteSVG } from '../icons/Suppression.svg'
import { getCoordinates } from '../../utils'
import { CoordinatesFormat, OPENLAYERS_PROJECTION } from '../../domain/entities/map'

const X = 0
const Y = 1
const initialOffsetValue = [-90, 10]

const InterestPointOverlay = ({ map, coordinates, observations, offset, name, featureId, moveVesselLabelLine, zoomHasChanged }) => {
  const ref = createRef()

  const currentOffset = useRef(initialOffsetValue)
  const currentCoordinates = useRef([])
  const isThrottled = useRef(false)
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    offset: currentOffset.current,
    autoPan: false,
    positioning: 'left-center'
  }))

  useEffect(() => {
    if (overlay && offset) {
      currentOffset.current = offset
      overlay.setOffset(offset)
    }
  }, [offset, overlay])

  useEffect(() => {
    if (map) {
      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)

      map.addOverlay(overlay)

      const hammer = new Hammer(overlay.getElement())
      hammer.on('pan', ({ deltaX, deltaY }) => {
        overlay.setOffset([currentOffset.current[X] + deltaX, currentOffset.current[Y] + deltaY])
      })

      hammer.on('panend', ({ deltaX, deltaY }) => {
        currentOffset.current = [currentOffset.current[X] + deltaX, currentOffset.current[Y] + deltaY]
      })

      overlay.on('change:offset', ({ target }) => {
        moveInterestPointWithThrottle(target, 50)
      })

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [overlay, coordinates, map])

  useEffect(() => {
    if (currentOffset.current !== initialOffsetValue) {
      moveInterestPointWithThrottle(overlay, 100)
    }
  }, [zoomHasChanged])

  function moveInterestPointWithThrottle (target, delay) {
    if (isThrottled.current) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      const offset = target.getOffset()
      const pixel = map.getPixelFromCoordinate(coordinates)

      const { width, height } = target.getElement().getBoundingClientRect()
      const nextXPixelCenter = pixel[X] + offset[X] + width / 2
      const nextYPixelCenter = pixel[Y] + offset[Y] + height / 2

      const nextCoordinates = map.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
      currentCoordinates.current = nextCoordinates
      // moveVesselLabelLine(featureId, coordinates, nextCoordinates, offset)

      isThrottled.current = false
    }, delay)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        <InterestPointOverlayElement>
          <Header>
            <Name>
              {
                name || 'Aucun Libellé'
              }
            </Name>
            <Delete></Delete>
          </Header>
          <Body>
            {
              observations || 'Aucune observation'
            }
          </Body>
          <Footer>
            {
              coordinates && coordinates.length
                ? getCoordinates(coordinates, OPENLAYERS_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_DECIMALS).join(' ')
                : null
            }
          </Footer>

        </InterestPointOverlayElement>
      </div>
    </WrapperToBeKeptForDOMManagement>
  )
}

const Body = styled.div`
  padding: 10px;
  font-size: 13px;
  text-align: left;
  border-bottom: 1px solid ${COLORS.grayDarker};
`

const Footer = styled.div`
  padding: 10px 3px 10px 3px;
  font-size: 12px;
  text-align: center;
`

const Header = styled.div`
  display: flex;
  height: 30px;
  background ${COLORS.grayBackground};
  text-align: left;
`

const Delete = styled(DeleteSVG)`
  height: 30px;
  width: 14px;
  border-left: 1px solid ${COLORS.grayDarker};
  padding-left: 7px;
  margin-left: auto;
  margin-right: 9px;
  cursor: pointer;
`

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 300;
`

const InterestPointOverlayElement = styled.div`
  background: ${COLORS.background};
  cursor: grabbing;
  width: 183px;
  color: ${COLORS.grayDarkerThree};
`

const Name = styled.span`
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  margin-left: 2px;
  padding: 6px 10px;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export default InterestPointOverlay
