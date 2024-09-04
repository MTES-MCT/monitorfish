import { ErrorWall } from '@components/ErrorWall'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customSentry, CustomSentryMeasurementName } from '@libs/customSentry'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik } from 'formik'
import { omit } from 'lodash'
import { useState } from 'react'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { FORM_VALIDATION_SCHEMA } from './constants'
import { Content } from './Content'
import { SideWindowCard } from '../../../../components/SideWindowCard'
import { priorNotificationActions } from '../../slice'
import { createOrUpdateManualPriorNotification } from '../../useCases/createOrUpdateManualPriorNotification'

import type { ManualPriorNotificationFormValues } from './types'
import type { PriorNotification } from '../../PriorNotification.types'

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

  const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const identifier = getPriorNotificationIdentifier(openedPriorNotificationDetail)

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
  }

  // TODO Replace that with a use case dispatcher.
  const submit = async (nextFormValues: ManualPriorNotificationFormValues) => {
    setIsLoading(true)

    const { isExpectedLandingDateSameAsExpectedArrivalDate, ...priorNotificationData } = omit(nextFormValues, [
      'hasGlobalFaoArea'
    ])
    const newOrNextPriorNotificationData = {
      ...priorNotificationData,
      expectedLandingDate: isExpectedLandingDateSameAsExpectedArrivalDate
        ? priorNotificationData.expectedArrivalDate
        : priorNotificationData.expectedLandingDate
    } as PriorNotification.NewManualForm

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

  if (openedPriorNotificationDetail?.reportId) {
    customSentry.endMeasurement(
      CustomSentryMeasurementName.MANUAL_PRIOR_NOTIFICATION_FORM_SPINNER,
      openedPriorNotificationDetail.reportId
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
