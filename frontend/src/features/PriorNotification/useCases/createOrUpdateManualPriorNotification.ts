import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'
import { omit } from 'lodash'

import { openManualPriorNotificationForm } from './openManualPriorNotificationForm'
import { priorNotificationApi } from '../priorNotificationApi'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const createOrUpdateManualPriorNotification =
  (reportId: string | undefined, newOrNextManualForm: PriorNotification.ManualForm): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const { vesselId } = newOrNextManualForm.vesselIdentity
      assertNotNullish(vesselId)

      const requestData: PriorNotification.ApiManualCreateOrUpdateRequestData = {
        ...omit(newOrNextManualForm, ['vesselIdentity']),
        vesselId
      }

      let updatedPriorNotificationData: PriorNotification.ApiManualCreateOrUpdateResponseData
      if (!reportId) {
        updatedPriorNotificationData = await dispatch(
          priorNotificationApi.endpoints.createPriorNotification.initiate(requestData)
        ).unwrap()
      } else {
        updatedPriorNotificationData = await dispatch(
          priorNotificationApi.endpoints.updateManualPriorNotification.initiate({
            data: requestData,
            reportId
          })
        ).unwrap()
      }

      dispatch(
        openManualPriorNotificationForm({
          // `operationDate` is not part of `PriorNotification.ManualPriorNotificationData`
          // but this is a good enough guess since this param is only used to optimize SQL queries through Timescale
          operationDate: customDayjs().toISOString(),
          reportId: updatedPriorNotificationData.reportId
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
