import Overlay from 'ol/Overlay'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { VesselLabel } from './VesselLabel'
import { getVesselCompositeIdentifier } from '../../../../domain/entities/vessel/vessel'
import { useMoveOverlayWhenDragging } from '../../../../hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '../../../../hooks/useMoveOverlayWhenZooming'

const X = 0
const Y = 1
const INITIAL_OFFSET_VALUE = [5, -30]
const INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK = [33, -25]

export function VesselLabelOverlay({
  coordinates,
  featureId,
  flagState,
  identity,
  map,
  moveLine,
  offset,
  opacity,
  previewFilteredVesselsMode,
  riskFactor,
  riskFactorDetailsShowed,
  text,
  trackIsShown,
  triggerShowRiskDetails,
  underCharter,
  zoomHasChanged
}) {
  const overlayElementRef = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>

  const currentOffset = useRef(trackIsShown ? INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK : INITIAL_OFFSET_VALUE)
  const currentCoordinates = useRef([])
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

  useMoveOverlayWhenDragging(overlay, map, currentOffset, moveVesselLabelWithThrottle, showed, isPanning => {
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
    map?.addOverlay(overlay)
    setShowed(true)

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
      const pixel = map.getPixelFromCoordinate(coordinates)

      const { height, width } = target.getElement().getBoundingClientRect()
      const nextXPixelCenter = pixel[X] + nextOffset[X] + width / 2
      const nextYPixelCenter = pixel[Y] + nextOffset[Y] + height / 2

      const nextCoordinates = map.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
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
        <VesselLabel
          featureId={featureId}
          flagState={flagState}
          identity={identity}
          opacity={opacity}
          overlayIsPanning={overlayIsPanning}
          overlayRef={overlayElementRef}
          previewFilteredVesselsMode={previewFilteredVesselsMode}
          riskFactor={riskFactor}
          riskFactorDetailsShowed={riskFactorDetailsShowed}
          showed={showed}
          text={text}
          triggerShowRiskDetails={triggerShowRiskDetails}
          underCharter={underCharter}
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
