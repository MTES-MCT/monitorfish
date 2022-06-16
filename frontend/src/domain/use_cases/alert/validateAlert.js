import { setError } from '../../shared_slices/Global'
import { setAlerts } from '../../shared_slices/Alert'
import { validateAlertFromAPI } from '../../../api/alert'
import { removeVesselAlertAndUpdateReporting } from '../../shared_slices/Vessel'
import { Vessel } from '../../entities/vessel'
import getVesselReportings from '../vessel/getVesselReportings'

const validateAlert = id => (dispatch, getState) => {
  const previousAlerts = getState().alert.alerts
  const previousAlertsWithValidatedFlag = setAlertAsValidated(previousAlerts, id)
  dispatch(setAlerts(previousAlertsWithValidatedFlag))

  const timeout = setTimeout(() => {
    const previousAlertsWithoutValidated = removeAlert(getState().alert.alerts, id)
    dispatch(setAlerts(previousAlertsWithoutValidated))
  }, 3200)

  validateAlertFromAPI(id).then(() => {
    dispatch(getVesselReportings())
    const validatedAlert = previousAlertsWithValidatedFlag?.find(alert => alert.id === id)
    dispatch(removeVesselAlertAndUpdateReporting({
      vesselId: Vessel.getVesselFeatureId(validatedAlert),
      alertType: validatedAlert.value?.type,
      isValidated: true
    }))
  }).catch(error => {
    clearTimeout(timeout)
    dispatch(setAlerts(previousAlerts))
    console.error(error)
    dispatch(setError(error))
  })
}

function setAlertAsValidated (previousAlerts, id) {
  return previousAlerts.reduce((acc, alert) => {
    if (alert.id === id) {
      const validatedAlert = Object.assign({}, alert)
      validatedAlert.isValidated = true

      acc.push(validatedAlert)
      return acc
    }

    acc.push(alert)
    return acc
  }, [])
}

export function removeAlert (previousAlerts, id) {
  return previousAlerts.reduce((acc, alert) => {
    if (alert.id === id) {
      return acc
    }

    acc.push(alert)
    return acc
  }, [])
}

export default validateAlert
