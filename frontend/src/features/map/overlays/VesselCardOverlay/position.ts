import { containsXY, Extent } from 'ol/extent'

import type { VesselCardMargins } from './types'

function getOuterExtentPosition(boxSize: number, x: number, y: number) {
  return {
    BOTTOM: {
      x,
      y: y - boxSize
    },
    BOTTOM_LEFT: {
      x: x - boxSize,
      y: y - boxSize
    },
    BOTTOM_RIGHT: {
      x: x + boxSize,
      y: y - boxSize
    },
    LEFT: {
      x: x - boxSize,
      y
    },
    RIGHT: {
      x: x + boxSize,
      y
    },
    TOP: {
      x,
      y: y + boxSize
    },
    TOP_LEFT: {
      x: x - boxSize,
      y: y + boxSize
    },
    TOP_RIGHT: {
      x: x + boxSize,
      y: y + boxSize
    }
  }
}

export enum OverlayPosition {
  BOTTOM = 'BOTTOM',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  TOP = 'TOP',
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT'
}

/**
 * Get the [top, left] overlay margins to use for overlay placement
 * @returns {[number, number]} margins - The [top, left] overlay margins (and not the x, y margins)
 */
export function getTopLeftMargin(nextOverlayPosition: OverlayPosition, margins: VesselCardMargins): [number, number] {
  const { xLeft, xMiddle, xRight, yBottom, yMiddle, yTop } = margins

  switch (nextOverlayPosition) {
    case OverlayPosition.TOP_LEFT:
      return [yTop, xLeft]
    case OverlayPosition.TOP_RIGHT:
      return [yTop, xRight]
    case OverlayPosition.BOTTOM_LEFT:
      return [yBottom, xLeft]
    case OverlayPosition.BOTTOM_RIGHT:
      return [yBottom, xRight]
    case OverlayPosition.TOP:
      return [yTop, xMiddle]
    case OverlayPosition.RIGHT:
      return [yMiddle, xRight]
    case OverlayPosition.BOTTOM:
      return [yBottom, xMiddle]
    case OverlayPosition.LEFT:
      return [yMiddle, xLeft]
    default:
      return [yBottom, yMiddle]
  }
}

export function getOverlayPosition(boxSize: number, x: number, y: number, extent: Extent) {
  const position = getOuterExtentPosition(boxSize, x, y)

  if (!containsXY(extent, position.TOP.x, position.TOP.y) && !containsXY(extent, position.LEFT.x, position.LEFT.y)) {
    return OverlayPosition.TOP_LEFT
  }
  if (!containsXY(extent, position.TOP.x, position.TOP.y) && !containsXY(extent, position.RIGHT.x, position.RIGHT.y)) {
    return OverlayPosition.TOP_RIGHT
  }
  if (
    !containsXY(extent, position.BOTTOM.x, position.BOTTOM.y) &&
    !containsXY(extent, position.LEFT.x, position.LEFT.y)
  ) {
    return OverlayPosition.BOTTOM_LEFT
  }
  if (
    !containsXY(extent, position.BOTTOM.x, position.BOTTOM.y) &&
    !containsXY(extent, position.RIGHT.x, position.RIGHT.y)
  ) {
    return OverlayPosition.BOTTOM_RIGHT
  }
  if (!containsXY(extent, position.TOP.x, position.TOP.y)) {
    return OverlayPosition.TOP
  }
  if (!containsXY(extent, position.RIGHT.x, position.RIGHT.y)) {
    return OverlayPosition.RIGHT
  }
  if (!containsXY(extent, position.LEFT.x, position.LEFT.y)) {
    return OverlayPosition.LEFT
  }
  if (!containsXY(extent, position.BOTTOM.x, position.BOTTOM.y)) {
    return OverlayPosition.BOTTOM
  }

  return OverlayPosition.BOTTOM
}

export const marginsWithoutAlert: VesselCardMargins = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -277,
  yMiddle: -127,
  yTop: 20
}
export const marginsWithOneWarning: VesselCardMargins = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -307,
  yMiddle: -141,
  yTop: 20
}
export const marginsWithTwoWarning: VesselCardMargins = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -337,
  yMiddle: -155,
  yTop: 20
}
