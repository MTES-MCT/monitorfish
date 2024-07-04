import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const createOrUpdateManualPriorNotification =
  (
    reportId: string | undefined,
    newOrNextPriorNotificationData: PriorNotification.NewManualPriorNotificationData
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      let updatedPriorNotificationData: PriorNotification.ManualPriorNotificationData
      if (!reportId) {
        updatedPriorNotificationData = await dispatch(
          priorNotificationApi.endpoints.createPriorNotification.initiate(newOrNextPriorNotificationData)
        ).unwrap()
      } else {
        updatedPriorNotificationData = await dispatch(
          priorNotificationApi.endpoints.updateManualPriorNotification.initiate({
            data: newOrNextPriorNotificationData,
            reportId
          })
        ).unwrap()
      }

      dispatch(
        priorNotificationActions.setOpenedPriorNotification({
          isManual: true,
          reportId: updatedPriorNotificationData.reportId
        })
      )
      dispatch(
        priorNotificationActions.setEditedPriorNotificationInitialFormValues({
          ...updatedPriorNotificationData,
          isExpectedLandingDateSameAsExpectedArrivalDate:
            updatedPriorNotificationData.expectedLandingDate === updatedPriorNotificationData.expectedArrivalDate
        })
      )
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))

        return
      }

      handleThunkError(err)
    }
  }
