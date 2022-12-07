import { addFleetSegmentYearFromAPI } from '../../../api/fleetSegment'
import { setError } from '../../shared_slices/Global'
import { getFleetSegmentsYearEntries } from './getFleetSegmentsYearEntries'

/**
 * Add a new fleet segment year
 */
export const addFleetSegmentYear = (year: number) => dispatch =>
  addFleetSegmentYearFromAPI(year)
    .then(() => dispatch(getFleetSegmentsYearEntries()))
    .catch(error => {
      dispatch(setError(error))
    })
