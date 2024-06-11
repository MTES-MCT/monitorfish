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

import type { MainAppThunk } from '@store'

export const openPriorNotificationCard =
  (id: string, fingerprint: string): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR))
      dispatch(priorNotificationActions.openPriorNotificationCard())

      const priorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate(id)
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

      dispatch(priorNotificationActions.setPriorNotificationCardDetail(priorNotificationDetail))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openPriorNotificationCard(id, fingerprint),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
