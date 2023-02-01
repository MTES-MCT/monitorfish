import type { ControlUnit } from './controlUnit'
import type { GeoJSON } from './GeoJSON'
import type { SeaFront } from '../entities/alerts/constants'
import type { Except } from 'type-fest'

export interface Mission {
  closedBy?: string
  controlUnits: ControlUnit[]
  endDateTimeUtc?: string
  // We type it as `undefined` because we don't need that prop in Fish
  envActions: undefined
  facade?: SeaFront
  geom?: GeoJSON.MultiPolygon
  id: number
  isClosed: boolean
  isDeleted: boolean
  missionNature?: MissionNature
  missionSource: MissionSource
  missionType: MissionType
  observationsCacem?: string
  observationsCnsp?: string
  openBy?: string
  startDateTimeUtc: string
}

export type MissionData = Except<Mission, 'id'>

export enum MissionAlertType {
  WAITING_FOR_CLOSURE = 'Mission à clôturer'
}

export enum MissionStatus {
  CLOSED = 'Clôturée',
  DONE = 'Terminée',
  IN_PROGRESS = 'En cours'
}

/* eslint-disable typescript-sort-keys/string-enum */
export enum MissionNature {
  ENV = 'ENV',
  FISH = 'FISH',
  OTHER = 'OTHER'
}
export enum MissionNatureLabel {
  ENV = 'Env',
  FISH = 'Pêche',
  OTHER = 'Autre'
}

export enum MissionSource {
  MONITORENV = 'MONITORENV',
  MONITORFISH = 'MONITORFISH',
  POSEIDON_CACEM = 'POSEIDON_CACEM',
  POSEIDON_CNSP = 'POSEIDON_CNSP'
}

export enum MissionType {
  SEA = 'SEA',
  LAND = 'LAND',
  AIR = 'AIR'
}
export enum MissionTypeLabel {
  SEA = 'Mer',
  LAND = 'Terre',
  AIR = 'Air'
}
/* eslint-enable typescript-sort-keys/string-enum */
