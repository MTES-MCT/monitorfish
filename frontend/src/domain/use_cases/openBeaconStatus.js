import { getBeaconStatusFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setOpenedBeaconStatus } from '../shared_slices/BeaconStatus'

/**
 * Open a single beacon status
 * @function setOpenedBeaconStatus
 * @param {BeaconStatusWithDetails} beaconStatus - the beacon status to open
 */
const openBeaconStatus = (beaconStatus) => (dispatch, getState) => {
  const previousBeaconStatus = getState().beaconStatus.openedBeaconStatus
  dispatch(setOpenedBeaconStatus(beaconStatus))

  getBeaconStatusFromAPI(beaconStatus.beaconStatus?.id).then(beaconStatusWithDetails => {
    dispatch(setOpenedBeaconStatus(beaconStatusWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
    dispatch(setOpenedBeaconStatus(previousBeaconStatus))
  })
}

export default openBeaconStatus
