import { getBeaconStatusFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { selectBeaconStatus } from '../shared_slices/BeaconStatus'

const openBeaconStatus = beaconStatus => dispatch => {
  dispatch(selectBeaconStatus({
    beaconStatus: beaconStatus
  }))

  getBeaconStatusFromAPI(beaconStatus?.id).then(beaconStatusWithDetails => {
    dispatch(selectBeaconStatus(beaconStatusWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default openBeaconStatus
