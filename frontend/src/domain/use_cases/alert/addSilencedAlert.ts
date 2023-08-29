import { alertApi, CREATE_SILENCED_ALERT_ERROR_MESSAGE } from '../../../api/alert'
import { setSilencedAlerts } from '../../../features/SideWindow/Alert/slice'
import { ApiError } from '../../../libs/ApiError'
import { setError } from '../../shared_slices/Global'

import type { MainAppThunk } from '../../../store'
import type { SilencedAlertData } from '../../entities/alerts/types'

/**
 * Add a new silenced alert
 */
export const addSilencedAlert =
  (silencedAlert: SilencedAlertData): MainAppThunk =>
  async (dispatch, getState) => {
    const previousSilencedAlerts = getState().alert.silencedAlerts

    try {
      const { data: savedSilencedAlert, error: silencedAlertError } = await dispatch(
        alertApi.endpoints.createSilencedAlert.initiate(silencedAlert)
      )
      if (silencedAlertError) {
        throw silencedAlertError
      }

      const nextSilencedAlerts = [savedSilencedAlert, ...previousSilencedAlerts]
      dispatch(setSilencedAlerts(nextSilencedAlerts))
    } catch (error) {
      await dispatch(setError(new ApiError(CREATE_SILENCED_ALERT_ERROR_MESSAGE, error)))
    }
  }
