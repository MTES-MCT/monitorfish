import { sortBy } from 'lodash-es'

import { CONTROL_UNIT_CONTACT_PREDEFINED_NAMES } from './constants'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

/**
 * Sort control unit contacts by qualified name.
 *
 * @description
 * Predefined names comes first, then custom names, both in alphabetical order.
 */
export function sortControlUnitContactsByQualifiedName(
  controlUnitContacts: ControlUnit.ControlUnitContactData[]
): ControlUnit.ControlUnitContactData[] {
  const predefinedNamedContacts = controlUnitContacts.filter(({ name }) =>
    CONTROL_UNIT_CONTACT_PREDEFINED_NAMES.includes(name)
  )
  const customNamedContacts = controlUnitContacts.filter(
    ({ name }) => !CONTROL_UNIT_CONTACT_PREDEFINED_NAMES.includes(name)
  )
  const sortedPredefinedNamedContacts = sortBy(predefinedNamedContacts, ['name'])
  const sortedCustomNamedContacts = sortBy(customNamedContacts, ['name'])

  return [...sortedPredefinedNamedContacts, ...sortedCustomNamedContacts]
}

export function formatPhoneNumber(phoneNumber: string) {
  if (phoneNumber.startsWith('00')) {
    if (phoneNumber.length === 12) {
      return phoneNumber.match(/.{1,2}/g)?.join(' ')
    }

    return `00 ${phoneNumber
      .slice(2)
      .match(/.{1,3}/g)
      ?.join(' ')}`
  }
  if (phoneNumber.startsWith('0')) {
    return phoneNumber.match(/.{1,2}/g)?.join(' ')
  }

  return phoneNumber.match(/.{1,3}/g)?.join(' ')
}
