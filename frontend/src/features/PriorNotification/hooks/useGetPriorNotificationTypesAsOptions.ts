import { useMemo } from 'react'

import {
  IS_PRIOR_NOTIFICATION_ZERO,
  IS_PRIOR_NOTIFICATION_ZERO_LABEL
} from '../components/PriorNotificationList/constants'
import { useGetPriorNotificationTypesQuery } from '../priorNotificationApi'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches gears and returns them as tree options with their `code` property as option value.
 */
export function useGetPriorNotificationTypesAsOptions() {
  const { data: types, error, isLoading } = useGetPriorNotificationTypesQuery()

  const priorNotificationTypesAsOptions: Option[] | undefined = useMemo(() => {
    if (!types) {
      return undefined
    }

    const opts = types.map(type => ({
      label: type,
      value: type
    }))

    opts.push({ label: IS_PRIOR_NOTIFICATION_ZERO_LABEL, value: IS_PRIOR_NOTIFICATION_ZERO })

    return opts
  }, [types])

  return {
    error,
    isLoading,
    priorNotificationTypesAsOptions
  }
}
