import { getFleetSegmentsYearEntries } from './getFleetSegmentsYearEntries'
import { addFleetSegmentYearFromAPI } from '../../../api/fleetSegment'
import { setError } from '../../shared_slices/Global'

/**
 * Add a new fleet segment year
 */
export const addFleetSegmentYear = (year: number) => dispatch =>
  addFleetSegmentYearFromAPI(year)
    .then(() => dispatch(getFleetSegmentsYearEntries()))
    .catch(error => {
      dispatch(setError(error))
    })
