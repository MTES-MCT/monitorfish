import { saveBeaconMalfunctionCommentFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setOpenedBeaconMalfunctionsInKanban } from '../shared_slices/BeaconMalfunction'

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

  return saveBeaconMalfunctionCommentFromAPI(beaconMalfunctionId, newCommentInput).then(beaconMalfunctionWithDetails => {
    return dispatch(setOpenedBeaconMalfunctionsInKanban(beaconMalfunctionWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default saveBeaconMalfunctionCommentFromKanban
