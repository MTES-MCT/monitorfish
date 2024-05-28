import { describe, expect, it } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'

import { useListPagination } from '../useListPagination'

describe('hooks/useListPagination()', () => {
  it('should initialize with default values for finite lists', () => {
    const { result } = renderHook(() => useListPagination(10))

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)
  })

  it('should initialize with default values for infinite lists', () => {
    const { result } = renderHook(() => useListPagination(10, true))

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)
  })

  it('should handle pagination change for finite lists', () => {
    const { result } = renderHook(() => useListPagination(10))

    act(() => {
      result.current.setReactTablePaginationState({ pageIndex: 2, pageSize: 20 })
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 2,
      pageSize: 20
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 2,
      pageSize: 20
    })
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)
  })

  it('should handle pagination change for infinite lists', () => {
    const { result } = renderHook(() => useListPagination(10, true))

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
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)
  })

  it('should reset pagination when resetting data changes for finite lists', () => {
    const { rerender, result } = renderHook(({ data }) => useListPagination(10, false, data), {
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
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)

    act(() => {
      result.current.setReactTablePaginationState({ pageIndex: 1, pageSize: 10 })
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 1,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 1,
      pageSize: 10
    })
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)

    rerender({ data: 'newData' })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)
  })

  it('should reset pagination when resetting data changes for infinite lists', () => {
    const { rerender, result } = renderHook(({ data }) => useListPagination(10, true, data), {
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
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)

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
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)

    rerender({ data: 'newData' })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 0,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 10
    })
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)
  })

  it('should not reset pagination when resettingDataWhenUpdated is equal for finite lists', () => {
    const { rerender, result } = renderHook(({ data }) => useListPagination(10, false, data), {
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
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)

    act(() => {
      result.current.setReactTablePaginationState({ pageIndex: 1, pageSize: 10 })
    })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 1,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 1,
      pageSize: 10
    })
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)

    rerender({ data: 'sameData' })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 1,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 1,
      pageSize: 10
    })
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)
  })

  it('should not reset pagination when resettingDataWhenUpdated is equal for inifinte lists', () => {
    const { rerender, result } = renderHook(({ data }) => useListPagination(10, true, data), {
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
    expect(result.current.isNewPage).toBe(true)
    expect(result.current.isNextPage).toBe(false)

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
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)

    rerender({ data: 'sameData' })

    expect(result.current.reactTablePaginationState).toEqual({
      pageIndex: 1,
      pageSize: 10
    })
    expect(result.current.apiPaginationParams).toEqual({
      pageNumber: 0,
      pageSize: 20
    })
    expect(result.current.isNewPage).toBe(false)
    expect(result.current.isNextPage).toBe(true)
  })
})
