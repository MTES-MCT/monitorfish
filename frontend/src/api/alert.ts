// TODO We could remove the type discrimation normalization step if we had it done on API side.

import ky from 'ky'

import { monitorfishApi, monitorfishApiKy } from './index'
import { SilencedAlertData } from '../domain/entities/alerts/types'
import { ApiError } from '../libs/ApiError'

import type {
  LEGACY_PendingAlert,
  LEGACY_SilencedAlert,
  PendingAlert,
  SilencedAlert,
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
      })
    })
  })
})

export const { useCreateSilencedAlertMutation } = alertApi

/**
 * Get operational alerts
 *
 * @throws {@link ApiError}
 */
async function getOperationalAlertsFromAPI(): Promise<LEGACY_PendingAlert[]> {
  try {
    const data = await monitorfishApiKy.get('/bff/v1/operational_alerts').json<PendingAlert[]>()

    return data.map(normalizePendingAlert)
  } catch (err) {
    throw new ApiError(ALERTS_ERROR_MESSAGE, err)
  }
}

/**
 * Validate an alert
 *
 * @throws {@link ApiError}
 */
async function validateAlertFromAPI(id: string): Promise<void> {
  try {
    await monitorfishApiKy.put(`/bff/v1/operational_alerts/${id}/validate`)
  } catch (err) {
    throw new ApiError(VALIDATE_ALERT_ERROR_MESSAGE, err)
  }
}

/**
 * Silence an alert and returns the saved silenced alert
 *
 * @throws {@link ApiError}
 */
async function silenceAlertFromAPI(
  id: string,
  silencedAlertPeriodRequest: SilencedAlertPeriodRequest
): Promise<LEGACY_SilencedAlert> {
  // TODO Normalize this data before calling the api service rather than here.
  const silencedAlertPeriod = silencedAlertPeriodRequest.silencedAlertPeriod || ''
  const beforeDateTime = silencedAlertPeriodRequest.beforeDateTime?.toISOString() || ''

  try {
    return await ky
      .put(`/bff/v1/operational_alerts/${id}/silence`, {
        json: {
          beforeDateTime,
          silencedAlertPeriod
        }
      })
      .json<SilencedAlert>()
  } catch (err) {
    throw new ApiError(SILENCE_ALERT_ERROR_MESSAGE, err)
  }
}

/**
 * Get silenced alerts
 *
 * @throws {@link ApiError}
 */
async function getSilencedAlertsFromAPI(): Promise<LEGACY_SilencedAlert[]> {
  try {
    return await monitorfishApiKy.get('/bff/v1/operational_alerts/silenced').json<SilencedAlert[]>()
  } catch (err) {
    throw new ApiError(ALERTS_ERROR_MESSAGE, err)
  }
}

/**
 * Delete a silenced alert
 *
 * @throws {@link ApiError}
 */
async function deleteSilencedAlertFromAPI(id: string): Promise<void> {
  try {
    await monitorfishApiKy.delete(`/bff/v1/operational_alerts/silenced/${id}`)
  } catch (err) {
    throw new ApiError(DELETE_SILENCED_ALERT_ERROR_MESSAGE, err)
  }
}

export {
  getOperationalAlertsFromAPI,
  validateAlertFromAPI,
  silenceAlertFromAPI,
  getSilencedAlertsFromAPI,
  deleteSilencedAlertFromAPI
}
