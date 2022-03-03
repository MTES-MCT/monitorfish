import { setError } from '../shared_slices/Global'
import { updateBeaconStatusFromAPI } from '../../api/fetch'
import { setOpenedBeaconStatusInKanban, setBeaconStatuses, updateLocalBeaconStatuses } from '../shared_slices/BeaconStatus'

/**
 * Update a beacon status
 * @param {number} id - The id of the beacon status
 * @param {BeaconStatus} nextBeaconStatus - The next beacon status
 * @param {UpdateBeaconStatus} updatedFields - The fields to update
 */
const updateBeaconStatus = (id, nextBeaconStatus, updatedFields) => (dispatch, getState) => {
  const previousBeaconStatuses = getState().beaconStatus.beaconStatuses
  dispatch(updateLocalBeaconStatuses(nextBeaconStatus))
  const beaconStatusToUpdateIsOpened = getState().beaconStatus.openedBeaconStatusInKanban?.beaconStatus?.id === id

  return updateBeaconStatusFromAPI(id, updatedFields).then(updatedBeaconStatusWithDetails => {
    if (beaconStatusToUpdateIsOpened) {
      dispatch(setOpenedBeaconStatusInKanban(updatedBeaconStatusWithDetails))
    }
  }).catch(error => {
    dispatch(setError(error))
    dispatch(setBeaconStatuses(previousBeaconStatuses))
  })
}

export default updateBeaconStatus
