import { describe, expect, it } from '@jest/globals'

import { UserManagement } from '../types'
import { getAdministrationEmailsDiff, getEmailsFromRows, isValidEmail, parseEmails } from '../utils'

describe('features/UserManagement/utils', () => {
  it('parseEmails() should split, normalize and dedupe emails', () => {
    const result = parseEmails(' A@gendarmerie.fr,b@gendarmerie.fr;\n\na@gendarmerie.fr  c@douane.fr ')

    expect(result).toEqual(['a@gendarmerie.fr', 'b@gendarmerie.fr', 'c@douane.fr'])
  })

  it('isValidEmail() should reject malformed emails', () => {
    expect(isValidEmail('a@gendarmerie.fr')).toBe(true)
    expect(isValidEmail('a@gendarmerie')).toBe(false)
    expect(isValidEmail('gendarmerie.fr')).toBe(false)
  })

  it('getEmailsFromRows() should keep email cells of any column, ignoring headers and other values', () => {
    const rows = [
      ['Nom', 'E-mail', 'Unité'],
      ['Jean Dupont', ' Jean.Dupont@Douane.finances.gouv.fr ', 'BGC Lorient'],
      ['Marie Martin', 'marie.martin@douane.finances.gouv.fr', undefined],
      ['Doublon', 'jean.dupont@douane.finances.gouv.fr', 42]
    ]

    const result = getEmailsFromRows(rows)

    expect(result).toEqual(['jean.dupont@douane.finances.gouv.fr', 'marie.martin@douane.finances.gouv.fr'])
  })

  it('getAdministrationEmailsDiff() should compute added and removed emails of an administration, ignoring super users', () => {
    const users: UserManagement.User[] = [
      {
        administration: UserManagement.ExternalAdministration.GENDARMERIE_MARITIME,
        email: 'kept@gendarmerie.fr',
        hashedEmail: 'h1',
        isAdministrator: false,
        isSuperUser: false,
        lastLoginAtUtc: undefined,
        service: undefined
      },
      {
        administration: UserManagement.ExternalAdministration.GENDARMERIE_MARITIME,
        email: 'removed@gendarmerie.fr',
        hashedEmail: 'h2',
        isAdministrator: false,
        isSuperUser: false,
        lastLoginAtUtc: undefined,
        service: undefined
      },
      {
        administration: UserManagement.ExternalAdministration.GENDARMERIE_MARITIME,
        email: 'super@email.gouv.fr',
        hashedEmail: 'h3',
        isAdministrator: false,
        isSuperUser: true,
        lastLoginAtUtc: undefined,
        service: undefined
      },
      {
        administration: UserManagement.ExternalAdministration.DOUANE,
        email: 'other@unit.fr',
        hashedEmail: 'h4',
        isAdministrator: false,
        isSuperUser: false,
        lastLoginAtUtc: undefined,
        service: undefined
      }
    ]

    const result = getAdministrationEmailsDiff(users, UserManagement.ExternalAdministration.GENDARMERIE_MARITIME, [
      'kept@gendarmerie.fr',
      'added@gendarmerie.fr'
    ])

    expect(result).toEqual({ addedEmails: ['added@gendarmerie.fr'], removedEmails: ['removed@gendarmerie.fr'] })
  })
})
