import { monitorfishApi } from './api'

import type { Port } from '../domain/types/port'

export const portApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPorts: builder.query<Port.Port[], number | void>({
      // Updated weekly at most: kept for the whole session instead of being downloaded again each time a vessel is opened
      keepUnusedDataFor: Infinity,
      providesTags: () => [{ type: 'Ports' }],
      query: () => 'ports'
    })
  })
})

export const { useGetPortsQuery } = portApi
