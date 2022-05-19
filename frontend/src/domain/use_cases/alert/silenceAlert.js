import { setError } from '../../shared_slices/Global'
import { setAlerts } from '../../shared_slices/Alert'
import { silenceAlertFromAPI } from '../../../api/alert'
import { removeAlert } from './validateAlert'

/**
 * Silence an alert
 * @param silencedAlertPeriodRequest {SilencedAlertPeriodRequest}
 * @param id
 * @return {function(*, *): void}
 */
const silenceAlert = (silencedAlertPeriodRequest, id) => (dispatch, getState) => {
  const previousAlerts = getState().alert.alerts
  const previousAlertsWithSilencedFlag = setSilencedAlertAs(previousAlerts, id, silencedAlertPeriodRequest)
  dispatch(setAlerts(previousAlertsWithSilencedFlag))

  const timeout = setTimeout(() => {
    const previousAlertsWithoutSilenced = removeAlert(previousAlerts, id)
    dispatch(setAlerts(previousAlertsWithoutSilenced))
  }, 1500)

  silenceAlertFromAPI(id, silencedAlertPeriodRequest).catch(error => {
    clearTimeout(timeout)
    dispatch(setAlerts(previousAlerts))
    console.error(error)
    dispatch(setError(error))
  })
}

function setSilencedAlertAs (previousAlerts, id, silenced) {
  return previousAlerts.reduce((acc, alert) => {
    if (alert.id === id) {
      const silencedAlert = Object.assign({}, alert)
      silencedAlert.silencedPeriod = silenced

      acc.push(silencedAlert)
      return acc
    }

    acc.push(alert)
    return acc
  }, [])
}

export default silenceAlert
