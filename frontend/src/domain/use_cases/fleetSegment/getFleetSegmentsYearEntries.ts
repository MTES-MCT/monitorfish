import { getFleetSegmentYearEntriesFromAPI } from '../../../api/fleetSegment'
import { setError } from '../../shared_slices/Global'

export const getFleetSegmentsYearEntries = () => dispatch =>
  getFleetSegmentYearEntriesFromAPI().catch(error => {
    dispatch(setError(error))
  })
