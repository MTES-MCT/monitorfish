import { monitorfishApi } from './api'
import { getVersionedReferential } from './referential'

import type { Gear } from '../domain/types/Gear'

export const gearApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getGears: builder.query<Gear[], void>({
      providesTags: () => [{ type: 'Gears' }],
      queryFn: getVersionedReferential<Gear[]>('gears', 'gears')
    })
  })
})

export const { useGetGearsQuery } = gearApi
