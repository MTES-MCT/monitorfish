import { OverlayPosition } from '@features/Map/components/Overlay/types'
import { describe, expect, it } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import Overlay from 'ol/Overlay'

import { useMapOverlay } from '../useMapOverlay'

jest.mock('ol/Overlay', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(opts => ({
    _options: opts,
    getElement: jest.fn().mockReturnValue(null),
    getOffset: jest.fn().mockReturnValue([0, 0]),
    on: jest.fn().mockReturnValue({ key: 'mockKey' }),
    setElement: jest.fn(),
    setOffset: jest.fn(),
    setPosition: jest.fn()
  }))
}))

jest.mock('@features/Map/monitorfishMap', () => ({
  monitorfishMap: {
    addOverlay: jest.fn(),
    getCoordinateFromPixel: jest.fn(),
    getPixelFromCoordinate: jest.fn(),
    getView: () => ({
      calculateExtent: jest.fn().mockReturnValue([0, 0, 1000, 1000])
    }),
    removeOverlay: jest.fn()
  }
}))

jest.mock('@features/Map/utils', () => ({
  getMapResolution: jest.fn().mockReturnValue(1)
}))

jest.mock('@features/Map/components/Overlay/hooks/useMoveOverlayWhenDragging', () => ({
  useMoveOverlayWhenDragging: jest.fn()
}))

jest.mock('@features/Map/components/Overlay/hooks/useMoveOverlayWhenZooming', () => ({
  useMoveOverlayWhenZooming: jest.fn()
}))

const MARGINS = { xLeft: -10, xMiddle: -60, xRight: -110, yBottom: 10, yMiddle: -50, yTop: -120 }
const COORDINATES = [500, 500]
const INITIAL_OFFSET = [5, 10]

/** Returns the overlay instance created by the hook in the current test. */
function getOverlayInstance() {
  return (Overlay as jest.Mock).mock.results[0]?.value
}

describe('useMapOverlay()', () => {
  it('Should initialise overlayPosition to BOTTOM when margins are provided', () => {
    const { result } = renderHook(() =>
      useMapOverlay({ coordinates: COORDINATES, margins: MARGINS, overlayHeight: 100 })
    )

    expect(result.current.overlayPosition).toBe(OverlayPosition.BOTTOM)
  })

  it('Should initialise overlayPosition to undefined when no margins are provided', () => {
    const { result } = renderHook(() => useMapOverlay({ coordinates: COORDINATES }))

    expect(result.current.overlayPosition).toBeUndefined()
  })

  it('Should call overlay.setPosition with initial coordinates', () => {
    renderHook(() => useMapOverlay({ coordinates: COORDINATES }))

    expect(getOverlayInstance().setPosition).toHaveBeenCalledWith(COORDINATES)
  })

  it('Should call overlay.setPosition with undefined when coordinates change to undefined', () => {
    let coords: number[] | undefined = COORDINATES
    const { rerender } = renderHook(() => useMapOverlay({ coordinates: coords }))

    coords = undefined
    rerender()

    expect(getOverlayInstance().setPosition).toHaveBeenLastCalledWith(undefined)
  })

  it('Should call overlay.setOffset after smart positioning', () => {
    renderHook(() => useMapOverlay({ coordinates: COORDINATES, margins: MARGINS, overlayHeight: 100 }))

    // center (500,500) → BOTTOM → offset [-60, 60]
    expect(getOverlayInstance().setOffset).toHaveBeenCalledWith([-60, 60])
  })

  it('Should reset offset to initialOffset when resetOffset is called', () => {
    const { result } = renderHook(() =>
      useMapOverlay({ coordinates: COORDINATES, initialOffset: INITIAL_OFFSET, margins: MARGINS, overlayHeight: 100 })
    )

    act(() => {
      result.current.resetOffset()
    })

    expect(getOverlayInstance().setOffset).toHaveBeenLastCalledWith(INITIAL_OFFSET)
  })
})
