import { BackendApi } from '@api/BackendApi.types'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useState, type Dispatch, type SetStateAction } from 'react'

import type { AnyEnum } from '@mtes-mct/monitor-ui'
import type { SortingState } from '@tanstack/react-table'

/**
 * Hook to manage `react-table` & Backend API sorting for a list.
 */
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

  const firstReactTableSortingState = reactTableSortingState[0]
  assertNotNullish(firstReactTableSortingState)
  const apiSortingParams: BackendApi.RequestSortingParams<T> = {
    sortColumn: firstReactTableSortingState.id as T[keyof T],
    sortDirection: firstReactTableSortingState.desc ? BackendApi.SortDirection.DESC : BackendApi.SortDirection.ASC
  }

  return {
    apiSortingParams,
    reactTableSortingState,
    setReactTableSortingState
  }
}
