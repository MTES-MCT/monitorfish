import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { useMapMount } from '../useMapMount'

describe('useMapMount()', () => {
  it('calls map.setTarget with the ref element on mount', () => {
    const mockEl = document.createElement('div')
    const mockMap = { setTarget: jest.fn() } as any

    renderHook(() => useMapMount(mockMap, { current: mockEl }))

    expect(mockMap.setTarget).toHaveBeenCalledWith(mockEl)
  })

  it('calls map.setTarget(undefined) on unmount', () => {
    const mockEl = document.createElement('div')
    const mockMap = { setTarget: jest.fn() } as any

    const { unmount } = renderHook(() => useMapMount(mockMap, { current: mockEl }))
    unmount()

    expect(mockMap.setTarget).toHaveBeenLastCalledWith(undefined)
  })

  it('leaves 0 net setTarget calls pointing to an element after mount + unmount', () => {
    const mockEl = document.createElement('div')
    const mockMap = { setTarget: jest.fn() } as any

    const { unmount } = renderHook(() => useMapMount(mockMap, { current: mockEl }))
    unmount()

    const { calls } = (mockMap.setTarget as jest.Mock).mock
    const mountCalls = calls.filter(([arg]) => arg !== undefined)
    const unmountCalls = calls.filter(([arg]) => arg === undefined)
    expect(mountCalls).toHaveLength(1)
    expect(unmountCalls).toHaveLength(1)
  })
})
