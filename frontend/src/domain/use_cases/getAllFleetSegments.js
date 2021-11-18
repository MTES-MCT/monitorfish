import { getAllFleetSegmentFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setFleetSegments } from '../shared_slices/FleetSegment'

const getAllFleetSegments = () => dispatch => {
  getAllFleetSegmentFromAPI().then(fleetSegments => {
    console.log(fleetSegments, 'fleetSegments')
    dispatch(setFleetSegments(fleetSegments))
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllFleetSegments
