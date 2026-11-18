import { monitorfishApi } from './api'

import type { Gear } from '../domain/types/Gear'

export const gearApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getGears: builder.query<Gear[], void>({
      // Reference data: kept for the whole session instead of being downloaded again once unused for a minute
      keepUnusedDataFor: Infinity,
      providesTags: () => [{ type: 'Gears' }],
      query: () => `gears`
    })
  })
})

export const { useGetGearsQuery } = gearApi
