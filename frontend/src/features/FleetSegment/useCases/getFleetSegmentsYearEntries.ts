import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { fleetSegmentApi } from '@features/FleetSegment/apis'

import { setError } from '../../../domain/shared_slices/Global'

export const getFleetSegmentsYearEntries = () => async dispatch => {
  try {
    return dispatch(
      fleetSegmentApi.endpoints.getFleetSegmentYearEntries.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()
  } catch (error) {
    dispatch(setError(error))

    return undefined
  }
}
