import { getBeaconMalfunctionFromAPI } from '../../../api/beaconMalfunction'
import { setError } from '../../../features/MainWindow/slice'
import { setOpenedBeaconMalfunctionsInKanban } from '../../shared_slices/BeaconMalfunction'

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
