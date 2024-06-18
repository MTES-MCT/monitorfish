import { RtkCacheTagType } from '@api/constants'
import { addMainWindowBanner } from '@features/SideWindow/useCases/addMainWindowBanner'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { Level } from '@mtes-mct/monitor-ui'
import { handleThunkError } from '@utils/handleThunkError'
import { displayedErrorActions } from 'domain/shared_slices/DisplayedError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'

import { getInitialFormValues } from '../components/PriorNotificationForm/utils'
import { priorNotificationApi } from '../priorNotificationApi'
import { priorNotificationActions } from '../slice'

import type { FormValues } from '../components/PriorNotificationForm/types'
import type { PriorNotification } from '../PriorNotification.types'
import type { MainAppThunk } from '@store'

export const openPriorNotificationForm =
  (reportId: string | undefined, fingerprint?: string): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      dispatch(displayedErrorActions.unset(DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      dispatch(priorNotificationActions.openPriorNotificationForm())

      if (!reportId) {
        dispatch(priorNotificationActions.unsetEditedPriorNotificationComputedValues())
        dispatch(priorNotificationActions.setEditedPriorNotificationInitialFormValues(getInitialFormValues()))
        dispatch(priorNotificationActions.unsetEditedPriorNotificationReportId())
        dispatch(priorNotificationActions.openPriorNotificationForm())

        return
      }

      const priorNotificationDetail = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationDetail.initiate(reportId)
      ).unwrap()
      const priorNotificationData = await dispatch(
        priorNotificationApi.endpoints.getPriorNotificationData.initiate(reportId)
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

      const nextComputedValues: PriorNotification.ManualPriorNotificationComputedValues = {
        // TODO Add a type-guaranteed output in Backend for PNO message.
        isBeingSent: priorNotificationDetail.logbookMessage.message.isBeingSent!,
        isInVerificationScope: priorNotificationDetail.logbookMessage.message.isInVerificationScope!,
        isSent: priorNotificationDetail.logbookMessage.message.isSent!,
        isVerified: priorNotificationDetail.logbookMessage.message.isVerified!,
        tripSegments: priorNotificationDetail.logbookMessage.tripSegments ?? [],
        types:
          priorNotificationDetail.logbookMessage.message.pnoTypes?.map(({ pnoTypeName, ...rest }) => ({
            ...rest,
            name: pnoTypeName
          })) ?? [],
        // TODO Add vessel risk factor in details API response.
        vesselRiskFactor: undefined
      }
      const nextInitialFormValues: FormValues = {
        ...priorNotificationData,
        isExpectedLandingDateSameAsExpectedArrivalDate:
          priorNotificationData.expectedLandingDate === priorNotificationData.expectedArrivalDate
      }

      dispatch(priorNotificationActions.setEditedPriorNotificationComputedValues(nextComputedValues))
      dispatch(priorNotificationActions.setEditedPriorNotificationInitialFormValues(nextInitialFormValues))
      dispatch(priorNotificationActions.setEditedPriorNotificationReportId(reportId))
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(
          displayOrLogError(
            err,
            () => openPriorNotificationForm(reportId, fingerprint),
            true,
            DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR
          )
        )

        return
      }

      handleThunkError(err)
    }
  }
