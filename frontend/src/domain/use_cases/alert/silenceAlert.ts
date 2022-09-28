import { silenceAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { Vessel } from '../../entities/vessel'
import {
  addToPendingAlertsBeingSilenced,
  removeFromPendingAlertsBeingSilenced,
  setPendingAlerts,
  setSilencedAlerts
} from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'
import { removeVesselAlertAndUpdateReporting } from '../../shared_slices/Vessel'

import type { AppGetState } from '../../../store'
import type { SilencedAlertPeriodRequest } from '../../types/alert'

/**
 * Silence an alert
 */
export const silenceAlert =
  (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, id: string) => (dispatch, getState: AppGetState) => {
    const previousAlerts = getState().alert.pendingAlerts
    const previousSilencedAlerts = getState().alert.silencedAlerts

    dispatch(addToPendingAlertsBeingSilenced(id))
    const timeout = setTimeout(() => {
      const nextPendingAlerts = deleteListItems(getState().alert.pendingAlerts, 'id', id)
      dispatch(setPendingAlerts(nextPendingAlerts))

      dispatch(removeFromPendingAlertsBeingSilenced(id))
    }, 3200)

    silenceAlertFromAPI(id, silencedAlertPeriodRequest)
      .then(silencedAlert => {
        dispatch(
          removeVesselAlertAndUpdateReporting({
            alertType: silencedAlert.value.type,
            isValidated: false,
            vesselId: Vessel.getVesselFeatureId(silencedAlert)
          })
        )

        const nextSilencedAlerts = [silencedAlert, ...previousSilencedAlerts]
        dispatch(setSilencedAlerts(nextSilencedAlerts))
      })
      .catch(error => {
        clearTimeout(timeout)

        dispatch(setPendingAlerts(previousAlerts))
        dispatch(setSilencedAlerts(previousSilencedAlerts))
        dispatch(setError(error))
      })
  }
