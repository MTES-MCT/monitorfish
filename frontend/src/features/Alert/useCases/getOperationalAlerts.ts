import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { alertApi } from '@features/Alert/apis'
import { setPendingAlerts } from '@features/Alert/components/SideWindowAlerts/slice'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import type { MainAppThunk } from '@store'

export const getOperationalAlerts = (): MainAppThunk => async dispatch => {
  try {
    const alerts = await dispatch(
      alertApi.endpoints.getOperationalAlerts.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()

    dispatch(setPendingAlerts(alerts))
  } catch (error) {
    dispatch(
      addSideWindowBanner({
        children: (error as Error).message,
        closingDelay: 3000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }
}
