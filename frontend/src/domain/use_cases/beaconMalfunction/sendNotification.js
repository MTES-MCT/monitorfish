import { sendNotificationFromAPI } from '../../../api/beaconMalfunction'
import { setError } from '../../shared_slices/Global'

/**
 * Send a notification
 * @function sendNotification
 * @param {number} beaconMalfunctionId
 * @param {string} notificationType
 */
const sendNotification = (beaconMalfunctionId, notificationType) => dispatch =>
  sendNotificationFromAPI(beaconMalfunctionId, notificationType).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })

export default sendNotification
