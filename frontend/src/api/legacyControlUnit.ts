import { monitorenvApi } from './api'
import { FrontendApiError } from '../libs/FrontendApiError'

import type { LegacyControlUnit } from '../domain/types/legacyControlUnit'

const GET_CONTROL_UNIT_RESOURCES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des unités."

export const legacyControlUnitApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getLegacyControlUnits: builder.query<LegacyControlUnit.LegacyControlUnit[], void>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: () => `/v1/control_units`,
      transformErrorResponse: response => new FrontendApiError(GET_CONTROL_UNIT_RESOURCES_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetLegacyControlUnitsQuery } = legacyControlUnitApi
