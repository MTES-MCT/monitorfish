import { setError } from '../../shared_slices/Global'
import { setOpenedBeaconMalfunction } from '../../shared_slices/BeaconMalfunction'
import { getBeaconMalfunctionFromAPI } from '../../../api/beaconMalfunction'

/**
 * Open a single beacon malfunction
 * @function openBeaconMalfunction
 * @param {BeaconMalfunctionResumeAndDetails} beaconMalfunction - the beacon malfunction to open
 */
const openBeaconMalfunction = beaconMalfunction => (dispatch, getState) => {
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

export default openBeaconMalfunction
