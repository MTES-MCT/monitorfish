import { RtkCacheTagType } from '@api/constants'
import { addMainWindowBanner } from '@features/SideWindow/useCases/addMainWindowBanner'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { Level, type Undefine } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { getInitialFormValues } from '../components/PriorNotificationForm/utils'
import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'
import { getPriorNotificationTypesFromLogbookMessagePnoTypes } from '../utils'

import type { FormValues } from '../components/PriorNotificationForm/types'
import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const openPriorNotificationForm =
  (
    priorNotificationIdentifier: PriorNotification.PriorNotificationIdentifier | undefined,
    fingerprint?: string | undefined
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.openPriorNotificationForm())

      if (!priorNotificationIdentifier) {
        dispatch(priorNotificationActions.unsetEditedPriorNotificationComputedValues())
        dispatch(priorNotificationActions.setEditedPriorNotificationInitialFormValues(getInitialFormValues()))
        dispatch(priorNotificationActions.unsetOpenedPriorNotification())

        return
      }

      const priorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...priorNotificationIdentifier,
          isManuallyCreated: true
        })
      ).unwrap()
      const priorNotificationData = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationFormData.initiate(priorNotificationIdentifier)
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

      const nextComputedValues: Undefine<PriorNotification.ManualPriorNotificationComputedValues> = {
        isInVerificationScope: priorNotificationDetail.logbookMessage.message.isInVerificationScope,
        isVesselUnderCharter: priorNotificationDetail.isVesselUnderCharter,
        riskFactor: priorNotificationDetail.riskFactor,
        tripSegments: priorNotificationDetail.logbookMessage.tripSegments,
        types: getPriorNotificationTypesFromLogbookMessagePnoTypes(
          priorNotificationDetail.logbookMessage.message.pnoTypes
        )
      }

      const nextInitialFormValues: FormValues = {
        ...priorNotificationData,
        isExpectedLandingDateSameAsExpectedArrivalDate:
          priorNotificationData.expectedLandingDate === priorNotificationData.expectedArrivalDate
      }

      dispatch(priorNotificationActions.setEditedPriorNotificationComputedValues(nextComputedValues))
      dispatch(
        priorNotificationActions.setOpenedPriorNotification({
          ...priorNotificationIdentifier,
          isManuallyCreated: true
        })
      )
      dispatch(priorNotificationActions.setEditedPriorNotificationInitialFormValues(nextInitialFormValues))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openPriorNotificationForm(priorNotificationIdentifier, fingerprint),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
