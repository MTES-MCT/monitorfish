import { getFleetSegmentYearEntriesFromAPI } from '@features/FleetSegment/apis'

import { setError } from '../../MainWindow/slice'

export const getFleetSegmentsYearEntries = () => dispatch =>
  getFleetSegmentYearEntriesFromAPI().catch(error => {
    dispatch(setError(error))
  })
