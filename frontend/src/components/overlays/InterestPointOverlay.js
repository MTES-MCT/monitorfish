import React, { createRef, useEffect, useRef, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

import { ReactComponent as DeleteSVG } from '../icons/Suppression.svg'
import { ReactComponent as EditSVG } from '../icons/Bouton_edition.svg'
import { getCoordinates } from '../../utils'
import { OPENLAYERS_PROJECTION } from '../../domain/entities/map'
import { useMoveOverlayWhenDragging } from '../../hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '../../hooks/useMoveOverlayWhenZooming'
import { useSelector } from 'react-redux'

const X = 0
const Y = 1
const initialOffsetValue = [-90, 10]
const MIN_ZOOM = 7

const InterestPointOverlay = props => {
  const {
    map,
    coordinates,
    uuid,
    observations,
    name,
    moveLine,
    zoomHasChanged,
    deleteInterestPoint,
    modifyInterestPoint
  } = props

  const { coordinatesFormat } = useSelector(state => state.map)

  const ref = createRef()
  const currentOffset = useRef(initialOffsetValue)
  const currentCoordinates = useRef([])
  const isThrottled = useRef(false)
  const [showed, setShowed] = useState(false)
  const [hiddenByZoom, setHiddenByZoom] = useState(false)
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    offset: currentOffset.current,
    autoPan: false,
    positioning: 'left-center'
  }))

  useMoveOverlayWhenDragging(ref, overlay, map, currentOffset, moveInterestPointWithThrottle, showed)
  useMoveOverlayWhenZooming(overlay, initialOffsetValue, zoomHasChanged, currentOffset, moveInterestPointWithThrottle)

  useEffect(() => {
    if (map) {
      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)

      map.addOverlay(overlay)
      setShowed(true)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [overlay, coordinates, map])

  useEffect(() => {
    if (zoomHasChanged < MIN_ZOOM) {
      setHiddenByZoom(true)
    } else {
      setHiddenByZoom(false)
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

      const { width } = target.getElement().getBoundingClientRect()
      const nextXPixelCenter = pixel[X] + offset[X] + width / 2
      const nextYPixelCenter = pixel[Y] + offset[Y]

      const nextCoordinates = map.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
      currentCoordinates.current = nextCoordinates
      moveLine(uuid, coordinates, nextCoordinates, offset)

      isThrottled.current = false
    }, delay)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        {
          showed && !hiddenByZoom
            ? <InterestPointOverlayElement>
              <Header>
                <Name>
                  {
                    name || 'Aucun Libellé'
                  }
                </Name>
                <Edit onClick={() => modifyInterestPoint(uuid)}/>
                <Delete onClick={() => deleteInterestPoint(uuid)}/>
              </Header>
              <Body>
                {
                  observations || 'Aucune observation'
                }
              </Body>
              <Footer>
                {
                  coordinates && coordinates.length
                    ? getCoordinates(coordinates, OPENLAYERS_PROJECTION, coordinatesFormat).join(' ')
                    : null
                }
              </Footer>
            </InterestPointOverlayElement>
            : null
        }
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
  padding: 3px;
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
  width: 15px;
  border-left: 1px solid ${COLORS.grayDarker};
  padding-left: 7px;
  margin-left: auto;
  margin-right: 8px;
  cursor: pointer;
`

const Edit = styled(EditSVG)`
  height: 30px;
  width: 15px;
  border-left: 1px solid ${COLORS.grayDarker};
  padding-left: 7px;
  margin-left: auto;
  margin-right: 8px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 0;
`

export default InterestPointOverlay
