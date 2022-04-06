import { setError } from '../../shared_slices/Global'
import { setFleetSegments } from '../../shared_slices/FleetSegment'
import { getAllFleetSegmentFromAPI } from '../../../api/fleetSegment'

const getAllFleetSegments = () => dispatch => {
  getAllFleetSegmentFromAPI().then(fleetSegments => {
    dispatch(setFleetSegments(fleetSegments))
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllFleetSegments
