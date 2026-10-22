import type { CnspService } from '@features/VesselGroup/types'

export namespace UserManagement {
  export enum ExternalAdministration {
    DOUANE = 'DOUANE',
    GENDARMERIE_MARITIME = 'GENDARMERIE_MARITIME',
    GENDARMERIE_NATIONALE = 'GENDARMERIE_NATIONALE'
  }

  export enum AuthorizationAuditAction {
    ADD_AUTHORIZED_ORGANIZATIONAL_UNIT = 'ADD_AUTHORIZED_ORGANIZATIONAL_UNIT',
    ADD_USER = 'ADD_USER',
    DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT = 'DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT',
    DELETE_USER = 'DELETE_USER',
    REPLACE_ADMINISTRATION_USERS = 'REPLACE_ADMINISTRATION_USERS',
    UPDATE_USER_IS_ADMINISTRATOR = 'UPDATE_USER_IS_ADMINISTRATOR'
  }

  export type AuthorizationAuditLog = {
    action: AuthorizationAuditAction
    /** Undefined when the change has been made with the API key. */
    actorEmail: string | undefined
    createdAtUtc: string
    details: AuthorizationAuditLogDetails
    id: number
    target: string
  }

  export type AuthorizationAuditLogDetails = {
    addedEmails?: string[]
    administration?: ExternalAdministration | null
    isAdministrator?: boolean
    isSuperUser?: boolean
    movedEmails?: string[]
    removedEmails?: string[]
    service?: string | null
  }

  export type AuthorizationAuditLogFilters = {
    action: AuthorizationAuditAction | undefined
    searchQuery: string | undefined
  }

  export enum Activity {
    INACTIVE = 'INACTIVE',
    NEVER_LOGGED_IN = 'NEVER_LOGGED_IN'
  }

  export type Filters = {
    activity: Activity | undefined
    administration: ExternalAdministration | undefined
    searchQuery: string | undefined
    userType: UserType | undefined
  }

  export type User = {
    administration: ExternalAdministration | undefined
    email: string | undefined
    hashedEmail: string
    isAdministrator: boolean
    isSuperUser: boolean
    lastLoginAtUtc: string | undefined
    service: string | undefined
  }

  export enum Tab {
    AUTHORIZED_ORGANIZATIONAL_UNITS = 'AUTHORIZED_ORGANIZATIONAL_UNITS',
    USERS = 'USERS'
  }

  export enum UserType {
    CNSP = 'CNSP',
    EXTERNAL = 'EXTERNAL'
  }

  export type NewUser = {
    administration: ExternalAdministration | undefined
    email: string
    isAdministrator: boolean
    isSuperUser: boolean
    service: CnspService | undefined
  }

  export type ReplaceAdministrationUsersData = {
    administration: ExternalAdministration
    emails: string[]
    isEmptyListConfirmed: boolean
  }

  export type ReplacedAdministrationUsers = {
    addedEmails: string[]
    ignoredSuperUserEmails: string[]
    movedEmails: string[]
    removedEmails: string[]
  }

  export type EmailsDiff = {
    addedEmails: string[]
    /** Users of another administration, moved to this one. */
    movedEmails: string[]
    removedEmails: string[]
  }
}
