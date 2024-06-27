import { useGetSpeciesQuery } from '@api/specy'
import { useMemo } from 'react'

import type { Specy } from '../domain/types/specy'
import type { Option } from '@mtes-mct/monitor-ui'

/**
 * Fetches species and returns them as options with their `code` property as option value.
 */
export function useGetSpeciesAsOptions() {
  const { data: speciesAndGroups, error, isLoading } = useGetSpeciesQuery()

  const speciesAsOptions: Option<Specy>[] | undefined = useMemo(
    () => {
      if (!speciesAndGroups) {
        return undefined
      }

      return speciesAndGroups.species
        .map(specy => ({
          label: `${specy.code} - ${specy.name}`,
          value: specy
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    },

    // Species are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  )

  return {
    error,
    isLoading,
    speciesAsOptions
  }
}
