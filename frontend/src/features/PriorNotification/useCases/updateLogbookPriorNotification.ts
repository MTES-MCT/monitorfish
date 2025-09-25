import { WindowContext } from '@api/constants'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { Level } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'
import { openLogbookPriorNotificationForm } from './openLogbookPriorNotificationForm'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const updateLogbookPriorNotification =
  (identifier: PriorNotification.Identifier, nextData: PriorNotification.LogbookForm): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await dispatch(
        priorNotificationApi.endpoints.updateLogbookPriorNotification.initiate({
          ...identifier,
          data: nextData
        })
      ).unwrap()

      const logbookPriorNotification = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...identifier,
          isManuallyCreated: false
        })
      ).unwrap()

      // Close card and display a warning banner if prior notification has been deleted (in the meantime)
      if (logbookPriorNotification.logbookMessage.isDeleted) {
        dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
        dispatch(
          addSideWindowBanner({
            children: 'Ce préavis a été supprimé (entre temps).',
            closingDelay: 5000,
            isClosable: true,
            level: Level.WARNING,
            withAutomaticClosing: true
          })
        )

        return
      }

      dispatch(openLogbookPriorNotificationForm(identifier))

      dispatch(priorNotificationActions.setOpenedPriorNotificationDetail(logbookPriorNotification))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            undefined,
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR,
            WindowContext.SideWindow
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
