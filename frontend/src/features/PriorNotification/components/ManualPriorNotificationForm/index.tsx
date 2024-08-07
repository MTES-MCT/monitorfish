import { ErrorWall } from '@components/ErrorWall'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { Card } from './Card'
import { FORM_VALIDATION_SCHEMA } from './constants'
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

    const { isExpectedLandingDateSameAsExpectedArrivalDate, ...priorNotificationData } = nextFormValues
    const newOrNextPriorNotificationData = {
      ...priorNotificationData,
      expectedLandingDate: isExpectedLandingDateSameAsExpectedArrivalDate
        ? priorNotificationData.expectedArrivalDate
        : priorNotificationData.expectedLandingDate
    } as PriorNotification.NewManualFormData

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
      <Wrapper>
        <Background onClick={close} />

        <LoadingCard>
          <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR} />
        </LoadingCard>
      </Wrapper>
    )
  }

  if (!editedManualPriorNotificationFormValues || isLoading) {
    return (
      <Wrapper>
        <Background onClick={close} />

        <LoadingCard>
          <LoadingSpinnerWall />
        </LoadingCard>
      </Wrapper>
    )
  }

  return (
    <Formik
      initialValues={editedManualPriorNotificationFormValues}
      onSubmit={submit}
      validateOnChange={shouldValidateOnChange}
      validationSchema={FORM_VALIDATION_SCHEMA}
    >
      <Card
        detail={openedPriorNotificationDetail}
        isValidatingOnChange={shouldValidateOnChange}
        onClose={close}
        onSubmit={() => setShouldValidateOnChange(true)}
        onVerifyAndSend={verifyAndSend}
      />
    </Formik>
  )
}

const Wrapper = styled.div`
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  left: 70px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
`

const Background = styled.div`
  background-color: ${p => p.theme.color.charcoal};
  opacity: 0.5;
  flex-grow: 1;
`

const LoadingCard = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 560px;
`
