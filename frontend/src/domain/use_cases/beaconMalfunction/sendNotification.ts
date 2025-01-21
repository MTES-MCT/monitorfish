import { NOTIFICATION_TYPE } from '@features/BeaconMalfunction/constants'

import { sendNotificationFromAPI } from '../../../api/beaconMalfunction'
import { setError } from '../../shared_slices/Global'

/**
 * Send a notification message
 */
export const sendNotification =
  (beaconMalfunctionId: number, notificationType: string | null, foreignFmcCode?: string) =>
  (dispatch): Promise<string | void> => {
    if (!notificationType || !Object.keys(NOTIFICATION_TYPE).find(type => type === notificationType)) {
      return Promise.resolve()
    }

    return sendNotificationFromAPI(
      beaconMalfunctionId,
      notificationType as keyof typeof NOTIFICATION_TYPE,
      foreignFmcCode
    )
      .then(() => notificationType)
      .catch(error => {
        dispatch(setError(error))
      })
  }
