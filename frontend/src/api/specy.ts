import { monitorfishApi } from './api'

import type { SpeciesAndSpeciesGroupsAPIData } from '../domain/types/specy'

export const specyApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getSpecies: builder.query<SpeciesAndSpeciesGroupsAPIData, void>({
      providesTags: () => [{ type: 'Species' }],
      query: () => `species`
    })
  })
})

export const { useGetSpeciesQuery } = specyApi
