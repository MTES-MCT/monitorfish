import { usePrevious, type AnyObject } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash'
import { useRef } from 'react'

import { usePreviousIf } from './usePreviousIfTrue'

export type LoadingState = {
  /**
   * `true` if:
   * - the data is been fetched for the first time,
   * - the data is been fetched with a new filter/sorting state (irrespective of the pagination state).
   */
  isLoadingNewPage: boolean
  /** `true` if the data is been fetched with a new pagination state but the same filter/sorting state. */
  isLoadingNextPage: boolean
  /** `true` if the data is been fetched with the same filter/sorting & pagination states. */
  isReloading: boolean
}

export function useLoadingState(
  isFetching: boolean,
  filterAndSortingState: AnyObject,
  paginationState: AnyObject
): LoadingState {
  const isFirstFetchRef = useRef<boolean | undefined>(isFetching || undefined)
  const isFirstRenderRef = useRef(true)
  const lastLoadingStateRef = useRef<LoadingState>({
    isLoadingNewPage: isFetching,
    isLoadingNextPage: false,
    isReloading: false
  })

  // We want to keep track of the previous filter/sorting & pagination states only when the data is been fetched.
  // Indeed, when new filters are passed to a Redux RTK query hook,
  // there is a first render happening with the new filters but `isFetching` is still `false`.
  // The hook will then start fetching the data which will trigger a new render with `isFetching` set to `true`.
  const previousFilterAndSortingState = usePreviousIf(filterAndSortingState, isFetching)
  const previousPaginationState = usePreviousIf(paginationState, isFetching)
  const wasFetching = usePrevious(isFetching)

  if (isFirstRenderRef.current) {
    isFirstRenderRef.current = false

    return lastLoadingStateRef.current
  }

  if (!isFetching) {
    if (isFirstFetchRef.current === true && !!wasFetching) {
      isFirstFetchRef.current = false
    }

    lastLoadingStateRef.current = {
      isLoadingNewPage: false,
      isLoadingNextPage: false,
      isReloading: false
    }
  } else {
    const hasFilterAndSortingStateChanged =
      isFirstFetchRef.current !== undefined && !isEqual(filterAndSortingState, previousFilterAndSortingState)
    const hasPaginationStateChanged =
      isFirstFetchRef.current !== undefined && !isEqual(paginationState, previousPaginationState)

    if (isFirstFetchRef.current === undefined) {
      isFirstFetchRef.current = true
    } else if (isFirstFetchRef.current && (hasFilterAndSortingStateChanged || hasPaginationStateChanged)) {
      isFirstFetchRef.current = false
    }

    // If the data is still been fetched with the same filter/sorting & pagination states,
    // while not being a first load, this means the loading state is the same as the last one.
    if (!isFirstFetchRef.current && wasFetching && !hasFilterAndSortingStateChanged && !hasPaginationStateChanged) {
      return lastLoadingStateRef.current
    }

    const isLoadingNewPage = isFirstFetchRef.current || hasFilterAndSortingStateChanged
    const isLoadingNextPage = !isLoadingNewPage && !hasFilterAndSortingStateChanged && hasPaginationStateChanged
    const isReloading = !isFirstFetchRef.current && !hasFilterAndSortingStateChanged && !hasPaginationStateChanged

    lastLoadingStateRef.current = {
      isLoadingNewPage,
      isLoadingNextPage,
      isReloading
    }
  }

  return lastLoadingStateRef.current
}
