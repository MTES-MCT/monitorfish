import { alertApi } from '@features/Alert/apis'
import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { deleteListItems } from '@utils/deleteListItems'
import { updateListItemsProp } from '@utils/updateListItemsProp'

import { setError } from '../../../domain/shared_slices/Global'

import type { SilencedAlert } from '@features/Alert/types'
import type { MainAppThunk } from '@store'

export const reactivateSilencedAlert =
  (id: number): MainAppThunk =>
  async (dispatch, getState) => {
    const previousSilencedAlerts = getState().alert.silencedAlerts
    const previousSilencedAlertsWithReactivatedFlag = setAlertAsReactivated(previousSilencedAlerts, id)
    dispatch(setSilencedAlerts(previousSilencedAlertsWithReactivatedFlag))

    const timeout = setTimeout(() => {
      const previousSilencedAlertsWithoutReactivatedFlag = deleteListItems(previousSilencedAlerts, 'id', id)
      dispatch(setSilencedAlerts(previousSilencedAlertsWithoutReactivatedFlag))
    }, 3200)

    try {
      await dispatch(alertApi.endpoints.deleteSilencedAlert.initiate(id)).unwrap()
    } catch (error) {
      clearTimeout(timeout)
      dispatch(setSilencedAlerts(previousSilencedAlerts))
      dispatch(setError(error))
    }
  }

function setAlertAsReactivated(previousSilencedAlerts: SilencedAlert[], id: number) {
  return updateListItemsProp(previousSilencedAlerts, 'id', id, {
    isReactivated: true
  })
}
