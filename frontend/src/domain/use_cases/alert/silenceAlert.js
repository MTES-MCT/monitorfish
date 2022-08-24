import { silenceAlertFromAPI } from '../../../api/alert'
import { Vessel } from '../../entities/vessel'
import { setAlerts, setSilencedAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'
import { removeVesselAlertAndUpdateReporting } from '../../shared_slices/Vessel'
import { removeAlert } from './validateAlert'

/**
 * Silence an alert
 * @param silencedAlertPeriodRequest {SilencedAlertPeriodRequest}
 * @param id
 * @return {function(*, *): void}
 */
const silenceAlert = (silencedAlertPeriodRequest, id) => (dispatch, getState) => {
  const previousAlerts = getState().alert.alerts
  const previousSilencedAlerts = getState().alert.silencedAlerts
  const previousAlertsWithSilencedFlag = setSilencedAlertAs(previousAlerts, id, silencedAlertPeriodRequest)
  dispatch(setAlerts(previousAlertsWithSilencedFlag))

  const timeout = setTimeout(() => {
    const previousAlertsWithoutSilenced = removeAlert(getState().alert.alerts, id)
    dispatch(setAlerts(previousAlertsWithoutSilenced))
  }, 3200)

  silenceAlertFromAPI(id, silencedAlertPeriodRequest)
    .then(silencedAlert => {
      dispatch(
        removeVesselAlertAndUpdateReporting({
          alertType: silencedAlert.value?.type,
          isValidated: false,
          vesselId: Vessel.getVesselFeatureId(silencedAlert),
        }),
      )
      const previousSilencedAlertsWithNewSilencedAlert = [silencedAlert].concat(previousSilencedAlerts)
      dispatch(setSilencedAlerts(previousSilencedAlertsWithNewSilencedAlert))
    })
    .catch(error => {
      clearTimeout(timeout)
      dispatch(setAlerts(previousAlerts))
      dispatch(setSilencedAlerts(previousSilencedAlerts))
      console.error(error)
      dispatch(setError(error))
    })
}

function setSilencedAlertAs(previousAlerts, id, silenced) {
  return previousAlerts.reduce((acc, alert) => {
    if (alert.id === id) {
      const silencedAlert = { ...alert }
      silencedAlert.silencedPeriod = silenced

      acc.push(silencedAlert)

      return acc
    }

    acc.push(alert)

    return acc
  }, [])
}

export default silenceAlert
