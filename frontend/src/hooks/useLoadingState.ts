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

const NO_LOADING_STATE: LoadingState = {
  isLoadingNewPage: false,
  isLoadingNextPage: false,
  isReloading: false
}

export function useLoadingState(
  isFetching: boolean,
  filterAndSortingState: AnyObject,
  paginationState: AnyObject
): LoadingState {
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

  if (!isFetching) {
    lastLoadingStateRef.current = NO_LOADING_STATE

    return lastLoadingStateRef.current
  }

  const hasNewFilterAndSortingState = !isEqual(filterAndSortingState, previousFilterAndSortingState)
  const hasNewPaginationState = !isEqual(paginationState, previousPaginationState)

  // If the data is still been fetched with the same filter/sorting & pagination states,
  // while not being a first load, this means the loading state is the same as the last one.
  if (wasFetching && !hasNewFilterAndSortingState && !hasNewPaginationState) {
    return lastLoadingStateRef.current
  }

  const isLoadingNewPage = hasNewFilterAndSortingState
  const isLoadingNextPage = !isLoadingNewPage && !hasNewFilterAndSortingState && hasNewPaginationState
  const isReloading = !hasNewFilterAndSortingState && !hasNewPaginationState

  lastLoadingStateRef.current = {
    isLoadingNewPage,
    isLoadingNextPage,
    isReloading
  }

  return lastLoadingStateRef.current
}
