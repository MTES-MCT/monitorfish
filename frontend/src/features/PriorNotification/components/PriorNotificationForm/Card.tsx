import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { updateEditedPriorNotificationComputedValues } from '@features/PriorNotification/useCases/updateEditedPriorNotificationComputedValues'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Banner, Button, FormikEffect, Icon, Level, usePrevious } from '@mtes-mct/monitor-ui'
import { getDefinedObject } from '@utils/getDefinedObject'
import { useFormikContext } from 'formik'
import { isEqual } from 'lodash'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { Form } from './Form'
import { Header } from './Header'
import { TagBar } from './TagBar'
import { getPartialComputationRequestData } from './utils'

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
  const { isValid, submitForm, values } = useFormikContext<FormValues>()
  const dispatch = useMainAppDispatch()
  const editedPriorNotificationDetail = useMainAppSelector(
    store => store.priorNotification.editedPriorNotificationDetail
  )

  const previousPartialComputationRequestData = usePrevious(getPartialComputationRequestData(values))

  const isNewPriorNotification = !reportId
  const isPendingSend = editedPriorNotificationDetail?.state === PriorNotification.State.PENDING_SEND
  const isSent = [PriorNotification.State.SENT, PriorNotification.State.VERIFIED_AND_SENT].includes(
    editedPriorNotificationDetail?.state as any
  )

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
  const updateComputedValuesIfMecessary = (nextFormValues: FormValues) => {
    const nextPartialComputationRequestData = getPartialComputationRequestData(nextFormValues)
    if (
      !previousPartialComputationRequestData ||
      isEqual(nextPartialComputationRequestData, previousPartialComputationRequestData)
    ) {
      return
    }

    const nextComputationRequestData = getDefinedObject(nextPartialComputationRequestData, [
      'faoArea',
      'fishingCatches',
      'portLocode',
      'tripGearCodes',
      'vesselId'
    ])
    if (!nextComputationRequestData) {
      return
    }

    updateComputedValues(nextComputationRequestData)
  }

  return (
    <Wrapper>
      <FormikEffect onChange={updateComputedValuesIfMecessary as any} />

      {editedPriorNotificationDetail?.state === PriorNotification.State.PENDING_SEND && (
        <StyledBanner isCollapsible level={Level.WARNING} top="100px">
          Le préavis est en cours de diffusion.
        </StyledBanner>
      )}

      <FrontendErrorBoundary>
        <Header isNewPriorNotification={isNewPriorNotification} onClose={onClose} vesselId={values.vesselId} />

        <Body>
          <TagBar />

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
          <Button accent={Accent.TERTIARY} onClick={onClose}>
            Fermer
          </Button>
          <Button
            accent={Accent.PRIMARY}
            disabled={isPendingSend || isSent || (isValidatingOnChange && !isValid)}
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
    </Wrapper>
  )
}

const Wrapper = styled.div`
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

  > .Element-Button:not(:first-child) {
    margin-left: 16px;
  }
`
