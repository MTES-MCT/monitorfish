import { validateAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { updateListItemsProp } from '../../../utils/updateListItemsProp'
import { Vessel } from '../../entities/vessel/vessel'
import { setPendingAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'
import { removeVesselAlertAndUpdateReporting } from '../../shared_slices/Vessel'
import { getVesselReportings } from '../vessel/getVesselReportings'

import type { MainAppThunk } from '../../../store'
import type { LEGACY_PendingAlert } from '../../entities/alerts/types'

export const validateAlert =
  (id: string): MainAppThunk =>
  (dispatch, getState) => {
    const previousAlerts = getState().alert.pendingAlerts
    const previousAlertsWithValidatedFlag = setAlertAsValidated(previousAlerts, id)
    dispatch(setPendingAlerts(previousAlertsWithValidatedFlag))

    const timeout = setTimeout(() => {
      const previousAlertsWithoutValidated = deleteListItems(getState().alert.pendingAlerts, 'id', id)
      dispatch(setPendingAlerts(previousAlertsWithoutValidated))
    }, 3200)

    validateAlertFromAPI(id)
      .then(() => {
        // We dispatch this action to update the reportings list
        // since it depends on the the alerts list that we just updated
        dispatch(getVesselReportings(false))

        const validatedAlert = previousAlertsWithValidatedFlag.find(alert => alert.id === id)
        if (!validatedAlert) {
          return
        }

        dispatch(
          removeVesselAlertAndUpdateReporting({
            alertType: validatedAlert.value?.type,
            isValidated: true,
            vesselFeatureId: Vessel.getVesselFeatureId(validatedAlert)
          })
        )
      })
      .catch(error => {
        clearTimeout(timeout)
        dispatch(setPendingAlerts(previousAlerts))
        dispatch(setError(error))
      })
  }

function setAlertAsValidated(previousAlerts: LEGACY_PendingAlert[], id: string): LEGACY_PendingAlert[] {
  return updateListItemsProp(previousAlerts, 'id', id, {
    isValidated: true
  })
}
