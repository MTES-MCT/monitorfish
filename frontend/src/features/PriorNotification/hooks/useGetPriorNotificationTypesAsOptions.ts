import { useMemo } from 'react'

import { useGetPriorNotificationTypesQuery } from '../api'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches gears and returns them as tree options with their `code` property as option value.
 */
export function useGetPriorNotificationTypesAsOptions() {
  const { data: types, error, isLoading } = useGetPriorNotificationTypesQuery()

  const typesAsOptions: Option[] | undefined = useMemo(() => {
    if (!types) {
      return undefined
    }

    return types.map(type => ({
      label: type,
      value: type
    }))
  }, [types])

  return {
    error,
    isLoading,
    typesAsOptions
  }
}