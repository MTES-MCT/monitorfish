import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const invalidatePriorNotification =
  (identifier: PriorNotification.Identifier, isManuallyCreated: boolean): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
      dispatch(priorNotificationActions.openPriorNotificationCard())

      const nextDetail = await dispatch(
        priorNotificationApi.endpoints.invalidatePriorNotification.initiate({
          ...identifier,
          isManuallyCreated
        })
      ).unwrap()

      dispatch(priorNotificationActions.setOpenedPriorNotification(nextDetail))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(priorNotificationActions.openPriorNotificationCard())

        dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))

        return
      }

      handleThunkError(err)
    }
  }
