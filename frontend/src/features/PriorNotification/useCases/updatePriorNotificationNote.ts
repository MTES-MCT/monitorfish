import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'

import type { MainAppThunk } from '@store'

export const updatePriorNotificationNote =
  (reportId: string, note: string | undefined): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await dispatch(
        priorNotificationApi.endpoints.updatePriorNotificationNote.initiate({
          data: { note },
          reportId
        })
      ).unwrap()

      await dispatch(priorNotificationApi.endpoints.getPriorNotificationPDF.initiate(reportId)).unwrap()
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))

        return
      }

      handleThunkError(err)
    }
  }
