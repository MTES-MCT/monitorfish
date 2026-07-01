import { useGetFaoAreasQuery } from '@api/faoAreas'
import { useGetSpeciesQuery } from '@api/specy'
import { CustomSearch } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

export function useSpeciesAndFaoOptions() {
  const getSpeciesApiQuery = useGetSpeciesQuery()
  const getFaoAreasQuery = useGetFaoAreasQuery()

  const speciesAsOptions: Array<Option<Specy>> = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? getSpeciesApiQuery.data.species.map(specy => ({
            label: `${specy.code} - ${specy.name}`,
            value: specy
          }))
        : [],
    [getSpeciesApiQuery.data]
  )

  const faoAreasAsOptions: Array<Option<string>> = useMemo(
    () => (getFaoAreasQuery.data ? getFaoAreasQuery.data.map(zone => ({ label: zone, value: zone })) : []),
    [getFaoAreasQuery.data]
  )

  const customSearch = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? new CustomSearch(
            structuredClone(speciesAsOptions),
            [
              { name: 'value.code', weight: 0.9 },
              { name: 'value.name', weight: 0.1 }
            ],
            { cacheKey: 'SPECIES_AS_OPTIONS', isStrict: true }
          )
        : undefined,
    [getSpeciesApiQuery.data, speciesAsOptions]
  )

  const getSpecyNameFromSpecyCode = useCallback(
    (specyCode: Specy['code']) => getSpeciesApiQuery.data?.species.find(({ code }) => code === specyCode)?.name ?? '',
    [getSpeciesApiQuery.data]
  )

  const getScipSpeciesTypeFromSpecyCode = useCallback(
    (specyCode: Specy['code']) =>
      getSpeciesApiQuery.data?.species.find(({ code }) => code === specyCode)?.scipSpeciesType,
    [getSpeciesApiQuery.data]
  )

  return {
    customSearch,
    faoAreasAsOptions,
    getScipSpeciesTypeFromSpecyCode,
    getSpecyNameFromSpecyCode,
    speciesAsOptions
  }
}
