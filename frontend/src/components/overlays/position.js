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

export function getOverlayPosition (boxSize, x, y, extent) {
  let position = getOuterExtentPosition(boxSize, x, y)

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
