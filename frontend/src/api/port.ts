import { monitorfishApi } from './api'

import type { Port } from '../domain/types/port'

export const portApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPorts: builder.query<Port.Port[], number | void>({
      // Rarely updated: not downloaded again each time a vessel is opened
      keepUnusedDataFor: 60 * 60,
      providesTags: () => [{ type: 'Ports' }],
      query: () => 'ports'
    })
  })
})

export const { useGetPortsQuery } = portApi
