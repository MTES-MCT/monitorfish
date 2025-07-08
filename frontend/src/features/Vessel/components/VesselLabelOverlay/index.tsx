import { monitorfishMap } from '@features/Map/monitorfishMap'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMoveOverlayWhenDragging } from '@hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '@hooks/useMoveOverlayWhenZooming'
import Overlay from 'ol/Overlay'
import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { VesselLabelContent } from './VesselLabelContent'

import type { MutableRefObject } from 'react'

const X = 0
const Y = 1
const INITIAL_OFFSET_VALUE = [5, -30]
const INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK = [33, -25]

export function VesselLabelOverlay({
  coordinates,
  featureId,
  identity,
  label,
  moveLine,
  offset,
  opacity,
  previewFilteredVesselsMode,
  riskFactorDetailsShowed,
  trackIsShown,
  triggerShowRiskDetails,
  zoomHasChanged
}) {
  const overlayElementRef = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>

  const currentOffset = useRef(trackIsShown ? INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK : INITIAL_OFFSET_VALUE)
  const currentCoordinates = useRef<number[]>([])
  const overlayIsPanning = useRef(false)
  const isThrottled = useRef(false)
  const [showed, setShowed] = useState(false)
  const overlay = useMemo(
    () =>
      new Overlay({
        autoPan: false,
        element: overlayElementRef.current,
        offset: currentOffset.current,
        position: coordinates,
        // @ts-ignore
        positioning: 'left-center'
      }),
    // We exclude `ref` on purpose here to avoid infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useMoveOverlayWhenDragging(overlay, currentOffset, moveVesselLabelWithThrottle, showed, isPanning => {
    overlayIsPanning.current = isPanning
  })
  useMoveOverlayWhenZooming(overlay, INITIAL_OFFSET_VALUE, zoomHasChanged, currentOffset, moveVesselLabelWithThrottle)

  useEffect(() => {
    if (trackIsShown) {
      currentOffset.current = INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK
      overlay.setOffset(INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK)
    }
  }, [trackIsShown, overlay])

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

    currentOffset.current = offset
    overlay.setOffset(offset)
  }, [offset, overlay])

  function moveVesselLabelWithThrottle(target, delay) {
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
      moveLine(featureId, coordinates, nextCoordinates, nextOffset, opacity)

      isThrottled.current = false
    }, delay)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <Wrapper
        ref={overlayElementRef}
        data-cy={`vessel-label-draggable-${getVesselCompositeIdentifier(identity)}`}
        onClick={() => {
          if (overlayIsPanning.current) {
            overlayIsPanning.current = false
          }
        }}
      >
        <VesselLabelContent
          featureId={featureId}
          identity={identity}
          label={label}
          opacity={opacity}
          overlayIsPanning={overlayIsPanning}
          overlayRef={overlayElementRef}
          previewFilteredVesselsMode={previewFilteredVesselsMode}
          riskFactorDetailsShowed={riskFactorDetailsShowed}
          showed={showed}
          triggerShowRiskDetails={triggerShowRiskDetails}
        />
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
