import styled, { css } from 'styled-components'

import { type OverlayCardMargins, OverlayPosition } from './types'

const TRIANGLE_HEIGHT = 11
const TRIANGLE_HALF_WIDTH = 6

export type OverlayTrianglePointerProps = {
  cardHeight: number
  cardWidth: number
  margins: OverlayCardMargins
  overlayPosition: OverlayPosition
}
export function OverlayTrianglePointer({
  cardHeight,
  cardWidth,
  margins,
  overlayPosition
}: OverlayTrianglePointerProps) {
  const { marginLeft, marginTop } = computeTriangleMargins(overlayPosition, margins, cardHeight, cardWidth)

  return <Triangle $marginLeft={marginLeft} $marginTop={marginTop} $position={overlayPosition} />
}

export function computeTriangleMargins(
  position: OverlayPosition,
  margins: OverlayCardMargins,
  cardHeight: number,
  cardWidth: number
): { marginLeft: number; marginTop: number } {
  switch (position) {
    case OverlayPosition.TOP:
    case OverlayPosition.TOP_LEFT:
    case OverlayPosition.TOP_RIGHT:
      return { marginLeft: -margins.xMiddle - TRIANGLE_HALF_WIDTH, marginTop: -(cardHeight + TRIANGLE_HEIGHT) }
    case OverlayPosition.RIGHT:
      return { marginLeft: cardWidth, marginTop: margins.yMiddle }
    case OverlayPosition.LEFT:
      return { marginLeft: -TRIANGLE_HEIGHT, marginTop: margins.yMiddle }
    case OverlayPosition.BOTTOM:
    case OverlayPosition.BOTTOM_LEFT:
    case OverlayPosition.BOTTOM_RIGHT:
    default:
      return { marginLeft: -margins.xMiddle - TRIANGLE_HALF_WIDTH, marginTop: 0 }
  }
}

function getTriangleCss(position: OverlayPosition) {
  switch (position) {
    case OverlayPosition.TOP:
    case OverlayPosition.TOP_LEFT:
    case OverlayPosition.TOP_RIGHT:
      return css`
        border-top: transparent;
        border-right: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-bottom: ${TRIANGLE_HEIGHT}px solid ${p => p.theme.color.white};
        border-left: ${TRIANGLE_HALF_WIDTH}px solid transparent;
      `
    case OverlayPosition.RIGHT:
      return css`
        border-right: transparent;
        border-top: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-bottom: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-left: ${TRIANGLE_HEIGHT}px solid ${p => p.theme.color.white};
      `
    case OverlayPosition.LEFT:
      return css`
        border-top: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-right: ${TRIANGLE_HEIGHT}px solid ${p => p.theme.color.white};
        border-bottom: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-left: transparent;
      `
    case OverlayPosition.BOTTOM:
    case OverlayPosition.BOTTOM_LEFT:
    case OverlayPosition.BOTTOM_RIGHT:
    default:
      return css`
        border-style: solid;
        border-width: ${TRIANGLE_HEIGHT}px ${TRIANGLE_HALF_WIDTH}px 0 ${TRIANGLE_HALF_WIDTH}px;
        border-color: ${p => p.theme.color.white} transparent transparent transparent;
      `
  }
}

type TriangleProps = {
  $marginLeft: number
  $marginTop: number
  $position: OverlayPosition
}
const Triangle = styled.div<TriangleProps>`
  position: absolute;
  width: 0;
  height: 0;
  margin-left: ${p => p.$marginLeft}px;
  margin-top: ${p => p.$marginTop}px;
  ${p => getTriangleCss(p.$position)}
`
