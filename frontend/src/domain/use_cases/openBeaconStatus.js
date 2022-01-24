import { getBeaconStatusFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { selectBeaconStatus } from '../shared_slices/BeaconStatus'

const openBeaconStatus = beaconStatus => (dispatch, getState) => {
  const previousBeaconStatus = getState().beaconStatus.openedBeaconStatus
  dispatch(selectBeaconStatus(beaconStatus))

  getBeaconStatusFromAPI(beaconStatus.beaconStatus?.id).then(beaconStatusWithDetails => {
    dispatch(selectBeaconStatus(beaconStatusWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
    dispatch(selectBeaconStatus(previousBeaconStatus))
  })
}

export default openBeaconStatus
