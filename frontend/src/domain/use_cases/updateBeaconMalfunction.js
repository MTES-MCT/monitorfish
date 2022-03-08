import { setError } from '../shared_slices/Global'
import { updateMalfunctionStatusFromAPI } from '../../api/fetch'
import { setOpenedBeaconMalfunction, setBeaconMalfunctions, updateLocalBeaconMalfunctions } from '../shared_slices/BeaconMalfunction'

/**
 * Update a beacon status
 * @param {number} id - The id of the beacon status
 * @param {BeaconMalfunction} nextBeaconMalfunction - The next beacon status
 * @param {UpdateBeaconMalfunction} updatedFields - The fields to update
 */
const updateBeaconMalfunction = (id, nextBeaconMalfunction, updatedFields) => (dispatch, getState) => {
  const previousBeaconMalfunctions = getState().beaconMalfunction.beaconMalfunctions
  dispatch(updateLocalBeaconMalfunctions(nextBeaconMalfunction))
  const beaconMalfunctionToUpdateIsOpened = getState().beaconMalfunction.openedBeaconMalfunction?.beaconMalfunction?.id === id

  return updateMalfunctionStatusFromAPI(id, updatedFields).then(updatedBeaconMalfunctionWithDetails => {
    if (beaconMalfunctionToUpdateIsOpened) {
      dispatch(setOpenedBeaconMalfunction(updatedBeaconMalfunctionWithDetails))
    }
  }).catch(error => {
    dispatch(setError(error))
    dispatch(setBeaconMalfunctions(previousBeaconMalfunctions))
  })
}

export default updateBeaconMalfunction
