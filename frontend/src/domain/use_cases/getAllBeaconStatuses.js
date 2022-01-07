import { getAllBeaconStatusesFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setBeaconStatuses } from '../shared_slices/BeaconStatus'

const getAllBeaconStatuses = () => dispatch => {
  getAllBeaconStatusesFromAPI().then(beaconStatuses => {
    dispatch(setBeaconStatuses(beaconStatuses))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default getAllBeaconStatuses
