import { describe, expect, it } from '@jest/globals'
import { renderHook, act, type RenderHookResult } from '@testing-library/react'

import { type LoadingState, useLoadingState } from '../useLoadingState'

describe('hooks/useLoadingState()', () => {
  it('should set `isLoadingNewPage` to the initial fetching state', () => {
    const { result: firstResult } = renderHook(() =>
      useLoadingState(false, { filter: 'initial' }, { pageIndex: 0, pageSize: 10 })
    )

    expect(firstResult.current).toEqual({
      isLoadingNewPage: false,
      isLoadingNextPage: false,
      isReloading: false
    })

    const { result: secondResult } = renderHook(() =>
      useLoadingState(true, { filter: 'initial' }, { pageIndex: 0, pageSize: 10 })
    )

    expect(secondResult.current).toEqual({
      isLoadingNewPage: true,
      isLoadingNextPage: false,
      isReloading: false
    })
  })

  it('should set `isLoadingNewPage` to TRUE when only filter/sorting state changes', () => {
    const { rerender, result } = renderHook(
      ({ filterAndSortingState, isFetching, paginationState }) =>
        useLoadingState(isFetching, filterAndSortingState, paginationState),
      {
        initialProps: {
          filterAndSortingState: { filter: 'initial' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        }
      }
    )

    // First load fetch completes
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'initial' },
        isFetching: false,
        paginationState: { pageIndex: 0, pageSize: 10 }
      })
    })

    // New page fetch starts
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'changed' },
        isFetching: true,
        paginationState: { pageIndex: 0, pageSize: 10 }
      })
    })

    expect(result.current).toEqual({
      isLoadingNewPage: true,
      isLoadingNextPage: false,
      isReloading: false
    })
  })

  it('should set `isLoadingNextPage` to TRUE when only pagination state changes', () => {
    const { rerender, result } = renderHook(
      ({ filterAndSortingState, isFetching, paginationState }) =>
        useLoadingState(isFetching, filterAndSortingState, paginationState),
      {
        initialProps: {
          filterAndSortingState: { filter: 'initial' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        }
      }
    )

    // First load fetch completes
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'initial' },
        isFetching: false,
        paginationState: { pageIndex: 0, pageSize: 10 }
      })
    })

    // Next page fetch starts
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'initial' },
        isFetching: true,
        paginationState: { pageIndex: 1, pageSize: 10 }
      })
    })

    expect(result.current).toEqual({
      isLoadingNewPage: false,
      isLoadingNextPage: true,
      isReloading: false
    })
  })

  it('should set `isLoadingNewPage` to TRUE but `isLoadingNextPage` to FALSE when both filter/sorting and pagination state changes', () => {
    const { rerender, result } = renderHook(
      ({ filterAndSortingState, isFetching, paginationState }) =>
        useLoadingState(isFetching, filterAndSortingState, paginationState),
      {
        initialProps: {
          filterAndSortingState: { filter: 'initial' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        }
      }
    )

    // First load fetch completes
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'initial' },
        isFetching: false,
        paginationState: { pageIndex: 0, pageSize: 10 }
      })
    })

    // New page fetch starts
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'changed' },
        isFetching: true,
        paginationState: { pageIndex: 1, pageSize: 10 }
      })
    })

    expect(result.current).toEqual({
      isLoadingNewPage: true,
      isLoadingNextPage: false,
      isReloading: false
    })
  })

  it('should set `isReloading` to TRUE when neither filter/sorting state nor pagination state changes', () => {
    const { rerender, result } = renderHook(
      ({ filterAndSortingState, isFetching, paginationState }) =>
        useLoadingState(isFetching, filterAndSortingState, paginationState),
      {
        initialProps: {
          filterAndSortingState: { filter: 'initial' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        }
      }
    )

    // First load fetch completes
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'initial' },
        isFetching: false,
        paginationState: { pageIndex: 0, pageSize: 10 }
      })
    })

    // Reload fetch starts
    act(() => {
      rerender({
        filterAndSortingState: { filter: 'initial' },
        isFetching: true,
        paginationState: { pageIndex: 0, pageSize: 10 }
      })
    })

    expect(result.current).toEqual({
      isLoadingNewPage: false,
      isLoadingNextPage: false,
      isReloading: true
    })
  })

  it('should reset loading state when fetching is complete', () => {
    const { rerender, result } = renderHook(
      ({ filterAndSortingState, isFetching, paginationState }) =>
        useLoadingState(isFetching, filterAndSortingState, paginationState),
      {
        initialProps: {
          filterAndSortingState: { filter: 'initial' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        }
      }
    )

    act(() => {
      rerender({
        filterAndSortingState: { filter: 'initial' },
        isFetching: false,
        paginationState: { pageIndex: 0, pageSize: 10 }
      })
    })

    expect(result.current).toEqual({
      isLoadingNewPage: false,
      isLoadingNextPage: false,
      isReloading: false
    })
  })

  for (const isInitiallyFetching of [true, false]) {
    it(`should handle consecutive fetches correctly when ${
      isInitiallyFetching ? '' : 'NOT'
    } fetching from the start`, () => {
      let rerender: RenderHookResult<
        LoadingState,
        {
          filterAndSortingState: {
            filter: string
          }
          isFetching: boolean
          paginationState: {
            pageIndex: number
            pageSize: number
          }
        }
      >['rerender']
      let result: RenderHookResult<
        LoadingState,
        {
          filterAndSortingState: {
            filter: string
          }
          isFetching: boolean
          paginationState: {
            pageIndex: number
            pageSize: number
          }
        }
      >['result']
      if (isInitiallyFetching) {
        // A first load fetch starts

        const renderHookReturn = renderHook(
          ({ filterAndSortingState, isFetching, paginationState }) =>
            useLoadingState(isFetching, filterAndSortingState, paginationState),
          {
            initialProps: {
              filterAndSortingState: { filter: 'initial' },
              isFetching: true,
              paginationState: { pageIndex: 0, pageSize: 10 }
            }
          }
        )

        rerender = renderHookReturn.rerender
        result = renderHookReturn.result
      } else {
        const renderHookReturn = renderHook(
          ({ filterAndSortingState, isFetching, paginationState }) =>
            useLoadingState(isFetching, filterAndSortingState, paginationState),
          {
            initialProps: {
              filterAndSortingState: { filter: 'initial' },
              isFetching: false,
              paginationState: { pageIndex: 0, pageSize: 10 }
            }
          }
        )

        rerender = renderHookReturn.rerender
        result = renderHookReturn.result

        // A first load fetch starts

        act(() => {
          rerender({
            filterAndSortingState: { filter: 'initial' },
            isFetching: true,
            paginationState: { pageIndex: 0, pageSize: 10 }
          })
        })
      }

      expect(result.current).toEqual({
        isLoadingNewPage: true,
        isLoadingNextPage: false,
        isReloading: false
      })

      // The first load continues (= new render with the same params)

      act(() => {
        rerender({
          filterAndSortingState: { filter: 'initial' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        })
      })

      expect(result.current).toEqual({
        isLoadingNewPage: true,
        isLoadingNextPage: false,
        isReloading: false
      })

      // A new page fetch starts before the previous one completes

      act(() => {
        rerender({
          filterAndSortingState: { filter: 'changed' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        })
      })

      expect(result.current).toEqual({
        isLoadingNewPage: true,
        isLoadingNextPage: false,
        isReloading: false
      })

      // The new page fetch continues (= new render with the same params)

      act(() => {
        rerender({
          filterAndSortingState: { filter: 'changed' },
          isFetching: true,
          paginationState: { pageIndex: 0, pageSize: 10 }
        })
      })

      expect(result.current).toEqual({
        isLoadingNewPage: true,
        isLoadingNextPage: false,
        isReloading: false
      })

      // A next page fetch starts before the previous one completes

      act(() => {
        rerender({
          filterAndSortingState: { filter: 'changed' },
          isFetching: true,
          paginationState: { pageIndex: 1, pageSize: 10 }
        })
      })

      expect(result.current).toEqual({
        isLoadingNewPage: false,
        isLoadingNextPage: true,
        isReloading: false
      })

      // The next page fetch continues (= new render with the same params)

      act(() => {
        rerender({
          filterAndSortingState: { filter: 'changed' },
          isFetching: true,
          paginationState: { pageIndex: 1, pageSize: 10 }
        })
      })

      expect(result.current).toEqual({
        isLoadingNewPage: false,
        isLoadingNextPage: true,
        isReloading: false
      })

      // The next page fetch completes

      act(() => {
        rerender({
          filterAndSortingState: { filter: 'changed' },
          isFetching: false,
          paginationState: { pageIndex: 1, pageSize: 10 }
        })
      })

      expect(result.current).toEqual({
        isLoadingNewPage: false,
        isLoadingNextPage: false,
        isReloading: false
      })
    })
  }
})
