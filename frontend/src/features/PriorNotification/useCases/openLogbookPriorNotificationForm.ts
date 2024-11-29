import { RtkCacheTagType } from '@api/constants'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { FrontendError } from '@libs/FrontendError'
import { Level } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { OpenedPriorNotificationType } from '../constants'
import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const openLogbookPriorNotificationForm =
  (identifier: PriorNotification.Identifier, fingerprint?: string): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
      // TODO Remove this function once loading / spinner perfs tests are removed.
      dispatch(priorNotificationActions.setEditedPriorNotificationId(identifier.reportId))
      dispatch(priorNotificationActions.openPriorNotification(OpenedPriorNotificationType.LogbookForm))

      const logbookPriorNotification = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...identifier,
          isManuallyCreated: false
        })
      ).unwrap()
      if (logbookPriorNotification.isManuallyCreated) {
        throw new FrontendError('`priorNotificationDetail.isManuallyCreated` is `true` but should be `false`.')
      }

      // Update prior notification list if prior notification fingerprint has changed
      if (logbookPriorNotification.fingerprint !== fingerprint) {
        dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotifications]))
      }

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

      dispatch(priorNotificationActions.setOpenedPriorNotificationDetail(logbookPriorNotification))
      dispatch(
        priorNotificationActions.setEditedLogbookPriorNotificationFormValues(logbookPriorNotification.asLogbookForm)
      )
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openLogbookPriorNotificationForm(identifier, fingerprint),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
