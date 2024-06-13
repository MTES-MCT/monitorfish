import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { updateEditedPriorNotificationComputedValues } from '@features/PriorNotification/useCases/updateEditedPriorNotificationComputedValues'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, FormikEffect, usePrevious } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { isEqual } from 'lodash'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { Form } from './Form'
import { Header } from './Header'
import { TagBar } from './TagBar'
import { getPartialComputationRequestData, isZeroNotice } from './utils'

import type { FormValues } from './types'

type CardProps = Readonly<{
  isValidatingOnChange: boolean
  onClose: () => void
  onSubmit: () => void
  reportId: string | undefined
}>
export function Card({ isValidatingOnChange, onClose, onSubmit, reportId }: CardProps) {
  const { isValid, submitForm, values } = useFormikContext<FormValues>()
  const dispatch = useMainAppDispatch()

  const previousPartialComputationRequestData = usePrevious(getPartialComputationRequestData(values))

  const handleSubmit = () => {
    onSubmit()

    submitForm()
  }

  const updateComputedValues = useDebouncedCallback((nextFormValues: FormValues) => {
    if (isZeroNotice(nextFormValues)) {
      dispatch(priorNotificationActions.unsetPriorNotificationComputedValues())

      return
    }

    const nextPartialComputationRequestData = getPartialComputationRequestData(nextFormValues)
    if (isEqual(nextPartialComputationRequestData, previousPartialComputationRequestData)) {
      return
    }

    dispatch(updateEditedPriorNotificationComputedValues(nextPartialComputationRequestData))
  }, 1000)

  return (
    <Wrapper>
      <FormikEffect onChange={updateComputedValues as any} />

      <FrontendErrorBoundary>
        <Header isNewPriorNotification={!reportId} onClose={onClose} vesselId={values.vesselId} />

        <Body>
          <TagBar />

          <p>
            Veuillez renseigner les champs du formulaire pour définir le type de préavis et son statut, ainsi que le
            segment de flotte et la note de risque du navire.
          </p>

          <hr />

          <Form />
        </Body>

        <Footer>
          <Button accent={Accent.TERTIARY} onClick={onClose}>
            Fermer
          </Button>
          <Button accent={Accent.PRIMARY} disabled={isValidatingOnChange && !isValid} onClick={handleSubmit}>
            {!reportId ? 'Créer le préavis' : 'Enregistrer'}
          </Button>
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
  width: 560px;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 32px;

  > p:first-child {
    color: ${p => p.theme.color.slateGray};
    font-style: italic;
  }

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

  > .Element-Button:not(:first-child) {
    margin-left: 16px;
  }
`
