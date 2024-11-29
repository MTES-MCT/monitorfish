import { ErrorWall } from '@components/ErrorWall'
import { useInterval } from '@features/PriorNotification/hooks/useInterval'
import { refreshPriorNotification } from '@features/PriorNotification/useCases/refreshPriorNotification'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import {
  getFormDataFishingCatchesFromFormValuesFishingCatches,
  getPriorNotificationIdentifier
} from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik } from 'formik'
import { omit } from 'lodash'
import { useState } from 'react'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { FORM_VALIDATION_SCHEMA } from './constants'
import { Content } from './Content'
import { SideWindowCard } from '../../../../components/SideWindowCard'
import { PriorNotification } from '../../PriorNotification.types'
import { priorNotificationActions } from '../../slice'
import { createOrUpdateManualPriorNotification } from '../../useCases/createOrUpdateManualPriorNotification'

import type { ManualPriorNotificationFormValues } from './types'

export function ManualPriorNotificationForm() {
  const dispatch = useMainAppDispatch()
  const displayedError = useMainAppSelector(
    state => state.displayedError[DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR]
  )
  const editedManualPriorNotificationFormValues = useMainAppSelector(
    state => state.priorNotification.editedManualPriorNotificationFormValues
  )
  const openedPriorNotificationDetail = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationDetail
  )

  const isBeingSent =
    openedPriorNotificationDetail?.state === PriorNotification.State.PENDING_SEND ||
    openedPriorNotificationDetail?.state === PriorNotification.State.PENDING_AUTO_SEND

  useInterval(
    () => {
      assertNotNullish(openedPriorNotificationDetail)

      dispatch(
        refreshPriorNotification(
          getPriorNotificationIdentifier(openedPriorNotificationDetail),
          openedPriorNotificationDetail.fingerprint,
          openedPriorNotificationDetail.isManuallyCreated
        )
      )
    },
    isBeingSent,
    1000
  )

  const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const identifier = getPriorNotificationIdentifier(openedPriorNotificationDetail)

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
  }

  // TODO Replace that with a use case dispatcher.
  const submit = async (nextFormValues: ManualPriorNotificationFormValues) => {
    setIsLoading(true)

    const { fishingCatches, isExpectedLandingDateSameAsExpectedArrivalDate, ...priorNotificationData } = omit(
      nextFormValues,
      ['hasGlobalFaoArea']
    )
    const newOrNextPriorNotificationData = {
      ...priorNotificationData,
      expectedLandingDate: isExpectedLandingDateSameAsExpectedArrivalDate
        ? priorNotificationData.expectedArrivalDate
        : priorNotificationData.expectedLandingDate,
      fishingCatches: getFormDataFishingCatchesFromFormValuesFishingCatches(fishingCatches)
    } as PriorNotification.ManualForm

    await dispatch(
      createOrUpdateManualPriorNotification(openedPriorNotificationDetail?.reportId, newOrNextPriorNotificationData)
    )

    setIsLoading(false)
  }

  const verifyAndSend = async () => {
    assertNotNullish(identifier)
    assertNotNullish(openedPriorNotificationDetail)

    setIsLoading(true)

    await dispatch(verifyAndSendPriorNotification(identifier, true))
  }

  if (displayedError) {
    return (
      <SideWindowCard onBackgroundClick={close}>
        <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR} />
      </SideWindowCard>
    )
  }

  if (!editedManualPriorNotificationFormValues || isLoading) {
    return (
      <SideWindowCard onBackgroundClick={close}>
        <LoadingSpinnerWall />
      </SideWindowCard>
    )
  }

  return (
    <Formik
      initialValues={editedManualPriorNotificationFormValues}
      onSubmit={submit}
      validateOnChange={shouldValidateOnChange}
      validationSchema={FORM_VALIDATION_SCHEMA}
    >
      <Content
        detail={openedPriorNotificationDetail}
        isValidatingOnChange={shouldValidateOnChange}
        onClose={close}
        onSubmit={() => setShouldValidateOnChange(true)}
        onVerifyAndSend={verifyAndSend}
      />
    </Formik>
  )
}
