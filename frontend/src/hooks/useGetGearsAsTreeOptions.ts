import { useGetGearsQuery } from '@api/gear'
import { uniq } from 'lodash'
import { useMemo } from 'react'

import type { TreeOption } from '@mtes-mct/monitor-ui'

/**
 * Fetches gears and returns them as tree options with their `code` property as option value.
 */
export function useGetGearsAsTreeOptions() {
  const { data: gears, error, isLoading } = useGetGearsQuery()

  const gearsAsTreeOptions: TreeOption[] | undefined = useMemo(
    () => {
      if (!gears) {
        return undefined
      }

      const sortedGearCategories = uniq(gears.map(gear => gear.category)).sort()

      return sortedGearCategories.map(category => ({
        children: gears
          .filter(gear => gear.category === category)
          .map(gear => ({
            label: `${gear.name} – ${gear.code}`,
            value: gear.code
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
        label: category
      }))
    },

    // Gears are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    gearsAsTreeOptions,
    isLoading
  }
}
