import Overlay from 'ol/Overlay'
import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { MissionUnitLabel } from './MissionUnitLabel'
import { useMoveOverlayWhenDragging } from '../../../../hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '../../../../hooks/useMoveOverlayWhenZooming'

import type { MutableRefObject } from 'react'

const X = 0
const Y = 1
const INITIAL_OFFSET_VALUE = [23, -34]

export function MissionLabelOverlay({ color, coordinates, featureId, map, moveLine, offset, text, zoomHasChanged }) {
  const overlayElementRef = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>

  const currentOffsetRef = useRef(INITIAL_OFFSET_VALUE)
  const currentCoordinates = useRef([])
  const overlayIsPanning = useRef(false)
  const isThrottled = useRef(false)
  const [showed, setShowed] = useState(false)
  const overlay = useMemo(
    () =>
      new Overlay({
        autoPan: false,
        offset: currentOffsetRef.current
      }),
    []
  )

  useMoveOverlayWhenDragging(overlay, map, currentOffsetRef, moveVesselLabelAndLineWithThrottle, showed, isPanning => {
    overlayIsPanning.current = isPanning
  })
  useMoveOverlayWhenZooming(
    overlay,
    INITIAL_OFFSET_VALUE,
    zoomHasChanged,
    currentOffsetRef,
    moveVesselLabelAndLineWithThrottle
  )

  useEffect(() => {
    map?.addOverlay(overlay)
    if (map) {
      setShowed(true)
    }

    return () => {
      map?.removeOverlay(overlay)
    }
  }, [overlay, map])

  useEffect(() => {
    overlay.setPosition(coordinates)
    overlay.setElement(overlayElementRef.current)
  }, [overlay, coordinates])

  useEffect(() => {
    if (!overlay || !offset) {
      return
    }

    currentOffsetRef.current = offset
    overlay.setOffset(offset)
  }, [offset, overlay])

  function moveVesselLabelAndLineWithThrottle(target, delay) {
    if (isThrottled.current) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      const nextOffset = target.getOffset()
      const pixel = map.getPixelFromCoordinate(coordinates)

      const { height, width } = target.getElement().getBoundingClientRect()
      const nextXPixelCenter = pixel[X] + nextOffset[X] + width / 2
      const nextYPixelCenter = pixel[Y] + nextOffset[Y] + height / 2

      const nextCoordinates = map.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
      currentCoordinates.current = nextCoordinates
      moveLine(featureId, coordinates, nextCoordinates, nextOffset, 1)

      isThrottled.current = false
    }, delay)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <Wrapper
        ref={overlayElementRef}
        data-cy={`mission-label-draggable-${featureId}`}
        onClick={() => {
          if (overlayIsPanning.current) {
            overlayIsPanning.current = false
          }
        }}
      >
        <MissionUnitLabel color={color} showed={showed} text={text} />
      </Wrapper>
    </WrapperToBeKeptForDOMManagement>
  )
}

const Wrapper = styled.div`
  display: flex;
`

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 300;
`
