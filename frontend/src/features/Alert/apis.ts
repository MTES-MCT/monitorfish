// TODO We could remove the type discrimation normalization step if we had it done on API side.

import { monitorfishApi } from '@api/api'
import { BackendApi } from '@api/BackendApi.types'
import { valueOrUndefinedIfNotFoundOrThrow } from '@api/utils'
import { AlertSpecificationSchema } from '@features/Alert/schemas/AlertSpecificationSchema'
import { SilencedAlertSchema } from '@features/Alert/schemas/SilencedAlertSchema'
import {
  type AlertSpecification,
  type EditedAlertSpecification,
  type LEGACY_PendingAlert,
  type PendingAlert,
  type SilencedAlert,
  type SilencedAlertData,
  type SilencedAlertPeriodRequest
} from '@features/Alert/types'
import { FrontendApiError } from '@libs/FrontendApiError'
import { parseResponseOrReturn } from '@utils/parseResponseOrReturn'

export const ALERTS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les alertes opérationelles"
export const VALIDATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu valider l'alerte opérationelle"
export const ACTIVATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu activer l'alerte"
export const DEACTIVATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu désactiver l'alerte"
export const CREATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu créer l'alerte. Veuillez réessayer."
export const UPDATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu modifier l'alerte. Veuillez réessayer."
export const DELETE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu supprimer l'alerte"
export const SILENCE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu suspendre l'alerte opérationelle"
export const DELETE_SILENCED_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu réactiver l'alerte opérationelle"
export const CREATE_SILENCED_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu suspendre l'alerte opérationelle"

/**
 * Type-discriminate active alerts
 */
function normalizePendingAlert(alert: PendingAlert): LEGACY_PendingAlert {
  return {
    ...alert,
    isValidated: false
  }
}

export const alertApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    createSilencedAlert: builder.mutation<SilencedAlert, SilencedAlertData>({
      query: silencedAlert => ({
        body: {
          ...silencedAlert,
          value: JSON.stringify(silencedAlert.value)
        },
        method: 'POST',
        url: `/operational_alerts/silenced`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_SILENCED_ALERT_ERROR_MESSAGE, response)
    }),
    deleteSilencedAlert: builder.mutation<void, number>({
      query: id => ({
        method: 'DELETE',
        url: `/operational_alerts/silenced/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_SILENCED_ALERT_ERROR_MESSAGE, response)
    }),
    getOperationalAlerts: builder.query<LEGACY_PendingAlert[], void>({
      query: () => '/operational_alerts',
      transformErrorResponse: response => new FrontendApiError(ALERTS_ERROR_MESSAGE, response),
      transformResponse: (response: PendingAlert[]) => response.map(normalizePendingAlert)
    }),
    getSilencedAlerts: builder.query<SilencedAlert[], void>({
      query: () => '/operational_alerts/silenced',
      transformErrorResponse: response => new FrontendApiError(ALERTS_ERROR_MESSAGE, response)
    }),
    silenceAlert: builder.mutation<
      SilencedAlert | undefined,
      { id: number; silencedAlertPeriodRequest: SilencedAlertPeriodRequest }
    >({
      query: ({ id, silencedAlertPeriodRequest }) => ({
        body: {
          beforeDateTime: silencedAlertPeriodRequest.beforeDateTime?.toISOString() ?? '',
          silencedAlertPeriod: silencedAlertPeriodRequest.silencedAlertPeriod ?? ''
        },
        method: 'PUT',
        url: `/operational_alerts/${id}/silence`
      }),
      transformErrorResponse: response => new FrontendApiError(SILENCE_ALERT_ERROR_MESSAGE, response),
      transformResponse: (response: BackendApi.ResponseBodyError | SilencedAlert) => {
        const result = SilencedAlertSchema.safeParse(response)

        return valueOrUndefinedIfNotFoundOrThrow<SilencedAlert>(result, response)
      }
    }),
    validateAlert: builder.mutation<void, number>({
      query: id => ({
        method: 'PUT',
        url: `/operational_alerts/${id}/validate`
      }),
      transformErrorResponse: response => new FrontendApiError(VALIDATE_ALERT_ERROR_MESSAGE, response)
    })
  })
})

const POSITION_ALERT_SPECIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les spécification d'alertes"

export const alertSpecificationsApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    activateAlert: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'AlertSpecifications' }],
      query: id => ({
        method: 'PUT',
        url: `/position_alerts_specs/${id}/activate`
      }),
      transformErrorResponse: response => new FrontendApiError(ACTIVATE_ALERT_ERROR_MESSAGE, response)
    }),
    createAlert: builder.mutation<void, EditedAlertSpecification>({
      invalidatesTags: () => [{ type: 'AlertSpecifications' }],
      query: nextAlert => ({
        body: nextAlert,
        method: 'POST',
        url: `/position_alerts_specs`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_ALERT_ERROR_MESSAGE, response)
    }),
    deactivateAlert: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'AlertSpecifications' }],
      query: id => ({
        method: 'PUT',
        url: `/position_alerts_specs/${id}/deactivate`
      }),
      transformErrorResponse: response => new FrontendApiError(DEACTIVATE_ALERT_ERROR_MESSAGE, response)
    }),
    deleteAlert: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'AlertSpecifications' }],
      query: id => ({
        method: 'DELETE',
        url: `/position_alerts_specs/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_ALERT_ERROR_MESSAGE, response)
    }),
    getAllAlertSpecifications: builder.query<AlertSpecification[], void>({
      providesTags: () => [{ type: 'AlertSpecifications' }],
      query: () => `/position_alerts_specs`,
      transformErrorResponse: response => new FrontendApiError(POSITION_ALERT_SPECIFICATION_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: AlertSpecification[]) =>
        parseResponseOrReturn<AlertSpecification>(baseQueryReturnValue, AlertSpecificationSchema, true)
    }),
    updateAlert: builder.mutation<void, EditedAlertSpecification>({
      invalidatesTags: () => [{ type: 'AlertSpecifications' }],
      query: nextAlert => ({
        body: nextAlert,
        method: 'PUT',
        url: `/position_alerts_specs/${nextAlert.id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_ALERT_ERROR_MESSAGE, response)
    })
  })
})

export const {
  useActivateAlertMutation,
  useCreateAlertMutation,
  useDeactivateAlertMutation,
  useDeleteAlertMutation,
  useGetAllAlertSpecificationsQuery,
  useUpdateAlertMutation
} = alertSpecificationsApi
