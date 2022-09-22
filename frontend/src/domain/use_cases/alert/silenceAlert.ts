import { silenceAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { updateListItemsProp } from '../../../utils/updateListItemsProp'
import { Vessel } from '../../entities/vessel'
import { setAlerts, setSilencedAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'
import { removeVesselAlertAndUpdateReporting } from '../../shared_slices/Vessel'

import type { AppGetState } from '../../../store'
import type { SilencedAlert, SilencedAlertPeriodRequest } from '../../types/alert'

/**
 * Silence an alert
 */
export const silenceAlert =
  (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, id: string) => (dispatch, getState: AppGetState) => {
    const previousAlerts = getState().alert.alerts
    const previousSilencedAlerts = getState().alert.silencedAlerts
    // TODO Investigate the mechanism here: why is a silenced alert in the active alert array?
    const previousAlertsWithSilencedFlag = setSilencedAlertAs(previousAlerts as any, id, silencedAlertPeriodRequest)
    dispatch(setAlerts(previousAlertsWithSilencedFlag as any))

    const timeout = setTimeout(() => {
      const previousAlertsWithoutSilenced = deleteListItems(getState().alert.alerts, 'id', id)
      dispatch(setAlerts(previousAlertsWithoutSilenced))
    }, 3200)

    silenceAlertFromAPI(id, silencedAlertPeriodRequest)
      .then(silencedAlert => {
        dispatch(
          removeVesselAlertAndUpdateReporting({
            alertType: silencedAlert.value?.type,
            isValidated: false,
            vesselId: Vessel.getVesselFeatureId(silencedAlert)
          })
        )

        const previousSilencedAlertsWithNewSilencedAlert = [silencedAlert].concat(previousSilencedAlerts)
        dispatch(setSilencedAlerts(previousSilencedAlertsWithNewSilencedAlert))
      })
      .catch(error => {
        clearTimeout(timeout)

        dispatch(setAlerts(previousAlerts))
        dispatch(setSilencedAlerts(previousSilencedAlerts))
        dispatch(setError(error))
      })
  }

function setSilencedAlertAs(
  previousAlerts: SilencedAlert[],
  id: string,
  silencedAlertPeriodRequest: SilencedAlertPeriodRequest
): SilencedAlert[] {
  return updateListItemsProp(previousAlerts, 'id', id, {
    silencedPeriod: silencedAlertPeriodRequest
  })
}
