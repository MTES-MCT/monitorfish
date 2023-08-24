import { setError } from '../../shared_slices/Global'
import {
  setBeaconMalfunctions,
  updateLocalBeaconMalfunction,
  setOpenedBeaconMalfunctionsInKanban, setOpenedBeaconMalfunction, updateVesselBeaconMalfunctionsResumeAndHistory
} from '../../shared_slices/BeaconMalfunction'
import { updateBeaconMalfunctionFromAPI } from '../../../api/beaconMalfunction'

/**
 * Update a beacon malfunction
 * @param {number} id - The id of the beacon malfunction
 * @param {BeaconMalfunction} nextBeaconMalfunction - The next beacon malfunction
 * @param {UpdateBeaconMalfunction} updatedFields - The fields to update
 */
const updateBeaconMalfunctionFromKanban = (id, nextBeaconMalfunction, updatedFields) => (dispatch, getState) => {
  const previousBeaconMalfunctions = getState().beaconMalfunction.beaconMalfunctions
  dispatch(updateLocalBeaconMalfunction(nextBeaconMalfunction))
  const beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction = getState().beaconMalfunction
    .vesselBeaconMalfunctionsResumeAndHistory?.current?.beaconMalfunction?.id === id
  const beaconMalfunctionToUpdateIsOpened = getState().beaconMalfunction
    .openedBeaconMalfunction?.beaconMalfunction?.id === id
  const beaconMalfunctionToUpdateIsOpenedInKanban = getState().beaconMalfunction
    .openedBeaconMalfunctionInKanban?.beaconMalfunction?.id === id

  return updateBeaconMalfunctionFromAPI(id, updatedFields).then(updatedBeaconMalfunctionWithDetails => {
    if (beaconMalfunctionToUpdateIsOpened) {
      dispatch(setOpenedBeaconMalfunction({
        beaconMalfunction: updatedBeaconMalfunctionWithDetails,
        showTab: false
      }))
    }
    if (beaconMalfunctionToUpdateIsOpenedInKanban) {
      dispatch(setOpenedBeaconMalfunctionsInKanban(updatedBeaconMalfunctionWithDetails))
    }
    if (beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction) {
      dispatch(updateVesselBeaconMalfunctionsResumeAndHistory(updatedBeaconMalfunctionWithDetails))
    }
  }).catch(error => {
    dispatch(setError(error))
    dispatch(setBeaconMalfunctions(previousBeaconMalfunctions))
  })
}

export default updateBeaconMalfunctionFromKanban
