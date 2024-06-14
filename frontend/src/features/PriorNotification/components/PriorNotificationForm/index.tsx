import { priorNotificationApi } from '@features/PriorNotification/priorNotificationApi'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'
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

  // TODO Replace that with a use case dispatcher.
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

    try {
      let updatedPriorNotificationData: PriorNotification.ManualPriorNotificationData
      if (!editedPriorNotificationReportId) {
        updatedPriorNotificationData = await dispatch(
          priorNotificationApi.endpoints.createPriorNotification.initiate(newOrNextPriorNotificationData)
        ).unwrap()
      } else {
        updatedPriorNotificationData = await dispatch(
          priorNotificationApi.endpoints.updatePriorNotification.initiate({
            data: newOrNextPriorNotificationData,
            reportId: editedPriorNotificationReportId
          })
        ).unwrap()
      }

      dispatch(priorNotificationActions.setEditedPriorNotificationReportId(updatedPriorNotificationData.reportId))
      dispatch(
        priorNotificationActions.setEditedPriorNotificationInitialFormValues({
          ...updatedPriorNotificationData,
          isExpectedLandingDateSameAsExpectedArrivalDate:
            updatedPriorNotificationData.expectedLandingDate === updatedPriorNotificationData.expectedArrivalDate
        })
      )
    } catch (err) {
      if (err instanceof FrontendApiError) {
        dispatch(displayOrLogError(err, undefined, true, DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR))
      }
    }
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
