import { describe, expect, it, beforeEach } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { useMapAnimation } from '../useMapAnimation'

const mockFit = jest.fn()
const mockAnimate = jest.fn()
const mockGetZoom = jest.fn().mockReturnValue(10)
const mockDispatch = jest.fn()

jest.mock('@features/Map/monitorfishMap', () => ({
  monitorfishMap: {
    getView: () => ({
      animate: mockAnimate,
      fit: mockFit,
      getZoom: mockGetZoom
    })
  }
}))

jest.mock('@features/Map/slice', () => ({
  resetAnimateToRegulatoryLayer: jest.fn().mockReturnValue({ type: 'RESET_ANIMATE_TO_REGULATORY_LAYER' })
}))

jest.mock('@hooks/useMainAppDispatch', () => ({
  useMainAppDispatch: () => mockDispatch
}))

let mockAnimateToRegulatoryLayer: any

jest.mock('@hooks/useMainAppSelector', () => ({
  useMainAppSelector: (selector: any) => selector({ map: { animateToRegulatoryLayer: mockAnimateToRegulatoryLayer } })
}))

describe('useMapAnimation()', () => {
  beforeEach(() => {
    mockFit.mockClear()
    mockAnimate.mockClear()
    mockDispatch.mockClear()
    mockAnimateToRegulatoryLayer = undefined
  })

  it('does not call fit or animate when animateToRegulatoryLayer is undefined', () => {
    const isInitRenderDone = { current: true }
    renderHook(() => useMapAnimation(isInitRenderDone))

    expect(mockFit).not.toHaveBeenCalled()
    expect(mockAnimate).not.toHaveBeenCalled()
  })

  it('calls map.getView().fit() when animateToRegulatoryLayer has an extent', () => {
    const isInitRenderDone = { current: true }
    mockAnimateToRegulatoryLayer = { extent: [0, 0, 100, 100], name: 'test' }

    renderHook(() => useMapAnimation(isInitRenderDone))

    expect(mockFit).toHaveBeenCalledWith([0, 0, 100, 100], expect.objectContaining({ duration: 1000 }))
  })

  it('calls map.getView().animate() when animateToRegulatoryLayer has a center', () => {
    const isInitRenderDone = { current: true }
    mockAnimateToRegulatoryLayer = { center: [300000, 6000000], name: 'test' }

    renderHook(() => useMapAnimation(isInitRenderDone))

    expect(mockAnimate).toHaveBeenCalledWith(
      expect.objectContaining({ center: [300000, 6000000], duration: 1000 }),
      expect.any(Function)
    )
  })

  it('does not animate when isInitRenderDone is false', () => {
    const isInitRenderDone = { current: false }
    mockAnimateToRegulatoryLayer = { center: [300000, 6000000], name: 'test' }

    renderHook(() => useMapAnimation(isInitRenderDone))

    expect(mockFit).not.toHaveBeenCalled()
    expect(mockAnimate).not.toHaveBeenCalled()
  })

  it('sets zoom to 8 when current zoom is less than 8 and animating to center', () => {
    mockGetZoom.mockReturnValue(5)
    const isInitRenderDone = { current: true }
    mockAnimateToRegulatoryLayer = { center: [300000, 6000000], name: 'test' }

    renderHook(() => useMapAnimation(isInitRenderDone))

    expect(mockAnimate).toHaveBeenCalledWith(expect.objectContaining({ zoom: 8 }), expect.any(Function))
  })
})
