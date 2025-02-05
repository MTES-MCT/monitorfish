import { alertApi } from '@api/alert'
import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'

import { setError } from '../../shared_slices/Global'

export const getSilencedAlerts = () => async dispatch => {
  try {
    const silencedAlerts = await dispatch(
      alertApi.endpoints.getSilencedAlerts.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()

    dispatch(setSilencedAlerts(silencedAlerts))
  } catch (error) {
    dispatch(setError(error))
  }
}
