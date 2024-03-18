import { getFleetSegmentYearEntriesFromAPI } from '@features/FleetSegment/apis'

import { setError } from '../../../domain/shared_slices/Global'

export const getFleetSegmentsYearEntries = () => dispatch =>
  getFleetSegmentYearEntriesFromAPI().catch(error => {
    dispatch(setError(error))
  })
