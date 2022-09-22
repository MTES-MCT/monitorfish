import { validateAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { updateListItemsProp } from '../../../utils/updateListItemsProp'
import { Vessel } from '../../entities/vessel'
import { setAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'
import { removeVesselAlertAndUpdateReporting } from '../../shared_slices/Vessel'
import getVesselReportings from '../vessel/getVesselReportings'

import type { AppGetState } from '../../../store'
import type { ActiveAlert } from '../../types/alert'

export const validateAlert = (id: string) => (dispatch, getState: AppGetState) => {
  const previousAlerts = getState().alert.alerts
  const previousAlertsWithValidatedFlag = setAlertAsValidated(previousAlerts, id)
  dispatch(setAlerts(previousAlertsWithValidatedFlag))

  const timeout = setTimeout(() => {
    const previousAlertsWithoutValidated = deleteListItems(getState().alert.alerts, 'id', id)
    dispatch(setAlerts(previousAlertsWithoutValidated))
  }, 3200)

  validateAlertFromAPI(id)
    .then(() => {
      dispatch(getVesselReportings())

      const validatedAlert = previousAlertsWithValidatedFlag.find(alert => alert.id === id)
      if (!validatedAlert) {
        return
      }

      dispatch(
        removeVesselAlertAndUpdateReporting({
          alertType: validatedAlert.value?.type,
          isValidated: true,
          vesselId: Vessel.getVesselFeatureId(validatedAlert)
        })
      )
    })
    .catch(error => {
      clearTimeout(timeout)
      dispatch(setAlerts(previousAlerts))
      dispatch(setError(error))
    })
}

function setAlertAsValidated(previousAlerts: ActiveAlert[], id: string): ActiveAlert[] {
  return updateListItemsProp(previousAlerts, 'id', id, {
    isValidated: true
  })
}
