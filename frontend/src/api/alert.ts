// TODO We could remove the type discrimation normalization step if we had it done on API side.

import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApi, monitorfishApiKy } from './api'

import type {
  LEGACY_PendingAlert,
  LEGACY_SilencedAlert,
  PendingAlert,
  SilencedAlert,
  SilencedAlertData,
  SilencedAlertPeriodRequest
} from '../domain/entities/alerts/types'

export const ALERTS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les alertes opérationelles"
export const VALIDATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu valider l'alerte opérationelle"
export const SILENCE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu ignorer l'alerte opérationelle"
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
    })
  })
})

export const { useCreateSilencedAlertMutation } = alertApi

/**
 * Get operational alerts
 *
 * @throws {@link FrontendApiError}
 */
async function getOperationalAlertsFromAPI(): Promise<LEGACY_PendingAlert[]> {
  try {
    const data = await monitorfishApiKy.get('/bff/v1/operational_alerts').json<PendingAlert[]>()

    return data.map(normalizePendingAlert)
  } catch (err) {
    throw new FrontendApiError(ALERTS_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Validate an alert
 *
 * @throws {@link FrontendApiError}
 */
async function validateAlertFromAPI(id: string): Promise<void> {
  try {
    await monitorfishApiKy.put(`/bff/v1/operational_alerts/${id}/validate`)
  } catch (err) {
    throw new FrontendApiError(VALIDATE_ALERT_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Silence an alert and returns the saved silenced alert
 *
 * @throws {@link FrontendApiError}
 */
async function silenceAlertFromAPI(
  id: string,
  silencedAlertPeriodRequest: SilencedAlertPeriodRequest
): Promise<LEGACY_SilencedAlert> {
  // TODO Normalize this data before calling the api service rather than here.
  const silencedAlertPeriod = silencedAlertPeriodRequest.silencedAlertPeriod ?? ''
  const beforeDateTime = silencedAlertPeriodRequest.beforeDateTime?.toISOString() ?? ''

  try {
    return await monitorfishApiKy
      .put(`/bff/v1/operational_alerts/${id}/silence`, {
        json: {
          beforeDateTime,
          silencedAlertPeriod
        }
      })
      .json<SilencedAlert>()
  } catch (err) {
    throw new FrontendApiError(SILENCE_ALERT_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Get silenced alerts
 *
 * @throws {@link FrontendApiError}
 */
async function getSilencedAlertsFromAPI(): Promise<LEGACY_SilencedAlert[]> {
  try {
    return await monitorfishApiKy.get('/bff/v1/operational_alerts/silenced').json<SilencedAlert[]>()
  } catch (err) {
    throw new FrontendApiError(ALERTS_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Delete a silenced alert
 *
 * @throws {@link FrontendApiError}
 */
async function deleteSilencedAlertFromAPI(id: string): Promise<void> {
  try {
    await monitorfishApiKy.delete(`/bff/v1/operational_alerts/silenced/${id}`)
  } catch (err) {
    throw new FrontendApiError(DELETE_SILENCED_ALERT_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

export {
  getOperationalAlertsFromAPI,
  validateAlertFromAPI,
  silenceAlertFromAPI,
  getSilencedAlertsFromAPI,
  deleteSilencedAlertFromAPI
}
