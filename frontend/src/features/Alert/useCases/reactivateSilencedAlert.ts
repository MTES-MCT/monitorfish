import { alertApi } from '@features/Alert/apis'
import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { deleteListItems } from '@utils/deleteListItems'
import { updateListItemsProp } from '@utils/updateListItemsProp'

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
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }

function setAlertAsReactivated(previousSilencedAlerts: SilencedAlert[], id: number) {
  return updateListItemsProp(previousSilencedAlerts, 'id', id, {
    isReactivated: true
  })
}
