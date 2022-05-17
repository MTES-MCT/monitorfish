import { setError } from '../../shared_slices/Global'
import { setAlerts } from '../../shared_slices/Alert'
import { ignoreAlertFromAPI } from '../../../api/alert'
import { removeAlert } from './validateAlert'

const ignoreAlert = (forPeriod, id) => (dispatch, getState) => {
  const previousAlerts = getState().alert.alerts
  const previousAlertsWithIgnoredFlag = setIgnoredAlertAs(previousAlerts, id, 'ONE_WEEK')
  dispatch(setAlerts(previousAlertsWithIgnoredFlag))

  const timeout = setTimeout(() => {
    const previousAlertsWithoutIgnored = removeAlert(previousAlerts, id)
    dispatch(setAlerts(previousAlertsWithoutIgnored))
  }, 1500)

  ignoreAlertFromAPI(id).catch(error => {
    clearTimeout(timeout)
    dispatch(setAlerts(previousAlerts))
    console.error(error)
    dispatch(setError(error))
  })
}

function setIgnoredAlertAs (previousAlerts, id, ignored) {
  return previousAlerts.reduce((acc, alert) => {
    if (alert.id === id) {
      const ignoredAlert = Object.assign({}, alert)
      ignoredAlert.ignoredPeriod = ignored

      acc.push(ignoredAlert)
      return acc
    }

    acc.push(alert)
    return acc
  }, [])
}

export default ignoreAlert
