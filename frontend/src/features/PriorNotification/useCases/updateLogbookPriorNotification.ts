import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const updateLogbookPriorNotification =
  (
    priorNotificationIdentifier: PriorNotification.PriorNotificationIdentifier,
    nextData: PriorNotification.LogbookPriorNotificationData
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await dispatch(
        priorNotificationApi.endpoints.updateLogbookPriorNotification.initiate({
          ...priorNotificationIdentifier,
          data: nextData
        })
      ).unwrap()
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))

        return
      }

      handleThunkError(err)
    }
  }
