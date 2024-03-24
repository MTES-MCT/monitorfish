import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches fleet segments and returns them as options with their `segment` property as option value.
 */
export function useGetFleetSegmentsAsOptions() {
  const { data: fleetSegments, error, isLoading } = useGetFleetSegmentsQuery()

  const fleetSegmentsAsOptions: Option[] | undefined = useMemo(
    () => {
      if (!fleetSegments) {
        return undefined
      }

      return fleetSegments
        .map(({ segment, segmentName }) => ({
          label: `${segment} – ${String(segmentName)}`,
          value: segment
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    },

    // Fleet segments are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    fleetSegmentsAsOptions,
    isLoading
  }
}
