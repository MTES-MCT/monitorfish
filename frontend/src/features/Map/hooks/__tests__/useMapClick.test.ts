import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { useMapClick } from '../useMapClick'

jest.mock('@hooks/useMainAppDispatch', () => ({
  useMainAppDispatch: () => jest.fn()
}))

jest.mock('@features/Map/useCases/clickOnMapFeature', () => ({
  clickOnMapFeature: jest.fn().mockReturnValue({ type: 'CLICK_ON_MAP_FEATURE' })
}))

jest.mock('ol/events/condition', () => ({
  platformModifierKeyOnly: jest.fn().mockReturnValue(false)
}))

function makeMockMap() {
  return {
    forEachFeatureAtPixel: jest.fn().mockReturnValue(undefined),
    on: jest.fn(),
    un: jest.fn()
  } as any
}

describe('useMapClick()', () => {
  it('registers a click listener on mount', () => {
    const mockMap = makeMockMap()
    renderHook(() => useMapClick(mockMap))

    expect(mockMap.on).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('unregisters the click listener on unmount', () => {
    const mockMap = makeMockMap()
    const { unmount } = renderHook(() => useMapClick(mockMap))
    unmount()

    expect(mockMap.un).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('registers and unregisters the same function reference', () => {
    const mockMap = makeMockMap()
    const { unmount } = renderHook(() => useMapClick(mockMap))
    unmount()

    const registeredFn = (mockMap.on as jest.Mock).mock.calls[0][1]
    const unregisteredFn = (mockMap.un as jest.Mock).mock.calls[0][1]
    expect(registeredFn).toBe(unregisteredFn)
  })

  it('results in 0 net listeners after mount + unmount', () => {
    const mockMap = makeMockMap()
    const { unmount } = renderHook(() => useMapClick(mockMap))
    unmount()

    expect(mockMap.on).toHaveBeenCalledTimes(1)
    expect(mockMap.un).toHaveBeenCalledTimes(1)
  })

  it('calls map.forEachFeatureAtPixel when the click handler is invoked', () => {
    const mockMap = makeMockMap()
    renderHook(() => useMapClick(mockMap))

    const clickHandler = (mockMap.on as jest.Mock).mock.calls[0][1]
    const fakeEvent = { pixel: [100, 200] } as any
    clickHandler(fakeEvent)

    expect(mockMap.forEachFeatureAtPixel).toHaveBeenCalledWith(
      fakeEvent.pixel,
      expect.any(Function),
      expect.any(Object)
    )
  })
})
