import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import { useOnPolledQueryData } from '../useOnPolledQueryData'

type Result = { currentData?: string[] | undefined; originalArgs?: { id: number } | undefined }

function renderPolledQuery(initialResult: Result) {
  const onPolledData = jest.fn()
  const { rerender } = renderHook((result: Result) => useOnPolledQueryData(result, onPolledData), {
    initialProps: initialResult
  })

  return { onPolledData, rerender }
}

describe('hooks/useOnPolledQueryData()', () => {
  it('Should not be called with the data already in the cache when mounting', () => {
    const { onPolledData } = renderPolledQuery({ currentData: ['A'], originalArgs: { id: 1 } })

    expect(onPolledData).not.toHaveBeenCalled()
  })

  it('Should be called with each new response of the same query', () => {
    const { onPolledData, rerender } = renderPolledQuery({ currentData: ['A'], originalArgs: { id: 1 } })

    rerender({ currentData: ['A', 'B'], originalArgs: { id: 1 } })

    expect(onPolledData).toHaveBeenCalledTimes(1)
    expect(onPolledData).toHaveBeenCalledWith(['A', 'B'])
  })

  it('Should be called with the first response When nothing was cached when mounting', () => {
    const { onPolledData, rerender } = renderPolledQuery({ currentData: undefined, originalArgs: undefined })

    rerender({ currentData: ['A'], originalArgs: undefined })

    expect(onPolledData).toHaveBeenCalledWith(['A'])
  })

  it('Should not be called with the first response of other query arguments, fetched by their own use case', () => {
    const { onPolledData, rerender } = renderPolledQuery({ currentData: ['A'], originalArgs: { id: 1 } })

    rerender({ currentData: undefined, originalArgs: { id: 2 } })
    rerender({ currentData: ['B'], originalArgs: { id: 2 } })

    expect(onPolledData).not.toHaveBeenCalled()

    rerender({ currentData: ['B', 'C'], originalArgs: { id: 2 } })

    expect(onPolledData).toHaveBeenCalledWith(['B', 'C'])
  })
})
