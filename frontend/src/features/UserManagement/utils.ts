import type { UserManagement } from './types'

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

  const currentEmailsSet = new Set(currentEmails)
  const nextEmailsSet = new Set(nextEmails)

  return {
    addedEmails: nextEmails.filter(email => !currentEmailsSet.has(email)),
    removedEmails: currentEmails.filter(email => !nextEmailsSet.has(email))
  }
}
