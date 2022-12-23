import type { SeaFront } from '../entities/alerts/constants'

export type Mission = {
  alertType: MissionAlertType
  cacemNote: string
  closedBy: string
  cnspNote: string
  endDate: Date
  goals: MissionGoal[]
  hasOrder: boolean
  id: number
  inspectionsCount: number
  isUnderJdp: boolean
  openedBy: string
  resourceUnits: MissionUnit[]
  seaFront: SeaFront
  startDate: Date
  status: MissionStatus
  themes: string[]
  type: MissionType
  zones: Record<string, any>[]
}

export enum MissionAlertType {
  WAITING_FOR_CLOSURE = 'Mission à clôturer'
}

/* eslint-disable typescript-sort-keys/string-enum */
export enum MissionStatus {
  IN_PROGRESS = 'En cours',
  CLOSED = 'Clôturée',
  DONE = 'Terminée'
}

export enum MissionGoal {
  ENVIRONMENT = 'Env',
  FISHING = 'Pêche',
  OTHER = 'Autre'
}

export enum MissionType {
  SEA = 'Mer',
  GROUND = 'Terre',
  AIR = 'Air'
}
/* eslint-enable typescript-sort-keys/string-enum */

export type MissionUnit = {
  administration: string
  contact: string
  resources: Array<string>
  unit: string
}
