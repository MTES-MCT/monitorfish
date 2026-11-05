import { ControlUnit, getOptionsFromLabelledEnum, sortCollectionByLocalizedProps } from '@mtes-mct/monitor-ui'
import { object, string } from 'yup'

import type { ControlUnitContactFormValues } from './types'

const frenchPhoneRegex = /^0[1-9]\d{8}$/
const internationalPhoneRegex = /^00\d{6,15}$/

const CONTACT_METHOD_REQUIRED_MESSAGE = 'Veuillez entrer un téléphone, un portable ou un email.'
const NAME_OR_ROLE_REQUIRED_MESSAGE = 'Veuillez entrer un nom de contact ou une fonction'
const INVALID_PHONE_MESSAGE =
  "Le numéro saisi n'est pas valide. Si c'est un numéro satellitaire ou d'outre-mer, ajouter 00 avant les premiers chiffres."

const isValidPhoneNumber = (value: string | undefined) =>
  !value || frenchPhoneRegex.test(value) || internationalPhoneRegex.test(value)

const requiredUnlessOtherContactMethods = (others: [string, string]) =>
  string().when(others, {
    is: (first?: string, second?: string) => !first && !second,
    then: schema => schema.required(CONTACT_METHOD_REQUIRED_MESSAGE)
  })

export const CONTROL_UNIT_CONTACT_FORM_SCHEMA = object().shape(
  {
    cellPhone: requiredUnlessOtherContactMethods(['email', 'phone']).test(
      'is-valid-phone-number',
      INVALID_PHONE_MESSAGE,
      isValidPhoneNumber
    ),
    email: requiredUnlessOtherContactMethods(['phone', 'cellPhone']),
    name: string().when('role', {
      is: (role?: string) => !role,
      then: schema => schema.required(NAME_OR_ROLE_REQUIRED_MESSAGE)
    }),
    phone: requiredUnlessOtherContactMethods(['email', 'cellPhone']).test(
      'is-valid-phone-number',
      INVALID_PHONE_MESSAGE,
      isValidPhoneNumber
    ),
    role: string().when('name', {
      is: (name?: string) => !name,
      then: schema => schema.required(NAME_OR_ROLE_REQUIRED_MESSAGE)
    })
  },
  [
    ['name', 'role'],
    ['email', 'phone'],
    ['email', 'cellPhone'],
    ['phone', 'cellPhone']
  ]
)

export const INITIAL_CONTROL_UNIT_CONTACT_FORM_VALUES: ControlUnitContactFormValues = {
  cellPhone: undefined,
  controlUnitId: undefined,
  email: undefined,
  isEmailSubscriptionContact: false,
  isSmsSubscriptionContact: false,
  name: undefined,
  phone: undefined,
  role: undefined
}

export const CONTROL_UNIT_CONTACT_PREDEFINED_NAMES: string[] = Object.values(
  ControlUnit.ControlUnitContactPredefinedName
).sort()
export const SORTED_CONTROL_UNIT_CONTACT_PREDEFINED_NAMES_AS_OPTIONS = [
  ...sortCollectionByLocalizedProps(['label'], getOptionsFromLabelledEnum(ControlUnit.ControlUnitContactPredefinedName))
]
