import type { CnspService } from '@features/VesselGroup/types'

export namespace UserManagement {
  export enum ExternalAdministration {
    DOUANE = 'DOUANE',
    GENDARMERIE_MARITIME = 'GENDARMERIE_MARITIME',
    GENDARMERIE_NATIONALE = 'GENDARMERIE_NATIONALE'
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
  }

  export type ReplacedAdministrationUsers = {
    addedEmails: string[]
    ignoredSuperUserEmails: string[]
    removedEmails: string[]
  }

  export type EmailsDiff = {
    addedEmails: string[]
    removedEmails: string[]
  }
}
