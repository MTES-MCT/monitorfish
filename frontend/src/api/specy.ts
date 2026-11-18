import { monitorfishApi } from './api'
import { getVersionedReferential } from './referential'

import type { SpeciesAndSpeciesGroupsAPIData } from '../domain/types/specy'

export const specyApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getSpecies: builder.query<SpeciesAndSpeciesGroupsAPIData, void>({
      providesTags: () => [{ type: 'Species' }],
      queryFn: getVersionedReferential<SpeciesAndSpeciesGroupsAPIData>('species', 'species')
    })
  })
})

export const { useGetSpeciesQuery } = specyApi
