import { getBeaconMalfunctionFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setOpenedBeaconMalfunction } from '../shared_slices/BeaconMalfunction'

/**
 * Open a single beacon status
 * @function setOpenedBeaconMalfunction
 * @param {BeaconMalfunctionWithDetails} beaconMalfunction - the beacon status to open
 */
const openBeaconmalfunction = (beaconMalfunction) => (dispatch, getState) => {
  const previousBeaconMalfunction = getState().beaconMalfunction.openedBeaconMalfunction
  dispatch(setOpenedBeaconMalfunction(beaconMalfunction))

  getBeaconMalfunctionFromAPI(beaconMalfunction.beaconMalfunction?.id).then(beaconMalfunctionWithDetails => {
    dispatch(setOpenedBeaconMalfunction(beaconMalfunctionWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
    dispatch(setOpenedBeaconMalfunction(previousBeaconMalfunction))
  })
}

export default openBeaconmalfunction
