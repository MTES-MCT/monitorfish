import { getAllFleetSegmentFromAPI } from '../../../api/fleetSegment'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { setError } from '../../shared_slices/Global'

export const getAllFleetSegments = (year?: number) => dispatch => {
  getAllFleetSegmentFromAPI(year)
    .then(fleetSegments => {
      dispatch(setFleetSegments(fleetSegments.sort((a, b) => a.segment.localeCompare(b.segment))))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
