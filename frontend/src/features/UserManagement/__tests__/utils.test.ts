import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { UserManagement } from '../types'
import {
  filterUsers,
  getAdministrationEmailsDiff,
  getEmailsFromRows,
  getUserAffiliation,
  isValidEmail,
  parseEmails
} from '../utils'

const user = (props: Partial<UserManagement.User>): UserManagement.User => ({
  administration: undefined,
  email: 'agent@email.gouv.fr',
  hashedEmail: 'h',
  isAdministrator: false,
  isSuperUser: true,
  lastLoginAtUtc: undefined,
  service: undefined,
  ...props
})

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

  it('getUserAffiliation() should describe CNSP users with their service and external users with their administration', () => {
    expect(getUserAffiliation(user({ service: 'Pôle SIP' }))).toBe('CNSP · Pôle SIP')
    expect(getUserAffiliation(user({}))).toBe('CNSP')
    expect(
      getUserAffiliation(
        user({ administration: UserManagement.ExternalAdministration.GENDARMERIE_MARITIME, isSuperUser: false })
      )
    ).toBe('Gendarmerie maritime')
  })

  it('filterUsers() should filter by type, administration, activity and email', () => {
    const now = customDayjs.utc('2026-10-21T12:00:00Z')
    const recentCnspUser = user({
      email: 'recent@email.gouv.fr',
      hashedEmail: 'h1',
      lastLoginAtUtc: '2026-10-01T08:00:00Z'
    })
    const inactiveCnspUser = user({
      email: 'old@email.gouv.fr',
      hashedEmail: 'h2',
      lastLoginAtUtc: '2026-01-01T08:00:00Z'
    })
    const neverLoggedInExternalUser = user({
      administration: UserManagement.ExternalAdministration.DOUANE,
      email: 'agent@douane.finances.gouv.fr',
      hashedEmail: 'h3',
      isSuperUser: false
    })
    const users = [recentCnspUser, inactiveCnspUser, neverLoggedInExternalUser]
    const noFilters: UserManagement.Filters = {
      activity: undefined,
      administration: undefined,
      searchQuery: undefined,
      userType: undefined
    }

    expect(filterUsers(users, noFilters, now)).toEqual(users)
    expect(filterUsers(users, { ...noFilters, userType: UserManagement.UserType.EXTERNAL }, now)).toEqual([
      neverLoggedInExternalUser
    ])
    expect(
      filterUsers(users, { ...noFilters, administration: UserManagement.ExternalAdministration.DOUANE }, now)
    ).toEqual([neverLoggedInExternalUser])
    expect(filterUsers(users, { ...noFilters, activity: UserManagement.Activity.INACTIVE }, now)).toEqual([
      inactiveCnspUser,
      neverLoggedInExternalUser
    ])
    expect(filterUsers(users, { ...noFilters, activity: UserManagement.Activity.NEVER_LOGGED_IN }, now)).toEqual([
      neverLoggedInExternalUser
    ])
    expect(filterUsers(users, { ...noFilters, searchQuery: ' OLD ' }, now)).toEqual([inactiveCnspUser])
  })
})
