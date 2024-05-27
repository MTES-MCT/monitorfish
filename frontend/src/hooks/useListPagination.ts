import { usePrevious } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import type { BackendApi } from '@api/BackendApi.types'
import type { PaginationState } from '@tanstack/react-table'

/**
 * Hook to manage `react-table` & Backend API pagination for a list.
 *
 * @param isInfinite - Whether the list is infinite or not (ex: infinite scrolling).
 */
export function useListPagination(
  defaultPageSize: number,
  isInfinite: boolean = false,
  resettingDataWhenUpdated: any = undefined
): {
  apiPaginationParams: BackendApi.RequestPaginationParams
  isNewPage: boolean
  isNextPage: boolean
  reactTablePaginationState: PaginationState
  setReactTablePaginationState: Dispatch<SetStateAction<PaginationState>>
} {
  const defaultReactTablePaginationStateRef = useRef({
    pageIndex: 0,
    pageSize: defaultPageSize
  })

  const [reactTablePaginationState, setReactTablePaginationState] = useState<PaginationState>(
    defaultReactTablePaginationStateRef.current
  )

  const previousResettingDataWhenUpdated = usePrevious(resettingDataWhenUpdated)
  const shouldResetPagination =
    !!previousResettingDataWhenUpdated && !isEqual(resettingDataWhenUpdated, previousResettingDataWhenUpdated)

  const controlledReactTablePaginationState: PaginationState = shouldResetPagination
    ? defaultReactTablePaginationStateRef.current
    : reactTablePaginationState
  const constrolledApiPaginationParams: BackendApi.RequestPaginationParams = isInfinite
    ? {
        pageNumber: 0,
        pageSize: defaultPageSize * (reactTablePaginationState.pageIndex + 1)
      }
    : {
        pageNumber: controlledReactTablePaginationState.pageIndex,
        pageSize: controlledReactTablePaginationState.pageSize
      }

  const isNextPage = isInfinite
    ? constrolledApiPaginationParams.pageSize > defaultPageSize
    : constrolledApiPaginationParams.pageNumber > 0
  const isNewPage = isInfinite ? !isNextPage : constrolledApiPaginationParams.pageNumber === 0

  useEffect(() => {
    if (!shouldResetPagination) {
      return
    }

    setReactTablePaginationState(defaultReactTablePaginationStateRef.current)
  }, [resettingDataWhenUpdated, shouldResetPagination])

  return {
    apiPaginationParams: constrolledApiPaginationParams,
    isNewPage,
    isNextPage,
    reactTablePaginationState: controlledReactTablePaginationState,
    setReactTablePaginationState
  }
}
