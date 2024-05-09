import { ControlUnit, getOptionsFromLabelledEnum, sortCollectionByLocalizedProps } from '@mtes-mct/monitor-ui'
import { object, string } from 'yup'

import type { ControlUnitContactFormValues } from './types'

export const CONTROL_UNIT_CONTACT_FORM_SCHEMA = object().shape(
  {
    email: string().when('phone', {
      is: phone => !phone,
      then: schema => schema.required('Veuillez entrer un téléphone ou un email.')
    }),
    name: string().required('Veuillez choisir un nom.'),
    phone: string().when('email', {
      is: email => !email,
      then: schema => schema.required('Veuillez entrer un téléphone ou un email.')
    })
  },
  [['email', 'phone']]
)

export const INITIAL_CONTROL_UNIT_CONTACT_FORM_VALUES: ControlUnitContactFormValues = {
  controlUnitId: undefined,
  email: undefined,
  isEmailSubscriptionContact: undefined,
  isSmsSubscriptionContact: undefined,
  name: undefined,
  phone: undefined
}

export const CONTROL_UNIT_CONTACT_PREDEFINED_NAMES: string[] = Object.values(
  ControlUnit.ControlUnitContactPredefinedName
).sort()
export const SORTED_CONTROL_UNIT_CONTACT_PREDEFINED_NAMES_AS_OPTIONS = [
  ...sortCollectionByLocalizedProps(
    ['label'],
    getOptionsFromLabelledEnum(ControlUnit.ControlUnitContactPredefinedName)
  ),
  {
    label: 'Créer un nom personnalisé',
    value: 'SWITCH_TO_CUSTOM_NAME'
  }
]
