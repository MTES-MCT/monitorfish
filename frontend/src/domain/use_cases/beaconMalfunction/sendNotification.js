import { setError } from '../../shared_slices/Global'
import { sendNotificationFromAPI } from '../../../api/beaconMalfunction'

/**
 * Send a notification
 * @function sendNotification
 * @param {number} beaconMalfunctionId
 * @param {string | null} notificationType
 */
const sendNotification = (beaconMalfunctionId, notificationType) => dispatch => {
  return sendNotificationFromAPI(beaconMalfunctionId, notificationType).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

export default sendNotification
