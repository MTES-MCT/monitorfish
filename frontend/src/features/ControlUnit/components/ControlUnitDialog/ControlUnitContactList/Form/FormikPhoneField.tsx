import { FormikTextInput, Icon } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'

import { FieldWithButton } from './FieldWithButton'

import type { ControlUnitContactFormValues } from '../types'

export function FormikPhoneField() {
  const { errors, setFieldValue, values } = useFormikContext<ControlUnitContactFormValues>()

  const toggleSubscription = () => {
    setFieldValue('isSmsSubscriptionContact', !values.isSmsSubscriptionContact)
  }

  return (
    <FieldWithButton $hasError={!!errors.phone}>
      <FormikTextInput isLight label="Numéro de téléphone" name="phone" type="tel" />

      {values.isSmsSubscriptionContact ? (
        <FieldWithButton.IconButtonOn
          Icon={Icon.Subscription}
          onClick={toggleSubscription}
          title="Retirer ce numéro de la liste de diffusion des préavis et des bilans d’activités de contrôle"
        />
      ) : (
        <FieldWithButton.IconButtonOff
          Icon={Icon.Subscription}
          onClick={toggleSubscription}
          title="Ajouter ce numéro à la liste de diffusion des préavis et des bilans d’activités de contrôle"
        />
      )}
    </FieldWithButton>
  )
}
