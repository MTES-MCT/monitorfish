import { monitorfishApi } from './api'

import type { TreeOption } from '@mtes-mct/monitor-ui'

export const districtApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getDistricts: builder.query<TreeOption[], void>({
      providesTags: () => [{ type: 'Districts' }],
      query: () => 'districts'
    })
  })
})

export const { useGetDistrictsQuery } = districtApi
