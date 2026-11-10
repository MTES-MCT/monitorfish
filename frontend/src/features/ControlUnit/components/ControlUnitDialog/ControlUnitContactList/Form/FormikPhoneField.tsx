import { FormikPhoneInput } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'

import type { ControlUnitContactFormValues } from '../types'

export function FormikPhoneField() {
  const { errors } = useFormikContext<ControlUnitContactFormValues>()

  return (
    <FormikPhoneInput
      $isLight
      error={!!errors.phone}
      label="Numéro de téléphone fixe"
      name="phone"
      placeholder="01 23 45 67 89 ou 00 594 123 456 789"
    />
  )
}
