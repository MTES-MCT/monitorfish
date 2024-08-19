import { useGetFaoAreasQuery } from '@api/faoAreas'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches FAO areas and returns them as options.
 */
export function useGetFaoAreasAsOptions() {
  const { data: faoAreas, error, isLoading } = useGetFaoAreasQuery()

  const faoAreasAsOptions: Option[] | undefined = useMemo(
    () =>
      // No need to sort them, the Backend already sorts them by usage and name.
      faoAreas?.map(faoArea => ({
        label: faoArea,
        value: faoArea
      })),

    // FAO areas are not expected to change (often).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    faoAreasAsOptions,
    isLoading
  }
}
