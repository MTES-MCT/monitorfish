import { RtkCacheTagType } from '@api/constants'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { type Undefine } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { getInitialFormValues } from '../components/ManualPriorNotificationForm/utils'
import { OpenedPriorNotificationType } from '../constants'
import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'
import { getPriorNotificationTypesFromLogbookMessagePnoTypes } from '../utils'

import type { ManualPriorNotificationFormValues } from '../components/ManualPriorNotificationForm/types'
import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const openManualPriorNotificationForm =
  (
    priorNotificationIdentifier: PriorNotification.Identifier | undefined,
    fingerprint?: string | undefined
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
      dispatch(priorNotificationActions.openPriorNotification(OpenedPriorNotificationType.ManualForm))

      if (!priorNotificationIdentifier) {
        dispatch(priorNotificationActions.setEditedManualPriorNotificationFormValues(getInitialFormValues()))

        return
      }

      const priorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...priorNotificationIdentifier,
          isManuallyCreated: true
        })
      ).unwrap()
      const priorNotificationData = await dispatch(
        priorNotificationApi.endpoints.getManualPriorNotificationFormData.initiate(priorNotificationIdentifier)
      ).unwrap()

      // Update prior notification list if prior notification fingerprint has changed
      if (priorNotificationDetail.fingerprint !== fingerprint) {
        dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotifications]))
      }

      const nextComputedValues: Undefine<PriorNotification.ManualComputedValues> = {
        isVesselUnderCharter: priorNotificationDetail.isVesselUnderCharter,
        nextState: priorNotificationDetail.state,
        riskFactor: priorNotificationDetail.riskFactor,
        tripSegments: priorNotificationDetail.logbookMessage.tripSegments,
        types: getPriorNotificationTypesFromLogbookMessagePnoTypes(
          priorNotificationDetail.logbookMessage.message.pnoTypes
        )
      }

      const nextFormValues: ManualPriorNotificationFormValues = {
        ...priorNotificationData,
        isExpectedLandingDateSameAsExpectedArrivalDate:
          priorNotificationData.expectedLandingDate === priorNotificationData.expectedArrivalDate
      }

      dispatch(priorNotificationActions.setEditedManualPriorNotificationFormValues(nextFormValues))
      dispatch(priorNotificationActions.setManualPriorNotificationComputedValues(nextComputedValues))
      dispatch(priorNotificationActions.setOpenedPriorNotificationDetail(priorNotificationDetail))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openManualPriorNotificationForm(priorNotificationIdentifier, fingerprint),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
