import { silenceAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { Vessel } from '../../entities/vessel/vessel'
import {
  addToPendingAlertsBeingSilenced,
  removeFromSilencedAlertsQueue,
  setPendingAlerts,
  setSilencedAlerts
} from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'
import { removeVesselAlertAndUpdateReporting } from '../../shared_slices/Vessel'

import type { MainAppThunk } from '../../../store'
import type { SilencedAlertPeriodRequest } from '../../entities/alerts/types'

/**
 * Silence an alert
 */
export const silenceAlert =
  (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, pendingAlertId: string): MainAppThunk =>
  (dispatch, getState) => {
    const previousPendingAlerts = getState().alert.pendingAlerts
    const previousSilencedAlerts = getState().alert.silencedAlerts

    dispatch(
      addToPendingAlertsBeingSilenced({
        pendingAlertId,
        silencedAlertPeriodRequest
      })
    )
    const timeout = setTimeout(() => {
      const nextPendingAlerts = deleteListItems(getState().alert.pendingAlerts, 'id', pendingAlertId)
      dispatch(setPendingAlerts(nextPendingAlerts))

      dispatch(removeFromSilencedAlertsQueue(pendingAlertId))
    }, 3200)

    silenceAlertFromAPI(pendingAlertId, silencedAlertPeriodRequest)
      .then(silencedAlert => {
        dispatch(
          removeVesselAlertAndUpdateReporting({
            alertType: silencedAlert.value.type,
            isValidated: false,
            vesselFeatureId: Vessel.getVesselFeatureId(silencedAlert)
          })
        )

        const nextSilencedAlerts = [silencedAlert, ...previousSilencedAlerts]
        dispatch(setSilencedAlerts(nextSilencedAlerts))
      })
      .catch(error => {
        clearTimeout(timeout)

        dispatch(setPendingAlerts(previousPendingAlerts))
        dispatch(setSilencedAlerts(previousSilencedAlerts))
        dispatch(setError(error))
      })
  }
