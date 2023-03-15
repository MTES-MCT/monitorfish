import type { ControlUnit } from '../../types/controlUnit'
import type { GeoJSON } from '../../types/GeoJSON'
import type { MissionAction } from '../../types/missionAction'
import type { SeaFront } from '../alerts/constants'
import type { Except } from 'type-fest'

export namespace Mission {
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
    missionNature?: MissionNature[]
    missionSource: MissionSource
    missionType: MissionType
    observationsCacem?: string
    observationsCnsp?: string
    openBy?: string
    startDateTimeUtc: string
  }

  // ---------------------------------------------------------------------------
  // Constants

  export enum MissionAlertType {
    WAITING_FOR_CLOSURE = 'Mission à clôturer'
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
  /* eslint-enable typescript-sort-keys/string-enum */

  export enum MissionSource {
    MONITORENV = 'MONITORENV',
    MONITORFISH = 'MONITORFISH',
    POSEIDON_CACEM = 'POSEIDON_CACEM',
    POSEIDON_CNSP = 'POSEIDON_CNSP'
  }

  export enum MissionStatus {
    CLOSED = 'Clôturée',
    DONE = 'Terminée',
    IN_PROGRESS = 'En cours',
    UPCOMING = 'À venir'
  }

  /* eslint-disable typescript-sort-keys/string-enum */
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

  // ---------------------------------------------------------------------------
  // Types

  export type MissionData = Except<Mission, 'id'>
}

export type MissionAndActions = {
  actions: MissionAction.MissionAction[]
  mission: Mission.Mission
}
