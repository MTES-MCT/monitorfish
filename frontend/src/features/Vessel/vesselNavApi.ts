import { monitorfishLightApi } from '@api/api'
import { Vessel } from '@features/Vessel/Vessel.types'

export const vesselNavApi = monitorfishLightApi.injectEndpoints({
  endpoints: builder => ({
    getVesselsLastPositions: builder.query<Vessel.VesselLastPosition[], void>({
      query: () => `/v1/vessels`,
      transformResponse: (baseQueryReturnValue: Vessel.VesselLastPosition[]) =>
        baseQueryReturnValue.map(LastPosition => Vessel.VesselLastPositionSchema.parse(LastPosition))
    })
  })
})

export const { useGetVesselsLastPositionsQuery: useGetVesselsLastPositionsNavQuery } = vesselNavApi
