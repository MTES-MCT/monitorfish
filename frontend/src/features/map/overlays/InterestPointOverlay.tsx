import { noop } from 'lodash'
import LineString from 'ol/geom/LineString'
import Overlay from 'ol/Overlay'
import { getLength } from 'ol/sphere'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { getCoordinates } from '../../../coordinates'
import { OPENLAYERS_PROJECTION } from '../../../domain/entities/map'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { useMoveOverlayWhenDragging } from '../../../hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '../../../hooks/useMoveOverlayWhenZooming'
import { usePrevious } from '../../../hooks/usePrevious'
import { ReactComponent as EditSVG } from '../../icons/Bouton_edition.svg'
import { ReactComponent as DeleteSVG } from '../../icons/Suppression.svg'

import type { MutableRefObject } from 'react'

const X = 0
const Y = 1
export const initialOffsetValue = [-90, 10]
const MIN_ZOOM = 7

// TODO Type that.
export type InterestPointOverlayProps = {
  coordinates: any
  deleteInterestPoint: any
  featureIsShowed: any
  map: any
  modifyInterestPoint: any
  moveLine: any
  name: any
  observations: any
  uuid: any
  zoomHasChanged: any
}
export function InterestPointOverlay({
  coordinates,
  deleteInterestPoint,
  featureIsShowed,
  map,
  modifyInterestPoint,
  moveLine,
  name,
  observations,
  uuid,
  zoomHasChanged
}: InterestPointOverlayProps) {
  const { coordinatesFormat } = useAppSelector(state => state.map)

  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const currentOffset = useRef(initialOffsetValue)
  const currentCoordinates = useRef([])
  const interestPointCoordinates = useRef(coordinates)
  const isThrottled = useRef(false)
  const [showed, setShowed] = useState(false)
  const [hiddenByZoom, setHiddenByZoom] = useState(false)
  const [overlay] = useState(
    new Overlay({
      autoPan: false,
      element: ref.current,
      offset: currentOffset.current,
      position: coordinates,
      positioning: 'center-left'
    })
  )

  const moveInterestPointWithThrottle = useCallback(
    (target, delay) => {
      if (isThrottled.current) {
        return
      }

      isThrottled.current = true
      setTimeout(() => {
        if (interestPointCoordinates.current) {
          const offset = target.getOffset()
          const pixel = map.getPixelFromCoordinate(interestPointCoordinates.current)

          const { width } = target.getElement().getBoundingClientRect()
          const nextXPixelCenter = pixel[X] + offset[X] + width / 2
          const nextYPixelCenter = pixel[Y] + offset[Y]

          const nextCoordinates = map.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
          currentCoordinates.current = nextCoordinates
          moveLine(uuid, interestPointCoordinates.current, nextCoordinates, offset)

          isThrottled.current = false
        }
      }, delay)
    },
    [map, moveLine, uuid]
  )

  useMoveOverlayWhenDragging(overlay, map, currentOffset, moveInterestPointWithThrottle, showed, () => {})
  useMoveOverlayWhenZooming(overlay, initialOffsetValue, zoomHasChanged, currentOffset, moveInterestPointWithThrottle)
  const previousCoordinates = usePrevious(coordinates)

  function coordinatesAreModified(_coordinates, _previousCoordinates) {
    return (
      !Number.isNaN(_coordinates[0]) &&
      !Number.isNaN(_coordinates[1]) &&
      !Number.isNaN(_previousCoordinates[0]) &&
      !Number.isNaN(_previousCoordinates[1]) &&
      (_coordinates[0] !== _previousCoordinates[0] || _coordinates[1] !== _previousCoordinates[1])
    )
  }

  useEffect(() => {
    interestPointCoordinates.current = coordinates

    if (coordinates && previousCoordinates && coordinatesAreModified(coordinates, previousCoordinates)) {
      const line = new LineString([coordinates, previousCoordinates])
      const distance = getLength(line, { projection: OPENLAYERS_PROJECTION })

      if (distance > 10) {
        currentOffset.current = initialOffsetValue
        overlay.setOffset(initialOffsetValue)
      }
    }
  }, [coordinates, overlay, previousCoordinates])

  useEffect(() => {
    if (!map || !ref.current) {
      return noop
    }

    overlay.setPosition(coordinates)
    overlay.setElement(ref.current)

    map.addOverlay(overlay)
    if (featureIsShowed && !showed) {
      setShowed(true)
    }

    return () => {
      map.removeOverlay(overlay)
    }
  }, [coordinates, featureIsShowed, map, overlay, showed])

  useEffect(() => {
    if (zoomHasChanged < MIN_ZOOM) {
      setHiddenByZoom(true)
    } else {
      setHiddenByZoom(false)
    }
  }, [zoomHasChanged])

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        {showed && !hiddenByZoom && (
          <InterestPointOverlayElement>
            <Header>
              <Name data-cy="interest-point-name" title={name || 'Aucun Libellé'}>
                {name || 'Aucun Libellé'}
              </Name>
              <Edit data-cy="interest-point-edit" onClick={() => modifyInterestPoint(uuid)} />
              <Delete data-cy="interest-point-delete" onClick={() => deleteInterestPoint(uuid)} />
            </Header>
            <Body data-cy="interest-point-observations">{observations || 'Aucune observation'}</Body>
            <Footer data-cy="interest-point-coordinates">
              {coordinates &&
                Boolean(coordinates.length) &&
                getCoordinates(coordinates, OPENLAYERS_PROJECTION, coordinatesFormat).join(' ')}
            </Footer>
          </InterestPointOverlayElement>
        )}
      </div>
    </WrapperToBeKeptForDOMManagement>
  )
}

const Body = styled.div`
  padding: 10px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const Footer = styled.div`
  padding: 3px;
  font-size: 12px;
  text-align: center;
  color: ${p => p.theme.color.slateGray};
`

const Header = styled.div`
  display: flex;
  height: 30px;
  background ${p => p.theme.color.gainsboro};
  text-align: left;
  border: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const Delete = styled(DeleteSVG)`
  height: 30px;
  width: 15px;
  border-left: 1px solid ${p => p.theme.color.lightGray};
  padding-left: 7px;
  margin-left: auto;
  margin-right: 8px;
  cursor: pointer;
`

const Edit = styled(EditSVG)`
  height: 30px;
  width: 15px;
  border-left: 1px solid ${p => p.theme.color.lightGray};
  padding-left: 7px;
  margin-left: auto;
  margin-right: 8px;
  cursor: pointer;
`

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 300;
`

const InterestPointOverlayElement = styled.div`
  background: ${p => p.theme.color.white};
  cursor: grabbing;
  width: 183px;
  color: ${p => p.theme.color.gunMetal};
  border: none;
  border-radius: 2px;
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
