import { monitorfishApi } from './api'

import type { SpeciesAndSpeciesGroupsAPIData } from '../domain/types/specy'

export const specyApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getSpecies: builder.query<SpeciesAndSpeciesGroupsAPIData, void>({
      // Reference data: kept for the whole session instead of being downloaded again once unused for a minute
      keepUnusedDataFor: Infinity,
      providesTags: () => [{ type: 'Species' }],
      query: () => `species`
    })
  })
})

export const { useGetSpeciesQuery } = specyApi
