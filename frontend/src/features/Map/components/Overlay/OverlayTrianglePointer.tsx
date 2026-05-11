import styled, { useTheme } from 'styled-components'

import { type OverlayCardMargins, OverlayPosition } from './types'

const TRIANGLE_HEIGHT = 11
const TRIANGLE_HALF_WIDTH = 6

export type OverlayTrianglePointerProps = {
  /** CSS color value for the triangle fill. Defaults to `theme.color.white`. */
  $color?: string
  cardHeight: number
  cardWidth: number
  margins: OverlayCardMargins
  overlayPosition: OverlayPosition
}
export function OverlayTrianglePointer({
  $color,
  cardHeight,
  cardWidth,
  margins,
  overlayPosition
}: OverlayTrianglePointerProps) {
  const theme = useTheme()
  const resolvedColor = $color ?? theme.color.white
  const { marginLeft, marginTop } = computeTriangleMargins(overlayPosition, margins, cardHeight, cardWidth)

  return <Triangle $color={resolvedColor} $marginLeft={marginLeft} $marginTop={marginTop} $position={overlayPosition} />
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

function getTriangleCss(position: OverlayPosition, color: string) {
  switch (position) {
    case OverlayPosition.TOP:
    case OverlayPosition.TOP_LEFT:
    case OverlayPosition.TOP_RIGHT:
      return `
        border-top: transparent;
        border-right: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-bottom: ${TRIANGLE_HEIGHT}px solid ${color};
        border-left: ${TRIANGLE_HALF_WIDTH}px solid transparent;
      `
    case OverlayPosition.RIGHT:
      return `
        border-right: transparent;
        border-top: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-bottom: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-left: ${TRIANGLE_HEIGHT}px solid ${color};
      `
    case OverlayPosition.LEFT:
      return `
        border-top: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-right: ${TRIANGLE_HEIGHT}px solid ${color};
        border-bottom: ${TRIANGLE_HALF_WIDTH}px solid transparent;
        border-left: transparent;
      `
    case OverlayPosition.BOTTOM:
    case OverlayPosition.BOTTOM_LEFT:
    case OverlayPosition.BOTTOM_RIGHT:
    default:
      return `
        border-style: solid;
        border-width: ${TRIANGLE_HEIGHT}px ${TRIANGLE_HALF_WIDTH}px 0 ${TRIANGLE_HALF_WIDTH}px;
        border-color: ${color} transparent transparent transparent;
      `
  }
}

type TriangleProps = {
  $color: string
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
  ${p => getTriangleCss(p.$position, p.$color)}
`
