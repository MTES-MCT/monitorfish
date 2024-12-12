import { getBeaconMalfunctionFromAPI } from '../../../api/beaconMalfunction'
import { setOpenedBeaconMalfunction } from '../../shared_slices/BeaconMalfunction'
import { setError } from '../../shared_slices/Global'

/**
 * Open a single beacon malfunction
 * @function openBeaconMalfunction
 * @param {BeaconMalfunctionResumeAndDetails} beaconMalfunction - the beacon malfunction to open
 * @param {boolean} isFromUserAction - if the use case is called from the API Worker
 */
export const openBeaconMalfunction = (beaconMalfunction, isFromUserAction) => (dispatch, getState) => {
  const previousBeaconMalfunction = getState().beaconMalfunction.openedBeaconMalfunction
  dispatch(
    setOpenedBeaconMalfunction({
      beaconMalfunction,
      showTab: isFromUserAction
    })
  )

  getBeaconMalfunctionFromAPI(beaconMalfunction.beaconMalfunction?.id)
    .then(beaconMalfunctionWithDetails => {
      dispatch(
        setOpenedBeaconMalfunction({
          beaconMalfunction: beaconMalfunctionWithDetails,
          showTab: isFromUserAction
        })
      )
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(
        setOpenedBeaconMalfunction({
          beaconMalfunction: previousBeaconMalfunction,
          showTab: isFromUserAction
        })
      )
    })
}
