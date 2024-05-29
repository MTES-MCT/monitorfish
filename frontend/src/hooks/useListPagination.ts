import { usePrevious } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import type { BackendApi } from '@api/BackendApi.types'
import type { PaginationState } from '@tanstack/react-table'

/**
 * Hook to manage `react-table` & Backend API pagination for a list.
 */
export function useListPagination(
  defaultPageSize: number,
  resettingDataWhenUpdated: any = undefined
): {
  apiPaginationParams: BackendApi.RequestPaginationParams
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
  const apiPaginationParams: BackendApi.RequestPaginationParams = {
    pageNumber: 0,
    pageSize: defaultPageSize * (reactTablePaginationState.pageIndex + 1)
  }

  useEffect(() => {
    if (!shouldResetPagination) {
      return
    }

    setReactTablePaginationState(defaultReactTablePaginationStateRef.current)
  }, [resettingDataWhenUpdated, shouldResetPagination])

  return {
    apiPaginationParams,
    reactTablePaginationState: controlledReactTablePaginationState,
    setReactTablePaginationState
  }
}
