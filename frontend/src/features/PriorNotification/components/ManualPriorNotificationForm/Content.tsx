import { ConfirmationModal } from '@components/ConfirmationModal'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { invalidatePriorNotification } from '@features/PriorNotification/useCases/invalidatePriorNotification'
import { updateManualPriorNotificationComputedValues } from '@features/PriorNotification/useCases/updateManualPriorNotificationComputedValues'
import { getPriorNotificationIdentifier, isPriorNotificationZero } from '@features/PriorNotification/utils'
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
import { getPartialComputationRequestData } from './utils'
import { SideWindowCard } from '../../../../components/SideWindowCard'
import { PriorNotification } from '../../PriorNotification.types'
import { CardBanner } from '../shared/CardBanner'
import { CardBodyHead } from '../shared/CardBodyHead'
import { CardHeader } from '../shared/CardHeader'
import { DownloadButton } from '../shared/DownloadButton'
import { UploadFiles } from '../shared/UploadFiles'

import type { ManualPriorNotificationFormValues } from './types'
import type { Promisable } from 'type-fest'

type ContentProps = Readonly<{
  detail: PriorNotification.Detail | undefined
  isValidatingOnChange: boolean
  onClose: () => void
  onSubmit: () => Promisable<void>
  onVerifyAndSend: () => Promisable<void>
}>
export function Content({ detail, isValidatingOnChange, onClose, onSubmit, onVerifyAndSend }: ContentProps) {
  const { isValid, submitForm, values } = useFormikContext<ManualPriorNotificationFormValues>()
  const dispatch = useMainAppDispatch()
  const editedPriorNotificationComputedValues = useMainAppSelector(
    store => store.priorNotification.editedManualPriorNotificationComputedValues
  )
  const isPriorNotificationFormDirty = useMainAppSelector(store => store.priorNotification.isPriorNotificationFormDirty)

  const [isCancellationConfirmationModalOpen, setIsCancellationConfirmationModalOpen] = useState(false)
  const [isInvalidationConfirmationModalOpen, setIsInvalidationConfirmationModalOpen] = useState(false)

  const previousPartialComputationRequestData = usePrevious(getPartialComputationRequestData(values))

  const applicableState = editedPriorNotificationComputedValues?.nextState ?? detail?.state
  const isNewPriorNotification = !detail
  const isInvalidated = !!detail?.logbookMessage?.message?.isInvalidated
  const isPendingSend =
    !!detail?.state &&
    [PriorNotification.State.PENDING_AUTO_SEND, PriorNotification.State.PENDING_SEND].includes(detail?.state)
  const isReadOnly = isPendingSend || isInvalidated
  const isVerifiedAndSent = detail?.state === PriorNotification.State.VERIFIED_AND_SENT
  const priorNotificationIdentifier = getPriorNotificationIdentifier(detail)

  const closeCancellationConfirmationModal = () => {
    setIsCancellationConfirmationModalOpen(false)
  }

  const closeInvalidationConfirmationModal = () => {
    setIsInvalidationConfirmationModalOpen(false)
  }

  const handleClose = () => {
    if (isPriorNotificationFormDirty) {
      setIsCancellationConfirmationModalOpen(true)

      return
    }

    onClose()
  }

  const handleSubmit = () => {
    onSubmit()

    submitForm()
  }

  const invalidate = () => {
    assertNotNullish(priorNotificationIdentifier)

    dispatch(invalidatePriorNotification(priorNotificationIdentifier, true))
  }

  const openInvalidationConfirmationModal = () => {
    setIsInvalidationConfirmationModalOpen(true)
  }

  const updateComputedValues = useDebouncedCallback(
    (nextComputationRequestData: PriorNotification.ManualComputeRequestData) => {
      dispatch(updateManualPriorNotificationComputedValues(nextComputationRequestData))
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
      'fishingCatches',
      'portLocode',
      'tripGearCodes',
      'vesselId'
    ])
    if (
      !nextComputationRequestData ||
      nextFormValues.fishingCatches.length === 0 ||
      nextFormValues.tripGearCodes.length === 0 ||
      // If there is neither a global FAO area nor all per species FAO areas, we can't compute the values
      (!nextFormValues.globalFaoArea &&
        nextComputationRequestData.fishingCatches.some(fishingCatch => !fishingCatch.faoArea))
    ) {
      // but we need to unset existing computed values in case they were computed before
      dispatch(priorNotificationActions.unsetEditedPriorNotificationComputedValues())

      return
    }

    updateComputedValues(nextComputationRequestData)
  }

  useEffect(
    () => () => {
      dispatch(priorNotificationActions.setEditedManualPriorNotificationFormValues(values))
    },
    [dispatch, values]
  )

  return (
    <SideWindowCard onBackgroundClick={handleClose}>
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
        <CardHeader detail={detail} onClose={handleClose} vesselId={values.vesselId} withCloseButton />

        <Body data-cy="ManualPriorNotificationForm-Body">
          <CardBodyHead
            applicableState={applicableState}
            detail={detail}
            editedPriorNotificationComputedValues={editedPriorNotificationComputedValues}
            hasBeenComputed={!!editedPriorNotificationComputedValues}
            isNewPriorNotification={isNewPriorNotification}
            isPriorNotificationZero={isPriorNotificationZero(values.fishingCatches)}
            isVesselUnderCharter={editedPriorNotificationComputedValues?.isVesselUnderCharter}
            riskFactor={editedPriorNotificationComputedValues?.riskFactor}
            tripSegments={editedPriorNotificationComputedValues?.tripSegments}
            types={editedPriorNotificationComputedValues?.types}
          />

          <hr />

          <Form isNewPriorNotification={isNewPriorNotification} isReadOnly={isReadOnly} />

          {detail && (
            <>
              <hr style={{ marginBottom: 24 }} />

              <UploadFiles
                isManualPriorNotification
                isReadOnly={isReadOnly}
                operationDate={detail.operationDate}
                reportId={detail.reportId}
              />
            </>
          )}

          {!!detail && (
            <InvalidateButton
              accent={Accent.SECONDARY}
              disabled={isReadOnly}
              Icon={Icon.Invalid}
              onClick={openInvalidationConfirmationModal}
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
            <DownloadButton
              isDisabled={isPriorNotificationFormDirty}
              isManuallyCreated={detail.isManuallyCreated}
              pnoLogbookMessage={detail.logbookMessage}
              reportId={detail.reportId}
            />
          )}

          <Button
            accent={Accent.PRIMARY}
            disabled={(isReadOnly && !isPriorNotificationFormDirty) || (isValidatingOnChange && !isValid)}
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
              disabled={isReadOnly || isVerifiedAndSent}
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

      {isCancellationConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Quitter sans enregistrer"
          message={`Vous êtes en train d’abandonner ${
            isNewPriorNotification ? 'la création' : 'l’édition'
          } d’un préavis.`}
          onCancel={closeCancellationConfirmationModal}
          onConfirm={onClose}
          title="Abandon de préavis"
        />
      )}

      {isInvalidationConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer l’invalidation"
          message={
            <>
              <p>
                <b>Êtes-vous sûr de vouloir invalider ce préavis ?</b>
              </p>
              <p>Vous ne pourrez plus le modifier ni le diffuser aux unités. Vous pourrez toujours le consulter.</p>
            </>
          }
          onCancel={closeInvalidationConfirmationModal}
          onConfirm={invalidate}
          title="Invalider le préavis"
        />
      )}
    </SideWindowCard>
  )
}

const InvalidateButton = styled(Button)`
  color: ${p => p.theme.color.maximumRed};
  margin-top: 48px;
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
