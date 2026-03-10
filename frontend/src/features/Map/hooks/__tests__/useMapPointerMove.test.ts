import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { useMapPointerMove } from '../useMapPointerMove'

jest.mock('@features/Map/useCases/hoverOnMapFeature', () => ({
  hoverOnMapFeature: jest.fn()
}))

function makeMockMap() {
  return {
    forEachFeatureAtPixel: jest.fn().mockReturnValue(undefined),
    getEventPixel: jest.fn().mockReturnValue([0, 0]),
    getTarget: jest.fn().mockReturnValue({ style: {} }),
    on: jest.fn(),
    un: jest.fn()
  } as any
}

describe('useMapPointerMove()', () => {
  it('registers a pointermove listener on mount', () => {
    const mockMap = makeMockMap()
    renderHook(() => useMapPointerMove(mockMap, undefined, undefined, undefined))

    expect(mockMap.on).toHaveBeenCalledWith('pointermove', expect.any(Function))
  })

  it('unregisters the pointermove listener on unmount', () => {
    const mockMap = makeMockMap()
    const { unmount } = renderHook(() => useMapPointerMove(mockMap, undefined, undefined, undefined))
    unmount()

    expect(mockMap.un).toHaveBeenCalledWith('pointermove', expect.any(Function))
  })

  it('registers and unregisters the same function reference', () => {
    const mockMap = makeMockMap()
    const { unmount } = renderHook(() => useMapPointerMove(mockMap, undefined, undefined, undefined))
    unmount()

    const registeredFn = (mockMap.on as jest.Mock).mock.calls[0][1]
    const unregisteredFn = (mockMap.un as jest.Mock).mock.calls[0][1]
    expect(registeredFn).toBe(unregisteredFn)
  })

  it('results in 0 net listeners after mount + unmount', () => {
    const mockMap = makeMockMap()
    const { unmount } = renderHook(() => useMapPointerMove(mockMap, undefined, undefined, undefined))
    unmount()

    expect(mockMap.on).toHaveBeenCalledTimes(1)
    expect(mockMap.un).toHaveBeenCalledTimes(1)
  })

  it('two instances do not share throttle state (no module-level globals)', () => {
    const mapA = makeMockMap()
    const mapB = makeMockMap()

    const { unmount: unmountA } = renderHook(() => useMapPointerMove(mapA, undefined, undefined, undefined))
    const { unmount: unmountB } = renderHook(() => useMapPointerMove(mapB, undefined, undefined, undefined))

    expect(mapA.on).toHaveBeenCalledTimes(1)
    expect(mapB.on).toHaveBeenCalledTimes(1)

    unmountA()
    unmountB()

    expect(mapA.un).toHaveBeenCalledTimes(1)
    expect(mapB.un).toHaveBeenCalledTimes(1)
  })
})
