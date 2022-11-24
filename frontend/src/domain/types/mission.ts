import type { SeaFront } from '../entities/alerts/constants'

export type Mission = {
  alertType: MissionAlertType
  endDate: Date
  id: string
  inspectionsCount: number
  seaFront: SeaFront
  startDate: Date
  status: MissionStatus
  themes: string[]
  type: MissionType
  unit: string
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
/* eslint-enable typescript-sort-keys/string-enum */

export enum MissionType {
  SEA = 'Mer'
}
