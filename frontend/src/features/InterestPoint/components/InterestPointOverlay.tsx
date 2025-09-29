import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMoveOverlayWhenDragging } from '@hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '@hooks/useMoveOverlayWhenZooming'
import { getCoordinates, usePrevious } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash-es'
import LineString from 'ol/geom/LineString'
import Overlay from 'ol/Overlay'
import { transform } from 'ol/proj'
import { getLength } from 'ol/sphere'
import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import EditSVG from '../../icons/Bouton_edition.svg?react'
import DeleteSVG from '../../icons/Suppression.svg?react'

import type { InterestPoint } from '../types'

const X = 0
const Y = 1
export const initialOffsetValue = [-90, 60]
const MIN_ZOOM = 7

// TODO Type that.
export type InterestPointOverlayProps = {
  interestPoint: InterestPoint
  onDelete: (id: string) => void
  onDrag: any
  onEdit: (id: string) => void
  zoomHasChanged: any
}
export function InterestPointOverlay({
  interestPoint,
  onDelete,
  onDrag,
  onEdit,
  zoomHasChanged
}: InterestPointOverlayProps) {
  const ref: any = createRef()
  const { coordinates } = interestPoint.geometry

  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const currentOffset = useRef(initialOffsetValue)
  const currentCoordinates = useRef<number[]>([])
  const interestPointCoordinates = useRef(coordinates)
  const isThrottled = useRef(false)
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [hiddenByZoom, setHiddenByZoom] = useState(false)
  const overlay = useMemo(
    () =>
      new Overlay({
        autoPan: false,
        element: ref.current,
        offset: currentOffset.current,
        position: coordinates,
        positioning: 'center-left'
      }),

    // We exclude `ref` on purpose here to avoid infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coordinates]
  )

  const moveInterestPointWithThrottle = (target, delay: number) => {
    if (isThrottled.current || overlay.getOffset() === initialOffsetValue) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      if (!interestPointCoordinates.current) {
        return
      }

      const offset = target.getOffset()
      const pixel = monitorfishMap.getPixelFromCoordinate(interestPointCoordinates.current)

      const { width } = target.getElement().getBoundingClientRect()
      const nextXPixelCenter = pixel[X] + offset[X] + width / 2
      const nextYPixelCenter = pixel[Y] + offset[Y]

      const nextCoordinates = monitorfishMap.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
      currentCoordinates.current = nextCoordinates
      onDrag(interestPoint.id, interestPointCoordinates.current, nextCoordinates, offset)

      isThrottled.current = false
    }, delay)
  }

  useMoveOverlayWhenDragging(overlay, currentOffset, moveInterestPointWithThrottle, isDisplayed, () => {})
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
    interestPointCoordinates.current = transform(coordinates, WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    if (coordinates && previousCoordinates && coordinatesAreModified(coordinates, previousCoordinates)) {
      const line = new LineString([coordinates, previousCoordinates])
      const distance = getLength(line, { projection: OPENLAYERS_PROJECTION })

      if (distance > 10) {
        currentOffset.current = initialOffsetValue
        overlay.setOffset(initialOffsetValue)
      }
    }
  }, [coordinates, overlay, previousCoordinates])

  useEffect(
    () => {
      if (!ref.current) {
        return noop
      }

      const coordinatesAsOpenLayerProjection = transform(coordinates, WSG84_PROJECTION, OPENLAYERS_PROJECTION)
      overlay.setPosition(coordinatesAsOpenLayerProjection)
      overlay.setElement(ref.current)

      monitorfishMap.addOverlay(overlay)
      setTimeout(() => {
        setIsDisplayed(true)
      }, 50)

      return () => {
        setIsDisplayed(false)
        monitorfishMap.removeOverlay(overlay)
      }
    },

    // We exclude `ref` on purpose here to avoid infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coordinates, overlay]
  )

  useEffect(() => {
    if (zoomHasChanged < MIN_ZOOM) {
      setHiddenByZoom(true)
    } else {
      setHiddenByZoom(false)
    }
  }, [zoomHasChanged])

  const onInterestPointEdit = () => {
    overlay.setOffset(initialOffsetValue)
    onEdit(interestPoint.id)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        {!hiddenByZoom && (
          <InterestPointOverlayElement>
            <Header>
              <Name data-cy="interest-point-name" title={interestPoint.properties.name ?? 'Aucun Libellé'}>
                {interestPoint.properties.name ?? 'Aucun Libellé'}
              </Name>
              <Edit data-cy="interest-point-edit" onClick={onInterestPointEdit} />
              <Delete data-cy="interest-point-delete" onClick={() => onDelete(interestPoint.id)} />
            </Header>
            <Body data-cy="interest-point-observations">
              {interestPoint.properties.observations ?? 'Aucune observation'}
            </Body>
            <Footer data-cy="interest-point-coordinates">
              {getCoordinates(coordinates, WSG84_PROJECTION, coordinatesFormat).join(' ')}
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
  color: #ff3392;
`

const Header = styled.div`
  display: flex;
  height: 30px;
  background: ${p => p.theme.color.gainsboro};
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
