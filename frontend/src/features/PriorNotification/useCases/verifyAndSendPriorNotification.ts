import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { MainAppThunk } from '@store'

export const verifyAndSendPriorNotification =
  (reportId: string, isManuallyCreated: boolean): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const updatedPriorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.verifyAndSendPriorNotification.initiate({ isManuallyCreated, reportId })
      ).unwrap()

      dispatch(priorNotificationActions.setEditedPriorNotificationDetail(updatedPriorNotificationDetail))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR))

        return
      }

      handleThunkError(err)
    }
  }
