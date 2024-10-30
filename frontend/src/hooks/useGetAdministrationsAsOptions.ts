import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '@api/constants'
import { useGetAdministrationsQuery } from '@features/ControlUnit/administrationApi'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches administrations and returns them as options with their `id` property as option value.
 */
export function useGetAdministrationsAsOptions() {
  const {
    data: administrations,
    error,
    isLoading
  } = useGetAdministrationsQuery(undefined, RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS)

  const administrationsAsOptions: Option<number>[] | undefined = useMemo(() => {
    if (!administrations) {
      return undefined
    }

    return administrations
      .map(administration => ({
        label: administration.name,
        value: administration.id
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [administrations])

  return {
    administrationsAsOptions,
    error,
    isLoading
  }
}
