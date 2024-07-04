import { RTK_FORCE_REFETCH_QUERY_OPTIONS, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS } from '@api/constants'
import { ConfirmationModal } from '@components/ConfirmationModal'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { useGetPriorNotificationDetailQuery } from '@features/PriorNotification/priorNotificationApi'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { updateEditedPriorNotificationComputedValues } from '@features/PriorNotification/useCases/updateEditedPriorNotificationComputedValues'
import { isZeroNotice } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Banner, Button, FormikEffect, Icon, Level, usePrevious } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { getDefinedObject } from '@utils/getDefinedObject'
import { useFormikContext } from 'formik'
import { isEqual } from 'lodash'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { Form } from './Form'
import { Header } from './Header'
import { getApplicableState, getPartialComputationRequestData } from './utils'
import { PriorNotification } from '../../PriorNotification.types'
import { DownloadButton } from '../shared/DownloadButton'
import { TagBar } from '../shared/TagBar'

import type { FormValues } from './types'
import type { Promisable } from 'type-fest'

type CardProps = Readonly<{
  isValidatingOnChange: boolean
  onClose: () => void
  onSubmit: () => Promisable<void>
  onVerifyAndSend: () => Promisable<void>
  reportId: string | undefined
}>
export function Card({ isValidatingOnChange, onClose, onSubmit, onVerifyAndSend, reportId }: CardProps) {
  const { dirty, isValid, submitForm, values } = useFormikContext<FormValues>()
  const dispatch = useMainAppDispatch()
  const editedPriorNotificationComputedValues = useMainAppSelector(
    store => store.priorNotification.editedPriorNotificationComputedValues
  )
  const openedPriorNotificationReportId = useMainAppSelector(
    store => store.priorNotification.openedPriorNotificationReportId
  )
  const isOpenedPriorNotificationManual = useMainAppSelector(
    store => store.priorNotification.isOpenedPriorNotificationManual
  )

  const { data: editedPriorNotificationDetail } = useGetPriorNotificationDetailQuery(
    openedPriorNotificationReportId && typeof isOpenedPriorNotificationManual === 'boolean'
      ? {
          isManuallyCreated: isOpenedPriorNotificationManual,
          reportId: openedPriorNotificationReportId
        }
      : skipToken,
    {
      ...RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS,
      ...RTK_FORCE_REFETCH_QUERY_OPTIONS
    }
  )

  const [isClosingConfirmationDialog, setIsClosingConfirmationDialog] = useState(false)
  const previousPartialComputationRequestData = usePrevious(getPartialComputationRequestData(values))

  const applicableState = getApplicableState(editedPriorNotificationComputedValues, editedPriorNotificationDetail)
  const isNewPriorNotification = !reportId
  const isPendingSend = editedPriorNotificationDetail?.state === PriorNotification.State.PENDING_SEND
  const isSent = [PriorNotification.State.SENT, PriorNotification.State.VERIFIED_AND_SENT].includes(
    editedPriorNotificationDetail?.state as any
  )

  const handleClose = () => {
    if (dirty) {
      setIsClosingConfirmationDialog(true)

      return
    }

    onClose()
  }

  const handleSubmit = () => {
    onSubmit()

    submitForm()
  }

  const updateComputedValues = useDebouncedCallback(
    (nextComputationRequestData: PriorNotification.ManualPriorNotificationComputeRequestData) => {
      dispatch(updateEditedPriorNotificationComputedValues(nextComputationRequestData))
    },
    1000
  )

  // We need to check for equality outside the debounce to ensure `nextFormValues` is up-to-date.
  const updateComputedValuesIfNecessary = (nextFormValues: FormValues) => {
    const nextPartialComputationRequestData = getPartialComputationRequestData(nextFormValues)

    // If nothing changed, we don't need to update the computed values
    if (
      !previousPartialComputationRequestData ||
      isEqual(nextPartialComputationRequestData, previousPartialComputationRequestData)
    ) {
      return
    }

    // If we don't have enough data to compute the values, we can't update them
    const nextComputationRequestData = getDefinedObject(nextPartialComputationRequestData, [
      'faoArea',
      'fishingCatches',
      'portLocode',
      'tripGearCodes',
      'vesselId'
    ])
    if (!nextComputationRequestData) {
      // but we need to unset existing computed values in case they were computed before
      dispatch(priorNotificationActions.unsetEditedPriorNotificationComputedValues())

      return
    }

    updateComputedValues(nextComputationRequestData)
  }

  useEffect(
    () => () => {
      dispatch(priorNotificationActions.setEditedPriorNotificationInitialFormValues(values))
    },
    [dispatch, values]
  )

  return (
    <Wrapper>
      <Background onClick={handleClose} />

      <InnerWrapper>
        <FormikEffect onChange={updateComputedValuesIfNecessary as any} />

        {editedPriorNotificationDetail?.state === PriorNotification.State.PENDING_SEND && (
          <StyledBanner isCollapsible level={Level.WARNING} top="100px">
            Le préavis est en cours de diffusion.
          </StyledBanner>
        )}

        <FrontendErrorBoundary>
          <Header isNewPriorNotification={isNewPriorNotification} onClose={handleClose} vesselId={values.vesselId} />

          <Body>
            <TagBar
              isVesselUnderCharter={editedPriorNotificationComputedValues?.isVesselUnderCharter}
              isZeroNotice={isZeroNotice(values.fishingCatches)}
              riskFactor={editedPriorNotificationComputedValues?.riskFactor}
              state={applicableState}
              tripSegments={editedPriorNotificationComputedValues?.tripSegments}
              types={editedPriorNotificationComputedValues?.types}
            />

            {isNewPriorNotification && (
              <Intro>
                Veuillez renseigner les champs du formulaire pour définir le type de préavis et son statut, ainsi que le
                segment de flotte et la note de risque du navire.
              </Intro>
            )}
            {!isNewPriorNotification && (
              <Intro>
                Le préavis doit être vérifié par le CNSP avant sa diffusion.
                <br />
                Le navire doit respecter un délai d’envoi et débarquer dans un port désigné.
              </Intro>
            )}

            <hr />

            <Form />
          </Body>

          <Footer>
            <Button accent={Accent.TERTIARY} onClick={handleClose}>
              Fermer
            </Button>

            {!!editedPriorNotificationDetail && (
              <DownloadButton
                isDisabled={dirty && (!isSent || !isPendingSend)}
                isPdfDocumentAvailable={isSent}
                pnoLogbookMessage={editedPriorNotificationDetail.logbookMessage}
                reportId={editedPriorNotificationDetail.id}
              />
            )}

            <Button
              accent={Accent.PRIMARY}
              disabled={!dirty || isPendingSend || isSent || (isValidatingOnChange && !isValid)}
              onClick={handleSubmit}
            >
              {isNewPriorNotification ? 'Créer le préavis' : 'Enregistrer'}
            </Button>

            {!isNewPriorNotification && (
              <Button
                accent={Accent.PRIMARY}
                disabled={isPendingSend || isSent}
                Icon={isSent ? Icon.Check : Icon.Send}
                onClick={onVerifyAndSend}
              >
                {isSent ? 'Diffusé' : 'Diffuser'}
              </Button>
            )}
          </Footer>
        </FrontendErrorBoundary>
      </InnerWrapper>

      {isClosingConfirmationDialog && (
        <ConfirmationModal
          confirmationButtonLabel="Quitter sans enregistrer"
          message={`Vous êtes en train d’abandonner ${
            isNewPriorNotification ? 'la création' : 'l’édition'
          } d’un préavis.`}
          onCancel={() => setIsClosingConfirmationDialog(false)}
          onConfirm={onClose}
          title="Abandon de préavis"
        />
      )}
    </Wrapper>
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

const InnerWrapper = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 560px;
`

const StyledBanner = styled(Banner)`
  box-shadow: inset 0 3px 6px ${p => p.theme.color.lightGray};
  padding: 0;

  > div > p {
    font-size: 16px;
    font-weight: 500;
    padding-top: 3px;
  }

  > .banner-button {
    position: relative;

    > button {
      position: absolute;
      right: 32px;
      top: -7.5px;
    }
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 32px;

  > hr {
    margin: 24px 0 0;
  }

  > .Element-Field,
  > .Element-Fieldset,
  > .FieldGroup {
    margin-top: 24px;
  }
`

const Intro = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`

const Footer = styled.div`
  border-top: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  justify-content: flex-end;
  padding: 16px 32px;
  min-height: 30px;

  > .Element-Button:not(:first-child) {
    margin-left: 8px;
  }

  > div {
    margin-left: 8px;
  }
`
