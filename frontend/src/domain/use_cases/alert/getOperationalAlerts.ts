import { alertApi } from '@api/alert'
import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { setPendingAlerts } from '@features/Alert/components/SideWindowAlerts/slice'

import { setError } from '../../shared_slices/Global'

import type { MainAppThunk } from '@store'

export const getOperationalAlerts = (): MainAppThunk => async dispatch => {
  try {
    const alerts = await dispatch(
      alertApi.endpoints.getOperationalAlerts.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()

    dispatch(setPendingAlerts(alerts))
  } catch (error) {
    dispatch(setError(error))
  }
}
