import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import type { BackendApi } from '@api/BackendApi.types'
import type { PaginationState } from '@tanstack/react-table'

export function useListPagination(
  defaultPageSize: number = 10,
  defaultPageNumber: number = 0
): {
  apiPaginationParams: BackendApi.RequestPaginationParams
  reactTablePaginationState: PaginationState
  setReactTablePaginationState: Dispatch<SetStateAction<PaginationState>>
} {
  const [reactTablePaginationState, setReactTablePaginationState] = useState<PaginationState>({
    pageIndex: defaultPageNumber,
    pageSize: defaultPageSize
  })
  const [apiPaginationParams, setApiPaginationParams] = useState<BackendApi.RequestPaginationParams>({
    pageNumber: defaultPageNumber,
    pageSize: defaultPageSize
  })

  useEffect(() => {
    setApiPaginationParams({
      pageNumber: reactTablePaginationState.pageIndex,
      pageSize: reactTablePaginationState.pageSize
    })
  }, [reactTablePaginationState])

  return {
    apiPaginationParams,
    reactTablePaginationState,
    setReactTablePaginationState
  }
}
