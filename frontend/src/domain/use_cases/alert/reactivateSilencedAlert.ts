import { deleteSilencedAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { updateListItemsProp } from '../../../utils/updateListItemsProp'
import { setSilencedAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'

import type { AppThunk } from '../../../store'
import type { LEGACY_SilencedAlert } from '../../entities/alerts/types'

export const reactivateSilencedAlert =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const previousSilencedAlerts = getState().alert.silencedAlerts
    const previousSilencedAlertsWithReactivatedFlag = setAlertAsReactivated(previousSilencedAlerts, id)
    dispatch(setSilencedAlerts(previousSilencedAlertsWithReactivatedFlag))

    const timeout = setTimeout(() => {
      const previousSilencedAlertsWithoutReactivatedFlag = deleteListItems(previousSilencedAlerts, 'id', id)
      dispatch(setSilencedAlerts(previousSilencedAlertsWithoutReactivatedFlag))
    }, 3200)

    deleteSilencedAlertFromAPI(id).catch(error => {
      clearTimeout(timeout)
      dispatch(setSilencedAlerts(previousSilencedAlerts))
      dispatch(setError(error))
    })
  }

function setAlertAsReactivated(previousSilencedAlerts: LEGACY_SilencedAlert[], id: string) {
  return updateListItemsProp(previousSilencedAlerts, 'id', id, {
    isReactivated: true
  })
}

export function removeAlert(previousAlerts: LEGACY_SilencedAlert[], id: string) {
  return deleteListItems(previousAlerts, 'id', id)
}
