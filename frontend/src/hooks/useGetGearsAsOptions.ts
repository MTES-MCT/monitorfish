import { useGetGearsQuery } from '@api/gear'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches gears and returns them as options with their `code` property as option value.
 */
export function useGetGearsAsOptions() {
  const { data: gears, error, isLoading } = useGetGearsQuery()

  const gearsAsOptions: Option[] | undefined = useMemo(
    () => {
      if (!gears) {
        return undefined
      }

      return gears
        .map(gear => ({
          label: `${gear.name} (${gear.code})`,
          value: gear.code
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    },

    // Gears are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    gearsAsOptions,
    isLoading
  }
}
