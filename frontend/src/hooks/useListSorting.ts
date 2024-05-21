import { BackendApi } from '@api/BackendApi.types'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import type { AnyEnum } from '@mtes-mct/monitor-ui'
import type { SortingState } from '@tanstack/react-table'

export function useListSorting<T extends AnyEnum = AnyEnum>(
  defaultColumn: T[keyof T],
  defaultDirection: BackendApi.SortDirection
): {
  apiSortingParams: BackendApi.RequestSortingParams<T>
  reactTableSortingState: SortingState
  setReactTableSortingState: Dispatch<SetStateAction<SortingState>>
} {
  const [reactTableSortingState, setReactTableSortingState] = useState<SortingState>([
    {
      desc: defaultDirection === BackendApi.SortDirection.DESC,
      id: defaultColumn as string
    }
  ])
  const [apiSortingParams, setApiSortingParams] = useState<BackendApi.RequestSortingParams<T>>({
    sortColumn: defaultColumn,
    sortDirection: BackendApi.SortDirection.ASC
  })

  useEffect(() => {
    const [sorting] = reactTableSortingState
    assertNotNullish(sorting)

    setApiSortingParams({
      sortColumn: sorting.id as T[keyof T],
      sortDirection: sorting.desc ? BackendApi.SortDirection.DESC : BackendApi.SortDirection.ASC
    })
  }, [reactTableSortingState])

  return {
    apiSortingParams,
    reactTableSortingState,
    setReactTableSortingState
  }
}
