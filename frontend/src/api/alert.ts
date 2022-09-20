// TODO We could remove the type discrimation normalization step if we had it done on API side.

import ky from 'ky'

import {
  ActiveAlert,
  AlertType,
  LEGACY_ActiveAlert,
  LEGACY_SilencedAlert,
  SilencedAlert,
  SilencedAlertPeriodRequest
} from '../domain/types/alert'
import { ApiError } from '../libs/ApiError'

export const ALERTS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les alertes opérationelles"
export const VALIDATE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu valider l'alerte opérationelle"
export const SILENCE_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu ignorer l'alerte opérationelle"
export const DELETE_SILENCED_ALERT_ERROR_MESSAGE = "Nous n'avons pas pu réactiver l'alerte opérationelle"

/**
 * Type-discriminate active alerts
 */
function normalizeActiveAlert(alert: LEGACY_ActiveAlert): ActiveAlert {
  return {
    ...alert,
    type: AlertType.ACTIVE
  }
}

/**
 * Type-discriminate silenced alerts
 */
function normalizeSilencedAlert(alert: LEGACY_SilencedAlert): SilencedAlert {
  return {
    ...alert,
    type: AlertType.SILENCED
  }
}

/**
 * Get operational alerts
 *
 * @throws {@link ApiError}
 */
async function getOperationalAlertsFromAPI(): Promise<ActiveAlert[]> {
  try {
    const data = await ky.get('/bff/v1/operational_alerts').json<LEGACY_ActiveAlert[]>()

    return data.map(normalizeActiveAlert)
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
    await ky.put(`/bff/v1/operational_alerts/${id}/validate`)
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
): Promise<SilencedAlert> {
  // TODO Normalize this data before calling the api service rather than here.
  const silencedAlertPeriod = silencedAlertPeriodRequest.silencedAlertPeriod || ''
  const afterDateTime = silencedAlertPeriodRequest.afterDateTime?.toISOString() || ''
  const beforeDateTime = silencedAlertPeriodRequest.beforeDateTime?.toISOString() || ''

  try {
    const data = await ky
      .put(`/bff/v1/operational_alerts/${id}/silence`, {
        // TODO Is this necessary?
        headers: {
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json;charset=UTF-8'
        },
        json: {
          afterDateTime,
          beforeDateTime,
          silencedAlertPeriod
        }
      })
      .json<LEGACY_SilencedAlert>()

    return normalizeSilencedAlert(data)
  } catch (err) {
    throw new ApiError(SILENCE_ALERT_ERROR_MESSAGE, err)
  }
}

/**
 * Get silenced alerts
 *
 * @throws {@link ApiError}
 */
async function getSilencedAlertsFromAPI(): Promise<SilencedAlert[]> {
  try {
    const data = await ky.get('/bff/v1/operational_alerts/silenced').json<LEGACY_SilencedAlert[]>()

    return data.map(normalizeSilencedAlert)
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
    await ky.delete(`/bff/v1/operational_alerts/silenced/${id}`)
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
