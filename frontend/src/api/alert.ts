// TODO We could remove the type discrimation normalization step if we had it done on API side.

import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApi } from './api'

import type {
  LEGACY_PendingAlert,
  LEGACY_SilencedAlert,
  PendingAlert,
  SilencedAlert,
  SilencedAlertData,
  SilencedAlertPeriodRequest
} from '@features/Alert/types'

export const ALERTS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les alertes opérationelles"
export const VALIDATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu valider l'alerte opérationelle"
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
    deleteSilencedAlert: builder.mutation<void, string>({
      query: id => ({
        method: 'DELETE',
        url: `/operational_alerts/silenced/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_SILENCED_ALERT_ERROR_MESSAGE, response)
    }),
    getOperationalAlerts: builder.query<LEGACY_PendingAlert[], void>({
      query: () => '/bff/v1/operational_alerts',
      transformErrorResponse: response => new FrontendApiError(ALERTS_ERROR_MESSAGE, response),
      transformResponse: (response: PendingAlert[]) => response.map(normalizePendingAlert)
    }),
    getSilencedAlerts: builder.query<LEGACY_SilencedAlert[], void>({
      query: () => '/operational_alerts/silenced',
      transformErrorResponse: response => new FrontendApiError(ALERTS_ERROR_MESSAGE, response)
    }),
    silenceAlert: builder.mutation<
      LEGACY_SilencedAlert,
      { id: string; silencedAlertPeriodRequest: SilencedAlertPeriodRequest }
    >({
      query: ({ id, silencedAlertPeriodRequest }) => ({
        body: {
          beforeDateTime: silencedAlertPeriodRequest.beforeDateTime?.toISOString() ?? '',
          silencedAlertPeriod: silencedAlertPeriodRequest.silencedAlertPeriod ?? ''
        },
        method: 'PUT',
        url: `/operational_alerts/${id}/silence`
      }),
      transformErrorResponse: response => new FrontendApiError(SILENCE_ALERT_ERROR_MESSAGE, response)
    }),
    validateAlert: builder.mutation<void, string>({
      query: id => ({
        method: 'PUT',
        url: `/operational_alerts/${id}/validate`
      }),
      transformErrorResponse: response => new FrontendApiError(VALIDATE_ALERT_ERROR_MESSAGE, response)
    })
  })
})
