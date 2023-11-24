import { monitorenvApi } from './api'
import { FrontendApiError } from '../libs/FrontendApiError'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

const GET_CONTROL_UNIT_ERROR_MESSAGE = "Nous n'avons pas pu récupérer cette unité de contrôle."
const GET_CONTROL_UNITS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des unités de contrôle."
const UPDATE_CONTROL_UNIT_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour cette unité de contrôle."

export const monitorenvControlUnitApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getControlUnit: builder.query<ControlUnit.ControlUnit, number>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: controlUnitId => `/v2/control_units/${controlUnitId}`,
      transformErrorResponse: response => new FrontendApiError(GET_CONTROL_UNIT_ERROR_MESSAGE, response)
    }),

    getControlUnits: builder.query<ControlUnit.ControlUnit[], void>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: () => `/v2/control_units`,
      transformErrorResponse: response => new FrontendApiError(GET_CONTROL_UNITS_ERROR_MESSAGE, response)
    }),

    updateControlUnit: builder.mutation<void, ControlUnit.ControlUnitData>({
      invalidatesTags: () => [{ type: 'Administrations' }, { type: 'ControlUnits' }],
      query: nextControlUnitData => ({
        body: nextControlUnitData,
        method: 'PUT',
        url: `/v2/control_units/${nextControlUnitData.id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_CONTROL_UNIT_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetControlUnitQuery, useGetControlUnitsQuery, useUpdateControlUnitMutation } =
  monitorenvControlUnitApi
