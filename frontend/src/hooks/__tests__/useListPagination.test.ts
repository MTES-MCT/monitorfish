import { describe, expect, it } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'

import { useListPagination } from '../useListPagination'

describe('hooks/useListPagination()', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useListPagination(10))

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })
  })

  it('should handle pagination change', () => {
    const { result } = renderHook(() => useListPagination(10))

    act(() => {
      result.current.setReactTablePaginationState({ pageIndex: 2, pageSize: 10 })
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 2,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 30
    })
  })

  it('should reset pagination when resetting data changes', () => {
    const { rerender, result } = renderHook(({ data }) => useListPagination(10, data), {
      initialProps: { data: 'initialData' }
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })

    act(() => {
      result.current.setReactTablePaginationState({ pageIndex: 1, pageSize: 10 })
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 1,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 20
    })

    rerender({ data: 'newData' })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })
  })

  it("should not reset pagination when resetting data doesn't change", () => {
    const { rerender, result } = renderHook(({ data }) => useListPagination(10, data), {
      initialProps: { data: 'sameData' }
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })

    act(() => {
      result.current.setReactTablePaginationState({ pageIndex: 1, pageSize: 10 })
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 1,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 20
    })

    rerender({ data: 'sameData' })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 1,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 20
    })
  })
})
