import { BackendApi } from '@api/BackendApi.types'
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'

import { useListSorting } from '../useListSorting'

enum TestEnum {
  ColumnA = 'ColumnA',
  ColumnB = 'ColumnB'
}

describe('hooks/useListSorting()', () => {
  const consoleError = console.error
  const consoleInfo = console.info
  const consoleGroup = console.group
  const consoleLog = console.log

  beforeAll(() => {
    console.error = jest.fn()
    console.group = jest.fn()
    console.info = jest.fn()
    console.log = jest.fn()
  })

  afterAll(() => {
    console.error = consoleError
    console.group = consoleGroup
    console.info = consoleInfo
    console.log = consoleLog
  })

  it('should initialize with default sorting values', () => {
    const { result } = renderHook(() => useListSorting<TestEnum>(TestEnum.ColumnA, BackendApi.SortDirection.ASC))

    expect(result.current.reactTableSortingState).toEqual([{ desc: false, id: TestEnum.ColumnA }])
    expect(result.current.apiSortingParams).toEqual({
      sortColumn: TestEnum.ColumnA,
      sortDirection: BackendApi.SortDirection.ASC
    })
  })

  it('should handle default descending sorting direction', () => {
    const { result } = renderHook(() => useListSorting<TestEnum>(TestEnum.ColumnB, BackendApi.SortDirection.DESC))

    expect(result.current.reactTableSortingState).toEqual([{ desc: true, id: TestEnum.ColumnB }])
    expect(result.current.apiSortingParams).toEqual({
      sortColumn: TestEnum.ColumnB,
      sortDirection: BackendApi.SortDirection.DESC
    })
  })

  it('should update sorting state and params', () => {
    const { result } = renderHook(() => useListSorting<TestEnum>(TestEnum.ColumnA, BackendApi.SortDirection.ASC))

    act(() => {
      result.current.setReactTableSortingState([{ desc: true, id: TestEnum.ColumnB }])
    })

    expect(result.current.reactTableSortingState).toEqual([{ desc: true, id: TestEnum.ColumnB }])
    expect(result.current.apiSortingParams).toEqual({
      sortColumn: TestEnum.ColumnB,
      sortDirection: BackendApi.SortDirection.DESC
    })
  })

  it('should handle sorting state with multiple columns', () => {
    const { result } = renderHook(() => useListSorting<TestEnum>(TestEnum.ColumnA, BackendApi.SortDirection.ASC))

    act(() => {
      result.current.setReactTableSortingState([
        { desc: false, id: TestEnum.ColumnB },
        { desc: true, id: TestEnum.ColumnA }
      ])
    })

    expect(result.current.reactTableSortingState).toEqual([
      { desc: false, id: TestEnum.ColumnB },
      { desc: true, id: TestEnum.ColumnA }
    ])
    expect(result.current.apiSortingParams).toEqual({
      sortColumn: TestEnum.ColumnB,
      sortDirection: BackendApi.SortDirection.ASC
    })
  })

  it('should assert not nullish for sorting state', () => {
    const { result } = renderHook(() => useListSorting<TestEnum>(TestEnum.ColumnA, BackendApi.SortDirection.ASC))

    const call = () =>
      act(() => {
        result.current.setReactTableSortingState([])
      })

    expect(call).toThrowError('The value is undefined.')
  })
})
