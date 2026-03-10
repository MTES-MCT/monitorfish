import { describe, expect, it, beforeEach } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { useMapLayer } from '../useMapLayer'

jest.mock('@features/Map/monitorfishMap', () => ({
  monitorfishMap: {
    getLayers: jest.fn(),
    removeLayer: jest.fn()
  }
}))

function getMocks() {
  const { monitorfishMap } = jest.requireMock('@features/Map/monitorfishMap') as any

  return monitorfishMap
}

function makeMockLayer() {
  return {} as any
}

describe('useMapLayer()', () => {
  let mockPush: jest.Mock
  let mockRemove: jest.Mock

  beforeEach(() => {
    mockPush = jest.fn()
    mockRemove = jest.fn()
    const map = getMocks()
    map.getLayers.mockReturnValue({ push: mockPush })
    map.removeLayer = mockRemove
  })

  it('pushes the layer on mount', () => {
    const layer = makeMockLayer()
    renderHook(() => useMapLayer(layer))

    expect(mockPush).toHaveBeenCalledWith(layer)
  })

  it('removes the layer on unmount', () => {
    const layer = makeMockLayer()
    const { unmount } = renderHook(() => useMapLayer(layer))
    unmount()

    expect(mockRemove).toHaveBeenCalledWith(layer)
  })

  it('does not push the layer when condition is false', () => {
    const layer = makeMockLayer()
    renderHook(() => useMapLayer(layer, false))

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('does not push the layer when layer is undefined', () => {
    renderHook(() => useMapLayer(undefined))

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('results in 0 net layers after mount + unmount', () => {
    const layer = makeMockLayer()
    const { unmount } = renderHook(() => useMapLayer(layer))
    unmount()

    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockRemove).toHaveBeenCalledTimes(1)
  })

  it('accepts a factory function and calls it to get the layer', () => {
    const layer = makeMockLayer()
    const factory = jest.fn().mockReturnValue(layer)

    renderHook(() => useMapLayer(factory))

    expect(factory).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith(layer)
  })

  it('calls the factory only once even when condition toggles', () => {
    const layer = makeMockLayer()
    const factory = jest.fn().mockReturnValue(layer)

    let condition = true
    const { rerender } = renderHook(() => useMapLayer(factory, condition))

    condition = false
    rerender()
    condition = true
    rerender()
    condition = false
    rerender()

    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('removes the factory-created layer on unmount', () => {
    const layer = makeMockLayer()
    const factory = jest.fn().mockReturnValue(layer)
    const { unmount } = renderHook(() => useMapLayer(factory))
    unmount()

    expect(mockRemove).toHaveBeenCalledWith(layer)
  })
})
