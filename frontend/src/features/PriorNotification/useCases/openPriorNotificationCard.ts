import { RtkCacheTagType, WindowContext } from '@api/constants'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { Level } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'
import { pick } from 'lodash-es'

import { OpenedPriorNotificationType } from '../constants'
import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const openPriorNotificationCard =
  (
    priorNotificationIdentifier: PriorNotification.Identifier,
    fingerprint: string,
    isManuallyCreated: boolean
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR))
      dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
      dispatch(priorNotificationActions.openPriorNotification(OpenedPriorNotificationType.LogbookForm))

      const priorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...priorNotificationIdentifier,
          isManuallyCreated
        })
      ).unwrap()

      // Update prior notification list if prior notification fingerprint has changed
      if (priorNotificationDetail.fingerprint !== fingerprint) {
        dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotifications]))
      }

      // Close card and display a warning banner if prior notification has been deleted (in the meantime)
      if (priorNotificationDetail.logbookMessage.isDeleted) {
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

      dispatch(priorNotificationActions.setOpenedPriorNotificationDetail(priorNotificationDetail))
      const priorNotificationData = pick(priorNotificationDetail.logbookMessage.message, ['note', 'authorTrigram'])
      dispatch(priorNotificationActions.setEditedLogbookPriorNotificationFormValues(priorNotificationData))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openPriorNotificationCard(priorNotificationIdentifier, fingerprint, isManuallyCreated),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR,
            WindowContext.SideWindow
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
