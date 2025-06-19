import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { alertApi } from '@features/Alert/apis'
import { setSilencedAlerts } from '@features/Alert/components/SideWindowAlerts/slice'

import { setError } from '../../../domain/shared_slices/Global'

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
