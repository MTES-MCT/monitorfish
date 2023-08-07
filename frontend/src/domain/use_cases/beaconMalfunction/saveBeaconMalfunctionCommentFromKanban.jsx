import { setError } from '../../shared_slices/Global'
import {
  setOpenedBeaconMalfunction,
  setOpenedBeaconMalfunctionsInKanban,
  updateVesselBeaconMalfunctionsResumeAndHistory
} from '../../shared_slices/BeaconMalfunction'
import { saveBeaconMalfunctionCommentFromAPI } from '../../../api/beaconMalfunction'

/**
 * Save a new comment to a beacon malfunction
 * @function showVesselTrack
 * @param {number} beaconMalfunctionId
 * @param {string} comment
 */
const saveBeaconMalfunctionCommentFromKanban = (beaconMalfunctionId, comment) => (dispatch, getState) => {
  const userType = getState().global.userType
  const newCommentInput = {
    comment,
    userType
  }
  const beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction = getState().beaconMalfunction
    .vesselBeaconMalfunctionsResumeAndHistory?.current?.beaconMalfunction?.id === beaconMalfunctionId
  const beaconMalfunctionToUpdateIsOpened = getState().beaconMalfunction
    .openedBeaconMalfunction?.beaconMalfunction?.id === beaconMalfunctionId
  const beaconMalfunctionToUpdateIsOpenedInKanban = getState().beaconMalfunction
    .openedBeaconMalfunctionInKanban?.beaconMalfunction?.id === beaconMalfunctionId

  return saveBeaconMalfunctionCommentFromAPI(beaconMalfunctionId, newCommentInput).then(beaconMalfunctionWithDetails => {
    if (beaconMalfunctionToUpdateIsOpened) {
      dispatch(setOpenedBeaconMalfunction({
        beaconMalfunction: beaconMalfunctionWithDetails,
        showTab: false
      }))
    }
    if (beaconMalfunctionToUpdateIsOpenedInKanban) {
      dispatch(setOpenedBeaconMalfunctionsInKanban(beaconMalfunctionWithDetails))
    }
    if (beaconMalfunctionToUpdateIsOpenedAsCurrentVesselMalfunction) {
      dispatch(updateVesselBeaconMalfunctionsResumeAndHistory(beaconMalfunctionWithDetails))
    }
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default saveBeaconMalfunctionCommentFromKanban
