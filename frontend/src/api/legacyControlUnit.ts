import { monitorenvApi } from '.'

import type { LegacyControlUnit } from '../domain/types/legacyControlUnit'

export const legacyControlUnitApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getLegacyControlUnits: builder.query<LegacyControlUnit.LegacyControlUnit[], void>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: () => `/v1/control_units`
    })
  })
})

export const { useGetLegacyControlUnitsQuery } = legacyControlUnitApi
