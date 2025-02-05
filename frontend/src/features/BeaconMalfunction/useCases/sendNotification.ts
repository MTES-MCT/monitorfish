import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { NOTIFICATION_TYPE } from '@features/BeaconMalfunction/constants'

import { setError } from '../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const sendNotification =
  (
    beaconMalfunctionId: number,
    notificationType: string | null,
    foreignFmcCode?: string
  ): MainAppThunk<Promise<string | void>> =>
  async dispatch => {
    if (!notificationType || !Object.keys(NOTIFICATION_TYPE).includes(notificationType)) {
      return Promise.resolve()
    }

    try {
      await dispatch(
        beaconMalfunctionApi.endpoints.sendNotification.initiate({
          foreignFmcCode,
          id: beaconMalfunctionId,
          notificationType: notificationType as keyof typeof NOTIFICATION_TYPE
        })
      ).unwrap()

      return notificationType
    } catch (error) {
      dispatch(setError(error))

      return undefined
    }
  }
