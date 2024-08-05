import { ConfirmationModal } from '@components/ConfirmationModal'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { InvalidatePriorNotificationDialog } from '@features/PriorNotification/components/InvalidatePriorNotificationDialog'
import { useInvalidatePriorNotificationMutation } from '@features/PriorNotification/priorNotificationApi'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { updateEditedPriorNotificationComputedValues } from '@features/PriorNotification/useCases/updateEditedPriorNotificationComputedValues'
import { isZeroNotice } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, FormikEffect, Icon, Level, usePrevious } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { getDefinedObject } from '@utils/getDefinedObject'
import { useFormikContext } from 'formik'
import { isEqual } from 'lodash'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { Form } from './Form'
import { Header } from './Header'
import { getPartialComputationRequestData } from './utils'
import { PriorNotification } from '../../PriorNotification.types'
import { CardBanner } from '../shared/CardBanner'
import { DownloadButton } from '../shared/DownloadButton'
import { TagBar } from '../shared/TagBar'

import type { ManualPriorNotificationFormValues } from './types'
import type { Promisable } from 'type-fest'

type CardProps = Readonly<{
  detail: PriorNotification.PriorNotificationDetail | undefined
  isValidatingOnChange: boolean
  onClose: () => void
  onSubmit: () => Promisable<void>
  onVerifyAndSend: () => Promisable<void>
}>
export function Card({ detail, isValidatingOnChange, onClose, onSubmit, onVerifyAndSend }: CardProps) {
  const { dirty, isValid, submitForm, values } = useFormikContext<ManualPriorNotificationFormValues>()
  const dispatch = useMainAppDispatch()
  const editedPriorNotificationComputedValues = useMainAppSelector(
    store => store.priorNotification.editedManualPriorNotificationComputedValues
  )
  const [invalidatePriorNotification] = useInvalidatePriorNotificationMutation()

  const [isInvalidatingPriorNotificationDialog, setIsInvalidatingPriorNotificationDialog] = useState(false)
  const [isClosingConfirmationDialog, setIsClosingConfirmationDialog] = useState(false)
  const previousPartialComputationRequestData = usePrevious(getPartialComputationRequestData(values))

  const applicableState = editedPriorNotificationComputedValues?.nextState ?? detail?.state
  const isNewPriorNotification = !detail
  const isInvalidated = detail?.logbookMessage?.message?.isInvalidated
  const isPendingSend =
    !!detail?.state &&
    [PriorNotification.State.PENDING_AUTO_SEND, PriorNotification.State.PENDING_SEND].includes(detail?.state)
  const isPendingVerification = detail?.state === PriorNotification.State.PENDING_VERIFICATION
  const isVerifiedAndSent = detail?.state === PriorNotification.State.VERIFIED_AND_SENT
  const hasDesignatedPorts = editedPriorNotificationComputedValues?.types?.find(type => type.hasDesignatedPorts)

  const handleClose = () => {
    if (dirty) {
      setIsClosingConfirmationDialog(true)

      return
    }

    onClose()
  }

  const invalidate = async () => {
    assertNotNullish(detail)

    await invalidatePriorNotification({
      isManuallyCreated: true,
      operationDate: detail.logbookMessage.operationDateTime,
      reportId: detail.logbookMessage.reportId
    })

    setIsInvalidatingPriorNotificationDialog(false)
  }

  const handleSubmit = () => {
    onSubmit()

    submitForm()
  }

  const updateComputedValues = useDebouncedCallback(
    (nextComputationRequestData: PriorNotification.ManualComputeRequestData) => {
      dispatch(updateEditedPriorNotificationComputedValues(nextComputationRequestData))
    },
    1000
  )

  // We need to check for equality outside the debounce to ensure `nextFormValues` is up-to-date.
  const updateComputedValuesIfNecessary = (nextFormValues: ManualPriorNotificationFormValues) => {
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
      dispatch(priorNotificationActions.setEditedManualPriorNotificationInitialFormValues(values))
    },
    [dispatch, values]
  )

  return (
    <Wrapper>
      <Background onClick={handleClose} />

      <InnerWrapper>
        <FormikEffect onChange={updateComputedValuesIfNecessary as any} />

        {detail?.state === PriorNotification.State.PENDING_SEND && (
          <CardBanner isCollapsible level={Level.WARNING} top="100px">
            Le préavis est en cours de diffusion.
          </CardBanner>
        )}
        {detail?.state === PriorNotification.State.PENDING_AUTO_SEND && (
          <CardBanner isCollapsible level={Level.WARNING} top="100px">
            Le préavis est en cours d’envoi aux unités qui l’ont demandé.
          </CardBanner>
        )}

        <FrontendErrorBoundary>
          <Header isNewPriorNotification={isNewPriorNotification} onClose={handleClose} vesselId={values.vesselId} />

          <Body>
            <TagBar
              hasBeenComputed={!!editedPriorNotificationComputedValues}
              isInvalidated={isInvalidated}
              isVesselUnderCharter={editedPriorNotificationComputedValues?.isVesselUnderCharter}
              isZeroNotice={isZeroNotice(values.fishingCatches)}
              riskFactor={editedPriorNotificationComputedValues?.riskFactor}
              state={applicableState}
              tripSegments={editedPriorNotificationComputedValues?.tripSegments}
              types={editedPriorNotificationComputedValues?.types}
            />

            {isNewPriorNotification && !editedPriorNotificationComputedValues && (
              <Intro>
                Veuillez renseigner les champs du formulaire pour définir le type de préavis et son statut, ainsi que le
                segment de flotte et la note de risque du navire.
              </Intro>
            )}
            {!isNewPriorNotification && isPendingVerification && (
              <Intro>Le préavis doit être vérifié par le CNSP avant sa diffusion.</Intro>
            )}
            {(!!editedPriorNotificationComputedValues || !!detail) && (
              <Intro $withTopMargin={!isNewPriorNotification && isPendingVerification}>
                Le navire doit respecter un délai d’envoi{hasDesignatedPorts && ' et débarquer dans un port désigné'}.
              </Intro>
            )}

            <hr />

            <Form isInvalidated={isInvalidated} />

            {!!detail && !isInvalidated && (
              <InvalidateButton
                accent={Accent.SECONDARY}
                Icon={Icon.Invalid}
                onClick={() => setIsInvalidatingPriorNotificationDialog(true)}
                title="Invalider le préavis"
              >
                Invalider le préavis
              </InvalidateButton>
            )}
          </Body>

          <Footer>
            <Button accent={Accent.TERTIARY} onClick={handleClose}>
              Fermer
            </Button>

            {!!detail && (
              <DownloadButton isDisabled={dirty} pnoLogbookMessage={detail.logbookMessage} reportId={detail.reportId} />
            )}

            <Button
              accent={Accent.PRIMARY}
              disabled={(isInvalidated && !dirty) || (isValidatingOnChange && !isValid)}
              onClick={handleSubmit}
              title={
                isInvalidated
                  ? "Le préavis est invalidé, il n'est plus possible de le modifier ni de le diffuser."
                  : undefined
              }
            >
              {isNewPriorNotification ? 'Créer le préavis' : 'Enregistrer'}
            </Button>

            {!isNewPriorNotification && (
              <Button
                accent={Accent.PRIMARY}
                disabled={isInvalidated || isPendingSend || isVerifiedAndSent}
                Icon={isVerifiedAndSent ? Icon.Check : Icon.Send}
                onClick={onVerifyAndSend}
                title={
                  isInvalidated
                    ? "Le préavis est invalidé, il n'est plus possible de le modifier ni de le diffuser."
                    : undefined
                }
              >
                {isVerifiedAndSent ? 'Diffusé' : 'Diffuser'}
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

      {isInvalidatingPriorNotificationDialog && (
        <InvalidatePriorNotificationDialog
          onCancel={() => setIsInvalidatingPriorNotificationDialog(false)}
          onConfirm={invalidate}
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

const InvalidateButton = styled(Button)`
  color: ${p => p.theme.color.maximumRed};
  margin-top: 48px;
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

const Intro = styled.p<{
  $withTopMargin?: boolean
}>`
  ${p => p.$withTopMargin && 'margin-top: 2px;'}
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
