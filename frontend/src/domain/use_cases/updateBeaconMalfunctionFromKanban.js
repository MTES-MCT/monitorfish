import { setError } from '../shared_slices/Global'
import { updateBeaconMalfunctionFromAPI } from '../../api/fetch'
import {
  setBeaconMalfunctions,
  updateLocalBeaconMalfunctions,
  setOpenedBeaconMalfunctionsInKanban
} from '../shared_slices/BeaconMalfunction'

/**
 * Update a beacon malfunction
 * @param {number} id - The id of the beacon malfunction
 * @param {BeaconMalfunction} nextBeaconMalfunction - The next beacon malfunction
 * @param {UpdateBeaconMalfunction} updatedFields - The fields to update
 */
const updateBeaconMalfunctionFromKanban = (id, nextBeaconMalfunction, updatedFields) => (dispatch, getState) => {
  const previousBeaconMalfunctions = getState().beaconMalfunction.beaconMalfunctions
  dispatch(updateLocalBeaconMalfunctions(nextBeaconMalfunction))
  const beaconMalfunctionToUpdateIsOpened = getState().beaconMalfunction.openedBeaconMalfunctionInKanban?.beaconMalfunction?.id === id

  return updateBeaconMalfunctionFromAPI(id, updatedFields).then(updatedBeaconMalfunctionWithDetails => {
    if (beaconMalfunctionToUpdateIsOpened) {
      dispatch(setOpenedBeaconMalfunctionsInKanban(updatedBeaconMalfunctionWithDetails))
    }
  }).catch(error => {
    dispatch(setError(error))
    dispatch(setBeaconMalfunctions(previousBeaconMalfunctions))
  })
}

export default updateBeaconMalfunctionFromKanban
