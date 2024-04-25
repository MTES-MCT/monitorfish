import { useMoveOverlayWhenDragging } from '@hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '@hooks/useMoveOverlayWhenZooming'
import Overlay from 'ol/Overlay'
import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { MissionUnitLabel } from './MissionUnitLabel'
import { monitorfishMap } from '../../../map/monitorfishMap'

import type { MutableRefObject } from 'react'

const X = 0
const Y = 1
const INITIAL_OFFSET_VALUE = [23, -34]

type MissionLabelOverlayProps = {
  color: string
  coordinates: [number, number]
  featureId: string
  isDoneAndIncomplete: boolean
  moveLine: (featureId: any, fromCoordinates: any, toCoordinates: any, offset: any, opacity: any) => void
  offset: number[] | null
  text: string
  zoomHasChanged: any
}
export function MissionLabelOverlay({
  color,
  coordinates,
  featureId,
  isDoneAndIncomplete,
  moveLine,
  offset,
  text,
  zoomHasChanged
}: MissionLabelOverlayProps) {
  const overlayElementRef = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>

  const currentOffsetRef = useRef(INITIAL_OFFSET_VALUE)
  const currentCoordinates = useRef<number[]>([])
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

  useMoveOverlayWhenDragging(overlay, currentOffsetRef, moveVesselLabelAndLineWithThrottle, showed, isPanning => {
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
    monitorfishMap.addOverlay(overlay)
    setShowed(true)

    return () => {
      monitorfishMap.removeOverlay(overlay)
    }
  }, [overlay])

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
      const pixel = monitorfishMap.getPixelFromCoordinate(coordinates)

      const { height, width } = target.getElement().getBoundingClientRect()
      const nextXPixelCenter = pixel[X] + nextOffset[X] + width / 2
      const nextYPixelCenter = pixel[Y] + nextOffset[Y] + height / 2

      const nextCoordinates = monitorfishMap.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
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
        <MissionUnitLabel color={color} isDoneAndIncomplete={isDoneAndIncomplete} showed={showed} text={text} />
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
