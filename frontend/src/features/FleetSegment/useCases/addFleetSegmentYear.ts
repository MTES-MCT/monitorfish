import { fleetSegmentApi } from '@features/FleetSegment/apis'

import { getFleetSegmentsYearEntries } from './getFleetSegmentsYearEntries'
import { setError } from '../../../domain/shared_slices/Global'

/**
 * Add a new fleet segment year
 */
export const addFleetSegmentYear = (year: number) => async dispatch => {
  try {
    await dispatch(fleetSegmentApi.endpoints.addFleetSegmentYear.initiate(year)).unwrap()

    return dispatch(getFleetSegmentsYearEntries())
  } catch (error) {
    dispatch(setError(error))

    return undefined
  }
}
