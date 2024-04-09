import { useMemo } from 'react'

import { useGetPriorNotificationTypesQuery } from '../api'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches prior notification tyoes and returns them as options.
 */
export function useGetPriorNotificationTypesAsOptions() {
  const { data: types, error, isLoading } = useGetPriorNotificationTypesQuery()

  const priorNotificationTypesAsOptions: Option[] | undefined = useMemo(() => {
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
    priorNotificationTypesAsOptions
  }
}
