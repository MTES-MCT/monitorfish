import { monitorfishApi } from './api'
import { getVersionedReferential } from './referential'

import type { Port } from '../domain/types/port'

export const portApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getPorts: builder.query<Port.Port[], number | void>({
      providesTags: () => [{ type: 'Ports' }],
      queryFn: getVersionedReferential<Port.Port[]>('ports', 'ports')
    })
  })
})

export const { useGetPortsQuery } = portApi
