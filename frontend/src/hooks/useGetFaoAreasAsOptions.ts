import { useGetFaoAreasQuery } from '@api/faoAreas'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches FAO areas and returns them as options.
 */
export function useGetFaoAreasAsOptions() {
  const { data: faoAreas, error, isLoading } = useGetFaoAreasQuery()

  const faoAreasAsOptions: Option[] | undefined = useMemo(
    () => {
      if (!faoAreas) {
        return undefined
      }

      return faoAreas
        .map(faoArea => ({
          label: faoArea,
          value: faoArea
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    },

    // FAO areas are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    faoAreasAsOptions,
    isLoading
  }
}
