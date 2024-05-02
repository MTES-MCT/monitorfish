import { addFleetSegmentYearFromAPI } from '@features/FleetSegment/apis'

import { getFleetSegmentsYearEntries } from './getFleetSegmentsYearEntries'
import { setError } from '../../MainWindow/slice'

/**
 * Add a new fleet segment year
 */
export const addFleetSegmentYear = (year: number) => dispatch =>
  addFleetSegmentYearFromAPI(year)
    .then(() => dispatch(getFleetSegmentsYearEntries()))
    .catch(error => {
      dispatch(setError(error))
    })
