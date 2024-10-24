import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetControlUnitsQuery } from '@features/ControlUnit/controlUnitApi'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches control units and returns them as options with their `id` property as option value.
 */
export function useGetControlUnitsAsOptions() {
  const {
    data: controlUnits,
    error,
    isLoading
  } = useGetControlUnitsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  const administrationsAsOptions: Option<number>[] | undefined = useMemo(() => {
    if (!controlUnits) {
      return undefined
    }

    return controlUnits
      .map(controlUnit => ({
        label: controlUnit.name,
        value: controlUnit.id
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [controlUnits])

  return {
    administrationsAsOptions,
    error,
    isLoading
  }
}
