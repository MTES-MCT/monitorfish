import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { Form } from './Form'
import { Header } from './Header'
import { TagBar } from './TagBar'

import type { FormValues } from './types'

type CardProps = Readonly<{
  isValidatingOnChange: boolean
  onClose: () => void
  onSubmit: () => void
  reportId: string | undefined
}>
export function Card({ isValidatingOnChange, onClose, onSubmit, reportId }: CardProps) {
  const { isValid, submitForm, values } = useFormikContext<FormValues>()

  const handleSubmit = () => {
    onSubmit()

    submitForm()
  }

  return (
    <Wrapper>
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
