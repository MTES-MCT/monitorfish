import { Accent, Button, ControlUnit, FormikTextInput, Icon, Level, Message } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import { FieldWithButton } from './FieldWithButton'

import type { ControlUnitContactFormValues } from '../types'

type FormikIsEmailSubscriptionContactToggleProps = {
  controlUnit: ControlUnit.ControlUnit
}
export function FormikEmailField({ controlUnit }: FormikIsEmailSubscriptionContactToggleProps) {
  const { errors, setFieldValue, values } = useFormikContext<ControlUnitContactFormValues>()

  const [isConfirmationMessageOpened, setIsConfirmationMessageOpened] = useState(false)
  const [otherContactSubscribedEmail, setOtherContactSubscribedEmail] = useState<string | undefined>(undefined)

  const askForConfirmation = () => {
    // If the user is trying to subscribe this contact while another contact is already subscribed, ask for confirmation
    if (!values.isEmailSubscriptionContact) {
      const otherEmailSubscriptionContact = controlUnit.controlUnitContacts.find(
        controlUnitContact => controlUnitContact.id !== values.id && controlUnitContact.isEmailSubscriptionContact
      )

      if (otherEmailSubscriptionContact && otherEmailSubscriptionContact.email) {
        setOtherContactSubscribedEmail(otherEmailSubscriptionContact.email)
        setIsConfirmationMessageOpened(true)

        return
      }
    }

    toggleSubscription()
  }

  const closeConfirmationMessage = () => {
    setIsConfirmationMessageOpened(false)
    setOtherContactSubscribedEmail(undefined)
  }

  const toggleSubscription = () => {
    setIsConfirmationMessageOpened(false)

    const willBeSubscribed = !values.isEmailSubscriptionContact

    setFieldValue('isEmailSubscriptionContact', willBeSubscribed)
  }

  return (
    <>
      <FieldWithButton $hasError={!!errors.email}>
        <FormikTextInput isLight label="Adresse mail" name="email" type="email" />
        {values.isEmailSubscriptionContact ? (
          <FieldWithButton.IconButtonOn
            Icon={Icon.Subscription}
            onClick={toggleSubscription}
            title="Retirer cette adresse de la liste de diffusion des préavis et des bilans d’activités de contrôle"
          />
        ) : (
          <FieldWithButton.IconButtonOff
            Icon={Icon.Subscription}
            onClick={askForConfirmation}
            title="Ajouter cette adresse à la liste de diffusion des préavis et des bilans d’activités de contrôle"
          />
        )}
      </FieldWithButton>

      {values.isEmailSubscriptionContact && (
        <Message Icon={Icon.Subscription} level={Level.INFO}>
          <p>
            <strong>Adresse de diffusion</strong>
            <br />
            Cette adresse est utilisée pour envoyer à l’unité les préavis de débarquement ainsi que le bilan
            hebdomadaire de ses activités de contrôle.
          </p>
        </Message>
      )}

      {isConfirmationMessageOpened && otherContactSubscribedEmail && (
        <Message level={Level.WARNING}>
          <p>
            <strong>Attention</strong>
            <br />
            Attention l’adresse actuelle de diffusion à cette unité est : <b>{otherContactSubscribedEmail}</b>.{' '}
            Voulez-vous la remplacer par : <b>{values.email}</b> ?
          </p>

          <ActionBar>
            <Button accent={Accent.WARNING} onClick={toggleSubscription}>
              Oui, la remplacer
            </Button>
            <Button accent={Accent.WARNING} onClick={closeConfirmationMessage}>
              Non, conserver l’adresse actuelle
            </Button>
          </ActionBar>
        </Message>
      )}
    </>
  )
}

const ActionBar = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  > .Element-Button:not(:first-child) {
    margin-top: 8px;
  }
`
