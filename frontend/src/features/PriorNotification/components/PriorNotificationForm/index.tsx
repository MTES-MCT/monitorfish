import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { Card } from './Card'
import { FORM_VALIDATION_SCHEMA } from './constants'
import { priorNotificationActions } from '../../slice'
import { createOrUpdateManualPriorNotification } from '../../useCases/createOrUpdateManualPriorNotification'

import type { FormValues } from './types'
import type { PriorNotification } from '../../PriorNotification.types'

export function PriorNotificationForm() {
  const dispatch = useMainAppDispatch()
  const editedPriorNotificationInitialFormValues = useMainAppSelector(
    state => state.priorNotification.editedPriorNotificationInitialFormValues
  )
  const openedPriorNotificationReportId = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationReportId
  )

  const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationForm())
  }

  // TODO Replace that with a use case dispatcher.
  const submit = async (nextFormValues: FormValues) => {
    setIsLoading(true)

    const { isExpectedLandingDateSameAsExpectedArrivalDate, ...priorNotificationData } = nextFormValues
    const newOrNextPriorNotificationData = {
      ...priorNotificationData,
      expectedLandingDate: isExpectedLandingDateSameAsExpectedArrivalDate
        ? priorNotificationData.expectedArrivalDate
        : priorNotificationData.expectedLandingDate
    } as PriorNotification.NewManualPriorNotificationData

    await dispatch(
      createOrUpdateManualPriorNotification(openedPriorNotificationReportId, newOrNextPriorNotificationData)
    )

    setIsLoading(false)
  }

  const verifyAndSend = async () => {
    setIsLoading(true)

    assertNotNullish(openedPriorNotificationReportId)

    await dispatch(verifyAndSendPriorNotification(openedPriorNotificationReportId, true))

    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  if (!editedPriorNotificationInitialFormValues || isLoading) {
    return (
      <Wrapper className="Form">
        <Background onClick={close} />

        <LoadingCard>
          <LoadingSpinnerWall />
        </LoadingCard>
      </Wrapper>
    )
  }

  return (
    <Formik
      initialValues={editedPriorNotificationInitialFormValues}
      onSubmit={submit}
      validateOnChange={shouldValidateOnChange}
      validationSchema={FORM_VALIDATION_SCHEMA}
    >
      <Card
        isValidatingOnChange={shouldValidateOnChange}
        onClose={close}
        onSubmit={() => setShouldValidateOnChange(true)}
        onVerifyAndSend={verifyAndSend}
        reportId={openedPriorNotificationReportId}
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
