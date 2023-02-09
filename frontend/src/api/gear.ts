import { monitorfishApi } from '.'

import type { Gear } from '../domain/types/Gear'

export const gearApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getGears: builder.query<Gear[], void>({
      providesTags: () => [{ type: 'Gears' }],
      query: () => `gears`
    })
  })
})

export const { useGetGearsQuery } = gearApi
