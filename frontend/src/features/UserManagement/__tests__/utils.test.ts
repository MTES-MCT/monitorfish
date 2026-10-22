import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { UserManagement } from '../types'
import {
  filterUsers,
  getAdministrationEmailsDiff,
  getAuthorizationAuditLogActor,
  getAuthorizationAuditLogDetails,
  getAuthorizationAuditLogTarget,
  getEmailsFromFile,
  getEmailsFromRows,
  getUserAffiliation,
  isInactiveUser,
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

  it('getAdministrationEmailsDiff() should compute added, moved and removed emails of an administration, ignoring super users', () => {
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
      'added@gendarmerie.fr',
      'other@unit.fr'
    ])

    expect(result).toEqual({
      addedEmails: ['added@gendarmerie.fr'],
      movedEmails: ['other@unit.fr'],
      removedEmails: ['removed@gendarmerie.fr']
    })
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

  it('isInactiveUser() should flag users who never logged in or not for 6 months', () => {
    const now = customDayjs.utc('2026-10-21T12:00:00Z')

    expect(isInactiveUser(user({ lastLoginAtUtc: undefined }), now)).toBe(true)
    expect(isInactiveUser(user({ lastLoginAtUtc: '2026-04-20T12:00:00Z' }), now)).toBe(true)
    expect(isInactiveUser(user({ lastLoginAtUtc: '2026-04-22T12:00:00Z' }), now)).toBe(false)
  })

  it('getEmailsFromFile() should extract the emails of a CSV file', async () => {
    const csv = 'Nom;E-mail\nJean Dupont;Jean.Dupont@douane.finances.gouv.fr\n'
    // jsdom's `File` has no `arrayBuffer()`
    const file = { arrayBuffer: () => Promise.resolve(new Uint8Array(Buffer.from(csv)).buffer) } as unknown as File

    const result = await getEmailsFromFile(file)

    expect(result).toEqual(['jean.dupont@douane.finances.gouv.fr'])
  })

  it('getAuthorizationAuditLogTarget() should label the administration of a list import', () => {
    expect(getAuthorizationAuditLogTarget(auditLog({ target: 'GENDARMERIE_MARITIME' }))).toBe('Gendarmerie maritime')
    expect(
      getAuthorizationAuditLogTarget(
        auditLog({ action: UserManagement.AuthorizationAuditAction.ADD_USER, target: 'agent@email.gouv.fr' })
      )
    ).toBe('agent@email.gouv.fr')
  })

  it('getAuthorizationAuditLogActor() should fall back to the API key when there is no logged user', () => {
    expect(getAuthorizationAuditLogActor(auditLog({ actorEmail: 'admin@email.gouv.fr' }))).toBe('admin@email.gouv.fr')
    expect(getAuthorizationAuditLogActor(auditLog({ actorEmail: undefined }))).toBe('API (clé d’API)')
  })

  it('getAuthorizationAuditLogDetails() should describe the change', () => {
    expect(
      getAuthorizationAuditLogDetails(
        auditLog({
          action: UserManagement.AuthorizationAuditAction.ADD_USER,
          details: { administration: null, isAdministrator: true, isSuperUser: true, service: 'Pôle SIP' }
        })
      )
    ).toBe('CNSP · Pôle SIP, administrateur')
    expect(
      getAuthorizationAuditLogDetails(
        auditLog({
          action: UserManagement.AuthorizationAuditAction.DELETE_USER,
          details: { administration: UserManagement.ExternalAdministration.DOUANE, isSuperUser: false }
        })
      )
    ).toBe('Douane')
    expect(
      getAuthorizationAuditLogDetails(
        auditLog({
          details: { addedEmails: ['a@douane.fr'], movedEmails: [], removedEmails: ['b@douane.fr', 'c@douane.fr'] }
        })
      )
    ).toBe('Ajoutés (1) : a@douane.fr · Supprimés (2) : b@douane.fr, c@douane.fr')
    expect(
      getAuthorizationAuditLogDetails(
        auditLog({
          action: UserManagement.AuthorizationAuditAction.UPDATE_USER_IS_ADMINISTRATOR,
          details: { isAdministrator: false }
        })
      )
    ).toBe('Droits retirés')
  })
})

function auditLog(props: Partial<UserManagement.AuthorizationAuditLog>): UserManagement.AuthorizationAuditLog {
  return {
    action: UserManagement.AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS,
    actorEmail: 'admin@email.gouv.fr',
    createdAtUtc: '2026-10-22T08:00:00Z',
    details: { addedEmails: [], movedEmails: [], removedEmails: ['removed@douane.fr'] },
    id: 1,
    target: 'DOUANE',
    ...props
  }
}
