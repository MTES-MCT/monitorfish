import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const createOrUpdatePriorNotification =
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
          priorNotificationApi.endpoints.updatePriorNotification.initiate({
            data: newOrNextPriorNotificationData,
            reportId
          })
        ).unwrap()
      }

      const newOrUpdatedPriorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate(updatedPriorNotificationData.reportId)
      ).unwrap()

      dispatch(priorNotificationActions.setEditedPriorNotificationReportId(updatedPriorNotificationData.reportId))
      dispatch(priorNotificationActions.setEditedPriorNotificationDetail(newOrUpdatedPriorNotificationDetail))
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
