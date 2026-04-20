import { describe, expect, it, beforeEach, afterEach } from '@jest/globals'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('@features/Map/monitorfishMap', () => ({
  monitorfishMap: {
    getView: () => ({
      calculateExtent: jest.fn().mockReturnValue([0, 0, 1, 1]),
      getCenter: jest.fn().mockReturnValue([0, 0]),
      getZoom: jest.fn().mockReturnValue(6),
      setCenter: jest.fn(),
      setZoom: jest.fn()
    })
  }
}))

jest.mock('../../../../utils.ts', () => ({
  getLocalStorageState: jest.fn().mockReturnValue(null)
}))

jest.mock('@utils/isNumeric.ts', () => ({
  isNumeric: jest.fn().mockReturnValue(false)
}))

describe('MapHistory popstate listener', () => {
  let addSpy: jest.SpyInstance
  let removeSpy: jest.SpyInstance

  beforeEach(() => {
    addSpy = jest.spyOn(window, 'addEventListener')
    removeSpy = jest.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('adds a popstate listener on mount', async () => {
    const { default: MapHistory } = await import('../MapHistory')

    render(
      React.createElement(MapHistory, {
        historyMoveTrigger: {},
        setShouldUpdateView: jest.fn(),
        shouldUpdateView: false
      })
    )

    const popstateCalls = addSpy.mock.calls.filter(([event]) => event === 'popstate')
    expect(popstateCalls).toHaveLength(1)
  })

  it('removes the popstate listener on unmount', async () => {
    const { default: MapHistory } = await import('../MapHistory')

    const { unmount } = render(
      React.createElement(MapHistory, {
        historyMoveTrigger: {},
        setShouldUpdateView: jest.fn(),
        shouldUpdateView: false
      })
    )
    unmount()

    const popstateCalls = removeSpy.mock.calls.filter(([event]) => event === 'popstate')
    expect(popstateCalls).toHaveLength(1)
  })

  it('registers and removes the same function reference for popstate', async () => {
    const { default: MapHistory } = await import('../MapHistory')

    const { unmount } = render(
      React.createElement(MapHistory, {
        historyMoveTrigger: {},
        setShouldUpdateView: jest.fn(),
        shouldUpdateView: false
      })
    )
    unmount()

    const addedFn = addSpy.mock.calls.find(([event]) => event === 'popstate')?.[1]
    const removedFn = removeSpy.mock.calls.find(([event]) => event === 'popstate')?.[1]
    expect(addedFn).toBeDefined()
    expect(addedFn).toBe(removedFn)
  })
})
