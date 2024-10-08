import { getVesselReportings } from '@features/Reporting/useCases/getVesselReportings'
import { removeVesselAlertAndUpdateReporting } from '@features/Vessel/slice'
import { renderVessels } from '@features/Vessel/useCases/renderVessels'

import { validateAlertFromAPI } from '../../../api/alert'
import { setPendingAlerts } from '../../../features/SideWindow/Alert/slice'
import { deleteListItems } from '../../../utils/deleteListItems'
import { updateListItemsProp } from '../../../utils/updateListItemsProp'
import { Vessel } from '../../entities/vessel/vessel'
import { setError } from '../../shared_slices/Global'

import type { MainAppThunk } from '../../../store'
import type { LEGACY_PendingAlert } from '../../entities/alerts/types'

export const validateAlert =
  (id: string): MainAppThunk =>
  async (dispatch, getState) => {
    const previousAlerts = getState().alert.pendingAlerts
    const previousAlertsWithValidatedFlag = setAlertAsValidated(previousAlerts, id)
    dispatch(setPendingAlerts(previousAlertsWithValidatedFlag))

    const timeout = setTimeout(() => {
      const previousAlertsWithoutValidated = deleteListItems(getState().alert.pendingAlerts, 'id', id)
      dispatch(setPendingAlerts(previousAlertsWithoutValidated))
    }, 3200)

    try {
      await validateAlertFromAPI(id)
      // We dispatch this action to update the reporting list
      // since it depends on the alerts list that we just updated
      await dispatch(getVesselReportings(true))

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
      await dispatch(renderVessels())
    } catch (error) {
      clearTimeout(timeout)
      dispatch(setPendingAlerts(previousAlerts))
      dispatch(setError(error))
    }
  }

function setAlertAsValidated(previousAlerts: LEGACY_PendingAlert[], id: string): LEGACY_PendingAlert[] {
  return updateListItemsProp(previousAlerts, 'id', id, {
    isValidated: true
  })
}
