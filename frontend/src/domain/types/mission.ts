import type { SeaFront } from '../entities/alerts/constants'

export type Mission = {
  alert: string
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

export enum MissionStatus {
  CLOSED = 'Clôturée',
  DONE = 'Terminée',
  IN_PROGRESS = 'En cours'
}

export enum MissionType {
  SEA = 'Mer'
}
