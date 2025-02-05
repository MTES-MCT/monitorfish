import { monitorfishLightApi } from '@api/api'
import { VesselLastPositionLightSchema } from '@features/Vessel/schemas/VesselLastPositionLightSchema'
import { Vessel } from '@features/Vessel/Vessel.types'
import { parseResponseOrReturn } from '@utils/parseResponseOrReturn'

export const vesselNavApi = monitorfishLightApi.injectEndpoints({
  endpoints: builder => ({
    getVesselsLastPositions: builder.query<Vessel.VesselLightLastPosition[], void>({
      query: () => `/v1/vessels`,
      transformResponse: (baseQueryReturnValue: Vessel.VesselLightLastPosition[]) =>
        parseResponseOrReturn<Vessel.VesselLightLastPosition>(baseQueryReturnValue, VesselLastPositionLightSchema, true)
    })
  })
})

export const { useGetVesselsLastPositionsQuery: useGetVesselsLastPositionsNavQuery } = vesselNavApi
