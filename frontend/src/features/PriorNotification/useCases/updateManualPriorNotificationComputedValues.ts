import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const updateManualPriorNotificationComputedValues =
  (requestData: PriorNotification.ApiManualComputeRequestData): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const nextPriorNotificationComputedValues = await dispatch(
        priorNotificationApi.endpoints.computeManualPriorNotification.initiate(requestData)
      ).unwrap()

      dispatch(priorNotificationActions.setManualPriorNotificationComputedValues(nextPriorNotificationComputedValues))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))

        return
      }

      handleThunkError(err)
    }
  }
