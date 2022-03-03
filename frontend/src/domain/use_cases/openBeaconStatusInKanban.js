import { getBeaconStatusFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setOpenedBeaconStatusInKanban } from '../shared_slices/BeaconStatus'

/**
 * Open a single beacon status
 * @function setOpenedBeaconStatusInKanban
 * @param {BeaconStatusWithDetails} beaconStatus - the beacon status to open
 * @param {boolean} fromCron - true if called from cron
 */
const openBeaconStatus = (beaconStatus, fromCron) => (dispatch, getState) => {
  const previousBeaconStatus = getState().beaconStatus.openedBeaconStatusInKanban
  dispatch(setOpenedBeaconStatusInKanban(beaconStatus))

  getBeaconStatusFromAPI(beaconStatus.beaconStatus?.id).then(beaconStatusWithDetails => {
    dispatch(setOpenedBeaconStatusInKanban(beaconStatusWithDetails))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
    dispatch(setOpenedBeaconStatusInKanban(previousBeaconStatus))
  })
}

export default openBeaconStatus
