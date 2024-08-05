import { RtkCacheTagType } from '@api/constants'
import { addMainWindowBanner } from '@features/SideWindow/useCases/addMainWindowBanner'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { Level } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const openLogbookPriorNotificationForm =
  (
    priorNotificationIdentifier: PriorNotification.PriorNotificationIdentifier,
    fingerprint?: string
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.closePriorNotificationCard())
      dispatch(priorNotificationActions.closePriorNotificationForm())
      dispatch(priorNotificationActions.openPriorNotificationForm())

      const priorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...priorNotificationIdentifier,
          isManuallyCreated: false
        })
      ).unwrap()
      const priorNotificationData = await dispatch(
        priorNotificationApi.endpoints.getLogbookPriorNotificationFormData.initiate(priorNotificationIdentifier)
      ).unwrap()

      // Update prior notification list if prior notification fingerprint has changed
      if (priorNotificationDetail.fingerprint !== fingerprint) {
        dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotifications]))
      }

      // Close card and display a warning banner if prior notification has been deleted (in the meantime)
      if (priorNotificationDetail.logbookMessage.isDeleted) {
        dispatch(priorNotificationActions.closePriorNotificationCard())
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

      dispatch(priorNotificationActions.setOpenedPriorNotification(priorNotificationDetail))
      dispatch(priorNotificationActions.setEditedLogbookPriorNotificationInitialFormValues(priorNotificationData))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openLogbookPriorNotificationForm(priorNotificationIdentifier, fingerprint),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
