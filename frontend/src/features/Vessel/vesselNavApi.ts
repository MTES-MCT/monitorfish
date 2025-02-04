import { monitorfishLightApi } from '@api/api'
import { VesselLastPositionLightSchema } from '@features/Vessel/schemas/VesselLastPositionLightSchema'
import { Vessel } from '@features/Vessel/Vessel.types'

export const vesselNavApi = monitorfishLightApi.injectEndpoints({
  endpoints: builder => ({
    getVesselsLastPositions: builder.query<Vessel.VesselLightLastPosition[], void>({
      query: () => `/v1/vessels`,
      transformResponse: (baseQueryReturnValue: Vessel.VesselLightLastPosition[]) =>
        baseQueryReturnValue.map(LastPosition => VesselLastPositionLightSchema.parse(LastPosition))
    })
  })
})

export const { useGetVesselsLastPositionsQuery: useGetVesselsLastPositionsNavQuery } = vesselNavApi
