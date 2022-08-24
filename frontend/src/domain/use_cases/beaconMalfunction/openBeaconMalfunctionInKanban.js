import { getBeaconMalfunctionFromAPI } from '../../../api/beaconMalfunction'
import { setOpenedBeaconMalfunctionsInKanban } from '../../shared_slices/BeaconMalfunction'
import { setError } from '../../shared_slices/Global'

/**
 * Open a single beacon malfunction
 * @function openBeaconMalfunctionInKanban
 * @param {BeaconMalfunctionResumeAndDetails} beaconMalfunction - the beacon malfunction to open
 */
const openBeaconMalfunctionInKanban = beaconMalfunction => (dispatch, getState) => {
  const previousBeaconMalfunction = getState().beaconMalfunction.openedBeaconMalfunctionInKanban
  dispatch(setOpenedBeaconMalfunctionsInKanban(beaconMalfunction))

  getBeaconMalfunctionFromAPI(beaconMalfunction.beaconMalfunction?.id)
    .then(beaconMalfunctionWithDetails => {
      dispatch(setOpenedBeaconMalfunctionsInKanban(beaconMalfunctionWithDetails))
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(setOpenedBeaconMalfunctionsInKanban(previousBeaconMalfunction))
    })
}

export default openBeaconMalfunctionInKanban
