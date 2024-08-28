import { RtkCacheTagType } from '@api/constants'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { FrontendError } from '@libs/FrontendError'
import { type Undefine } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { OpenedPriorNotificationType } from '../constants'
import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'
import { getPriorNotificationTypesFromLogbookMessagePnoTypes } from '../utils'

import type { ManualPriorNotificationFormValues } from '../components/ManualPriorNotificationForm/types'
import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const duplicateLogbookPriorNotification =
  (identifier: PriorNotification.Identifier): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
      dispatch(priorNotificationActions.openPriorNotification(OpenedPriorNotificationType.ManualForm))

      const logbookPriorNotification = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...identifier,
          isManuallyCreated: false
        })
      ).unwrap()
      if (logbookPriorNotification.isManuallyCreated) {
        throw new FrontendError('`priorNotificationDetail.isManuallyCreated` is `true` but should be `false`.')
      }

      dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotifications]))

      const nextComputedValues: Undefine<PriorNotification.ManualComputedValues> = {
        isVesselUnderCharter: logbookPriorNotification.isVesselUnderCharter,
        nextState: logbookPriorNotification.state,
        riskFactor: logbookPriorNotification.riskFactor,
        tripSegments: logbookPriorNotification.logbookMessage.tripSegments,
        types: getPriorNotificationTypesFromLogbookMessagePnoTypes(
          logbookPriorNotification.logbookMessage.message.pnoTypes
        )
      }

      const nextHasGlobalFaoArea = !!logbookPriorNotification.asManualDraft.globalFaoArea
      const nextIsExpectedLandingDateSameAsExpectedArrivalDate =
        logbookPriorNotification.asManualDraft.expectedLandingDate ===
        logbookPriorNotification.asManualDraft.expectedArrivalDate
      const nextFormValues: ManualPriorNotificationFormValues = {
        ...logbookPriorNotification.asManualDraft,
        hasGlobalFaoArea: nextHasGlobalFaoArea,
        isExpectedLandingDateSameAsExpectedArrivalDate: nextIsExpectedLandingDateSameAsExpectedArrivalDate
      }

      dispatch(priorNotificationActions.setEditedManualPriorNotificationFormValues(nextFormValues))
      dispatch(priorNotificationActions.setManualPriorNotificationComputedValues(nextComputedValues))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => duplicateLogbookPriorNotification(identifier),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
