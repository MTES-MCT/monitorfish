import { priorNotificationActions } from '@features/PriorNotification/slice'
import { createOrUpdatePriorNotification } from '@features/PriorNotification/useCases/createOrUpdatePriorNotification'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik } from 'formik'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { Card } from './Card'
import { FORM_VALIDATION_SCHEMA } from './constants'

import type { FormValues } from './types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export function PriorNotificationForm() {
  const initialFormValuesRef = useRef<FormValues | undefined>()

  const dispatch = useMainAppDispatch()
  const editedPriorNotificationInitialFormValues = useMainAppSelector(
    state => state.priorNotification.editedPriorNotificationInitialFormValues
  )
  const editedPriorNotificationReportId = useMainAppSelector(
    state => state.priorNotification.editedPriorNotificationReportId
  )

  const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationForm())
  }

  const submit = async (nextFormValues: FormValues) => {
    // We don't want to lose the initial values if there is an error.
    initialFormValuesRef.current = nextFormValues
    setIsLoading(true)

    const { isExpectedLandingDateSameAsExpectedArrivalDate, ...priorNotificationData } = nextFormValues
    const newOrNextPriorNotificationData = {
      ...priorNotificationData,
      expectedLandingDate: isExpectedLandingDateSameAsExpectedArrivalDate
        ? priorNotificationData.expectedArrivalDate
        : priorNotificationData.expectedLandingDate
    } as PriorNotification.NewManualPriorNotificationData

    await dispatch(createOrUpdatePriorNotification(editedPriorNotificationReportId, newOrNextPriorNotificationData))

    setIsLoading(false)
  }

  const verifyAndSend = async () => {
    setIsLoading(true)

    assertNotNullish(editedPriorNotificationReportId)

    await dispatch(verifyAndSendPriorNotification(editedPriorNotificationReportId, true))

    setIsLoading(false)
  }

  useEffect(() => {
    if (!editedPriorNotificationInitialFormValues) {
      return
    }

    initialFormValuesRef.current = editedPriorNotificationInitialFormValues

    setIsLoading(false)
  }, [editedPriorNotificationInitialFormValues])

  if (!initialFormValuesRef.current || isLoading) {
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
    <Wrapper>
      <Background onClick={close} />

      <Formik
        initialValues={initialFormValuesRef.current}
        onSubmit={submit}
        validateOnChange={shouldValidateOnChange}
        validationSchema={FORM_VALIDATION_SCHEMA}
      >
        <Card
          isValidatingOnChange={shouldValidateOnChange}
          onClose={close}
          onSubmit={() => setShouldValidateOnChange(true)}
          onVerifyAndSend={verifyAndSend}
          reportId={editedPriorNotificationReportId}
        />
      </Formik>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  left: 0;
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
