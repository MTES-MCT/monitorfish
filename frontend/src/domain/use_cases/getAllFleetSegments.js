import { getAllFleetSegmentFromAPI } from '../../api/fetch'
import { setError } from '../reducers/Global'
import { setFleetSegments } from '../reducers/FleetSegment'

const getAllFleetSegments = () => dispatch => {
    getAllFleetSegmentFromAPI().then(fleetSegments => {
        dispatch(setFleetSegments(fleetSegments))
    }).catch(error => {
        dispatch(setError(error));
    });
}

export default getAllFleetSegments
