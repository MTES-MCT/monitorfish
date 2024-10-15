import { monitorfishLightApi } from '../../api/api'

import type { VesselLastPosition } from '../../domain/entities/vessel/types'

export const vesselNavApi = monitorfishLightApi.injectEndpoints({
  endpoints: builder => ({
    getVesselsLastPositions: builder.query<VesselLastPosition[], void>({
      query: () => `/v1/vessels`
    })
  })
})

export const { useGetVesselsLastPositionsQuery: useGetVesselsLastPositionsNavQuery } = vesselNavApi
