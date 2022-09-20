import { deleteSilencedAlertFromAPI } from '../../../api/alert'
import { setSilencedAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'

export const reactivateSilencedAlert = id => (dispatch, getState) => {
  const previousSilencedAlerts = getState().alert.silencedAlerts
  const previousSilencedAlertsWithReactivatedFlag = setAlertAsReactivated(previousSilencedAlerts, id)
  dispatch(setSilencedAlerts(previousSilencedAlertsWithReactivatedFlag))

  const timeout = setTimeout(() => {
    const previousSilencedAlertsWithoutReactivatedFlag = removeAlert(previousSilencedAlerts, id)
    dispatch(setSilencedAlerts(previousSilencedAlertsWithoutReactivatedFlag))
  }, 3200)

  deleteSilencedAlertFromAPI(id).catch(error => {
    clearTimeout(timeout)
    dispatch(setSilencedAlerts(previousSilencedAlerts))
    dispatch(setError(error))
  })
}

function setAlertAsReactivated(previousSilencedAlerts, id) {
  return previousSilencedAlerts.reduce((acc, alert) => {
    if (alert.id === id) {
      const validatedAlert = { ...alert }
      validatedAlert.isReactivated = true

      acc.push(validatedAlert)

      return acc
    }

    acc.push(alert)

    return acc
  }, [])
}

export function removeAlert(previousAlerts, id) {
  return previousAlerts.reduce((acc, alert) => {
    if (alert.id === id) {
      return acc
    }

    acc.push(alert)

    return acc
  }, [])
}
