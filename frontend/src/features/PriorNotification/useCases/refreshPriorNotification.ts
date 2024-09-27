import { RtkCacheTagType } from '@api/constants'
import { addMainWindowBanner } from '@features/SideWindow/useCases/addMainWindowBanner'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { Level } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const refreshPriorNotification =
  (
    identifier: PriorNotification.Identifier,
    fingerprint: string,
    isManuallyCreated: boolean
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const logbookPriorNotification = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...identifier,
          isManuallyCreated
        })
      ).unwrap()

      // Update prior notification list if prior notification fingerprint has changed
      if (logbookPriorNotification.fingerprint !== fingerprint) {
        dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotifications]))
      }

      // Close card and display a warning banner if prior notification has been deleted (in the meantime)
      if (logbookPriorNotification.logbookMessage.isDeleted) {
        dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
        dispatch(
          addMainWindowBanner({
            children: 'Ce préavis a été supprimé (entre temps).',
            closingDelay: 5000,
            isClosable: true,
            level: Level.WARNING,
            withAutomaticClosing: true
          })
        )

        return
      }

      dispatch(priorNotificationActions.setOpenedPriorNotificationDetail(logbookPriorNotification))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => refreshPriorNotification(identifier, fingerprint, isManuallyCreated),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
