import { getBeaconMalfunctionFromAPI } from '../../../api/beaconMalfunction'
import { setOpenedBeaconMalfunctionsInKanban } from '../../shared_slices/BeaconMalfunction'
import { setError } from '../../shared_slices/Global'

/**
 * Open a single beacon malfunction
 */
export const openBeaconMalfunctionInKanban = id => dispatch => {
  getBeaconMalfunctionFromAPI(id)
    .then(beaconMalfunctionWithDetails => {
      dispatch(setOpenedBeaconMalfunctionsInKanban(beaconMalfunctionWithDetails))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}
