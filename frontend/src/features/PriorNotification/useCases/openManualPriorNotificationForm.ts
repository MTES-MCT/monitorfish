import { RtkCacheTagType } from '@api/constants'
import { customSentry, CustomSentryMeasurementName } from '@libs/customSentry'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { FrontendError } from '@libs/FrontendError'
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
    identifier: PriorNotification.Identifier | undefined,
    fingerprint?: string | undefined
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      if (identifier) {
        customSentry.startMeasurement(
          CustomSentryMeasurementName.LOGBOOK_PRIOR_NOTIFICATION_FORM_SPINNER,
          identifier.reportId
        )
      }

      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
      dispatch(priorNotificationActions.openPriorNotification(OpenedPriorNotificationType.ManualForm))

      if (!identifier) {
        dispatch(priorNotificationActions.setEditedManualPriorNotificationFormValues(getInitialFormValues()))

        return
      }

      const manualPriorNotification = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate({
          ...identifier,
          isManuallyCreated: true
        })
      ).unwrap()
      if (!manualPriorNotification.isManuallyCreated) {
        throw new FrontendError('`priorNotificationDetail.isManuallyCreated` is `false` but should be `true`.')
      }

      // Update prior notification list if prior notification fingerprint has changed
      if (manualPriorNotification.fingerprint !== fingerprint) {
        dispatch(priorNotificationApi.util.invalidateTags([RtkCacheTagType.PriorNotifications]))
      }

      const nextComputedValues: Undefine<PriorNotification.ManualComputedValues> = {
        isVesselUnderCharter: manualPriorNotification.isVesselUnderCharter,
        nextState: manualPriorNotification.state,
        riskFactor: manualPriorNotification.riskFactor,
        tripSegments: manualPriorNotification.logbookMessage.tripSegments,
        types: getPriorNotificationTypesFromLogbookMessagePnoTypes(
          manualPriorNotification.logbookMessage.message.pnoTypes
        )
      }

      const nextHasGlobalFaoArea = !!manualPriorNotification.asManualForm.globalFaoArea
      const nextIsExpectedLandingDateSameAsExpectedArrivalDate =
        manualPriorNotification.asManualForm.expectedLandingDate ===
        manualPriorNotification.asManualForm.expectedArrivalDate
      const nextFormValues: ManualPriorNotificationFormValues = {
        ...manualPriorNotification.asManualForm,
        hasGlobalFaoArea: nextHasGlobalFaoArea,
        isExpectedLandingDateSameAsExpectedArrivalDate: nextIsExpectedLandingDateSameAsExpectedArrivalDate
      }

      dispatch(priorNotificationActions.setEditedManualPriorNotificationFormValues(nextFormValues))
      dispatch(priorNotificationActions.setManualPriorNotificationComputedValues(nextComputedValues))
      dispatch(priorNotificationActions.setOpenedPriorNotificationDetail(manualPriorNotification))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openManualPriorNotificationForm(identifier, fingerprint),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
