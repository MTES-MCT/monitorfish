import { alertSpecificationsApi } from '@features/Alert/apis'
import { getOperationalAlerts } from '@features/Alert/useCases/getOperationalAlerts'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import type { MainAppThunk } from '@store'

export const deactivateAlert =
  (id: number): MainAppThunk =>
  async dispatch => {
    try {
      await dispatch(alertSpecificationsApi.endpoints.deactivateAlert.initiate(id)).unwrap()
      // Refresh alert lists
      dispatch(getOperationalAlerts())
    } catch (error) {
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
