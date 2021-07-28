import { containsXY } from 'ol/extent'

function getOuterExtentPosition (boxSize, x, y) {
  return {
    TOP_LEFT: {
      x: x - boxSize,
      y: y + boxSize
    },
    TOP_RIGHT: {
      x: x + boxSize,
      y: y + boxSize
    },
    BOTTOM_LEFT: {
      x: x - boxSize,
      y: y - boxSize
    },
    BOTTOM_RIGHT: {
      x: x + boxSize,
      y: y - boxSize
    },
    TOP: {
      x: x,
      y: y + boxSize
    },
    RIGHT: {
      x: x + boxSize,
      y: y
    },
    LEFT: {
      x: x - boxSize,
      y: y
    },
    BOTTOM: {
      x: x,
      y: y - boxSize
    }
  }
}

export const OverlayPosition = {
  TOP_LEFT: 'TOP_LEFT',
  TOP_RIGHT: 'TOP_RIGHT',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  TOP: 'TOP',
  RIGHT: 'RIGHT',
  LEFT: 'LEFT',
  BOTTOM: 'BOTTOM'
}

/**
 * Get the [top, left] overlay margins to use for overlay placement
 * @param {OverlayPosition} nextOverlayPosition
 * @param {{
    xRight,
    xMiddle,
    xLeft,
    yTop,
    yMiddle,
    yBottom,
  }} margins
 * @returns {number[]} margins - The [top, left] overlay margins (and not the x, y margins)
 */
export function getTopLeftMargin (nextOverlayPosition, margins) {
  const {
    xRight,
    xMiddle,
    xLeft,
    yTop,
    yMiddle,
    yBottom
  } = margins

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

export function getOverlayPosition (boxSize, x, y, extent) {
  const position = getOuterExtentPosition(boxSize, x, y)

  if (!containsXY(extent, position.TOP.x, position.TOP.y) &&
    !containsXY(extent, position.LEFT.x, position.LEFT.y)) {
    return OverlayPosition.TOP_LEFT
  } else if (!containsXY(extent, position.TOP.x, position.TOP.y) &&
    !containsXY(extent, position.RIGHT.x, position.RIGHT.y)) {
    return OverlayPosition.TOP_RIGHT
  } else if (!containsXY(extent, position.BOTTOM.x, position.BOTTOM.y) &&
    !containsXY(extent, position.LEFT.x, position.LEFT.y)) {
    return OverlayPosition.BOTTOM_LEFT
  } else if (!containsXY(extent, position.BOTTOM.x, position.BOTTOM.y) &&
    !containsXY(extent, position.RIGHT.x, position.RIGHT.y)) {
    return OverlayPosition.BOTTOM_RIGHT
  } else if (!containsXY(extent, position.TOP.x, position.TOP.y)) {
    return OverlayPosition.TOP
  } else if (!containsXY(extent, position.RIGHT.x, position.RIGHT.y)) {
    return OverlayPosition.RIGHT
  } else if (!containsXY(extent, position.LEFT.x, position.LEFT.y)) {
    return OverlayPosition.LEFT
  } else if (!containsXY(extent, position.BOTTOM.x, position.BOTTOM.y)) {
    return OverlayPosition.BOTTOM
  } else {
    return OverlayPosition.BOTTOM
  }
}
