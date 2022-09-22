import { deleteSilencedAlertFromAPI } from '../../../api/alert'
import { deleteListItems } from '../../../utils/deleteListItems'
import { updateListItemsProp } from '../../../utils/updateListItemsProp'
import { setSilencedAlerts } from '../../shared_slices/Alert'
import { setError } from '../../shared_slices/Global'

import type { AppGetState } from '../../../store'
import type { SilencedAlert } from '../../types/alert'

export const reactivateSilencedAlert = id => (dispatch, getState: AppGetState) => {
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

function setAlertAsReactivated(previousSilencedAlerts: SilencedAlert[], id: string) {
  return updateListItemsProp(previousSilencedAlerts, 'id', id, {
    isReactivated: true
  })
}

export function removeAlert(previousAlerts: SilencedAlert[], id: string) {
  return deleteListItems(previousAlerts, 'id', id)
}
