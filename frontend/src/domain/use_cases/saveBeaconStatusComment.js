import { saveBeaconStatusCommentFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { selectBeaconStatus } from '../shared_slices/BeaconStatus'

/**
 * Save a new comment to a beacon status
 * @function showVesselTrack
 * @param {number} beaconStatusId
 * @param {string} comment
 */
const saveBeaconStatusComment = (beaconStatusId, comment) => (dispatch, getState) => {
  const userType = getState().global.userType
  const newCommentInput = {
    comment,
    userType
  }

  return saveBeaconStatusCommentFromAPI(beaconStatusId, newCommentInput).then(beaconStatusWithDetails => {
    console.log(beaconStatusWithDetails)
    return dispatch(selectBeaconStatus(beaconStatusWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default saveBeaconStatusComment
