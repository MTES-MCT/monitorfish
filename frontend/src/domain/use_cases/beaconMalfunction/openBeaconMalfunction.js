import { getBeaconMalfunctionFromAPI } from '../../../api/beaconMalfunction'
import { setOpenedBeaconMalfunction } from '../../shared_slices/BeaconMalfunction'
import { setError } from '../../shared_slices/Global'

/**
 * Open a single beacon malfunction
 * @function openBeaconMalfunction
 * @param {BeaconMalfunctionResumeAndDetails} beaconMalfunction - the beacon malfunction to open
 * @param {boolean} fromCron - if the use case is called from the API Worker
 */
const openBeaconMalfunction = (beaconMalfunction, fromCron) => (dispatch, getState) => {
  const previousBeaconMalfunction = getState().beaconMalfunction.openedBeaconMalfunction
  dispatch(
    setOpenedBeaconMalfunction({
      beaconMalfunction,
      showTab: !fromCron
    })
  )

  getBeaconMalfunctionFromAPI(beaconMalfunction.beaconMalfunction?.id)
    .then(beaconMalfunctionWithDetails => {
      dispatch(
        setOpenedBeaconMalfunction({
          beaconMalfunction: beaconMalfunctionWithDetails,
          showTab: !fromCron
        })
      )
    })
    .catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(
        setOpenedBeaconMalfunction({
          beaconMalfunction: previousBeaconMalfunction,
          showTab: !fromCron
        })
      )
    })
}

export default openBeaconMalfunction
