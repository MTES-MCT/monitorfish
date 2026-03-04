import { type OverlayCardMargins, OverlayPosition } from '@features/Map/components/Overlay/types'
import {
  computeSmartPositionAndOffset,
  getOverlayPosition,
  getTopLeftMargin
} from '@features/Map/components/Overlay/utils'
import { describe, expect, it } from '@jest/globals'

import type { Extent } from 'ol/extent'

describe('getOverlayPosition()', () => {
  const extent: Extent = [0, 0, 1000, 1000]
  const BOX_SIZE = 100

  it('Should return BOTTOM when feature is in the center of the map', () => {
    expect(getOverlayPosition(BOX_SIZE, 500, 500, extent)).toBe(OverlayPosition.BOTTOM)
  })

  it('Should return TOP when feature is near the top edge', () => {
    expect(getOverlayPosition(BOX_SIZE, 500, 950, extent)).toBe(OverlayPosition.TOP)
  })

  it('Should return BOTTOM when feature is near the bottom edge', () => {
    expect(getOverlayPosition(BOX_SIZE, 500, 50, extent)).toBe(OverlayPosition.BOTTOM)
  })

  it('Should return RIGHT when feature is near the right edge', () => {
    expect(getOverlayPosition(BOX_SIZE, 950, 500, extent)).toBe(OverlayPosition.RIGHT)
  })

  it('Should return LEFT when feature is near the left edge', () => {
    expect(getOverlayPosition(BOX_SIZE, 50, 500, extent)).toBe(OverlayPosition.LEFT)
  })

  it('Should return TOP_LEFT when feature is near the top-left corner', () => {
    expect(getOverlayPosition(BOX_SIZE, 50, 950, extent)).toBe(OverlayPosition.TOP_LEFT)
  })

  it('Should return TOP_RIGHT when feature is near the top-right corner', () => {
    expect(getOverlayPosition(BOX_SIZE, 950, 950, extent)).toBe(OverlayPosition.TOP_RIGHT)
  })

  it('Should return BOTTOM_LEFT when feature is near the bottom-left corner', () => {
    expect(getOverlayPosition(BOX_SIZE, 50, 50, extent)).toBe(OverlayPosition.BOTTOM_LEFT)
  })

  it('Should return BOTTOM_RIGHT when feature is near the bottom-right corner', () => {
    expect(getOverlayPosition(BOX_SIZE, 950, 50, extent)).toBe(OverlayPosition.BOTTOM_RIGHT)
  })
})

describe('getTopLeftMargin()', () => {
  const margins: OverlayCardMargins = {
    xLeft: 20,
    xMiddle: -174,
    xRight: -368,
    yBottom: -254,
    yMiddle: -94,
    yTop: 10
  }

  it('Should return [yBottom, xMiddle] for BOTTOM', () => {
    expect(getTopLeftMargin(OverlayPosition.BOTTOM, margins)).toEqual([-254, -174])
  })

  it('Should return [yTop, xMiddle] for TOP', () => {
    expect(getTopLeftMargin(OverlayPosition.TOP, margins)).toEqual([10, -174])
  })

  it('Should return [yMiddle, xLeft] for LEFT', () => {
    expect(getTopLeftMargin(OverlayPosition.LEFT, margins)).toEqual([-94, 20])
  })

  it('Should return [yMiddle, xRight] for RIGHT', () => {
    expect(getTopLeftMargin(OverlayPosition.RIGHT, margins)).toEqual([-94, -368])
  })

  it('Should return [yTop, xLeft] for TOP_LEFT', () => {
    expect(getTopLeftMargin(OverlayPosition.TOP_LEFT, margins)).toEqual([10, 20])
  })

  it('Should return [yTop, xRight] for TOP_RIGHT', () => {
    expect(getTopLeftMargin(OverlayPosition.TOP_RIGHT, margins)).toEqual([10, -368])
  })

  it('Should return [yBottom, xLeft] for BOTTOM_LEFT', () => {
    expect(getTopLeftMargin(OverlayPosition.BOTTOM_LEFT, margins)).toEqual([-254, 20])
  })

  it('Should return [yBottom, xRight] for BOTTOM_RIGHT', () => {
    expect(getTopLeftMargin(OverlayPosition.BOTTOM_RIGHT, margins)).toEqual([-254, -368])
  })
})

describe('computeSmartPositionAndOffset()', () => {
  const extent: Extent = [0, 0, 1000, 1000]
  const OVERLAY_HEIGHT = 100
  // getMapResolution() = 1, so boxSize = 1 * overlayHeight = overlayHeight
  const BOX_SIZE = OVERLAY_HEIGHT
  const MARGINS: OverlayCardMargins = {
    xLeft: -10,
    xMiddle: -60,
    xRight: -110,
    yBottom: 10,
    yMiddle: -50,
    yTop: -120
  }

  it('Should return BOTTOM position and correct offset for center of map', () => {
    // getTopLeftMargin(BOTTOM) = [yBottom, xMiddle] = [10, -60]
    // offset = [xMiddle, yBottom + h/2] = [-60, 10 + 50] = [-60, 60]
    expect(computeSmartPositionAndOffset(500, 500, extent, BOX_SIZE, MARGINS, OVERLAY_HEIGHT)).toEqual({
      offset: [-60, 60],
      position: OverlayPosition.BOTTOM
    })
  })

  it('Should return TOP position and correct offset when near top edge', () => {
    // getTopLeftMargin(TOP) = [yTop, xMiddle] = [-120, -60]
    // offset = [-60, -120 + 50] = [-60, -70]
    expect(computeSmartPositionAndOffset(500, 950, extent, BOX_SIZE, MARGINS, OVERLAY_HEIGHT)).toEqual({
      offset: [-60, -70],
      position: OverlayPosition.TOP
    })
  })

  it('Should return BOTTOM position and correct offset when near bottom edge', () => {
    expect(computeSmartPositionAndOffset(500, 50, extent, BOX_SIZE, MARGINS, OVERLAY_HEIGHT)).toEqual({
      offset: [-60, 60],
      position: OverlayPosition.BOTTOM
    })
  })

  it('Should return TOP_LEFT position and correct offset when near top-left corner', () => {
    // getTopLeftMargin(TOP_LEFT) = [yTop, xLeft] = [-120, -10]
    // offset = [-10, -120 + 50] = [-10, -70]
    expect(computeSmartPositionAndOffset(50, 950, extent, BOX_SIZE, MARGINS, OVERLAY_HEIGHT)).toEqual({
      offset: [-10, -70],
      position: OverlayPosition.TOP_LEFT
    })
  })

  it('Should return RIGHT position and correct offset when near right edge', () => {
    // getTopLeftMargin(RIGHT) = [yMiddle, xRight] = [-50, -110]
    // offset = [-110, -50 + 50] = [-110, 0]
    expect(computeSmartPositionAndOffset(950, 500, extent, BOX_SIZE, MARGINS, OVERLAY_HEIGHT)).toEqual({
      offset: [-110, 0],
      position: OverlayPosition.RIGHT
    })
  })
})
