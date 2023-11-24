import { monitorenvApi } from '../../api/api'
import { FrontendApiError } from '../../libs/FrontendApiError'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

const CREATE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE = "Nous n'avons pas pu créer ce contact."
const DELETE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE = "Nous n'avons pas pu supprimé ce contact."
const GET_CONTROL_UNIT_CONTACT_ERROR_MESSAGE = "Nous n'avons pas pu récupérer ce contact."
const GET_CONTROL_UNIT_CONTACTS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des contacts."
const UPDATE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour ce contact."

export const monitorenvControlUnitContactApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    createControlUnitContact: builder.mutation<void, ControlUnit.NewControlUnitContactData>({
      invalidatesTags: () => [{ type: 'ControlUnits' }],
      query: newControlUnitContactData => ({
        body: newControlUnitContactData,
        method: 'POST',
        url: `/v1/control_unit_contacts`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE, response)
    }),

    deleteControlUnitContact: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'ControlUnits' }],
      query: controlUnitContactId => ({
        method: 'DELETE',
        url: `/v1/control_unit_contacts/${controlUnitContactId}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE, response)
    }),

    getControlUnitContact: builder.query<ControlUnit.ControlUnitContact, number>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: controlUnitContactId => `/v1/control_unit_contacts/${controlUnitContactId}`,
      transformErrorResponse: response => new FrontendApiError(GET_CONTROL_UNIT_CONTACT_ERROR_MESSAGE, response)
    }),

    getControlUnitContacts: builder.query<ControlUnit.ControlUnitContact[], void>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: () => `/v1/control_unit_contacts`,
      transformErrorResponse: response => new FrontendApiError(GET_CONTROL_UNIT_CONTACTS_ERROR_MESSAGE, response)
    }),

    updateControlUnitContact: builder.mutation<void, ControlUnit.ControlUnitContactData>({
      invalidatesTags: () => [{ type: 'ControlUnits' }],
      query: nextControlUnitContactData => ({
        body: nextControlUnitContactData,
        method: 'PUT',
        url: `/v1/control_unit_contacts/${nextControlUnitContactData.id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE, response)
    })
  })
})

export const {
  useCreateControlUnitContactMutation,
  useDeleteControlUnitContactMutation,
  useGetControlUnitContactQuery,
  useGetControlUnitContactsQuery,
  useUpdateControlUnitContactMutation
} = monitorenvControlUnitContactApi
