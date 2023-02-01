import { monitorenvApi } from '.'

import type { ControlUnit } from '../domain/types/controlUnit'

export const controlUnitApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getControlUnits: builder.query<ControlUnit[], void>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: () => `/control_units`
    })
  })
})

export const { useGetControlUnitsQuery } = controlUnitApi
