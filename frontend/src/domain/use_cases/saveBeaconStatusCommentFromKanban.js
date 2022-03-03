import { saveBeaconStatusCommentFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setOpenedBeaconStatusInKanban } from '../shared_slices/BeaconStatus'

/**
 * Save a new comment to a beacon status from the side window kanban
 * @function showVesselTrack
 * @param {number} beaconStatusId
 * @param {string} comment
 */
const saveBeaconStatusCommentFromKanban = (beaconStatusId, comment) => (dispatch, getState) => {
  const userType = getState().global.userType
  const newCommentInput = {
    comment,
    userType
  }

  return saveBeaconStatusCommentFromAPI(beaconStatusId, newCommentInput).then(beaconStatusWithDetails => {
    return dispatch(setOpenedBeaconStatusInKanban(beaconStatusWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default saveBeaconStatusCommentFromKanban
