import { setError } from '../shared_slices/Global'
import { updateBeaconStatusFromAPI } from '../../api/fetch'

/**
 * Update a beacon status
 * @param {string} id - The id of the beacon status
 * @param {UpdateBeaconStatus} updatedFields - The fields to update
 */
const updateBeaconStatus = (id, updatedFields) => dispatch => {
  return updateBeaconStatusFromAPI(id, updatedFields).catch(error => {
    dispatch(setError(error))
  })
}

export default updateBeaconStatus
