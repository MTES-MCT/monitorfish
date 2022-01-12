import { setError } from '../shared_slices/Global'
import { updateBeaconStatusFromAPI } from '../../api/fetch'
import { selectBeaconStatus } from '../shared_slices/BeaconStatus'

/**
 * Update a beacon status
 * @param {number} id - The id of the beacon status
 * @param {UpdateBeaconStatus} updatedFields - The fields to update
 */
const updateBeaconStatus = (id, updatedFields) => (dispatch, getState) => {
  const beaconStatusToUpdateIsOpened = getState().beaconStatus.openedBeaconStatus?.beaconStatus?.id === id

  return updateBeaconStatusFromAPI(id, updatedFields).then(updatedBeaconStatusWithDetails => {
    if (beaconStatusToUpdateIsOpened) {
      dispatch(selectBeaconStatus(updatedBeaconStatusWithDetails))
    }
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default updateBeaconStatus
