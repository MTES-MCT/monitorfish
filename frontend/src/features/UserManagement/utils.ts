import { customDayjs } from '@mtes-mct/monitor-ui'

import { API_KEY_ACTOR_LABEL, EXTERNAL_ADMINISTRATION_LABEL, INACTIVITY_DELAY_IN_MONTHS } from './constants'
import { UserManagement } from './types'

export function parseEmails(rawEmails: string | undefined): string[] {
  if (!rawEmails) {
    return []
  }

  const emails = rawEmails
    .split(/[\s,;]+/)
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0)

  return [...new Set(emails)]
}

export function getUserAffiliation(user: UserManagement.User): string {
  if (user.isSuperUser) {
    return user.service ? `CNSP · ${user.service}` : 'CNSP'
  }

  return user.administration ? EXTERNAL_ADMINISTRATION_LABEL[user.administration] : 'Externe'
}

export function isInactiveUser(user: UserManagement.User, now = customDayjs.utc()): boolean {
  return (
    !user.lastLoginAtUtc ||
    customDayjs.utc(user.lastLoginAtUtc).isBefore(now.subtract(INACTIVITY_DELAY_IN_MONTHS, 'month'))
  )
}

export function filterUsers(
  users: UserManagement.User[],
  filters: UserManagement.Filters,
  now = customDayjs.utc()
): UserManagement.User[] {
  const normalizedSearchQuery = filters.searchQuery?.trim().toLowerCase()
  const isSuperUserFilter = filters.userType ? filters.userType === UserManagement.UserType.CNSP : undefined

  return users.filter(
    user =>
      (!normalizedSearchQuery || (user.email ?? '').includes(normalizedSearchQuery)) &&
      (isSuperUserFilter === undefined || user.isSuperUser === isSuperUserFilter) &&
      (!filters.administration || user.administration === filters.administration) &&
      (filters.activity !== UserManagement.Activity.INACTIVE || isInactiveUser(user, now)) &&
      (filters.activity !== UserManagement.Activity.NEVER_LOGGED_IN || !user.lastLoginAtUtc)
  )
}

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

/**
 * Keeps every cell that is an email, whatever its column, so that header rows and other columns (name, unit...) are ignored.
 */
export function getEmailsFromRows(rows: unknown[][]): string[] {
  const emails = rows
    .flat()
    .map(cell =>
      String(cell ?? '')
        .trim()
        .toLowerCase()
    )
    .filter(isValidEmail)

  return [...new Set(emails)]
}

export async function getEmailsFromFile(file: File): Promise<string[]> {
  const { read, utils } = await import('xlsx')
  const workbook = read(await file.arrayBuffer(), { raw: true, type: 'array' })
  const worksheet = workbook.SheetNames[0] ? workbook.Sheets[workbook.SheetNames[0]] : undefined
  if (!worksheet) {
    return []
  }

  return getEmailsFromRows(utils.sheet_to_json<unknown[]>(worksheet, { header: 1 }))
}

export function getAdministrationEmailsDiff(
  users: UserManagement.User[],
  administration: UserManagement.ExternalAdministration,
  nextEmails: string[]
): UserManagement.EmailsDiff {
  const currentEmails = users
    .filter(user => user.administration === administration && !user.isSuperUser)
    .map(user => user.email ?? user.hashedEmail)

  const otherAdministrationEmailsSet = new Set(
    users
      .filter(user => !!user.administration && user.administration !== administration && !user.isSuperUser)
      .map(user => user.email)
  )
  const currentEmailsSet = new Set(currentEmails)
  const nextEmailsSet = new Set(nextEmails)

  return {
    addedEmails: nextEmails.filter(email => !currentEmailsSet.has(email) && !otherAdministrationEmailsSet.has(email)),
    movedEmails: nextEmails.filter(email => otherAdministrationEmailsSet.has(email)),
    removedEmails: currentEmails.filter(email => !nextEmailsSet.has(email))
  }
}

export function getAuthorizationAuditLogActor(authorizationAuditLog: UserManagement.AuthorizationAuditLog): string {
  return authorizationAuditLog.actorEmail ?? API_KEY_ACTOR_LABEL
}

export function getAuthorizationAuditLogTarget(authorizationAuditLog: UserManagement.AuthorizationAuditLog): string {
  if (authorizationAuditLog.action === UserManagement.AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS) {
    return (
      EXTERNAL_ADMINISTRATION_LABEL[authorizationAuditLog.target as UserManagement.ExternalAdministration] ??
      authorizationAuditLog.target
    )
  }

  return authorizationAuditLog.target
}

export function getAuthorizationAuditLogDetails(authorizationAuditLog: UserManagement.AuthorizationAuditLog): string {
  const { details } = authorizationAuditLog

  switch (authorizationAuditLog.action) {
    case UserManagement.AuthorizationAuditAction.ADD_USER:
    case UserManagement.AuthorizationAuditAction.DELETE_USER:
      if (details.isSuperUser === undefined) {
        return ''
      }
      if (details.isSuperUser) {
        return [details.service ? `CNSP · ${details.service}` : 'CNSP', details.isAdministrator ? 'administrateur' : '']
          .filter(Boolean)
          .join(', ')
      }

      return details.administration ? EXTERNAL_ADMINISTRATION_LABEL[details.administration] : 'Externe'

    case UserManagement.AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS:
      return [
        ['Ajoutés', details.addedEmails],
        ['Déplacés depuis une autre administration', details.movedEmails],
        ['Supprimés', details.removedEmails]
      ]
        .filter((entry): entry is [string, string[]] => !!entry[1] && entry[1].length > 0)
        .map(([label, emails]) => `${label} (${emails.length}) : ${emails.join(', ')}`)
        .join(' · ')

    case UserManagement.AuthorizationAuditAction.UPDATE_USER_IS_ADMINISTRATOR:
      return details.isAdministrator ? 'Droits accordés' : 'Droits retirés'

    default:
      return ''
  }
}
